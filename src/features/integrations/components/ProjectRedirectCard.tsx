import { ArrowRight, Building2 } from "lucide-react";
import vwLogo from "figma:asset/ae69e78073115f73310c36ac547e11d5bee263ec.png";

interface ProjectRedirectCardProps {
  projectName: string;
  projectId: string;
  onSwitchProject: () => void;
}

export function ProjectRedirectCard({
  projectName,
  projectId,
  onSwitchProject,
}: ProjectRedirectCardProps) {
  // Project logos and colors
  const projectConfig: Record<string, { logo: string; color: string; bgColor: string }> = {
    BMW: {
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg",
      color: "#0066B1",
      bgColor: "#E8F4F8",
    },
    Haspa: {
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Hamburger_Sparkasse_logo.svg/320px-Hamburger_Sparkasse_logo.svg.png",
      color: "#E2001A",
      bgColor: "#FEF0F2",
    },
    Volkswagen: {
      logo: vwLogo,
      color: "#001E50",
      bgColor: "#E8EBF0",
    },
    VW: {
      logo: vwLogo,
      color: "#001E50",
      bgColor: "#E8EBF0",
    },
  };

  const config = projectConfig[projectName] || {
    logo: "",
    color: "#0A1F44",
    bgColor: "#E8EBF0",
  };

  return (
    <div className="mt-3 bg-white border-2 border-border rounded-xl p-5 shadow-md hover:shadow-lg transition-all">
      <div className="flex items-center gap-4 mb-4">
        {/* Project Logo */}
        <div
          className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm p-2"
          style={{ backgroundColor: config.bgColor }}
        >
          {config.logo ? (
            <img
              src={config.logo}
              alt={`${projectName} Logo`}
              className="w-full h-full object-contain"
            />
          ) : (
            <Building2 className="w-8 h-8" style={{ color: config.color }} />
          )}
        </div>

        {/* Project Info */}
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">
            {projectName} Projekt
          </h4>
          <p className="text-sm text-muted-foreground">
            Diese Frage gehört zum {projectName} Projekt-Bereich
          </p>
        </div>
      </div>

      {/* Action Section */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground mb-3">
          Möchten Sie automatisch zum {projectName}-Projekt Agent wechseln und dort einen neuen Chat starten?
        </p>
        
        <button
          onClick={onSwitchProject}
          className="w-full px-4 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
          style={{ backgroundColor: config.color }}
        >
          <span>Zu {projectName}-Projekt wechseln</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Helper Text */}
      <div className="mt-3 text-xs text-muted-foreground text-center">
        Sie können auch manuell über das Dropdown oben wechseln
      </div>
    </div>
  );
}