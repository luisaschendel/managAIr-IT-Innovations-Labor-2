import { useRef } from "react";
import { Mic, MicOff, Paperclip, Send, MessageCircle, ClipboardList } from "lucide-react";

interface ChatInputProps {
  input: string;
  isAILoading: boolean;
  isRecording: boolean;
  isChatGPTChat: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: { preventDefault(): void }) => void;
  onToggleRecording: () => void;
  badgeCount?: number;
  onChatOpen?: () => void;
  todoCount?: number;
  onTodoOpen?: () => void;
}

export function ChatInput({
  input,
  isAILoading,
  isRecording,
  isChatGPTChat,
  onInputChange,
  onSubmit,
  onToggleRecording,
  badgeCount = 0,
  onChatOpen,
  todoCount = 0,
  onTodoOpen,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-t border-border bg-white/50 backdrop-blur-sm p-4">
      <form onSubmit={onSubmit} className="flex gap-3 max-w-4xl mx-auto">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={
            isChatGPTChat
              ? "Stellen Sie ChatGPT eine Frage..."
              : "Stellen Sie eine Frage zu Jira, Teams, SharePoint, E-Mail oder MS Loop..."
          }
          disabled={isAILoading}
          className="flex-1 px-4 py-3 rounded-xl bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60"
        />
        <button
          type="button"
          disabled={isAILoading}
          className="px-4 py-3 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-all disabled:opacity-60"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onToggleRecording}
          disabled={isAILoading}
          className={`px-4 py-3 rounded-xl transition-all disabled:opacity-60 ${
            isRecording
              ? "bg-destructive text-destructive-foreground animate-pulse"
              : "bg-muted text-foreground hover:bg-muted/80"
          }`}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button
          type="submit"
          disabled={!input.trim() || isAILoading}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isAILoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          <span className="hidden sm:inline">{isAILoading ? "Lädt..." : "Senden"}</span>
        </button>

        {/* Todo list button */}
        {onTodoOpen && (
          <button
            type="button"
            onClick={onTodoOpen}
            aria-label="To-do Liste öffnen"
            className="relative px-4 py-3 rounded-xl bg-primary text-primary-foreground
                       hover:bg-primary/90 active:scale-95
                       transition-all duration-200 flex items-center justify-center
                       shadow-[0_2px_12px_rgba(0,184,230,0.35)]"
          >
            <ClipboardList className="w-5 h-5" />
            {todoCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-cyan-500 text-white text-[10px] font-bold shadow">
                  {todoCount > 9 ? "9+" : todoCount}
                </span>
              </span>
            )}
          </button>
        )}

        {/* Chat assistant button — shows badge when proactive messages are pending */}
        {onChatOpen && (
          <button
            type="button"
            onClick={onChatOpen}
            aria-label="Assistent öffnen"
            className="relative px-4 py-3 rounded-xl bg-primary text-primary-foreground
                       hover:bg-primary/90 active:scale-95
                       transition-all duration-200 flex items-center justify-center
                       shadow-[0_2px_12px_rgba(0,184,230,0.35)]"
          >
            <MessageCircle className="w-5 h-5" />
            {badgeCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-70" />
                <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow">
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              </span>
            )}
          </button>
        )}
      </form>
    </div>
  );
}
