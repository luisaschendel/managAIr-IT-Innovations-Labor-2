import { useState } from "react";
import { CheckCircle2, Circle, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "pending";
  assignee?: string;
}

interface SprintData {
  sprintNumber: number;
  currentWeek: number;
  totalWeeks: number;
  completedTasks: number;
  totalTasks: number;
  tasks: Task[];
}

interface SprintTimelineProps extends SprintData {
  allSprints?: SprintData[];
}

const statusLabel: Record<Task["status"], string> = {
  completed: "Abgeschlossen",
  "in-progress": "In Bearbeitung",
  pending: "Offen",
};

const statusColor: Record<Task["status"], string> = {
  completed: "text-green-600 bg-green-50",
  "in-progress": "text-yellow-600 bg-yellow-50",
  pending: "text-muted-foreground bg-accent",
};

export function SprintTimeline({
  sprintNumber,
  currentWeek,
  totalWeeks,
  completedTasks,
  totalTasks,
  tasks,
  allSprints,
}: SprintTimelineProps) {
  // Find the index of the displayed sprint in allSprints (default to last = current)
  const initialIndex = allSprints
    ? allSprints.findIndex((s) => s.sprintNumber === sprintNumber)
    : -1;
  const [sprintIndex, setSprintIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sprint: SprintData =
    allSprints && allSprints.length > 0 ? allSprints[sprintIndex] : { sprintNumber, currentWeek, totalWeeks, completedTasks, totalTasks, tasks };

  const progress = sprint.totalTasks > 0 ? (sprint.completedTasks / sprint.totalTasks) * 100 : 0;
  const hasPrev = allSprints && sprintIndex > 0;
  const hasNext = allSprints && sprintIndex < allSprints.length - 1;

  // Determine if this sprint is the "current" one (the one originally passed in)
  const isCurrentSprint = sprint.sprintNumber === sprintNumber;

  return (
    <div className="mt-3 bg-white border border-border rounded-xl p-4 shadow-sm">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { if (hasPrev) setSprintIndex((i) => i - 1); }}
            disabled={!hasPrev}
            className="p-1 rounded hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground">Sprint {sprint.sprintNumber}</h4>
              {isCurrentSprint && (
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                  Aktuell
                </span>
              )}
              {!isCurrentSprint && sprint.sprintNumber > sprintNumber && (
                <span className="text-xs bg-accent text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                  Geplant
                </span>
              )}
              {!isCurrentSprint && sprint.sprintNumber < sprintNumber && (
                <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">
                  Abgeschlossen
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {sprint.currentWeek > 0
                ? `Woche ${sprint.currentWeek} von ${sprint.totalWeeks}`
                : `${sprint.totalWeeks} Wochen geplant`}
            </p>
          </div>
          <button
            onClick={() => { if (hasNext) setSprintIndex((i) => i + 1); }}
            disabled={!hasNext}
            className="p-1 rounded hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-primary">{Math.round(progress)}%</div>
          <div className="text-xs text-muted-foreground">
            {sprint.completedTasks}/{sprint.totalTasks} Aufgaben
          </div>
        </div>
      </div>

      {/* Sprint dots indicator */}
      {allSprints && allSprints.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {allSprints.map((s, i) => (
            <button
              key={s.sprintNumber}
              onClick={() => setSprintIndex(i)}
              className={`rounded-full transition-all ${
                i === sprintIndex
                  ? "w-4 h-2 bg-primary"
                  : "w-2 h-2 bg-accent hover:bg-primary/30"
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-accent rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Timeline Weeks */}
      <div className="mb-4 flex items-center gap-2">
        {Array.from({ length: sprint.totalWeeks }).map((_, index) => (
          <div key={index} className="flex-1">
            <div
              className={`h-8 rounded flex items-center justify-center text-xs font-medium transition-all ${
                index + 1 < sprint.currentWeek
                  ? "bg-primary text-primary-foreground"
                  : index + 1 === sprint.currentWeek
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-accent text-muted-foreground"
              }`}
            >
              W{index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          {sprint.currentWeek === 0 ? "Geplante Aufgaben" : "Aktive Aufgaben"}
        </div>
        {sprint.tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer text-left"
          >
            {task.status === "completed" ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : task.status === "in-progress" ? (
              <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm flex-1">{task.title}</span>
            {task.assignee && (
              <span className="text-xs text-muted-foreground bg-white px-2 py-0.5 rounded">
                {task.assignee}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Jira Badge */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <span>Jira Sprint Board</span>
        </div>
        <span className="text-xs text-primary font-medium">Live-Daten</span>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-mono text-muted-foreground">{selectedTask.id}</span>
                <h3 className="text-base font-semibold text-foreground mt-1">{selectedTask.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-muted-foreground hover:text-foreground transition-colors ml-4 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">Status</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor[selectedTask.status]}`}
                >
                  {statusLabel[selectedTask.status]}
                </span>
              </div>
              {selectedTask.assignee && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20">Zugewiesen</span>
                  <span className="text-xs text-foreground bg-accent px-2 py-0.5 rounded">
                    {selectedTask.assignee}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">Sprint</span>
                <span className="text-xs text-foreground">Sprint {sprint.sprintNumber}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
