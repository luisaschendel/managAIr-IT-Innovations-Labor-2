// Routes user messages: classify INTERN/EXTERN, query the project LLM, fall back to keyword matching.
import { useCallback, useState } from "react";
import type { Message } from "../../../types/message";
import type { AppSettings, ProjectData } from "../../../types/project";
import type { ProjectEntry } from "../../project/types";
import type { UserData } from "../../auth/types";
import type { LLMChatMessage } from "../../../services/llm/types";
import {
  classifyRequest,
  sendProjectMessage,
  sendExternalMessage,
  analyzeOverviewQuery,
} from "../../../services/llm/llmService";
import {
  isOnboardingQuestion,
  isSprintStatusQuestion,
  isAppointmentQuestion,
  isMyTasksQuestion,
  isTicketCreationRequest,
  isSharepointQuestion,
  isEmailQuestion,
  isLoopQuestion,
  isContactQuestion,
  isSendMessageRequest,
} from "../../../lib/keywordMatcher";

interface UseMessageRouterOptions {
  settings: AppSettings;
  currentProject: ProjectEntry;
  currentChatId: string;
  chatMessages: Record<string, Message[]>;
  userData: UserData | null;
  setIsAILoading: (loading: boolean) => void;
  addMessage: (chatId: string, msg: Message) => void;
  replaceMessage: (chatId: string, id: string, msg: Message) => void;
  removeMessage: (chatId: string, id: string) => void;
  openGeminiChat: (title: string, question: string) => string;
  onChatGPTAccepted: (newChatId: string, question: string) => void;
  onChatGPTDeclined: (messageId: string) => void;
}

export function useMessageRouter({
  settings,
  currentProject,
  currentChatId,
  chatMessages,
  userData,
  setIsAILoading,
  addMessage,
  replaceMessage,
  removeMessage,
  openGeminiChat,
  onChatGPTAccepted,
  onChatGPTDeclined,
}: UseMessageRouterOptions) {
  const [pendingChatGPTQuestion, setPendingChatGPTQuestion] = useState("");

  const buildOllamaConfig = () => ({
    provider: "ollama" as const,
    apiKey: "",
    model: settings.ollamaModel,
    ollamaBaseUrl: settings.ollamaBaseUrl,
    ollamaModel: settings.ollamaModel,
  });

  const buildGeminiConfig = () => ({
    provider: "gemini" as const,
    apiKey: "",
    model: settings.geminiModel,
    ollamaBaseUrl: settings.ollamaBaseUrl,
    ollamaModel: settings.ollamaModel,
    geminiApiKey: settings.geminiApiKey,
    geminiModel: settings.geminiModel,
  });

  const buildConversationHistory = (chatId: string): LLMChatMessage[] =>
    (chatMessages[chatId] ?? [])
      .filter((m) => !m.isLoading)
      .map((m) => ({ role: m.role, content: m.content }));

  // ---- External (Gemini) chat ----
  const handleExternalMessage = useCallback(
    async (chatId: string, question: string) => {
      const history = buildConversationHistory(chatId);
      const loadingId = `loading-${Date.now()}`;
      addMessage(chatId, { id: loadingId, role: "assistant", content: "...", source: "gemini", isLoading: true });
      setIsAILoading(true);

      const result = await sendExternalMessage(
        {
          provider: "gemini",
          apiKey: "",
          model: settings.geminiModel,
          ollamaBaseUrl: settings.ollamaBaseUrl,
          ollamaModel: settings.ollamaModel,
          geminiApiKey: settings.geminiApiKey,
          geminiModel: settings.geminiModel,
        },
        history,
        question
      );

      replaceMessage(chatId, loadingId, {
        id: Date.now().toString(),
        role: "assistant",
        content: result.error ? `Fehler: ${result.error}` : result.content,
        source: "gemini",
      });
      setIsAILoading(false);
    },
    [chatMessages, settings] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ---- Keyword fallback (no API key) ----
  const keywordFallback = useCallback(
    (question: string, chatId: string, projectData: ProjectData) => {
      const lq = question.toLowerCase();
      const base = { id: Date.now().toString(), role: "assistant" as const };

      if (isSendMessageRequest(lq)) {
        // Extract a name: first capitalised word after send-verb
        const nameMatch = question.match(
          /(?:informiere|benachrichtige|schick|sende|teile mit|gib bescheid)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)?)/i
        );
        const recipientName = nameMatch?.[1] ?? "Ansprechpartner";
        const contact = projectData.contacts.find((c) =>
          c.name.toLowerCase().includes(recipientName.toLowerCase()) ||
          recipientName.toLowerCase().includes(c.name.split(" ")[0].toLowerCase())
        ) ?? { name: recipientName, role: "Kontakt", email: "", phone: "" };
        addMessage(chatId, {
          ...base,
          content: `Ich habe eine Nachricht für ${contact.name} vorbereitet:`,
          outgoingMessage: {
            recipient: contact,
            subject: "Projektinfo",
            body: question,
          },
        });
      } else if (isSharepointQuestion(lq)) {
        addMessage(chatId, { ...base, content: "Hier sind die aktuellen SharePoint-Dokumente:", source: "sharepoint", sharepointDocs: projectData.sharepoint });
      } else if (isEmailQuestion(lq)) {
        addMessage(chatId, { ...base, content: "Hier sind Ihre letzten E-Mails:", source: "email", emails: projectData.emails });
      } else if (isLoopQuestion(lq)) {
        addMessage(chatId, { ...base, content: "Hier sind die aktuellen MS Loop-Seiten:", source: "msloop", loopPages: projectData.msLoop });
      } else if (isContactQuestion(lq)) {
        addMessage(chatId, { ...base, content: "Hier sind Ihre Ansprechpartner:", source: "teams", contactInfo: projectData.contacts });
      } else if (isMyTasksQuestion(lq)) {
        addMessage(chatId, { ...base, content: "Hier sind Ihre offenen Aufgaben:", source: "jira", myTasks: projectData.myTasks });
      } else if (isTicketCreationRequest(lq)) {
        const priority: "high" | "medium" | "low" =
          lq.includes("bug") || lq.includes("fehler") ? "high" : lq.includes("test") ? "low" : "medium";
        addMessage(chatId, {
          ...base,
          content: "Ich habe ein neues Jira-Ticket erstellt:",
          source: "jira",
          ticketInfo: {
            title: "Neue Aufgabe",
            description: "Erstellt per Assistent.",
            priority,
            assignee: userData?.employeeNumber || "—",
            storyPoints: 3,
          },
        });
      } else if (isAppointmentQuestion(lq)) {
        const showAll =
          lq.includes("termine") || lq.includes("alle") || lq.includes("kalender") || lq.includes("meetings");
        if (showAll) {
          addMessage(chatId, { ...base, content: "Hier sind Ihre anstehenden Termine:", source: "teams", meetingsList: projectData.meetings });
        } else {
          addMessage(chatId, { ...base, content: "Ihr nächster Termin:", source: "teams", meetingInfo: projectData.meetings[0] });
        }
      } else if (isSprintStatusQuestion(lq)) {
        const si = projectData.sprintInfo;
        addMessage(chatId, {
          ...base,
          content: `Sprint ${si.sprintNumber}: Woche ${si.currentWeek}/${si.totalWeeks}, ${si.completedTasks}/${si.totalTasks} Aufgaben erledigt.`,
          source: "jira",
          sprintInfo: si,
          allSprints: projectData.sprints,
        });
      } else if (isOnboardingQuestion(lq)) {
        addMessage(chatId, { ...base, content: "Herzlich willkommen! Hier ist alles Wichtige für Ihren Start:", source: "jira", showOnboardingTable: true });
      } else if (lq.includes("bedeutet")) {
        setPendingChatGPTQuestion(question);
        addMessage(chatId, { ...base, content: "", showChatGPTOffer: true });
      } else {
        addMessage(chatId, {
          ...base,
          content:
            "Kein API-Key konfiguriert. Bitte tragen Sie Ihren OpenAI API-Key in den Einstellungen ein (⚙️), um intelligente Antworten zu erhalten.",
        });
      }
    },
    [userData, addMessage] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ---- Project AI response ----
  const handleProjectMessage = useCallback(
    async (question: string, chatId: string) => {
      const lowerQuestion = question.toLowerCase();

      const history = buildConversationHistory(chatId);

      // Overview mode — AI-powered cross-project router via Ollama/Gemini
      if (currentProject.type === "overview") {
        const loadingId = `loading-${Date.now()}`;
        addMessage(chatId, { id: loadingId, role: "assistant", content: "...", isLoading: true });
        setIsAILoading(true);

        const overviewResult = await analyzeOverviewQuery(
          {
            provider: "gemini",
            apiKey: "",
            model: settings.geminiModel,
            ollamaBaseUrl: settings.ollamaBaseUrl,
            ollamaModel: settings.ollamaModel,
            geminiApiKey: settings.geminiApiKey,
            geminiModel: settings.geminiModel,
          },
          settings.projects,
          question,
          history
        );

        removeMessage(chatId, loadingId);
        setIsAILoading(false);

        if (overviewResult.error) {
          addMessage(chatId, {
            id: Date.now().toString(),
            role: "assistant",
            content: `Ich konnte die Anfrage leider nicht verarbeiten. Bitte stelle sicher, dass Ollama läuft oder ein API-Key konfiguriert ist.`,
          });
          return;
        }

        if (overviewResult.action === "project_redirect" && overviewResult.projectId) {
          addMessage(chatId, {
            id: Date.now().toString(),
            role: "assistant",
            content: overviewResult.content,
            projectRedirect: {
              projectName: overviewResult.projectName ?? overviewResult.projectId,
              projectId: overviewResult.projectId,
            },
          });
        } else if (overviewResult.action === "clarify") {
          addMessage(chatId, {
            id: Date.now().toString(),
            role: "assistant",
            content: overviewResult.content,
            source: "teams",
          });
        } else {
          addMessage(chatId, {
            id: Date.now().toString(),
            role: "assistant",
            content: overviewResult.content,
          });
        }
        return;
      }

      const projectData = settings.projects[currentProject.id];
      if (!projectData) return;

      const lq = lowerQuestion;

      // Keyword pre-filter: if this is clearly a project question, skip LLM classification.
      // This prevents the model from mis-classifying known topics as EXTERN.
      const isKnownProjectQuestion =
        isSprintStatusQuestion(lq) ||
        isAppointmentQuestion(lq) ||
        isMyTasksQuestion(lq) ||
        isTicketCreationRequest(lq) ||
        isSharepointQuestion(lq) ||
        isEmailQuestion(lq) ||
        isLoopQuestion(lq) ||
        isContactQuestion(lq) ||
        isOnboardingQuestion(lq) ||
        isSendMessageRequest(lq);

      const loadingId = `loading-${Date.now()}`;
      addMessage(chatId, { id: loadingId, role: "assistant", content: "...", isLoading: true });
      setIsAILoading(true);

      // Step 1: Classify (only for questions the keyword matcher doesn't recognise)
      if (!isKnownProjectQuestion) {
        const classification = await classifyRequest(buildOllamaConfig(), question);
        if (classification === "EXTERN") {
          removeMessage(chatId, loadingId);
          setIsAILoading(false);
          setPendingChatGPTQuestion(question);
          addMessage(chatId, { id: Date.now().toString(), role: "assistant", content: "", showChatGPTOffer: true });
          return;
        }
      }

      // Step 2: INTERN → ask LLM with project context
      // send_message needs content generation → use Gemini; everything else uses Ollama
      const llmConfig = isSendMessageRequest(lq) ? buildGeminiConfig() : buildOllamaConfig();
      const gpResult = await sendProjectMessage(
        llmConfig,
        currentProject.name,
        projectData,
        history,
        question
      );

      removeMessage(chatId, loadingId);
      setIsAILoading(false);

      // Any error OR unparseable LLM output on a known project question
      // → keyword fallback guarantees a graphical card is always shown.
      if (gpResult.error || (gpResult.action === "text" && isKnownProjectQuestion)) {
        keywordFallback(question, chatId, projectData);
        return;
      }

      // Short, fixed intro text for card-type actions.
      // The rich card carries all the detail; raw LLM markdown would only clutter.
      const card = (content: string): Message => ({
        id: Date.now().toString(),
        role: "assistant",
        content,
      });

      switch (gpResult.action) {
        case "sprint_status":
          addMessage(chatId, { ...card("Hier ist der aktuelle Sprint-Status:"), source: "jira", sprintInfo: projectData.sprintInfo, allSprints: projectData.sprints });
          break;
        case "meetings":
          addMessage(chatId, { ...card("Hier sind Ihre anstehenden Termine:"), source: "teams", meetingsList: projectData.meetings });
          break;
        case "meeting_single":
          addMessage(chatId, { ...card("Hier ist Ihr nächster Termin:"), source: "teams", meetingInfo: projectData.meetings[0] });
          break;
        case "my_tasks":
          addMessage(chatId, { ...card("Hier sind Ihre offenen Aufgaben:"), source: "jira", myTasks: projectData.myTasks });
          break;
        case "contacts":
          addMessage(chatId, { ...card("Hier sind Ihre Ansprechpartner:"), source: "teams", contactInfo: projectData.contacts });
          break;
        case "onboarding":
          addMessage(chatId, { ...card("Herzlich willkommen! Hier ist alles Wichtige für Ihren Start:"), source: "jira", showOnboardingTable: true });
          break;
        case "sharepoint":
          addMessage(chatId, { ...card("Hier sind die aktuellen SharePoint-Dokumente:"), source: "sharepoint", sharepointDocs: projectData.sharepoint });
          break;
        case "email":
          addMessage(chatId, { ...card("Hier sind Ihre letzten E-Mails:"), source: "email", emails: projectData.emails });
          break;
        case "msloop":
          addMessage(chatId, { ...card("Hier sind die aktuellen MS Loop-Seiten:"), source: "msloop", loopPages: projectData.msLoop });
          break;
        case "create_ticket":
          addMessage(chatId, {
            ...card("Ich habe ein neues Jira-Ticket für Sie erstellt:"),
            source: "jira",
            ticketInfo: {
              title: gpResult.ticketData?.title ?? "Neue Aufgabe",
              description: gpResult.ticketData?.description ?? "Erstellt per KI-Assistent.",
              priority: gpResult.ticketData?.priority ?? "medium",
              assignee: userData?.employeeNumber || "Nicht zugewiesen",
              storyPoints: gpResult.ticketData?.storyPoints ?? 3,
            },
          });
          break;
        case "send_message": {
          const md = gpResult.messageData;
          const recipientName = md?.recipientName ?? "";
          const allContacts = [
            ...projectData.contacts,
            ...(projectData.onboarding?.contacts ?? []),
          ];
          const contact = (recipientName
            ? allContacts.find((c) =>
                c.name.toLowerCase().includes(recipientName.toLowerCase()) ||
                recipientName.toLowerCase().includes(c.name.split(" ")[0].toLowerCase())
              )
            : undefined) ?? {
            name: recipientName || "Empfänger",
            role: "Kontakt",
            email: "",
            phone: "",
          };
          addMessage(chatId, {
            ...card(`Ich habe eine Nachricht für ${contact.name} vorbereitet:`),
            outgoingMessage: {
              recipient: { name: contact.name, role: contact.role, email: contact.email, phone: contact.phone },
              subject: md?.subject ?? "Projektinfo",
              body: md?.body ?? gpResult.content ?? question,
            },
          });
          break;
        }
        case "chatgpt_offer":
          setPendingChatGPTQuestion(question);
          addMessage(chatId, { id: Date.now().toString(), role: "assistant", content: "", showChatGPTOffer: true });
          break;
        default:
          // Free-text response — render full LLM content as-is
          addMessage(chatId, { id: Date.now().toString(), role: "assistant", content: gpResult.content });
      }
    },
    [currentProject, settings, chatMessages, userData, keywordFallback, addMessage, removeMessage, setIsAILoading] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ---- ChatGPT offer handlers ----
  const handleAcceptChatGPT = (messageId: string) => {
    const question = pendingChatGPTQuestion;
    let chatTitle = "Gemini Chat";
    if (question) {
      const lq = question.toLowerCase();
      if (lq.includes("mobile") || lq.includes("responsive")) chatTitle = "Mobile Responsive Design";
      else if (lq.includes("api")) chatTitle = "API Integration";
      else chatTitle = `Gemini - ${question.substring(0, 30)}...`;
    }

    const newChatId = openGeminiChat(chatTitle, question);
    removeMessage(currentChatId, messageId);
    setPendingChatGPTQuestion("");
    onChatGPTAccepted(newChatId, question);
  };

  const handleDeclineChatGPT = (messageId: string) => {
    removeMessage(currentChatId, messageId);
    setPendingChatGPTQuestion("");
    onChatGPTDeclined(messageId);
  };

  return {
    handleExternalMessage,
    handleProjectMessage,
    handleAcceptChatGPT,
    handleDeclineChatGPT,
    pendingChatGPTQuestion,
  };
}
