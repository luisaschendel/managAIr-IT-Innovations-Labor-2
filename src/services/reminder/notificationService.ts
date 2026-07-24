// Formats reminder messages: LLM summary when available, structured template otherwise.

import type { ReminderContext } from "./types";

/** "2 Stunden" or "10 Minuten" depending on the value. */
function formatTimeLabel(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} Minuten`;
  return `${hours} Stunden`;
}

/**
 * Builds the full prompt sent to the LLM to generate a reminder summary.
 * Keeping the prompt in this module keeps summarization logic co-located.
 */
export function buildSummaryPrompt(context: ReminderContext, hoursUntil: number): string {
  const { event, recentDiscussion, goal, participants, openItems } = context;
  const eventTypeLabel = event.type === "meeting" ? "Meeting" : "Aufgabe";

  const discussionBlock =
    recentDiscussion.length > 0
      ? recentDiscussion.map((d) => `- ${d}`).join("\n")
      : "- Keine bisherige Diskussion gefunden.";

  const participantsBlock =
    participants.length > 0
      ? participants.map((p) => `- ${p}`).join("\n")
      : "- Keine Angaben.";

  const openItemsBlock =
    openItems.length > 0
      ? openItems.map((i) => `- ${i}`).join("\n")
      : "- Keine offenen Punkte.";

  return `Erstelle eine prägnante Erinnerung auf Deutsch für folgendes Ereignis.
Halte dich EXAKT an das vorgegebene Format. Maximal 200 Wörter.

EREIGNIS: ${event.title} (${eventTypeLabel}) in ${formatTimeLabel(hoursUntil)}
PROJEKT: ${event.projectName}

LETZTE DISKUSSION:
${discussionBlock}

PROJEKTZIEL:
${goal || "Nicht definiert."}

TEILNEHMER:
${participantsBlock}

OFFENE PUNKTE:
${openItemsBlock}

Ausgabeformat (genau so übernehmen, inkl. Emoji und Markdown-Fettdruck):
📅 **Erinnerung: ${event.title}** in ${formatTimeLabel(hoursUntil)}

**Letzte Diskussion:**
- ...

**Ziel:**
- ...

**Offene Punkte:**
- ...`;
}

/**
 * Renders a reminder message from structured context.
 * If `llmSummary` is provided it is used verbatim; otherwise a template is rendered.
 */
export function formatReminderMessage(
  context: ReminderContext,
  hoursUntil: number,
  llmSummary: string | null
): string {
  if (llmSummary?.trim()) return llmSummary.trim();

  // --- Template fallback ---
  const { event, recentDiscussion, goal, participants, openItems } = context;
  const lines: string[] = [];

  lines.push(`📅 **Erinnerung: ${event.title}** in ${formatTimeLabel(hoursUntil)}`);
  lines.push("");

  lines.push("**Letzte Diskussion:**");
  if (recentDiscussion.length === 0) {
    lines.push("- Noch keine Diskussion zu diesem Thema gefunden.");
  } else {
    recentDiscussion.slice(0, 3).forEach((d) => lines.push(`- ${d}`));
  }
  lines.push("");

  lines.push("**Ziel:**");
  if (goal) {
    const goalText = goal.length > 220 ? goal.slice(0, 220) + "…" : goal;
    lines.push(`- ${goalText}`);
  } else {
    lines.push("- Kein Ziel definiert.");
  }
  lines.push("");

  if (participants.length > 0) {
    lines.push("**Teilnehmer:**");
    participants.forEach((p) => lines.push(`- ${p}`));
    lines.push("");
  }

  if (openItems.length > 0) {
    lines.push("**Offene Punkte:**");
    openItems.slice(0, 4).forEach((item) => lines.push(`- ${item}`));
  }

  return lines.join("\n").trimEnd();
}
