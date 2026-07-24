import { Send } from "lucide-react";
import bpcLogo from "figma:asset/580f5bf52086de870cd2d413ab0f628d99a35fc3.png";

interface ChatEmptyStateProps {
  onNewChat: () => void;
}

export function ChatEmptyState({ onNewChat }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="mb-6">
        <img src={bpcLogo} alt="BPC Logo" className="h-20 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-medium text-muted-foreground mb-2">
          Keine Chats vorhanden
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Starten Sie einen neuen Chat, um zu beginnen
        </p>
        <button
          onClick={onNewChat}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 mx-auto"
        >
          <Send className="w-4 h-4" />
          <span>Neuen Chat starten</span>
        </button>
      </div>
    </div>
  );
}
