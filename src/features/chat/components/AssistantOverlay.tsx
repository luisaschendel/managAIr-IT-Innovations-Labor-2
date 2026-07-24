// Floating assistant panel: compact (excerpt + quick actions) or expanded (full content).
// Reopenable via the FAB; keeps the last proactive message after dismissal.

import { useState, useEffect, useRef } from "react";
import { X, Bot, Clock, CheckCircle, ChevronLeft, Sparkles, Plus, Trash2, Pin } from "lucide-react";
import type { ProactiveEntry } from "../hooks/useProactiveOverlay";
import type { TodoItem } from "../../../types/project";

interface AssistantOverlayProps {
  entry: ProactiveEntry;
  isPending: boolean; // false when showing a previously dismissed entry
  todos: TodoItem[];
  todoPinned: boolean;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onRemoveTodo: (id: string) => void;
  onPinTodos: () => void;
}

// ---- Markdown renderer ----------------------------------------

function renderLine(line: string): React.ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-gray-800">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

function MarkdownContent({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        if (/^#{1,4}\s/.test(line)) {
          return (
            <p key={i} className="font-semibold text-gray-800 text-sm mt-3 mb-0.5 first:mt-0">
              {renderLine(line.replace(/^#{1,4}\s+/, ""))}
            </p>
          );
        }

        if (/^[-•]\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-cyan-500 text-xs mt-0.5 shrink-0">•</span>
              <span className="text-xs text-gray-600 leading-relaxed">
                {renderLine(line.replace(/^[-•]\s+/, ""))}
              </span>
            </div>
          );
        }

        return (
          <p key={i} className="text-xs text-gray-700 leading-relaxed">
            {renderLine(line)}
          </p>
        );
      })}
    </div>
  );
}

// ---- Excerpt helper -------------------------------------------

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#{1,4}\s+/gm, "")
    .replace(/^[-•]\s+/gm, "")
    .trim();
}

function getExcerpt(content: string): string {
  const lines = stripMarkdown(content)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const first =
    lines.find((l) => l.replace(/\p{Emoji}/gu, "").trim().length > 10) ??
    lines[0] ??
    "";
  return first.length > 200 ? first.slice(0, 197) + "…" : first;
}

// ---- Component ------------------------------------------------

export function AssistantOverlay({
  entry,
  isPending,
  todos,
  todoPinned,
  onDismiss,
  onSnooze,
  onAddTodo,
  onToggleTodo,
  onRemoveTodo,
  onPinTodos,
}: AssistantOverlayProps) {
  const [expanded, setExpanded] = useState(false);
  const [todoInput, setTodoInput] = useState("");
  const todoInputRef = useRef<HTMLInputElement>(null);

  // Reset to compact whenever a new entry arrives
  useEffect(() => {
    setExpanded(false);
  }, [entry.id]);

  const handleAddTodo = () => {
    if (!todoInput.trim()) return;
    onAddTodo(todoInput);
    setTodoInput("");
    todoInputRef.current?.focus();
  };

  const excerpt = getExcerpt(entry.message.content);
  const openTodos = todos.filter((t) => !t.done);

  return (
    <>
      <style>{`
        @keyframes assistantSlideUp {
          from { transform: translateY(14px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .assistant-overlay-card {
          animation: assistantSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      <div className="w-80">
        <div
          className="assistant-overlay-card rounded-2xl overflow-hidden
                     bg-white/95 backdrop-blur-xl
                     border border-primary/25
                     shadow-[0_0_0_1px_rgba(0,184,230,0.12),0_8px_40px_rgba(0,184,230,0.18),0_0_60px_rgba(0,184,230,0.07)]"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-2.5">
              {expanded ? (
                <button
                  onClick={() => setExpanded(false)}
                  aria-label="Zurück"
                  className="w-7 h-7 rounded-full flex items-center justify-center
                             text-gray-400 hover:text-primary hover:bg-primary/10
                             transition-colors -ml-1"
                >
                  <ChevronLeft size={16} />
                </button>
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center
                             bg-primary
                             shadow-[0_0_14px_rgba(0,184,230,0.5)]"
                >
                  <Bot size={15} className="text-white" />
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest leading-none">
                  {expanded ? "Alle Infos" : "Assistent"}
                </p>
                <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
                  {entry.projectName}
                </p>
              </div>
            </div>

            <button
              onClick={onDismiss}
              aria-label="Schließen"
              className="w-6 h-6 rounded-full flex items-center justify-center
                         text-gray-400 hover:text-gray-600 hover:bg-gray-100
                         transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          {/* ── Body ── */}
          {expanded ? (
            /* ---- Expanded: full formatted content ---- */
            <div className="px-4 pb-4 max-h-[32rem] overflow-y-auto overscroll-contain">
              <MarkdownContent text={entry.message.content} />

              {/* ── To-do section ── */}
              <div className="mt-4 border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                    Meine To-dos
                    {openTodos.length > 0 && (
                      <span className="ml-1.5 text-primary">{openTodos.length}</span>
                    )}
                  </p>
                  <button
                    onClick={onPinTodos}
                    aria-label={todoPinned ? "Liste loslösen" : "Liste fixieren"}
                    title={todoPinned ? "Liste loslösen" : "Liste fixieren"}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium
                                transition-all
                                ${todoPinned
                                  ? "bg-primary/10 text-primary"
                                  : "text-gray-400 hover:text-primary hover:bg-primary/10"
                                }`}
                  >
                    <Pin size={10} className={todoPinned ? "fill-primary" : ""} />
                    {todoPinned ? "Fixiert" : "Fixieren"}
                  </button>
                </div>

                {todos.length > 0 && (
                  <ul className="mb-2 space-y-1">
                    {todos.map((todo) => (
                      <li key={todo.id} className="flex items-center gap-2 group">
                        <button
                          onClick={() => onToggleTodo(todo.id)}
                          className={`shrink-0 text-xs ${todo.done ? "text-primary" : "text-gray-300 hover:text-primary"} transition-colors`}
                          aria-label={todo.done ? "Als offen markieren" : "Erledigt markieren"}
                        >
                          {todo.done ? "✓" : "○"}
                        </button>
                        <span className={`text-xs flex-1 leading-relaxed ${todo.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                          {todo.text}
                        </span>
                        <button
                          onClick={() => onRemoveTodo(todo.id)}
                          aria-label="Entfernen"
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400
                                     transition-all shrink-0"
                        >
                          <Trash2 size={11} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-1.5">
                  <input
                    ref={todoInputRef}
                    type="text"
                    value={todoInput}
                    onChange={(e) => setTodoInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                    placeholder="To-do hinzufügen…"
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200
                               bg-gray-50 placeholder-gray-400 text-gray-700
                               focus:outline-none focus:border-primary/50 focus:bg-white
                               transition-colors"
                  />
                  <button
                    onClick={handleAddTodo}
                    aria-label="Hinzufügen"
                    disabled={!todoInput.trim()}
                    className="w-7 h-7 flex items-center justify-center rounded-lg
                               bg-primary text-white
                               hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed
                               active:scale-95 transition-all shrink-0"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Confirm dismiss at bottom of detail view */}
              <button
                onClick={onDismiss}
                className="mt-4 flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl
                           bg-gray-50 hover:bg-gray-100
                           text-gray-600 text-[11px] font-medium
                           border border-gray-200
                           active:scale-95 transition-all duration-150"
              >
                <CheckCircle size={12} />
                Alles klar, danke
              </button>
            </div>
          ) : (
            /* ---- Compact: excerpt + quick actions ---- */
            <div className="px-4 pb-4">
              {!isPending && (
                <div className="flex items-center gap-1.5 mb-2 text-[10px] text-gray-400">
                  <Sparkles size={10} />
                  Letzte Nachricht
                </div>
              )}
              <p className="text-sm text-gray-700 leading-relaxed mb-4">{excerpt}</p>

              <div className="flex flex-col gap-2">
                {/* Primary CTA — opens detail view */}
                <button
                  onClick={() => setExpanded(true)}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl
                             bg-primary
                             text-white text-xs font-semibold
                             hover:bg-primary/90
                             active:scale-95 transition-all duration-150 shadow-sm"
                >
                  <Bot size={13} />
                  Ja, bitte zeigen
                </button>

                {/* Secondary row — only shown for pending (actionable) entries */}
                {isPending && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSnooze(5)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl
                                 bg-gray-50 hover:bg-gray-100
                                 text-gray-600 text-[11px] font-medium
                                 border border-gray-200
                                 active:scale-95 transition-all duration-150"
                    >
                      <Clock size={12} />
                      In 5 Min.
                    </button>
                    <button
                      onClick={onDismiss}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl
                                 bg-gray-50 hover:bg-gray-100
                                 text-gray-600 text-[11px] font-medium
                                 border border-gray-200
                                 active:scale-95 transition-all duration-150"
                    >
                      <CheckCircle size={12} />
                      Danke, ich weiß
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
