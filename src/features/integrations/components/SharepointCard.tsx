import type { SharepointDoc } from "../../../types/project";

interface SharepointCardProps {
  docs: SharepointDoc[];
}

const DOC_COLORS: Record<string, string> = {
  Word: "bg-[#2B579A]",
  Excel: "bg-[#217346]",
  PowerPoint: "bg-[#B7472A]",
};

const DOC_LETTERS: Record<string, string> = {
  Word: "W",
  Excel: "X",
  PowerPoint: "P",
};

export function SharepointCard({ docs }: SharepointCardProps) {
  if (!docs.length) return null;

  return (
    <div className="mt-3 mb-4 mx-auto max-w-4xl">
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-[#0078D4] px-4 py-2.5">
          <span className="text-white font-semibold text-sm">SharePoint</span>
        </div>
        <div className="divide-y divide-border">
          {docs.map((doc, i) => (
            <a
              key={i}
              href={doc.url}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
            >
              <div
                className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                  DOC_COLORS[doc.type] ?? "bg-gray-500"
                }`}
              >
                {DOC_LETTERS[doc.type] ?? "F"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.type} · Geändert {doc.lastModified} von {doc.modifiedBy}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
