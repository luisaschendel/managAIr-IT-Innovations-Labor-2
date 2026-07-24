import { useState } from "react";
import { Send, CheckCircle2, Mail, Pencil } from "lucide-react";

function htmlToText(html: string): string {
  return html
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<p>/gi, "")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<strong>(.*?)<\/strong>/gi, "$1")
    .replace(/<em>(.*?)<\/em>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

interface Recipient {
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface OutgoingMessageCardProps {
  recipient: Recipient;
  subject: string;
  body: string;
  onSend: () => void;
  onCancel: () => void;
}

const AVATAR_COLORS = [
  "#3B82F6", "#8B5CF6", "#10B981",
  "#F59E0B", "#EF4444", "#06B6D4", "#F97316",
];

function avatarColor(name: string) {
  let n = 0;
  for (const c of name) n += c.charCodeAt(0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export function OutgoingMessageCard({
  recipient,
  subject,
  body,
  onSend,
  onCancel,
}: OutgoingMessageCardProps) {
  const cleanBody = htmlToText(body);
  const cleanSubject = htmlToText(subject);

  const [editableBody, setEditableBody] = useState(cleanBody);
  const [editableSubject, setEditableSubject] = useState(cleanSubject);
  const [editing, setEditing] = useState(false);
  const [sent, setSent] = useState(false);

  const color = avatarColor(recipient.name);

  const handleSend = () => {
    setSent(true);
    onSend();
  };

  /* ── Sent state ── */
  if (sent) {
    return (
      <div className="mt-3 mb-4">
        <div className="rounded-2xl overflow-hidden border border-emerald-200 bg-emerald-50 shadow-sm">
          <div className="px-5 py-4 flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm shadow"
              style={{ backgroundColor: color }}
            >
              {initials(recipient.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-sm font-semibold text-emerald-800">Nachricht gesendet</span>
              </div>
              <p className="text-xs text-emerald-600 mt-0.5">
                An <span className="font-medium">{recipient.name}</span>
                {recipient.email ? ` · ${recipient.email}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Compose / Preview ── */
  return (
    <div className="mt-3 mb-4">
      <div className="rounded-2xl overflow-hidden border border-border bg-white shadow-sm">

        {/* ── Header ── */}
        <div className="bg-[#0A1F44] px-4 py-3 flex items-center gap-3">
          <Mail className="w-4 h-4 text-[#00B8E6] shrink-0" />
          <span className="text-white font-semibold text-sm flex-1">Neue Nachricht</span>
          <button
            onClick={() => setEditing((e) => !e)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            {editing ? "Vorschau" : "Bearbeiten"}
          </button>
        </div>

        {/* ── Recipient chip ── */}
        <div className="px-4 pt-4 pb-3 border-b border-border flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium w-10 shrink-0">An</span>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/40"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold shrink-0"
              style={{ backgroundColor: color, fontSize: "10px" }}
            >
              {initials(recipient.name)}
            </div>
            <span className="text-sm font-medium text-foreground leading-none">{recipient.name}</span>
            {recipient.role && (
              <span className="text-xs text-muted-foreground">· {recipient.role}</span>
            )}
          </div>
          {recipient.email && (
            <a
              href={`mailto:${recipient.email}`}
              className="ml-auto text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors shrink-0"
            >
              <Mail className="w-3 h-3" />
              {recipient.email}
            </a>
          )}
        </div>

        {/* ── Subject ── */}
        <div className="px-4 py-2.5 border-b border-border/60 flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium w-10 shrink-0">Betreff</span>
          {editing ? (
            <input
              type="text"
              value={editableSubject}
              onChange={(e) => setEditableSubject(e.target.value)}
              className="flex-1 text-sm font-semibold text-foreground bg-transparent border-0 outline-none p-0"
            />
          ) : (
            <span className="text-sm font-semibold text-foreground">{editableSubject}</span>
          )}
        </div>

        {/* ── Body ── */}
        <div className="px-4 py-4 min-h-[120px]">
          {editing ? (
            <textarea
              value={editableBody}
              onChange={(e) => setEditableBody(e.target.value)}
              rows={7}
              className="w-full text-sm text-foreground bg-transparent border-0 outline-none resize-none p-0 leading-relaxed"
            />
          ) : (
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {editableBody}
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between gap-3">
          <button
            onClick={onCancel}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Verwerfen
          </button>

          <button
            onClick={handleSend}
            disabled={!editableBody.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#0078D4] hover:bg-[#106EBE] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow"
          >
            <Send className="w-4 h-4" />
            Senden
          </button>
        </div>

      </div>
    </div>
  );
}
