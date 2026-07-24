import { ChevronDown, Plus } from "lucide-react";
import type { ProjectEntry } from "../types";

interface ProjectSelectorProps {
  currentProject: ProjectEntry;
  availableProjects: ProjectEntry[];
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onSelectProject: (project: ProjectEntry) => void;
  onAddProject: (name: string) => void;
}

export function ProjectSelector({
  currentProject,
  availableProjects,
  showDropdown,
  onToggleDropdown,
  onSelectProject,
  onAddProject,
}: ProjectSelectorProps) {
  const handleAddProject = () => {
    const name = window.prompt("Name des neuen Projekts:");
    if (name?.trim()) onAddProject(name.trim());
  };

  return (
    <div className="relative">
      <button
        onClick={onToggleDropdown}
        className="flex items-center gap-2 hover:bg-accent px-3 py-1.5 rounded-lg transition-colors"
      >
        <span className="text-lg font-medium">
          {currentProject.type === "overview"
            ? currentProject.name
            : `${currentProject.name} - Projekt Agent`}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg py-1 min-w-[220px] z-10">
          {availableProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={`w-full text-left px-4 py-2 hover:bg-accent transition-colors ${
                currentProject.id === project.id ? "bg-accent" : ""
              }`}
            >
              {project.type === "overview" ? project.name : `${project.name} - Projekt Agent`}
            </button>
          ))}
          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={handleAddProject}
              className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center gap-2 text-primary font-medium"
            >
              <Plus className="w-4 h-4" />
              Neues Projekt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
