import { useState, useRef } from "react";
import { X, Plus, CheckCircle2, Circle, Trash2, ClipboardList } from "lucide-react";
import type { TodoItem } from "../../../types/project";

interface TodoPanelProps {
  projectName: string;
  todos: TodoItem[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export function TodoPanel({
  projectName,
  todos,
  onAdd,
  onToggle,
  onRemove,
  onClose,
}: TodoPanelProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!input.trim()) return;
    onAdd(input);
    setInput("");
    inputRef.current?.focus();
  };

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div className="w-72">
      <div
        className="rounded-2xl overflow-hidden
                   bg-white/95 backdrop-blur-xl
                   border border-primary/25
                   shadow-[0_0_0_1px_rgba(0,184,230,0.12),0_8px_40px_rgba(0,184,230,0.18),0_0_60px_rgba(0,184,230,0.07)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center
                         bg-primary shadow-[0_0_14px_rgba(0,184,230,0.5)]"
            >
              <ClipboardList size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-primary uppercase tracking-widest leading-none">
                To-do Liste
              </p>
              <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="w-6 h-6 rounded-full flex items-center justify-center
                       text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        {/* Todo list */}
        <div className="px-4 py-3 max-h-72 overflow-y-auto overscroll-contain space-y-1">
          {open.length === 0 && done.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-3">Noch keine To-dos</p>
          )}

          {open.map((todo) => (
            <div key={todo.id} className="flex items-center gap-2 group py-0.5">
              <button
                onClick={() => onToggle(todo.id)}
                className="text-gray-300 hover:text-primary transition-colors shrink-0"
                aria-label="Erledigt markieren"
              >
                <Circle size={15} />
              </button>
              <span className="text-xs text-gray-700 flex-1 leading-relaxed">{todo.text}</span>
              <button
                onClick={() => onRemove(todo.id)}
                aria-label="Entfernen"
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400
                           transition-all shrink-0"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}

          {done.length > 0 && (
            <>
              {open.length > 0 && <div className="border-t border-gray-100 my-2" />}
              {done.map((todo) => (
                <div key={todo.id} className="flex items-center gap-2 group py-0.5 opacity-50">
                  <button
                    onClick={() => onToggle(todo.id)}
                    className="text-primary shrink-0"
                    aria-label="Als offen markieren"
                  >
                    <CheckCircle2 size={15} />
                  </button>
                  <span className="text-xs text-gray-500 flex-1 leading-relaxed line-through">
                    {todo.text}
                  </span>
                  <button
                    onClick={() => onRemove(todo.id)}
                    aria-label="Entfernen"
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400
                               transition-all shrink-0"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
          <div className="flex gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="To-do hinzufügen…"
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200
                         bg-gray-50 placeholder-gray-400 text-gray-700
                         focus:outline-none focus:border-primary/50 focus:bg-white
                         transition-colors"
            />
            <button
              onClick={handleAdd}
              aria-label="Hinzufügen"
              disabled={!input.trim()}
              className="w-7 h-7 flex items-center justify-center rounded-lg
                         bg-primary text-white
                         hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed
                         active:scale-95 transition-all shrink-0"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
