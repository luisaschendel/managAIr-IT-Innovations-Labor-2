// Contracts for proactive event reminders.

import type { Meeting, MyTask } from "../../types/project";

export type ReminderEventType = "meeting" | "task";

export interface ReminderEvent {
  /** Stable deterministic ID derived from project + title + date. */
  id: string;
  type: ReminderEventType;
  title: string;
  eventDate: Date;
  projectId: string;
  projectName: string;
  raw: Meeting | MyTask;
}

export interface ReminderContext {
  event: ReminderEvent;
  /** Snippets from chat history relevant to this event (newest first). */
  recentDiscussion: string[];
  /** Project goal or task description – best-effort. */
  goal: string;
  /** Attendees / relevant contacts. */
  participants: string[];
  /** Open sprint tasks that may be relevant. */
  openItems: string[];
}

export interface ReminderThreshold {
  hoursBeforeEvent: number;
  label: string;
}

export const REMINDER_THRESHOLDS: ReminderThreshold[] = [
  { hoursBeforeEvent: 24, label: "24 Stunden" },
  { hoursBeforeEvent: 2, label: "2 Stunden" },
  { hoursBeforeEvent: 10 / 60, label: "10 Minuten" },
];

/** localStorage key for deduplication map: { "<eventId>": [24, 2] } */
export const SENT_REMINDERS_KEY = "innolab_sent_reminders";
