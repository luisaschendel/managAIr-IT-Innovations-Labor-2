// Collects reminder context: recent discussion, project goal, participants, open sprint items.

import type { Message } from "../../types/message";
import type { ProjectData, Meeting, MyTask } from "../../types/project";
import type { ReminderContext, ReminderEvent } from "./types";

const MAX_DISCUSSION_SNIPPETS = 4;
const SNIPPET_MAX_CHARS = 160;

/** Extracts meaningful keywords from an event title for relevance matching. */
function extractKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .split(/[\s\-_:]+/)
    .filter((w) => w.length > 3);
}

function isRelevantMessage(content: string, keywords: string[]): boolean {
  const lower = content.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, "").replace(/#+\s/g, "").replace(/\n+/g, " ").trim();
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

/**
 * Collects all contextual information needed to generate a reminder for `event`.
 * Handles missing data gracefully — every field has a safe fallback.
 */
export function collectContext(
  event: ReminderEvent,
  allMessages: Record<string, Message[]>,
  projectData: ProjectData
): ReminderContext {
  const keywords = extractKeywords(event.title);

  // Scan all chat messages (newest first), skip loading states
  const allMsgs = Object.values(allMessages).flat().reverse();
  const recentDiscussion: string[] = [];

  for (const msg of allMsgs) {
    if (msg.isLoading) continue;
    if (!isRelevantMessage(msg.content, keywords)) continue;
    recentDiscussion.push(truncate(stripMarkdown(msg.content), SNIPPET_MAX_CHARS));
    if (recentDiscussion.length >= MAX_DISCUSSION_SNIPPETS) break;
  }

  // Goal: for tasks use the task description; for meetings use project goal
  const projectGoal = projectData.onboarding?.projectGoal ?? "";
  const goal =
    event.type === "task"
      ? ((event.raw as MyTask).description?.trim() || projectGoal)
      : projectGoal;

  // Participants
  let participants: string[] = [];
  if (event.type === "meeting") {
    const meeting = event.raw as Meeting;
    if (meeting.attendees?.trim()) {
      participants = [meeting.attendees.trim()];
    } else {
      participants = projectData.contacts
        .slice(0, 4)
        .map((c) => `${c.name} (${c.role})`);
    }
  } else {
    // For tasks, list the relevant contacts as context
    participants = projectData.contacts
      .slice(0, 2)
      .map((c) => `${c.name} (${c.role})`);
  }

  // Open sprint tasks as potential blockers / open items
  const openItems = projectData.sprintInfo.tasks
    .filter((t) => t.status !== "completed")
    .map((t) => `${t.id}: ${t.title}${t.assignee ? ` → ${t.assignee}` : ""}`)
    .slice(0, 5);

  return { event, recentDiscussion, goal, participants, openItems };
}
