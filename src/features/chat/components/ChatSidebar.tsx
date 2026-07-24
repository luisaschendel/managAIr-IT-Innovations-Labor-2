import { MessageSquare, Plus, Clock, Menu, Trash2 } from "lucide-react";
import type { ChatHistory } from "../../../types/message";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  chatHistory: ChatHistory[];
  currentChatId: string;
  currentProjectName: string;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  onNewChat,
  chatHistory,
  currentChatId,
  currentProjectName,
  onSelectChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const visibleChats = chatHistory.filter(
    (c) => c.projectName === currentProjectName
  );
  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-sidebar text-sidebar-foreground flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={onToggle} />
      )}

      <div
        className={`fixed lg:relative top-0 left-0 h-screen w-80 bg-sidebar text-sidebar-foreground flex flex-col z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-sidebar-border">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Neuer Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-sidebar-foreground/60 px-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Verlauf</span>
          </div>
          <div className="space-y-2">
            {visibleChats.map((chat) => (
              <div
                key={chat.id}
                className={`relative w-full text-left px-3 py-3 rounded-lg transition-all group ${
                  currentChatId === chat.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"
                }`}
              >
                <button onClick={() => onSelectChat(chat.id)} className="w-full text-left">
                  <div className="flex items-start gap-3 pr-8">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-sidebar-primary" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-sidebar-foreground truncate mb-1">{chat.title}</h4>
                      <p className="text-xs text-sidebar-foreground/60 line-clamp-2 mb-1">{chat.preview}</p>
                      <p className="text-xs text-sidebar-foreground/40">{chat.timestamp}</p>
                      {chat.type === "project" && (
                        <p className="text-xs text-sidebar-foreground/40">Projekt: {chat.projectName}</p>
                      )}
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                  className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-foreground/50 hover:text-red-500"
                  title="Chat löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/50 text-center">BPC AI Assistant v1.0</div>
        </div>
      </div>
    </>
  );
}
