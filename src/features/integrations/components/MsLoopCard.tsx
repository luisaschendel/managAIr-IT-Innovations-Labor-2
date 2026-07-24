import type { LoopPage } from "../../../types/project";

interface MsLoopCardProps {
  pages: LoopPage[];
}

export function MsLoopCard({ pages }: MsLoopCardProps) {
  if (!pages.length) return null;

  return (
    <div className="mt-3 mb-4 mx-auto max-w-4xl">
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-[#7B2D8B] px-4 py-2.5">
          <span className="text-white font-semibold text-sm">Microsoft Loop</span>
        </div>
        <div className="divide-y divide-border">
          {pages.map((page, i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">{page.title}</p>
                <span className="text-xs text-muted-foreground">
                  {page.lastEdited} · {page.editedBy}
                </span>
              </div>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {page.content}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
