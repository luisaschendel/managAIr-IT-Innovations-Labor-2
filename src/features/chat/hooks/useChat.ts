// Owns all chat state: messages, history, active chat, and chat CRUD.
import { useState, useRef, useEffect } from "react";
import type { Message, ChatHistory } from "../../../types/message";
import type { ProjectEntry } from "../../project/types";

export function useChat(currentProject: ProjectEntry) {
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({});
  const [currentChatId, setCurrentChatId] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = chatMessages[currentChatId] ?? [];
  const currentChat = chatHistory.find((c) => c.id === currentChatId);
  const isChatGPTChat = currentChat?.type === "chatgpt";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When the active project changes, switch to an existing chat for that project
  // or create a new one — so the first message always lands in the right place.
  useEffect(() => {
    if (chatHistory.length === 0) return; // not logged in yet

    const existing = chatHistory.find((c) => c.projectName === currentProject.name);
    if (existing) {
      setCurrentChatId(existing.id);
      return;
    }

    const newChatId = `chat-${currentProject.id}-${Date.now()}`;
    const welcomeContent =
      currentProject.type === "overview"
        ? "Hallo! Ich bin Ihr allgemeiner AI-Assistent. Ich kann Ihnen eine Übersicht über alle Ihre Projekte geben und projektübergreifende Fragen beantworten. Wie kann ich Ihnen helfen?"
        : `Hallo! Ich bin Ihr AI-Assistent für das ${currentProject.name}-Projekt. Ich habe Zugriff auf Jira, Teams, SharePoint, E-Mail und MS Loop. Wie kann ich Ihnen heute weiterhelfen?`;
    setChatHistory((prev) => [
      {
        id: newChatId,
        title: `${currentProject.name} - Chat`,
        timestamp: "Jetzt",
        preview: "Neuer Chat erstellt",
        type: "project" as const,
        projectName: currentProject.name,
      },
      ...prev,
    ]);
    setChatMessages((prev) => ({
      ...prev,
      [newChatId]: [{ id: `welcome-${Date.now()}`, role: "assistant" as const, content: welcomeContent }],
    }));
    setCurrentChatId(newChatId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject.id]);

  const handleNewChat = () => {
    const newChatId = `chat-new-${Date.now()}`;
    const newChat: ChatHistory = {
      id: newChatId,
      title: `Neuer Chat - ${currentProject.name}`,
      timestamp: "Jetzt",
      preview: "Neuer Chat erstellt",
      type: "project",
      projectName: currentProject.name,
    };
    const welcomeContent =
      currentProject.type === "overview"
        ? "Hallo! Ich bin Ihr allgemeiner AI-Assistent. Ich kann Ihnen eine Übersicht über alle Ihre Projekte geben und projektübergreifende Fragen beantworten. Wie kann ich Ihnen helfen?"
        : `Hallo! Ich bin Ihr AI-Assistent für das ${currentProject.name}-Projekt. Ich habe Zugriff auf Jira, Teams, SharePoint, E-Mail und MS Loop. Wie kann ich Ihnen heute weiterhelfen?`;

    setChatHistory((prev) => [newChat, ...prev]);
    setChatMessages((prev) => ({
      ...prev,
      [newChatId]: [{ id: `welcome-${Date.now()}`, role: "assistant", content: welcomeContent }],
    }));
    setCurrentChatId(newChatId);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    if (!chatMessages[chatId]) {
      setChatMessages((prev) => ({ ...prev, [chatId]: [] }));
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
    setChatMessages((prev) => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
    if (currentChatId === chatId) {
      const remaining = chatHistory.filter((chat) => chat.id !== chatId);
      setCurrentChatId(remaining.length > 0 ? remaining[0].id : "");
    }
  };

  const openGeminiChat = (title: string, initialQuestion: string): string => {
    const newChatId = `gemini-${Date.now()}`;
    const newChat: ChatHistory = {
      id: newChatId,
      title,
      timestamp: "Jetzt",
      preview: "Gemini aktiviert",
      type: "chatgpt",
      projectName: currentProject.name,
    };
    const initialMessages: Message[] = initialQuestion
      ? [{ id: `user-${Date.now()}`, role: "user", content: initialQuestion }]
      : [];

    setChatHistory((prev) => [newChat, ...prev]);
    setChatMessages((prev) => ({ ...prev, [newChatId]: initialMessages }));
    setCurrentChatId(newChatId);
    return newChatId;
  };

  const switchToProjectChat = (projectName: string, projectId: string): string => {
    const newChatId = `chat-${projectId}-${Date.now()}`;
    const newChat: ChatHistory = {
      id: newChatId,
      title: `${projectName} - Chat`,
      timestamp: "Jetzt",
      preview: `Automatisch gewechselt zu ${projectName}`,
      type: "project",
      projectName,
    };
    setChatHistory((prev) => [newChat, ...prev]);
    setChatMessages((prev) => ({
      ...prev,
      [newChatId]: [
        {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: `Willkommen im ${projectName}-Projekt Agent! Wie kann ich Ihnen heute weiterhelfen?`,
        },
      ],
    }));
    setCurrentChatId(newChatId);
    return newChatId;
  };

  const initializeWelcomeChat = (username: string) => {
    const newChatId = `chat-welcome-${Date.now()}`;
    const today = new Date().toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const welcomeContent = `Guten Tag, ${username}. Wir haben heute das ${today}. Ich stehe bereit, um dir bei der Suche nach Informationen zu helfen oder deine Fragen direkt zu klären. Was steht als Erstes auf deiner Liste?`;
    const newChat: ChatHistory = {
      id: newChatId,
      title: "Allgemeiner Chat",
      timestamp: "Jetzt",
      preview: "Sitzung gestartet",
      type: "project",
      projectName: "Allgemeiner Chat",
    };
    setChatHistory([newChat]);
    setChatMessages({ [newChatId]: [{ id: `welcome-${Date.now()}`, role: "assistant", content: welcomeContent }] });
    setCurrentChatId(newChatId);
  };

  const addMessage = (chatId: string, message: Message) => {
    setChatMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] ?? []), message],
    }));
  };

  const replaceMessage = (chatId: string, messageId: string, replacement: Message) => {
    setChatMessages((prev) => ({
      ...prev,
      [chatId]: (prev[chatId] ?? []).map((m) => (m.id === messageId ? replacement : m)),
    }));
  };

  const removeMessage = (chatId: string, messageId: string) => {
    setChatMessages((prev) => ({
      ...prev,
      [chatId]: (prev[chatId] ?? []).filter((m) => m.id !== messageId),
    }));
  };

  /**
   * Injects a reminder message into the most recent project chat that matches
   * `projectName`. Does NOT change the active chat — the user keeps their context.
   * If no matching chat exists, the reminder is silently dropped (user hasn't
   * opened that project yet and would have no frame of reference).
   */
  const updateChatTitle = (chatId: string, title: string) => {
    setChatHistory((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title } : c))
    );
  };

  const injectReminderMessage = (projectName: string, message: Message) => {
    const targetChat = chatHistory.find(
      (c) => c.type === "project" && c.projectName === projectName
    );
    if (!targetChat) return;
    setChatMessages((prev) => ({
      ...prev,
      [targetChat.id]: [...(prev[targetChat.id] ?? []), message],
    }));
  };

  return {
    // State
    chatMessages,
    currentChatId,
    chatHistory,
    isAILoading,
    setIsAILoading,
    sidebarOpen,
    setSidebarOpen,
    messages,
    isChatGPTChat,
    messagesEndRef,
    // Actions
    handleNewChat,
    handleSelectChat,
    handleDeleteChat,
    openGeminiChat,
    switchToProjectChat,
    initializeWelcomeChat,
    addMessage,
    replaceMessage,
    removeMessage,
    updateChatTitle,
    injectReminderMessage,
  };
}
