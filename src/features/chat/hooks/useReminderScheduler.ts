// Polls every minute for upcoming events and injects proactive reminders into the matching chat.

import { useEffect, useRef } from "react";
import type { AppSettings } from "../../../types/project";
import type { Message } from "../../../types/message";
import type { LLMConfig } from "../../../services/llm/types";
import {
  getUpcomingEvents,
  checkRemindersForEvent,
} from "../../../services/reminder/reminderScheduler";

const CHECK_INTERVAL_MS = 60_000; // run every minute

function buildLLMConfig(settings: AppSettings): LLMConfig {
  return {
    provider: settings.llmProvider,
    apiKey: settings.openaiApiKey,
    model: settings.openaiModel,
    ollamaBaseUrl: settings.ollamaBaseUrl,
    ollamaModel: settings.ollamaModel,
    geminiApiKey: settings.geminiApiKey,
    geminiModel: settings.geminiModel,
  };
}

/**
 * Mounts a background interval that:
 *  1. Discovers upcoming meetings and tasks across all projects.
 *  2. For each, checks whether a 24h or 2h reminder is due.
 *  3. Generates a context-rich summary (LLM or template).
 *  4. Injects the reminder into the matching project chat via `injectReminderMessage`.
 *
 * The interval re-runs whenever `settings` changes (e.g. a new project is added).
 */
export function useReminderScheduler(
  settings: AppSettings,
  chatMessages: Record<string, Message[]>,
  injectReminderMessage: (projectName: string, message: Message) => void
): void {
  // Keep stable refs so the interval closure doesn't capture stale values
  const chatMessagesRef = useRef(chatMessages);
  const injectRef = useRef(injectReminderMessage);

  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);

  useEffect(() => {
    injectRef.current = injectReminderMessage;
  }, [injectReminderMessage]);

  // Re-create the interval when settings change (new project, LLM config, etc.)
  useEffect(() => {
    const llmConfig = buildLLMConfig(settings);

    const run = async () => {
      const events = getUpcomingEvents(settings);
      for (const event of events) {
        const projectData = settings.projects[event.projectId];
        if (!projectData) continue;

        await checkRemindersForEvent(
          event,
          projectData,
          chatMessagesRef.current,
          llmConfig,
          (message) => injectRef.current(event.projectName, message)
        );
      }
    };

    // Run once immediately on mount / settings change, then on interval
    run();
    const interval = setInterval(run, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [settings]); // eslint-disable-line react-hooks/exhaustive-deps
  // chatMessages / injectReminderMessage intentionally accessed via refs above
}
