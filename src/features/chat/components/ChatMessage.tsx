import type { ReactNode } from "react";
import type { MessageSource } from "../../../types/message";
import bpcAvatarLogo from "figma:asset/fdce4d46568785f6d5c30b2cbe525083648b0d11.png";
import userAvatar from "figma:asset/8a3638c76e69e23115b6d9f5207c52d7da020604.png";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  source?: MessageSource;
  isLoading?: boolean;
}

const SOURCE_LABELS: Record<string, string> = {
  jira: "Jira",
  teams: "Microsoft Teams",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  sharepoint: "SharePoint",
  email: "E-Mail",
  msloop: "MS Loop",
};

function renderInline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

function renderMarkdown(content: string): ReactNode {
  return (
    <div className="space-y-1">
      {content.split("\n").map((line, i) => {
        if (line.startsWith("# "))
          return <p key={i} className="font-bold text-lg mt-2 mb-1">{renderInline(line.slice(2))}</p>;
        if (line.startsWith("## "))
          return <p key={i} className="font-semibold text-base mt-2 mb-0.5">{renderInline(line.slice(3))}</p>;
        if (line.startsWith("### "))
          return <p key={i} className="font-semibold text-sm mt-1">{renderInline(line.slice(4))}</p>;
        if (line.startsWith("- ") || line.startsWith("* "))
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-0.5 shrink-0">•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        const numberedMatch = line.match(/^(\d+)\.\s(.*)$/);
        if (numberedMatch)
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="shrink-0">{numberedMatch[1]}.</span>
              <span>{renderInline(numberedMatch[2])}</span>
            </div>
          );
        if (line === "") return <div key={i} className="h-1.5" />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

export function ChatMessage({ role, content, source, isLoading }: ChatMessageProps) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src={bpcAvatarLogo} alt="BPC AI" className="w-full h-full object-cover" />
        </div>
      )}
      <div className={`max-w-[70%] ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser ? "bg-primary text-primary-foreground" : "bg-white border border-border shadow-sm"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            renderMarkdown(content)
          )}
        </div>
        {source && !isUser && !isLoading && (
          <div className="mt-1 px-2 text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Quelle: {SOURCE_LABELS[source] ?? source}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}
