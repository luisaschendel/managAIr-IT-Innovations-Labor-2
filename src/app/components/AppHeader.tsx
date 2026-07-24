import type { AppSettings } from "../../types/project";
import type { ProjectEntry } from "../../features/project/types";
import type { UserData } from "../../features/auth/types";
import { ProjectSelector } from "../../features/project/components/ProjectSelector";
import { ConnectionStatus } from "./ConnectionStatus";
import { DummyDataEditor } from "../../features/settings/components/DummyDataEditor";
import bpcLogo from "figma:asset/580f5bf52086de870cd2d413ab0f628d99a35fc3.png";

interface AppHeaderProps {
  settings: AppSettings;
  currentProject: ProjectEntry;
  availableProjects: ProjectEntry[];
  showDropdown: boolean;
  userData: UserData | null;
  isChatGPTChat: boolean;
  onToggleDropdown: () => void;
  onSelectProject: (project: ProjectEntry) => void;
  onAddProject: (name: string) => void;
  onSettingsChange: (next: AppSettings) => void;
}

export function AppHeader({
  settings,
  currentProject,
  availableProjects,
  showDropdown,
  userData,
  isChatGPTChat,
  onToggleDropdown,
  onSelectProject,
  onAddProject,
  onSettingsChange,
}: AppHeaderProps) {
  return (
    <div className="bg-white border-b border-border px-6 py-4">
      <div className="flex items-center gap-4 mb-3">
        <img src={bpcLogo} alt="BPC Logo" className="h-10" />
        <div className="h-8 w-px bg-border" />
        <div className="flex-1">
          <ProjectSelector
            currentProject={currentProject}
            availableProjects={availableProjects}
            showDropdown={showDropdown}
            onToggleDropdown={onToggleDropdown}
            onSelectProject={onSelectProject}
            onAddProject={onAddProject}
          />
          <div className="text-xs text-muted-foreground px-3">
            Mitarbeiter: {userData?.employeeNumber}
          </div>
        </div>
        <DummyDataEditor data={settings} onDataChange={onSettingsChange} />
      </div>
      <ConnectionStatus isChatGPTChat={isChatGPTChat} />
    </div>
  );
}
