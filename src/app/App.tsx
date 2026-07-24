// App root: composes feature hooks and the top-level layout. Business logic lives in the feature hooks.

import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useProjectSelector } from "../features/project/hooks/useProjectSelector";
import { useChat } from "../features/chat/hooks/useChat";
import { useMessageRouter } from "../features/chat/hooks/useMessageRouter";
import { useReminderScheduler } from "../features/chat/hooks/useReminderScheduler";
import { useProactiveOverlay } from "../features/chat/hooks/useProactiveOverlay";
import { useTodos } from "../features/todos/hooks/useTodos";
import { TodoPanel } from "../features/todos/components/TodoPanel";
import { LoginScreen } from "../features/auth/components/LoginScreen";
import { ChatSidebar } from "../features/chat/components/ChatSidebar";
import { AssistantOverlay } from "../features/chat/components/AssistantOverlay";
import { ChatInput } from "../features/chat/components/ChatInput";
import { ChatEmptyState } from "../features/chat/components/ChatEmptyState";
import { ExternalChatWarning } from "../features/chat/components/ExternalChatWarning";
import { VoiceRecordingIndicator } from "../features/chat/components/VoiceRecordingIndicator";
import { MessageRenderer } from "../features/chat/components/MessageRenderer";
import { AppHeader } from "./components/AppHeader";
import { loadAppSettings, saveAppSettings } from "../data/storage";
import type { AppSettings } from "../types/project";
import type { Message } from "../types/message";
import type { ProjectEntry } from "../features/project/types";

export default function App() {
  // ---- Auth ----
  const { isLoggedIn, userData, handleLogin } = useAuth();

  // ---- App data (settings + project data) ----
  const [settings, setSettings] = useState<AppSettings>(loadAppSettings);

  const handleSettingsChange = useCallback((next: AppSettings) => {
    saveAppSettings(next);
    setSettings(next);
  }, []);

  // ---- Project selection ----
  const {
    currentProject,
    setCurrentProject,
    availableProjects,
    showDropdown,
    setShowDropdown,
    selectProject,
    addProject,
  } = useProjectSelector(settings, handleSettingsChange);

  // ---- Chat state ----
  const chat = useChat(currentProject);

  // ---- Session initialization: personalized welcome on login ----
  useEffect(() => {
    if (isLoggedIn && userData && chat.chatHistory.length === 0) {
      chat.initializeWelcomeChat(userData.employeeNumber);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // ---- Proactive overlay (badge + assistant card) ----
  const overlay = useProactiveOverlay();

  // ---- Per-project todo list ----
  const projectId = currentProject.type !== "overview" ? currentProject.id : undefined;
  const { todos, addTodo, toggleTodo, removeTodo } = useTodos(projectId, settings, handleSettingsChange);
  const [todoPinned, setTodoPinned] = useState(false);

  // Track which panel opened first to control stacking order (first opened = bottom)
  const [panelOrder, setPanelOrder] = useState<('overlay' | 'todo')[]>([]);

  // Sync overlay open state into panelOrder (covers both FAB clicks and push notifications)
  useEffect(() => {
    if (overlay.isOpen) {
      setPanelOrder((prev) => prev.includes('overlay') ? prev : [...prev, 'overlay']);
    } else {
      setPanelOrder((prev) => prev.filter((x) => x !== 'overlay'));
    }
  }, [overlay.isOpen]);

  const handleTodoToggle = useCallback(() => {
    setTodoPinned((v) => {
      const next = !v;
      setPanelOrder((prev) =>
        next
          ? prev.includes('todo') ? prev : [...prev, 'todo']
          : prev.filter((x) => x !== 'todo')
      );
      return next;
    });
  }, []);

  // Wrap injectReminderMessage so proactive messages also surface in the overlay
  const injectReminderMessage = useCallback(
    (projectName: string, message: Message) => {
      chat.injectReminderMessage(projectName, message);
      if (message.isProactive) overlay.push(projectName, message);
    },
    [chat.injectReminderMessage, overlay.push] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ---- Proactive reminders (background) ----
  useReminderScheduler(settings, chat.chatMessages, injectReminderMessage);

  // ---- Voice recording (simulated) ----
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setInput("Was ist der aktuelle Status?");
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  // Use a ref so the onChatGPTAccepted callback can safely call handleExternalMessage
  // without a forward-reference issue at hook-call time.
  const externalMessageRef = useRef<(chatId: string, question: string) => Promise<void>>(
    async () => {}
  );

  const router = useMessageRouter({
    settings,
    currentProject,
    currentChatId: chat.currentChatId,
    chatMessages: chat.chatMessages,
    userData,
    setIsAILoading: chat.setIsAILoading,
    addMessage: chat.addMessage,
    replaceMessage: chat.replaceMessage,
    removeMessage: chat.removeMessage,
    openGeminiChat: chat.openGeminiChat,
    onChatGPTAccepted: (newChatId, question) => {
      setTimeout(() => externalMessageRef.current(newChatId, question), 100);
    },
    onChatGPTDeclined: () => {},
  });

  // Sync the ref after every render so callbacks always hold the latest closure
  externalMessageRef.current = router.handleExternalMessage;

  // ---- Send message ----
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || chat.isAILoading) return;

    // Auto-title on first user message (max 5 words)
    const hasUserMessage = chat.messages.some((m) => m.role === "user");
    if (!hasUserMessage) {
      const words = text.trim().split(/\s+/).slice(0, 5).join(" ");
      chat.updateChatTitle(chat.currentChatId, words);
    }

    chat.addMessage(chat.currentChatId, {
      id: Date.now().toString(),
      role: "user",
      content: text,
    });
    setInput("");
    if (chat.isChatGPTChat) {
      await router.handleExternalMessage(chat.currentChatId, text);
    } else {
      await router.handleProjectMessage(text, chat.currentChatId);
    }
  };

  // ---- Meeting + ticket handlers ----
  const handleAcceptMeeting = (title: string) => {
    chat.addMessage(chat.currentChatId, {
      id: Date.now().toString(),
      role: "assistant",
      content: `Sie haben die Besprechung "${title}" angenommen. Wir freuen uns darauf, Sie dabei zu sehen!`,
      source: "jira",
    });
  };

  const handleDeclineMeeting = (title: string) => {
    chat.addMessage(chat.currentChatId, {
      id: Date.now().toString(),
      role: "assistant",
      content: `Sie haben die Besprechung "${title}" abgelehnt. Bitte informieren Sie uns, wenn Sie sich später entscheiden, teilzunehmen.`,
      source: "jira",
    });
  };

  const handleAddTicketToSprint = (ticketTitle: string) => {
    chat.addMessage(chat.currentChatId, {
      id: Date.now().toString(),
      role: "assistant",
      content: `Das Ticket "${ticketTitle}" wurde erfolgreich zum aktuellen Sprint hinzugefügt. Das Team wurde benachrichtigt.`,
      source: "jira",
    });
  };

  const handleSwitchToProject = (projectId: string) => {
    const target = availableProjects.find((p) => p.id === projectId);
    if (!target) return;
    setCurrentProject(target);
    chat.switchToProjectChat(target.name, target.id);
  };

  // ---- Guard: show login until authenticated ----
  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;

  const projectData =
    currentProject.type !== "overview"
      ? settings.projects[currentProject.id]
      : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex">
      <ChatSidebar
        isOpen={chat.sidebarOpen}
        onToggle={() => chat.setSidebarOpen(!chat.sidebarOpen)}
        onNewChat={chat.handleNewChat}
        chatHistory={chat.chatHistory}
        currentChatId={chat.currentChatId}
        currentProjectName={currentProject.name}
        onSelectChat={chat.handleSelectChat}
        onDeleteChat={chat.handleDeleteChat}
      />

      <div className="flex-1 flex flex-col h-screen">
        <AppHeader
          settings={settings}
          currentProject={currentProject}
          availableProjects={availableProjects}
          showDropdown={showDropdown}
          userData={userData}
          isChatGPTChat={chat.isChatGPTChat}
          onToggleDropdown={() => setShowDropdown(!showDropdown)}
          onSelectProject={(p: ProjectEntry) => selectProject(p)}
          onAddProject={addProject}
          onSettingsChange={handleSettingsChange}
        />

        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-cyan-50/20 to-transparent">
          {chat.isChatGPTChat && chat.chatHistory.length > 0 && <ExternalChatWarning />}

          {chat.chatHistory.length === 0 ? (
            <ChatEmptyState onNewChat={chat.handleNewChat} />
          ) : (
            chat.messages.map((message) => (
              <MessageRenderer
                key={message.id}
                message={message}
                projectData={projectData}
                settings={settings}
                currentProjectId={currentProject.id}
                onAcceptChatGPT={router.handleAcceptChatGPT}
                onDeclineChatGPT={router.handleDeclineChatGPT}
                onAcceptMeeting={handleAcceptMeeting}
                onDeclineMeeting={handleDeclineMeeting}
                onAddTicketToSprint={handleAddTicketToSprint}
                onSwitchToProject={handleSwitchToProject}
                onRemoveMessage={(id) => chat.removeMessage(chat.currentChatId, id)}
              />
            ))
          )}
          <div ref={chat.messagesEndRef} />
        </div>

        {isRecording && <VoiceRecordingIndicator />}

        {chat.chatHistory.length > 0 && (
          <ChatInput
            input={input}
            isAILoading={chat.isAILoading}
            isRecording={isRecording}
            isChatGPTChat={chat.isChatGPTChat}
            onInputChange={setInput}
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
            onToggleRecording={toggleRecording}
            todoCount={todos.filter((t) => !t.done).length}
            onTodoOpen={handleTodoToggle}
            badgeCount={overlay.badgeCount}
            onChatOpen={overlay.toggle}
          />
        )}
      </div>

      {/* Shared panel stack — first opened sits at the bottom */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col-reverse gap-3 items-end pointer-events-none">
        {panelOrder.map((id) => {
          if (id === 'overlay' && overlay.isOpen && overlay.displayEntry) {
            return (
              <div key="overlay" className="pointer-events-auto">
                <AssistantOverlay
                  entry={overlay.displayEntry}
                  isPending={overlay.current !== null}
                  todos={todos}
                  todoPinned={todoPinned}
                  onDismiss={overlay.dismiss}
                  onSnooze={overlay.snooze}
                  onAddTodo={addTodo}
                  onToggleTodo={toggleTodo}
                  onRemoveTodo={removeTodo}
                  onPinTodos={handleTodoToggle}
                />
              </div>
            );
          }
          if (id === 'todo' && todoPinned) {
            return (
              <div key="todo" className="pointer-events-auto">
                <TodoPanel
                  projectName={currentProject.name}
                  todos={todos}
                  onAdd={addTodo}
                  onToggle={toggleTodo}
                  onRemove={removeTodo}
                  onClose={handleTodoToggle}
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
