// Per-project todo list persisted in AppSettings.
import type { AppSettings, TodoItem } from "../../../types/project";

export function useTodos(
  projectId: string | undefined,
  settings: AppSettings,
  onSettingsChange: (s: AppSettings) => void
) {
  const isOverview = !projectId || projectId === "overview";
  const todos: TodoItem[] = isOverview
    ? []
    : (settings.projects[projectId]?.todos ?? []);

  const persist = (updated: TodoItem[]) => {
    if (isOverview) return;
    onSettingsChange({
      ...settings,
      projects: {
        ...settings.projects,
        [projectId!]: {
          ...settings.projects[projectId!],
          todos: updated,
        },
      },
    });
  };

  const addTodo = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    persist([...todos, { id: `todo-${Date.now()}`, text: trimmed, done: false }]);
  };

  const toggleTodo = (id: string) => {
    persist(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeTodo = (id: string) => {
    persist(todos.filter((t) => t.id !== id));
  };

  return { todos, addTodo, toggleTodo, removeTodo };
}
