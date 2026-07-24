import type { Email } from "../../../types/project";

interface EmailCardProps {
  emails: Email[];
}

export function EmailCard({ emails }: EmailCardProps) {
  if (!emails.length) return null;

  return (
    <div className="mt-3 mb-4 mx-auto max-w-4xl">
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-[#0078D4] px-4 py-2.5">
          <span className="text-white font-semibold text-sm">E-Mail / Outlook</span>
        </div>
        <div className="divide-y divide-border">
          {emails.map((email, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 px-4 py-3 ${email.unread ? "bg-blue-50/50" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                {email.from.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${email.unread ? "font-semibold" : "font-medium"}`}>
                    {email.from}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">{email.date}</span>
                </div>
                <p
                  className={`text-sm truncate ${
                    email.unread ? "font-medium text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {email.subject}
                </p>
                <p className="text-xs text-muted-foreground truncate">{email.preview}</p>
              </div>
              {email.unread && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
