// localStorage persistence. Swap this module to plug in a real backend.

import type { AppSettings, ProjectData } from "../types/project";
import { DEFAULT_DATA } from "./defaults";

const STORAGE_KEY = "innolab_dummy_data";

export function loadAppSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AppSettings;
      const mergedProjects: Record<string, ProjectData> = {
        ...DEFAULT_DATA.projects,
        ...parsed.projects,
      };
      // Backfill fields added after initial storage schema
      for (const [id, proj] of Object.entries(mergedProjects)) {
        if (!proj.name) {
          proj.name =
            DEFAULT_DATA.projects[id]?.name ??
            id.charAt(0).toUpperCase() + id.slice(1);
        }
        if (!proj.sprints) {
          proj.sprints = DEFAULT_DATA.projects[id]?.sprints;
        }
        if (!proj.todos) {
          proj.todos = [];
        }
      }
      return { ...DEFAULT_DATA, ...parsed, projects: mergedProjects };
    }
  } catch {
    // Corrupt storage — fall through to defaults
  }
  return DEFAULT_DATA;
}

export function saveAppSettings(data: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetAppSettings(): AppSettings {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_DATA;
}

export function getProjectData(
  settings: AppSettings,
  projectId: string
): ProjectData | undefined {
  return settings.projects[projectId];
}

export function createEmptyProject(name: string): ProjectData {
  return {
    name,
    contacts: [],
    meetings: [],
    sprintInfo: {
      sprintNumber: 1,
      currentWeek: 1,
      totalWeeks: 2,
      completedTasks: 0,
      totalTasks: 0,
      tasks: [],
    },
    myTasks: [],
    todos: [],
    sharepoint: [],
    emails: [],
    msLoop: [],
    onboarding: {
      contacts: [],
      projectGoal: "",
      dos: [],
      donts: [],
      nextMeeting: { title: "", date: "", time: "", location: "" },
      links: [],
    },
  };
}
