// Detects upcoming events; coordinates context collection, LLM summary, and dispatch.

import type { AppSettings, ProjectData } from "../../types/project";
import type { Message } from "../../types/message";
import type { LLMConfig } from "../llm/types";
import type { ReminderEvent } from "./types";
import { REMINDER_THRESHOLDS, SENT_REMINDERS_KEY } from "./types";
import { parseGermanDate, hoursDiff } from "./dateParser";
import { collectContext } from "./contextService";
import { buildSummaryPrompt, formatReminderMessage } from "./notificationService";
import { generateReminderSummary } from "../llm/llmService";

// ---- Sent-reminder deduplication (localStorage) ----

type SentRemindersMap = Record<string, number[]>;

function loadSentReminders(): SentRemindersMap {
  try {
    return JSON.parse(localStorage.getItem(SENT_REMINDERS_KEY) ?? "{}") as SentRemindersMap;
  } catch {
    return {};
  }
}

function wasReminderSent(eventId: string, thresholdHours: number): boolean {
  return (loadSentReminders()[eventId] ?? []).includes(thresholdHours);
}

function markReminderSent(eventId: string, thresholdHours: number): void {
  const sent = loadSentReminders();
  sent[eventId] = [...new Set([...(sent[eventId] ?? []), thresholdHours])];
  try {
    localStorage.setItem(SENT_REMINDERS_KEY, JSON.stringify(sent));
  } catch {
    // localStorage might be full; ignore
  }
}

// ---- Event discovery ----

/** Creates a stable, URL-safe ID for an event. */
function makeEventId(projectId: string, type: string, key: string): string {
  return `${type}-${projectId}-${key}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Iterates all projects in `settings` and returns upcoming meetings and tasks
 * that still lie in the future.
 */
export function getUpcomingEvents(settings: AppSettings): ReminderEvent[] {
  const now = new Date();
  const events: ReminderEvent[] = [];

  for (const [projectId, projectData] of Object.entries(settings.projects)) {
    // --- Meetings ---
    for (const meeting of projectData.meetings ?? []) {
      const eventDate = parseGermanDate(meeting.date, meeting.time);
      if (!eventDate || eventDate <= now) continue;

      events.push({
        id: makeEventId(projectId, "meeting", `${meeting.title}-${meeting.date}`),
        type: "meeting",
        title: meeting.title,
        eventDate,
        projectId,
        projectName: projectData.name,
        raw: meeting,
      });
    }

    // --- Tasks ---
    for (const task of projectData.myTasks ?? []) {
      const eventDate = parseGermanDate(task.dueDate);
      if (!eventDate || eventDate <= now) continue;

      events.push({
        id: makeEventId(projectId, "task", task.id),
        type: "task",
        title: task.title,
        eventDate,
        projectId,
        projectName: projectData.name,
        raw: task,
      });
    }
  }

  return events;
}

// ---- Per-event reminder check ----

/**
 * For a single event, checks all configured thresholds.
 * Fires a reminder for each threshold that:
 *   1. The event is within `threshold.hoursBeforeEvent` hours, AND
 *   2. The reminder has not been sent before.
 *
 * Generates an LLM summary (with template fallback) and calls `onReminder`.
 */
export async function checkRemindersForEvent(
  event: ReminderEvent,
  projectData: ProjectData,
  allMessages: Record<string, Message[]>,
  llmConfig: LLMConfig,
  onReminder: (message: Message) => void
): Promise<void> {
  const now = new Date();
  const hoursUntil = hoursDiff(now, event.eventDate);

  if (hoursUntil <= 0) return; // Event is in the past

  for (const threshold of REMINDER_THRESHOLDS) {
    if (hoursUntil > threshold.hoursBeforeEvent) continue;
    if (wasReminderSent(event.id, threshold.hoursBeforeEvent)) continue;

    // Collect contextual data
    const context = collectContext(event, allMessages, projectData);

    // Attempt LLM summary; fall back to template on any failure
    const prompt = buildSummaryPrompt(context, threshold.hoursBeforeEvent);
    const llmSummary = await generateReminderSummary(llmConfig, prompt);

    const content = formatReminderMessage(context, threshold.hoursBeforeEvent, llmSummary);

    markReminderSent(event.id, threshold.hoursBeforeEvent);

    onReminder({
      id: `reminder-${event.id}-${threshold.hoursBeforeEvent}h-${Date.now()}`,
      role: "assistant",
      content,
      source: "teams",
      isProactive: true,
    });
  }
}
