import { useState } from "react";
import {
  Settings,
  X,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  DatabaseZap,
} from "lucide-react";
import type {
  AppSettings,
  Contact,
  Meeting,
  SprintTask,
  MyTask,
  SharepointDoc,
  Email,
  LoopPage,
} from "../../../types/project";
import { saveAppSettings, resetAppSettings } from "../../../data/storage";

// Backward-compat aliases used by the rest of this file
type AllDummyData = AppSettings;
const saveDummyData = saveAppSettings;
const resetDummyData = resetAppSettings;

interface DummyDataEditorProps {
  data: AllDummyData;
  onDataChange: (data: AllDummyData) => void;
}

type TabId = "settings" | "jira" | "teams" | "sharepoint" | "email" | "msloop";
type ProjectId = "bmw" | "haspa" | "volkswagen";

const PROJECT_LABELS: Record<ProjectId, string> = {
  bmw: "BMW",
  haspa: "Haspa",
  volkswagen: "Volkswagen",
};

function SectionHeader({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg hover:bg-accent transition-colors font-medium text-sm"
    >
      {open ? (
        <ChevronDown className="w-4 h-4 shrink-0" />
      ) : (
        <ChevronRight className="w-4 h-4 shrink-0" />
      )}
      {label}
    </button>
  );
}

function StringListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={placeholder}
          />
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <Plus className="w-3.5 h-3.5" />
        Hinzufügen
      </button>
    </div>
  );
}

// ---- Format-enforced date input: dd/mm/yyyy ----
function DateInput({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    let result = "";
    for (let i = 0; i < digits.length; i++) {
      if (i === 2 || i === 4) result += "/";
      result += digits[i];
    }
    onChange(result);
  };
  const isValid = value === "" || /^\d{2}\/\d{2}\/\d{4}$/.test(value);
  return (
    <input
      value={value}
      onChange={handle}
      maxLength={10}
      placeholder="27/04/2026"
      className={`w-full border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 transition-colors ${
        !isValid
          ? "border-red-400 focus:ring-red-300"
          : "border-border focus:ring-primary/30"
      } ${className}`}
    />
  );
}

// ---- Format-enforced time input: HH:MM-HH:MM ----
function TimeInput({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    let result = "";
    for (let i = 0; i < digits.length; i++) {
      if (i === 2) result += ":";
      if (i === 4) result += "-";
      if (i === 6) result += ":";
      result += digits[i];
    }
    onChange(result);
  };
  const isValid = value === "" || /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(value);
  return (
    <input
      value={value}
      onChange={handle}
      maxLength={11}
      placeholder="10:00-11:00"
      className={`w-full border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 transition-colors ${
        !isValid
          ? "border-red-400 focus:ring-red-300"
          : "border-border focus:ring-primary/30"
      } ${className}`}
    />
  );
}

// ---- SETTINGS TAB ----
function SettingsTab({
  data,
  onChange,
}: {
  data: AllDummyData;
  onChange: (d: AllDummyData) => void;
}) {
  const [showKey, setShowKey] = useState(false);
  const provider = data.llmProvider;

  const btn = (p: typeof provider, label: string) => (
    <button
      onClick={() => onChange({ ...data, llmProvider: p })}
      className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
        provider === p ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Provider toggle */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">KI-Anbieter</h3>
        <div className="grid grid-cols-3 gap-2">
          {btn("gemini", "✨ Gemini")}
          {btn("openai", "☁️ OpenAI")}
          {btn("ollama", "🖥️ Ollama")}
        </div>
        {provider === "gemini" && (
          <p className="text-xs text-muted-foreground mt-2">
            Primär: Gemini — fällt automatisch auf Ollama zurück wenn nicht erreichbar.
          </p>
        )}
      </div>

      {/* Gemini settings */}
      {provider === "gemini" && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Gemini Einstellungen</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">API-Key</label>
              <div className="flex gap-2">
                <input
                  type={showKey ? "text" : "password"}
                  value={data.geminiApiKey}
                  onChange={(e) => onChange({ ...data, geminiApiKey: e.target.value })}
                  placeholder="AIza..."
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                />
                <button
                  onClick={() => setShowKey((v) => !v)}
                  className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Key erhalten Sie unter aistudio.google.com</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Modell</label>
              <select
                value={data.geminiModel}
                onChange={(e) => onChange({ ...data, geminiModel: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="gemini-2.5-flash-lite-preview-06-17">Gemini 2.5 Flash Lite Preview</option>
                <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite Preview</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (schnell, kostenlos)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (leistungsstark)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* OpenAI settings */}
      {provider === "openai" && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">OpenAI Einstellungen</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                API-Key
              </label>
              <div className="flex gap-2">
                <input
                  type={showKey ? "text" : "password"}
                  value={data.openaiApiKey}
                  onChange={(e) => onChange({ ...data, openaiApiKey: e.target.value })}
                  placeholder="sk-..."
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                />
                <button
                  onClick={() => setShowKey((v) => !v)}
                  className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                  title={showKey ? "Verbergen" : "Anzeigen"}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ihren API-Key erhalten Sie unter platform.openai.com
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Modell
              </label>
              <select
                value={data.openaiModel}
                onChange={(e) => onChange({ ...data, openaiModel: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (schnell, günstig)</option>
                <option value="gpt-4o">GPT-4o (leistungsstark)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (günstigste)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Ollama settings */}
      {provider === "ollama" && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Ollama Einstellungen</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Server-URL
              </label>
              <input
                type="text"
                value={data.ollamaBaseUrl}
                onChange={(e) => onChange({ ...data, ollamaBaseUrl: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Standard: http://localhost:11434
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Modell
              </label>
              <input
                type="text"
                value={data.ollamaModel}
                onChange={(e) => onChange({ ...data, ollamaModel: e.target.value })}
                placeholder="llama3.2"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                z.B. llama3.2, mistral, gemma2
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-amber-800">Einrichtung (einmalig):</p>
              <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                <li>
                  Ollama installieren:{" "}
                  <span className="font-mono bg-amber-100 px-1 rounded">ollama.com</span>
                </li>
                <li>
                  Server starten:{" "}
                  <span className="font-mono bg-amber-100 px-1 rounded">ollama serve</span>
                </li>
                <li>
                  Modell laden:{" "}
                  <span className="font-mono bg-amber-100 px-1 rounded">
                    ollama pull {data.ollamaModel || "llama3.2"}
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          {provider === "ollama"
            ? "Ollama läuft vollständig lokal — keine Daten verlassen Ihren Rechner."
            : "Der API-Key wird nur in Ihrem Browser (localStorage) gespeichert und nie an unsere Server übertragen."}
        </p>
      </div>
    </div>
  );
}

// ---- JIRA TAB ----
function JiraTab({
  data,
  onChange,
  projectId,
}: {
  data: AllDummyData;
  onChange: (d: AllDummyData) => void;
  projectId: ProjectId;
}) {
  const [openSection, setOpenSection] = useState<string | null>("sprint");
  const project = data.projects[projectId];

  const updateProject = (updates: Partial<typeof project>) => {
    onChange({
      ...data,
      projects: {
        ...data.projects,
        [projectId]: { ...project, ...updates },
      },
    });
  };

  const toggle = (s: string) => setOpenSection(openSection === s ? null : s);

  return (
    <div className="space-y-2">
      {/* Sprint Info */}
      <SectionHeader
        label="Sprint Info"
        open={openSection === "sprint"}
        onToggle={() => toggle("sprint")}
      />
      {openSection === "sprint" && (
        <div className="pl-4 pr-2 pb-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["sprintNumber", "Sprint Nr."],
                ["currentWeek", "Akt. Woche"],
                ["totalWeeks", "Ges. Wochen"],
                ["completedTasks", "Erledigt"],
                ["totalTasks", "Gesamt"],
              ] as [keyof typeof project.sprintInfo, string][]
            ).map(([key, label]) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground block mb-1">
                  {label}
                </label>
                <input
                  type="number"
                  value={project.sprintInfo[key] as number}
                  onChange={(e) =>
                    updateProject({
                      sprintInfo: {
                        ...project.sprintInfo,
                        [key]: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Sprint Tasks
            </p>
            <div className="space-y-2">
              {project.sprintInfo.tasks.map((task, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center"
                >
                  <input
                    value={task.title}
                    onChange={(e) => {
                      const tasks = [...project.sprintInfo.tasks];
                      tasks[i] = { ...tasks[i], title: e.target.value };
                      updateProject({
                        sprintInfo: { ...project.sprintInfo, tasks },
                      });
                    }}
                    className="border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Task Titel"
                  />
                  <select
                    value={task.status}
                    onChange={(e) => {
                      const tasks = [...project.sprintInfo.tasks];
                      tasks[i] = {
                        ...tasks[i],
                        status: e.target.value as SprintTask["status"],
                      };
                      updateProject({
                        sprintInfo: { ...project.sprintInfo, tasks },
                      });
                    }}
                    className="border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="completed">Erledigt</option>
                    <option value="in-progress">In Arbeit</option>
                    <option value="pending">Offen</option>
                  </select>
                  <input
                    value={task.assignee || ""}
                    onChange={(e) => {
                      const tasks = [...project.sprintInfo.tasks];
                      tasks[i] = { ...tasks[i], assignee: e.target.value };
                      updateProject({
                        sprintInfo: { ...project.sprintInfo, tasks },
                      });
                    }}
                    className="border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-24"
                    placeholder="Assignee"
                  />
                  <button
                    onClick={() => {
                      const tasks = project.sprintInfo.tasks.filter(
                        (_, j) => j !== i
                      );
                      updateProject({
                        sprintInfo: { ...project.sprintInfo, tasks },
                      });
                    }}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newTask: SprintTask = {
                    id: `${projectId.toUpperCase()}-${Date.now()}`,
                    title: "",
                    status: "pending",
                    assignee: "",
                  };
                  updateProject({
                    sprintInfo: {
                      ...project.sprintInfo,
                      tasks: [...project.sprintInfo.tasks, newTask],
                    },
                  });
                }}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Task hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Tasks */}
      <SectionHeader
        label="Meine Aufgaben"
        open={openSection === "tasks"}
        onToggle={() => toggle("tasks")}
      />
      {openSection === "tasks" && (
        <div className="pl-4 pr-2 pb-3 space-y-3">
          {project.myTasks.map((task, i) => (
            <div
              key={i}
              className="border border-border rounded-lg p-3 space-y-2"
            >
              <div className="flex justify-between items-start">
                <input
                  value={task.id}
                  onChange={(e) => {
                    const tasks = [...project.myTasks];
                    tasks[i] = { ...tasks[i], id: e.target.value };
                    updateProject({ myTasks: tasks });
                  }}
                  className="border border-border rounded px-2 py-1 text-xs font-mono bg-background focus:outline-none w-28"
                  placeholder="ID"
                />
                <button
                  onClick={() =>
                    updateProject({
                      myTasks: project.myTasks.filter((_, j) => j !== i),
                    })
                  }
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                value={task.title}
                onChange={(e) => {
                  const tasks = [...project.myTasks];
                  tasks[i] = { ...tasks[i], title: e.target.value };
                  updateProject({ myTasks: tasks });
                }}
                className="w-full border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Titel"
              />
              <textarea
                value={task.description}
                onChange={(e) => {
                  const tasks = [...project.myTasks];
                  tasks[i] = { ...tasks[i], description: e.target.value };
                  updateProject({ myTasks: tasks });
                }}
                rows={2}
                className="w-full border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="Beschreibung"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">
                    Priorität
                  </label>
                  <select
                    value={task.priority}
                    onChange={(e) => {
                      const tasks = [...project.myTasks];
                      tasks[i] = {
                        ...tasks[i],
                        priority: e.target.value as MyTask["priority"],
                      };
                      updateProject({ myTasks: tasks });
                    }}
                    className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-background focus:outline-none"
                  >
                    <option value="high">Hoch</option>
                    <option value="medium">Mittel</option>
                    <option value="low">Niedrig</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-0.5">
                    Fällig (dd/mm/yyyy)
                  </label>
                  <DateInput
                    value={task.dueDate}
                    onChange={(v) => {
                      const tasks = [...project.myTasks];
                      tasks[i] = { ...tasks[i], dueDate: v };
                      updateProject({ myTasks: tasks });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newTask: MyTask = {
                id: `${projectId.toUpperCase()}-${Date.now()}`,
                title: "",
                description: "",
                priority: "medium",
                dueDate: "",
                project: PROJECT_LABELS[projectId] + " Projekt",
              };
              updateProject({ myTasks: [...project.myTasks, newTask] });
            }}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Aufgabe hinzufügen
          </button>
        </div>
      )}

      {/* Contacts */}
      <SectionHeader
        label="Ansprechpartner"
        open={openSection === "contacts"}
        onToggle={() => toggle("contacts")}
      />
      {openSection === "contacts" && (
        <div className="pl-4 pr-2 pb-3 space-y-3">
          {project.contacts.map((c, i) => (
            <div
              key={i}
              className="border border-border rounded-lg p-3 space-y-2"
            >
              <div className="flex justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Kontakt {i + 1}
                </span>
                <button
                  onClick={() =>
                    updateProject({
                      contacts: project.contacts.filter((_, j) => j !== i),
                    })
                  }
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {(["role", "name", "email", "phone"] as (keyof Contact)[]).map(
                (field) => (
                  <input
                    key={field}
                    value={c[field]}
                    onChange={(e) => {
                      const contacts = [...project.contacts];
                      contacts[i] = { ...contacts[i], [field]: e.target.value };
                      updateProject({ contacts });
                    }}
                    className="w-full border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={
                      field === "role"
                        ? "Rolle"
                        : field === "name"
                        ? "Name"
                        : field === "email"
                        ? "E-Mail"
                        : "Telefon"
                    }
                  />
                )
              )}
            </div>
          ))}
          <button
            onClick={() =>
              updateProject({
                contacts: [
                  ...project.contacts,
                  { role: "", name: "", email: "", phone: "" },
                ],
              })
            }
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Kontakt hinzufügen
          </button>
        </div>
      )}
    </div>
  );
}

// ---- TEAMS TAB ----
function TeamsTab({
  data,
  onChange,
  projectId,
}: {
  data: AllDummyData;
  onChange: (d: AllDummyData) => void;
  projectId: ProjectId;
}) {
  const project = data.projects[projectId];

  const updateProject = (updates: Partial<typeof project>) => {
    onChange({
      ...data,
      projects: {
        ...data.projects,
        [projectId]: { ...project, ...updates },
      },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Teams-Meetings und Termine für das Projekt
      </p>
      {project.meetings.map((meeting, i) => (
        <div
          key={i}
          className="border border-border rounded-lg p-3 space-y-2"
        >
          <div className="flex justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Meeting {i + 1}
            </span>
            <button
              onClick={() =>
                updateProject({
                  meetings: project.meetings.filter((_, j) => j !== i),
                })
              }
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {(["title", "date", "time", "attendees", "location", "agenda"] as (keyof Meeting)[]).map(
            (field) => (
              <div key={field}>
                <label className="text-xs text-muted-foreground block mb-0.5">
                  {field === "title"
                    ? "Titel"
                    : field === "date"
                    ? "Datum (dd/mm/yyyy)"
                    : field === "time"
                    ? "Uhrzeit (HH:MM-HH:MM)"
                    : field === "attendees"
                    ? "Teilnehmer"
                    : field === "location"
                    ? "Ort"
                    : "Agenda"}
                </label>
                {field === "date" ? (
                  <DateInput
                    value={(meeting[field] as string) || ""}
                    onChange={(v) => {
                      const meetings = [...project.meetings];
                      meetings[i] = { ...meetings[i], [field]: v };
                      updateProject({ meetings });
                    }}
                  />
                ) : field === "time" ? (
                  <TimeInput
                    value={(meeting[field] as string) || ""}
                    onChange={(v) => {
                      const meetings = [...project.meetings];
                      meetings[i] = { ...meetings[i], [field]: v };
                      updateProject({ meetings });
                    }}
                  />
                ) : (
                  <input
                    value={(meeting[field] as string) || ""}
                    onChange={(e) => {
                      const meetings = [...project.meetings];
                      meetings[i] = { ...meetings[i], [field]: e.target.value };
                      updateProject({ meetings });
                    }}
                    className="w-full border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                )}
              </div>
            )
          )}
        </div>
      ))}
      <button
        onClick={() =>
          updateProject({
            meetings: [
              ...project.meetings,
              {
                title: "",
                date: "",
                time: "",
                attendees: "",
                location: "Microsoft Teams (Online)",
                agenda: "",
              },
            ],
          })
        }
        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <Plus className="w-3.5 h-3.5" />
        Meeting hinzufügen
      </button>
    </div>
  );
}

// ---- SHAREPOINT TAB ----
function SharepointTab({
  data,
  onChange,
  projectId,
}: {
  data: AllDummyData;
  onChange: (d: AllDummyData) => void;
  projectId: ProjectId;
}) {
  const project = data.projects[projectId];

  const updateProject = (updates: Partial<typeof project>) => {
    onChange({
      ...data,
      projects: { ...data.projects, [projectId]: { ...project, ...updates } },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        SharePoint-Dokumente des Projekts
      </p>
      {project.sharepoint.map((doc, i) => (
        <div
          key={i}
          className="border border-border rounded-lg p-3 space-y-2"
        >
          <div className="flex justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Dokument {i + 1}
            </span>
            <button
              onClick={() =>
                updateProject({
                  sharepoint: project.sharepoint.filter((_, j) => j !== i),
                })
              }
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            value={doc.title}
            onChange={(e) => {
              const sp = [...project.sharepoint];
              sp[i] = { ...sp[i], title: e.target.value };
              updateProject({ sharepoint: sp });
            }}
            className="w-full border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Dokumenttitel"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground block mb-0.5">
                Typ
              </label>
              <select
                value={doc.type}
                onChange={(e) => {
                  const sp = [...project.sharepoint];
                  sp[i] = {
                    ...sp[i],
                    type: e.target.value as SharepointDoc["type"],
                  };
                  updateProject({ sharepoint: sp });
                }}
                className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-background focus:outline-none"
              >
                <option value="Word">Word</option>
                <option value="Excel">Excel</option>
                <option value="PowerPoint">PowerPoint</option>
                <option value="PDF">PDF</option>
                <option value="Andere">Andere</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-0.5">
                Zuletzt geändert
              </label>
              <input
                value={doc.lastModified}
                onChange={(e) => {
                  const sp = [...project.sharepoint];
                  sp[i] = { ...sp[i], lastModified: e.target.value };
                  updateProject({ sharepoint: sp });
                }}
                className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-background focus:outline-none"
                placeholder="z.B. 15. Feb 2026"
              />
            </div>
          </div>
          <input
            value={doc.modifiedBy}
            onChange={(e) => {
              const sp = [...project.sharepoint];
              sp[i] = { ...sp[i], modifiedBy: e.target.value };
              updateProject({ sharepoint: sp });
            }}
            className="w-full border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Bearbeitet von"
          />
        </div>
      ))}
      <button
        onClick={() =>
          updateProject({
            sharepoint: [
              ...project.sharepoint,
              {
                title: "",
                type: "Word",
                lastModified: "",
                modifiedBy: "",
                url: "#",
              },
            ],
          })
        }
        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <Plus className="w-3.5 h-3.5" />
        Dokument hinzufügen
      </button>
    </div>
  );
}

// ---- EMAIL TAB ----
function EmailTab({
  data,
  onChange,
  projectId,
}: {
  data: AllDummyData;
  onChange: (d: AllDummyData) => void;
  projectId: ProjectId;
}) {
  const project = data.projects[projectId];

  const updateProject = (updates: Partial<typeof project>) => {
    onChange({
      ...data,
      projects: { ...data.projects, [projectId]: { ...project, ...updates } },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        E-Mail-Nachrichten im Posteingang
      </p>
      {project.emails.map((email, i) => (
        <div
          key={i}
          className="border border-border rounded-lg p-3 space-y-2"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                E-Mail {i + 1}
              </span>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={email.unread}
                  onChange={(e) => {
                    const emails = [...project.emails];
                    emails[i] = { ...emails[i], unread: e.target.checked };
                    updateProject({ emails });
                  }}
                  className="rounded"
                />
                Ungelesen
              </label>
            </div>
            <button
              onClick={() =>
                updateProject({
                  emails: project.emails.filter((_, j) => j !== i),
                })
              }
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {(["from", "subject", "preview", "date"] as (keyof Email)[]).map(
            (field) =>
              field !== "unread" ? (
                <div key={field}>
                  <label className="text-xs text-muted-foreground block mb-0.5">
                    {field === "from"
                      ? "Von"
                      : field === "subject"
                      ? "Betreff"
                      : field === "preview"
                      ? "Vorschau"
                      : "Datum"}
                  </label>
                  <input
                    value={(email[field] as string) || ""}
                    onChange={(e) => {
                      const emails = [...project.emails];
                      emails[i] = { ...emails[i], [field]: e.target.value };
                      updateProject({ emails });
                    }}
                    className="w-full border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ) : null
          )}
        </div>
      ))}
      <button
        onClick={() =>
          updateProject({
            emails: [
              ...project.emails,
              {
                from: "",
                subject: "",
                preview: "",
                date: "",
                unread: true,
              },
            ],
          })
        }
        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <Plus className="w-3.5 h-3.5" />
        E-Mail hinzufügen
      </button>
    </div>
  );
}

// ---- MS LOOP TAB ----
function MsLoopTab({
  data,
  onChange,
  projectId,
}: {
  data: AllDummyData;
  onChange: (d: AllDummyData) => void;
  projectId: ProjectId;
}) {
  const project = data.projects[projectId];

  const updateProject = (updates: Partial<typeof project>) => {
    onChange({
      ...data,
      projects: { ...data.projects, [projectId]: { ...project, ...updates } },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">MS Loop Seiten und Notizen</p>
      {project.msLoop.map((page, i) => (
        <div
          key={i}
          className="border border-border rounded-lg p-3 space-y-2"
        >
          <div className="flex justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Seite {i + 1}
            </span>
            <button
              onClick={() =>
                updateProject({
                  msLoop: project.msLoop.filter((_, j) => j !== i),
                })
              }
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {(["title", "lastEdited", "editedBy"] as (keyof LoopPage)[]).map(
            (field) =>
              field !== "content" ? (
                <div key={field}>
                  <label className="text-xs text-muted-foreground block mb-0.5">
                    {field === "title"
                      ? "Titel"
                      : field === "lastEdited"
                      ? "Zuletzt bearbeitet"
                      : "Bearbeitet von"}
                  </label>
                  <input
                    value={(page[field] as string) || ""}
                    onChange={(e) => {
                      const loop = [...project.msLoop];
                      loop[i] = { ...loop[i], [field]: e.target.value };
                      updateProject({ msLoop: loop });
                    }}
                    className="w-full border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ) : null
          )}
          <div>
            <label className="text-xs text-muted-foreground block mb-0.5">
              Inhalt (Markdown)
            </label>
            <textarea
              value={page.content}
              onChange={(e) => {
                const loop = [...project.msLoop];
                loop[i] = { ...loop[i], content: e.target.value };
                updateProject({ msLoop: loop });
              }}
              rows={5}
              className="w-full border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-mono"
              placeholder="Inhalt..."
            />
          </div>
        </div>
      ))}
      <button
        onClick={() =>
          updateProject({
            msLoop: [
              ...project.msLoop,
              {
                title: "",
                lastEdited: "Heute",
                editedBy: "",
                content: "",
              },
            ],
          })
        }
        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <Plus className="w-3.5 h-3.5" />
        Loop-Seite hinzufügen
      </button>
    </div>
  );
}

// ---- ONBOARDING TAB ----
function OnboardingTab({
  data,
  onChange,
  projectId,
}: {
  data: AllDummyData;
  onChange: (d: AllDummyData) => void;
  projectId: ProjectId;
}) {
  const project = data.projects[projectId];
  const ob = project.onboarding;
  const [openSection, setOpenSection] = useState<string | null>("goal");
  const toggle = (s: string) => setOpenSection(openSection === s ? null : s);

  const updateOb = (updates: Partial<typeof ob>) => {
    onChange({
      ...data,
      projects: {
        ...data.projects,
        [projectId]: {
          ...project,
          onboarding: { ...ob, ...updates },
        },
      },
    });
  };

  return (
    <div className="space-y-2">
      <SectionHeader
        label="Projektziel"
        open={openSection === "goal"}
        onToggle={() => toggle("goal")}
      />
      {openSection === "goal" && (
        <div className="pl-4 pr-2 pb-3">
          <textarea
            value={ob.projectGoal}
            onChange={(e) => updateOb({ projectGoal: e.target.value })}
            rows={4}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
      )}

      <SectionHeader
        label="Do's & Don'ts"
        open={openSection === "dodos"}
        onToggle={() => toggle("dodos")}
      />
      {openSection === "dodos" && (
        <div className="pl-4 pr-2 pb-3 space-y-4">
          <div>
            <p className="text-xs font-medium text-green-700 mb-2">Do's</p>
            <StringListEditor items={ob.dos} onChange={(dos) => updateOb({ dos })} placeholder="Do-Regel" />
          </div>
          <div>
            <p className="text-xs font-medium text-red-700 mb-2">Don'ts</p>
            <StringListEditor items={ob.donts} onChange={(donts) => updateOb({ donts })} placeholder="Don't-Regel" />
          </div>
        </div>
      )}

      <SectionHeader
        label="Nächster Regeltermin"
        open={openSection === "meeting"}
        onToggle={() => toggle("meeting")}
      />
      {openSection === "meeting" && (
        <div className="pl-4 pr-2 pb-3 space-y-2">
          {(["title", "date", "time", "location"] as const).map((field) => (
            <input
              key={field}
              value={ob.nextMeeting[field]}
              onChange={(e) =>
                updateOb({
                  nextMeeting: { ...ob.nextMeeting, [field]: e.target.value },
                })
              }
              className="w-full border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={
                field === "title" ? "Titel" : field === "date" ? "Datum" : field === "time" ? "Uhrzeit" : "Ort"
              }
            />
          ))}
        </div>
      )}

      <SectionHeader
        label="Links"
        open={openSection === "links"}
        onToggle={() => toggle("links")}
      />
      {openSection === "links" && (
        <div className="pl-4 pr-2 pb-3 space-y-2">
          {ob.links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={link.label}
                onChange={(e) => {
                  const links = [...ob.links];
                  links[i] = { ...links[i], label: e.target.value };
                  updateOb({ links });
                }}
                className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Bezeichnung"
              />
              <input
                value={link.url}
                onChange={(e) => {
                  const links = [...ob.links];
                  links[i] = { ...links[i], url: e.target.value };
                  updateOb({ links });
                }}
                className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="URL"
              />
              <button
                onClick={() =>
                  updateOb({ links: ob.links.filter((_, j) => j !== i) })
                }
                className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              updateOb({ links: [...ob.links, { label: "", url: "#" }] })
            }
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Link hinzufügen
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Main component ----

export function DummyDataEditor({ data, onDataChange }: DummyDataEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("settings");
  const [activeProject, setActiveProject] = useState<ProjectId>("bmw");
  const [localData, setLocalData] = useState<AllDummyData>(data);
  const [saved, setSaved] = useState(false);

  const handleOpen = () => {
    setLocalData(data);
    setSaved(false);
    setIsOpen(true);
  };

  const handleSave = () => {
    saveDummyData(localData);
    onDataChange(localData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm("Alle Dummy-Daten auf Standard zurücksetzen?")) {
      const reset = resetDummyData();
      setLocalData(reset);
      onDataChange(reset);
    }
  };

  const handleClearStorage = () => {
    if (window.confirm("Lokalen Speicher komplett löschen und App neu laden?\n\nDadurch werden alle gespeicherten Daten und Benachrichtigungen zurückgesetzt.")) {
      localStorage.removeItem("innolab_dummy_data");
      localStorage.removeItem("innolab_sent_reminders");
      window.location.reload();
    }
  };

  const TABS: { id: TabId; label: string }[] = [
    { id: "settings", label: "Einstellungen" },
    { id: "jira", label: "Jira" },
    { id: "teams", label: "Teams" },
    { id: "sharepoint", label: "SharePoint" },
    { id: "email", label: "E-Mail" },
    { id: "msloop", label: "MS Loop" },
  ];

  const needsProject = activeTab !== "settings";

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        title="Einstellungen & Dummy-Daten bearbeiten"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative ml-auto h-full w-full max-w-xl bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="font-semibold text-foreground">
                  Einstellungen & Dummy-Daten
                </h2>
                <p className="text-xs text-muted-foreground">
                  Konfigurieren Sie den Chatbot und passen Sie die Testdaten an
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-border overflow-x-auto shrink-0">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Project selector (for data tabs) */}
            {needsProject && (
              <div className="flex gap-1 px-5 py-3 border-b border-border bg-accent/30 shrink-0">
                {(Object.keys(PROJECT_LABELS) as ProjectId[]).map((pid) => (
                  <button
                    key={pid}
                    onClick={() => setActiveProject(pid)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeProject === pid
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    {PROJECT_LABELS[pid]}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {activeTab === "settings" && (
                <SettingsTab data={localData} onChange={setLocalData} />
              )}
              {activeTab === "jira" && (
                <JiraTab
                  data={localData}
                  onChange={setLocalData}
                  projectId={activeProject}
                />
              )}
              {activeTab === "teams" && (
                <TeamsTab
                  data={localData}
                  onChange={setLocalData}
                  projectId={activeProject}
                />
              )}
              {activeTab === "sharepoint" && (
                <SharepointTab
                  data={localData}
                  onChange={setLocalData}
                  projectId={activeProject}
                />
              )}
              {activeTab === "email" && (
                <EmailTab
                  data={localData}
                  onChange={setLocalData}
                  projectId={activeProject}
                />
              )}
              {activeTab === "msloop" && (
                <MsLoopTab
                  data={localData}
                  onChange={setLocalData}
                  projectId={activeProject}
                />
              )}
              {activeTab === "jira" && (
                <div className="mt-6 border-t border-border pt-4">
                  <OnboardingTab
                    data={localData}
                    onChange={setLocalData}
                    projectId={activeProject}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-accent/20 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  title="Dummy-Daten auf Standard zurücksetzen"
                >
                  <RotateCcw className="w-4 h-4" />
                  Zurücksetzen
                </button>
                <button
                  onClick={handleClearStorage}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition-colors"
                  title="Lokalen Speicher löschen und App neu laden"
                >
                  <DatabaseZap className="w-4 h-4" />
                  Cache leeren
                </button>
              </div>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  saved
                    ? "bg-green-500 text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                <Save className="w-4 h-4" />
                {saved ? "Gespeichert!" : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
