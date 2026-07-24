// Unified LLM client for Gemini, OpenAI, and Ollama. All external AI calls route through here.

import type { ProjectData } from "../../types/project";
import type {
  LLMChatMessage,
  LLMResponse,
  LLMConfig,
  ProjectResponse,
  OverviewResponse,
  ClassificationResult,
} from "./types";

// ---- Core HTTP client ----

async function callLLM(
  config: LLMConfig,
  messages: LLMChatMessage[],
  jsonMode = false,
  extra?: Record<string, unknown>
): Promise<LLMResponse> {
  const isOllama = config.provider === "ollama";
  const isGemini = config.provider === "gemini";

  if (isGemini && !config.geminiApiKey?.trim()) {
    return { content: "", error: "no_gemini_key" };
  }
  if (!isOllama && !isGemini && !config.apiKey?.trim()) {
    return {
      content: "",
      error:
        "Kein OpenAI API-Key konfiguriert. Bitte tragen Sie Ihren API-Key in den Einstellungen ein (⚙️ oben rechts).",
    };
  }

  let baseUrl: string;
  let model: string;
  let authHeader: string | null;

  if (isGemini) {
    baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai";
    model = config.geminiModel ?? "gemini-2.0-flash";
    authHeader = `Bearer ${config.geminiApiKey}`;
  } else if (isOllama) {
    baseUrl = `${config.ollamaBaseUrl ?? "http://localhost:11434"}/v1`;
    model = config.ollamaModel ?? "llama3.2";
    authHeader = null;
  } else {
    baseUrl = "https://api.openai.com/v1";
    model = config.model || "gpt-4o-mini";
    authHeader = `Bearer ${config.apiKey}`;
  }

  const url = `${baseUrl}/chat/completions`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authHeader) headers["Authorization"] = authHeader;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: isGemini ? 512 : 1024,
    ...extra,
  };
  if (jsonMode && !isOllama) body.response_format = { type: "json_object" };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      if (response.status === 401)
        return { content: "", error: isGemini ? "no_gemini_key" : "Ungültiger API-Key." };
      if (response.status === 429)
        return { content: "", error: "rate_limit" };
      if (isOllama && response.status === 404)
        return {
          content: "",
          error: `Ollama-Modell „${model}" nicht gefunden. Bitte zuerst „ollama pull ${model}" ausführen.`,
        };
      return {
        content: "",
        error: `Fehler: ${errorData?.error?.message ?? `HTTP ${response.status}`}`,
      };
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { content: "", error: "Leere Antwort erhalten." };
    return { content };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unbekannter Fehler";
    if (isOllama && (msg.includes("fetch") || msg.includes("Failed"))) {
      return {
        content: "",
        error:
          "Ollama nicht erreichbar. Bitte stellen Sie sicher, dass Ollama läuft (ollama serve).",
      };
    }
    if (isGemini) return { content: "", error: "no_gemini_key" };
    return { content: "", error: `Netzwerkfehler: ${msg}` };
  }
}

// ---- Fallback: Gemini → Ollama ----

function buildOllamaFallbackConfig(config: LLMConfig): LLMConfig {
  return {
    provider: "ollama",
    apiKey: "",
    model: config.ollamaModel ?? "llama3.2",
    ollamaBaseUrl: config.ollamaBaseUrl,
    ollamaModel: config.ollamaModel,
  };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callWithFallback(
  config: LLMConfig,
  messages: LLMChatMessage[],
  jsonMode = false
): Promise<LLMResponse> {
  const result = await callLLM(config, messages, jsonMode);

  if (result.error && config.provider === "gemini") {
    if (result.error === "rate_limit") {
      console.warn("Gemini Rate Limit — warte 3s und versuche erneut...");
      await delay(3000);
      const retry = await callLLM(config, messages, jsonMode);
      if (!retry.error) return retry;
      console.warn("Gemini Retry fehlgeschlagen, wechsle zu Ollama");
    } else {
      console.warn("Gemini fehlgeschlagen, wechsle zu Ollama:", result.error);
    }
    const fallback = await callLLM(buildOllamaFallbackConfig(config), messages, false);
    if (fallback.error) {
      return {
        content: "",
        error:
          "Gemini nicht verfügbar (Rate Limit) und Ollama nicht erreichbar. Bitte Ollama starten (ollama serve) oder kurz warten.",
      };
    }
    return fallback;
  }

  return result;
}

// ---- Request classification ----

const CLASSIFICATION_SYSTEM_PROMPT = `You are a classifier. Output ONLY valid JSON, no other text.

Classify the user message as INTERN or EXTERN.
INTERN: sprints, tasks, tickets, meetings, team members, project documents, project emails, contacts, onboarding.
EXTERN: general knowledge, coding help, code snippets, technical concepts, weather, translations, creative writing.

Examples:
User: "Wann ist unser nächstes Meeting?" → {"classification":"INTERN"}
User: "Zeig mir meine offenen Tasks" → {"classification":"INTERN"}
User: "Wer ist der Ansprechpartner für das BMW-Projekt?" → {"classification":"INTERN"}
User: "Was ist der aktuelle Sprint-Status?" → {"classification":"INTERN"}
User: "Wie funktioniert eine REST API?" → {"classification":"EXTERN"}
User: "Schreib mir einen Python-Sortieralgorithmus" → {"classification":"EXTERN"}
User: "Wie ist das Wetter in München?" → {"classification":"EXTERN"}
User: "Übersetze 'Guten Morgen' ins Englische" → {"classification":"EXTERN"}`;

export async function classifyRequest(
  config: LLMConfig,
  userMessage: string
): Promise<ClassificationResult> {
  const ollamaConfig: LLMConfig = {
    provider: "ollama",
    apiKey: "",
    model: config.ollamaModel ?? "llama3.2",
    ollamaBaseUrl: config.ollamaBaseUrl,
    ollamaModel: config.ollamaModel,
  };

  const messages: LLMChatMessage[] = [
    { role: "system", content: CLASSIFICATION_SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  try {
    const result = await callLLM(ollamaConfig, messages, false, {
      temperature: 0,
      max_tokens: 15,
      top_k: 20,
      top_p: 0.1,
      stop: ["\n", "}"],
    });
    if (result.error || !result.content) return "INTERN";
    if (result.content.includes("EXTERN")) return "EXTERN";
    return "INTERN";
  } catch {
    return "INTERN";
  }
}

// ---- External (ChatGPT / Gemini) mode ----

const EXTERNAL_CHAT_SYSTEM_PROMPT = `Du bist ein hilfreicher KI-Assistent für ein Unternehmens-Chatbot-System.
Du kannst allgemeine Fragen beantworten und bei beruflichen Themen helfen.
Antworte auf Deutsch, es sei denn, der Nutzer schreibt auf Englisch.
Beachte: Du hast in diesem Modus KEINEN Zugriff auf interne Projektdaten (Jira, Teams, SharePoint).
Gib keine sensiblen Unternehmensdaten weiter.

FORMATIERUNG — halte dich strikt an diese Regeln:
- Überschriften: immer mit Leerzeichen nach den Rauten (z. B. "### Überschrift", nicht "###Überschrift")
- Fettdruck: immer vollständig geschlossen (z. B. "**Begriff**", nie "**Begriff" ohne schließende Sterne)
- Listen: Bullet-Points mit "- " (Bindestrich + Leerzeichen) am Zeilenanfang
- Nummerierte Listen: "1. ", "2. " usw.
- Markdown-Symbole dürfen niemals direkt an Buchstaben kleben, wenn sie Formatierung signalisieren sollen`;

export async function sendExternalMessage(
  config: LLMConfig,
  conversationHistory: LLMChatMessage[],
  userMessage: string
): Promise<LLMResponse> {
  const messages: LLMChatMessage[] = [
    { role: "system", content: EXTERNAL_CHAT_SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];
  return callWithFallback(config, messages);
}

// ---- Project mode ----

function buildProjectSystemPrompt(projectName: string, data: ProjectData): string {
  const trimmed = {
    contacts: data.contacts.slice(0, 5),
    nextMeetings: data.meetings.slice(0, 3),
    sprint: {
      number: data.sprintInfo.sprintNumber,
      week: `${data.sprintInfo.currentWeek}/${data.sprintInfo.totalWeeks}`,
      tasks: `${data.sprintInfo.completedTasks}/${data.sprintInfo.totalTasks} erledigt`,
      openItems: data.sprintInfo.tasks.filter((t) => t.status !== "completed").slice(0, 5),
    },
    myTasks: data.myTasks.slice(0, 5),
    sharepoint: data.sharepoint
      .slice(0, 4)
      .map((d) => ({ title: d.title, type: d.type, modified: d.lastModified })),
    emails: data.emails
      .slice(0, 3)
      .map((e) => ({ from: e.from, subject: e.subject, date: e.date, unread: e.unread })),
    msLoop: data.msLoop.slice(0, 3).map((p) => ({ title: p.title, edited: p.lastEdited })),
  };

  return `Du bist ein intelligenter Projekt-Assistent für das ${projectName}-Projekt bei BPC Consulting.
Du hast Zugriff auf alle aktuellen Projektdaten und beantwortest Fragen natürlich und präzise auf Deutsch.

PROJEKTDATEN:
${JSON.stringify(trimmed)}

AUFGABE:
Analysiere die Nutzerfrage und antworte mit einem JSON-Objekt:
{
  "action": "<action>",
  "content": "<natürliche Antwort auf Deutsch>"
  // optional bei create_ticket:
  "ticketData": { "title": "...", "description": "...", "priority": "high|medium|low", "storyPoints": <zahl> }
  // optional bei send_message:
  "messageData": { "recipientName": "<Name>", "subject": "<Betreff>", "body": "<Nachrichtentext>" }
}

MÖGLICHE ACTIONS — wähle immer die passendste:
- "sprint_status"    → Fragen zu Sprint, Fortschritt, Status, ob wir im Plan sind, wie es läuft
- "meetings"         → Fragen nach mehreren Terminen, Kalender, anstehenden Besprechungen
- "meeting_single"   → Fragen nach dem nächsten Termin, wann das nächste Meeting ist
- "my_tasks"         → Fragen nach eigenen Aufgaben, Tasks, was zu tun ist, Workload
- "create_ticket"    → Nutzer möchte ein Ticket/Issue/Aufgabe anlegen oder etwas tracken
- "contacts"         → Fragen nach Ansprechpartnern, wer zuständig ist, Kontaktdaten, Team
- "onboarding"       → Neue Mitarbeiter, was muss ich wissen, erste Schritte, Einstieg
- "sharepoint"       → Fragen nach Dokumenten, Dateien, Word/Excel/PPT, Unterlagen
- "email"            → Fragen nach E-Mails, Posteingang, Nachrichten
- "msloop"           → Fragen nach Loop-Seiten, Notizen, gemeinsamen Dokumenten
- "send_message"     → Nutzer möchte eine Nachricht, E-Mail oder Teams-Nachricht an eine Person schicken
- "chatgpt_offer"    → Frage geht über Projektdaten hinaus (allgemeinwissen, externe Themen)
- "text"             → Alles andere, allgemeine Antwort ohne spezielle Karte

WICHTIG:
- "content" ist der Text der Chatblase — schreibe natürlich, freundlich, kontextuell
- Beziehe dich konkret auf die Daten (z.B. nenne Sprintnummer, Datum, Namen)
- Antworte immer nur mit validem JSON, ohne Markdown-Codeblock
- Bei "chatgpt_offer": erkläre kurz, dass du für diese Frage ChatGPT hinzuziehen kannst
- Bei "send_message": füge ein "messageData"-Feld hinzu mit { "recipientName": "<Vorname oder voller Name>", "subject": "<Betreff>", "body": "<vollständiger Nachrichtentext auf Deutsch, freundlich und professionell>" }

FORMATIERUNG im "content"-Feld — halte dich strikt an diese Regeln:
- Überschriften: immer mit Leerzeichen nach den Rauten (z. B. "### Überschrift", nicht "###Überschrift")
- Fettdruck: immer vollständig geschlossen (z. B. "**Begriff**", nie "**Begriff" ohne schließende Sterne)
- Listen: Bullet-Points mit "- " (Bindestrich + Leerzeichen) am Zeilenanfang
- Nummerierte Listen: "1. ", "2. " usw.
- Markdown-Symbole dürfen niemals direkt an Buchstaben kleben`;
}

// ---- Reminder summarization ----

/**
 * Sends a single summarization prompt to the configured LLM.
 * Returns the generated text or null if the LLM is unavailable.
 * Used exclusively by the reminder system.
 */
export async function generateReminderSummary(
  config: LLMConfig,
  prompt: string
): Promise<string | null> {
  const messages: LLMChatMessage[] = [
    {
      role: "system",
      content:
        "Du bist ein präziser Assistent. Erstelle strukturierte, knappe Zusammenfassungen auf Deutsch. Halte dich strikt an das vorgegebene Format.",
    },
    { role: "user", content: prompt },
  ];
  const result = await callWithFallback(config, messages);
  if (result.error || !result.content?.trim()) return null;
  return result.content.trim();
}

// ---- Overview (cross-project) mode ----

function buildPersonDirectory(projects: Record<string, ProjectData>): string {
  const lines: string[] = [];
  for (const [id, data] of Object.entries(projects)) {
    for (const c of data.contacts) {
      lines.push(`${c.name} | ${c.role} | ${data.name} (${id})`);
    }
    const devs = [
      ...new Set(
        data.sprintInfo.tasks
          .map((t) => t.assignee)
          .filter((a): a is string => Boolean(a))
      ),
    ];
    for (const dev of devs) {
      const alreadyListed = data.contacts.some((c) => c.name === dev);
      if (!alreadyListed) {
        lines.push(`${dev} | Entwickler | ${data.name} (${id})`);
      }
    }
  }
  return lines.length > 0 ? lines.join("\n") : "– keine Personen gefunden –";
}

function buildOverviewSystemPrompt(projects: Record<string, ProjectData>): string {
  const personDir = buildPersonDirectory(projects);

  const summaries = Object.entries(projects)
    .map(([id, data]) => {
      const meetings = data.meetings
        .slice(0, 3)
        .map((m) => `  - ${m.title}: ${m.date} ${m.time}`)
        .join("\n");
      const tasks = data.myTasks
        .slice(0, 3)
        .map((t) => `  - ${t.title} (Fällig: ${t.dueDate}, Prio: ${t.priority})`)
        .join("\n");
      const sprint = `Sprint ${data.sprintInfo.sprintNumber}: Woche ${data.sprintInfo.currentWeek}/${data.sprintInfo.totalWeeks}, ${data.sprintInfo.completedTasks}/${data.sprintInfo.totalTasks} Tasks erledigt`;
      return `### Projekt "${data.name}" (ID: ${id})\nSprint: ${sprint}\nNächste Meetings:\n${meetings || "  – keine"}\nOffene Tasks:\n${tasks || "  – keine"}`;
    })
    .join("\n\n");

  return `Du bist INNO, ein projektübergreifender KI-Assistent für BPC Consulting.
Du hast Zugriff auf alle Projekte und Mitarbeiter. Deine Aufgabe: präzise antworten und gezielt weiterleiten.

══════════════════════════════════════
PERSONEN-VERZEICHNIS (maßgeblich für ALLE Personen-Fragen)
Format: Name | Rolle | Projekt (ID)
══════════════════════════════════════
${personDir}

══════════════════════════════════════
PROJEKTDATEN
══════════════════════════════════════
${summaries}

══════════════════════════════════════
AUSGABEFORMAT — ausschließlich valides JSON, kein Text davor oder danach:
══════════════════════════════════════
{"action":"<action>","projectId":"<id>","projectName":"<name>","content":"<antwort>"}

Felder "projectId" und "projectName" nur bei action "project_redirect" setzen.

══════════════════════════════════════
ENTSCHEIDUNGSREGELN (in dieser Reihenfolge prüfen)
══════════════════════════════════════
1. PERSON GESUCHT → Suche den Namen im PERSONEN-VERZEICHNIS (exakter Abgleich, keine Interpretation).
   a) Gefunden: action "project_redirect", projectId + projectName des Projekts.
      content: Nenne Rolle und Namen exakt aus dem Verzeichnis, kündige Weiterleitung an.
   b) Nicht gefunden: action "clarify".
      content: Erkläre, dass die Person nicht gefunden wurde. Schlage 2-3 ähnliche Namen aus dem Verzeichnis vor.

2. PROJEKT-SPEZIFISCH → Frage bezieht sich eindeutig auf ein Projekt → action "project_redirect".

3. PROJEKTÜBERGREIFEND → Frage betrifft mehrere Projekte gleichzeitig → action "overview_answer".

4. UNKLAR → Nicht zuordenbar → action "clarify" mit konkreter Rückfrage.

══════════════════════════════════════
FEW-SHOT BEISPIELE
══════════════════════════════════════
User: "Wer ist Product Owner bei BMW?"
Denke: Suche Rolle "Product Owner" in BMW → finde Name aus Verzeichnis.
Output: {"action":"project_redirect","projectId":"bmw","projectName":"BMW","content":"Der Product Owner im BMW-Projekt ist [exakter Name aus Verzeichnis]. Ich leite Sie zum BMW-Projekt weiter."}

User: "In welchem Projekt arbeitet Thomas Braun?"
Denke: Suche "Thomas Braun" im Verzeichnis → Volkswagen.
Output: {"action":"project_redirect","projectId":"volkswagen","projectName":"Volkswagen","content":"Thomas Braun ist [Rolle] im Volkswagen-Projekt. Ich leite Sie dorthin weiter."}

User: "Wer ist Tom?"
Denke: "Tom" nicht im Verzeichnis. Ähnliche Namen: z.B. Thomas Braun. Rückfrage.
Output: {"action":"clarify","content":"Ich habe keine Person namens 'Tom' in den Projektdaten gefunden. Meinten Sie Thomas Braun (Volkswagen)?"}

User: "Welches Projekt hat die meisten offenen Tasks?"
Denke: Vergleich über alle Projekte → overview_answer.
Output: {"action":"overview_answer","content":"[Vergleich aller Projekte]"}

══════════════════════════════════════
ABSOLUTE REGELN
══════════════════════════════════════
- Namen EXAKT aus dem Verzeichnis übernehmen — keine Kurzformen, keine Interpretationen
- Rollen EXAKT aus dem Verzeichnis zitieren — keine eigenen Bezeichnungen
- Füllwörter des Nutzers (nochmal, eigentlich, mal, doch, ja, halt, eben) NIEMALS in die Antwort übernehmen
- Nur valides JSON ausgeben — kein erklärender Text davor oder danach, keine Markdown-Blöcke`;
}

export async function analyzeOverviewQuery(
  config: LLMConfig,
  projects: Record<string, ProjectData>,
  userMessage: string,
  conversationHistory: LLMChatMessage[] = []
): Promise<OverviewResponse> {
  const systemPrompt = buildOverviewSystemPrompt(projects);
  const messages: LLMChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-6),
    { role: "user", content: userMessage },
  ];

  const result = await callWithFallback(config, messages, true);

  if (result.error) {
    return { action: "overview_answer", content: "", error: result.error };
  }

  try {
    let raw = result.content.trim();
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) raw = fenceMatch[1].trim();
    const objMatch = raw.match(/\{[\s\S]*\}/);
    if (objMatch) raw = objMatch[0];
    const sanitized = raw.replace(/"((?:[^"\\]|\\.)*)"/gs, (match) =>
      match.replace(/\n/g, "\\n").replace(/\r/g, "\\r")
    );
    const parsed = JSON.parse(sanitized) as OverviewResponse;
    return {
      action: parsed.action ?? "overview_answer",
      projectId: parsed.projectId,
      projectName: parsed.projectName,
      content: parsed.content ?? "",
    };
  } catch {
    return { action: "overview_answer", content: result.content };
  }
}

export async function sendProjectMessage(
  config: LLMConfig,
  projectName: string,
  projectData: ProjectData,
  conversationHistory: LLMChatMessage[],
  userMessage: string
): Promise<ProjectResponse> {
  if (config.provider === "openai" && !config.apiKey?.trim()) {
    return { action: "text", content: "", error: "no_api_key" };
  }

  const systemPrompt = buildProjectSystemPrompt(projectName, projectData);
  const messages: LLMChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-10),
    { role: "user", content: userMessage },
  ];

  const result = await callWithFallback(config, messages, true);

  if (result.error) {
    return { action: "text", content: "", error: result.error };
  }

  try {
    let raw = result.content.trim();
    // Strip markdown code fences that Ollama sometimes wraps around JSON
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) raw = fenceMatch[1].trim();
    // Extract the first JSON object if surrounded by extra text
    if (!raw.startsWith("{")) {
      const objMatch = raw.match(/\{[\s\S]*\}/);
      if (objMatch) raw = objMatch[0];
    }
    // Sanitize literal (unescaped) newlines inside JSON string values —
    // Gemini sometimes emits real \n inside string content which breaks JSON.parse
    const sanitized = raw.replace(/"((?:[^"\\]|\\.)*)"/gs, (match) =>
      match.replace(/\n/g, "\\n").replace(/\r/g, "\\r")
    );
    try {
      const parsed = JSON.parse(sanitized) as ProjectResponse;
      return {
        action: parsed.action ?? "text",
        content: parsed.content ?? "",
        ticketData: parsed.ticketData,
        messageData: parsed.messageData,
      };
    } catch {
      // Last resort: extract action via regex so we can at least show the right card
      const actionMatch = raw.match(/"action"\s*:\s*"([^"]+)"/);
      const action = (actionMatch?.[1] ?? "text") as ProjectResponse["action"];
      return { action, content: "" };
    }
  } catch {
    return { action: "text", content: result.content };
  }
}
