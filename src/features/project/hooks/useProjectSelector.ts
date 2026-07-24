import { useState, useCallback } from "react";
import type { AppSettings } from "../../../types/project";
import type { ProjectEntry } from "../types";
import { saveAppSettings, createEmptyProject } from "../../../data/storage";

export function buildProjectList(settings: AppSettings): ProjectEntry[] {
  return [
    { id: "overview", name: "Allgemeiner Chat", type: "overview" },
    ...Object.entries(settings.projects).map(([id, p]) => ({
      id,
      name: p.name || id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, " "),
      type: "project" as const,
    })),
  ];
}

export function useProjectSelector(
  settings: AppSettings,
  onSettingsChange: (next: AppSettings) => void
) {
  const availableProjects = buildProjectList(settings);

  const [currentProject, setCurrentProject] = useState<ProjectEntry>(
    () => ({ id: "overview", name: "Allgemeiner Chat", type: "overview" })
  );

  const [showDropdown, setShowDropdown] = useState(false);

  const selectProject = useCallback(
    (project: ProjectEntry) => {
      setCurrentProject(project);
      setShowDropdown(false);
    },
    []
  );

  const addProject = useCallback(
    (name: string) => {
      const id = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      if (settings.projects[id]) return "exists";
      const next: AppSettings = {
        ...settings,
        projects: { ...settings.projects, [id]: createEmptyProject(name.trim()) },
      };
      saveAppSettings(next);
      onSettingsChange(next);
      setCurrentProject({ id, name: name.trim(), type: "project" });
      setShowDropdown(false);
      return "ok";
    },
    [settings, onSettingsChange]
  );

  return {
    currentProject,
    setCurrentProject,
    availableProjects,
    showDropdown,
    setShowDropdown,
    selectProject,
    addProject,
  };
}
