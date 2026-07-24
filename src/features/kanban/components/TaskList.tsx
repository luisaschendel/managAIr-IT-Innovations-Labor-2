import { Clock, AlertCircle, ArrowRight, User, Tag } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  project: string;
}

interface TaskListProps {
  tasks: Task[];
}

const PRIORITY = {
  high:   { label: "Hoch",    dot: "bg-red-500",    badge: "bg-red-50 text-red-700 border-red-200",    bar: "bg-red-500" },
  medium: { label: "Mittel",  dot: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700 border-yellow-200", bar: "bg-yellow-400" },
  low:    { label: "Niedrig", dot: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200", bar: "bg-green-500" },
};

export function TaskList({ tasks }: TaskListProps) {
  return (
    <div className="mt-3 space-y-2.5">
      {/* Jira-style header */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-4 h-4 rounded bg-[#0052CC] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white">
            <path d="M11.53 2c-.06 6.1 4.87 11.1 11 11.2V2zm.94 10.15L6 18.6l1.56 1.54 6.47-6.45a5.6 5.6 0 0 1-.56-1.54zm9.35 1.55a11.2 11.2 0 0 1-7.24-2.4l-1.55 1.54a13.2 13.2 0 0 0 7.25 3.42z"/>
          </svg>
        </div>
        <span className="text-xs font-semibold text-[#0052CC] uppercase tracking-wide">Jira — Meine Aufgaben</span>
        <span className="ml-auto text-xs text-muted-foreground">{tasks.length} offen</span>
      </div>

      {tasks.map((task) => {
        const p = PRIORITY[task.priority];
        return (
          <div
            key={task.id}
            className="bg-white border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            {/* Priority bar */}
            <div className={`h-0.5 w-full ${p.bar}`} />

            <div className="p-4">
              {/* Top row: ID + priority */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#0052CC] font-semibold">{task.id}</span>
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium ${p.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                  {p.label}
                </span>
              </div>

              {/* Title */}
              <p className="text-sm font-semibold text-foreground mb-1 leading-snug group-hover:text-[#0052CC] transition-colors">
                {task.title}
              </p>

              {/* Description */}
              {task.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
              )}

              {/* Footer meta */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/60">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {task.project}
                </span>
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.dueDate}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1 text-[#0052CC] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {tasks.length === 0 && (
        <div className="text-center py-6 text-sm text-muted-foreground bg-white border border-border rounded-lg">
          Keine offenen Aufgaben 🎉
        </div>
      )}
    </div>
  );
}
