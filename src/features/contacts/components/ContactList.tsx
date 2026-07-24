import { Mail, Phone, Building2 } from "lucide-react";

interface Contact {
  role: string;
  name: string;
  email: string;
  phone: string;
}

interface ContactListProps {
  contacts: Contact[];
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

// Deterministic color from name
const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-orange-500", "bg-rose-500", "bg-cyan-500", "bg-amber-500",
];
function avatarColor(name: string) {
  let n = 0;
  for (const c of name) n += c.charCodeAt(0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export function ContactList({ contacts }: ContactListProps) {
  return (
    <div className="mt-3 space-y-2.5">
      {contacts.map((contact, i) => (
        <div
          key={i}
          className="bg-white border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          <div className="p-4 flex gap-4 items-start">
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-full ${avatarColor(contact.name)} flex items-center justify-center shrink-0 shadow-sm`}>
              <span className="text-white font-bold text-sm">{initials(contact.name)}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Name + Role */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-sm text-foreground">{contact.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                  {contact.role}
                </span>
              </div>

              {/* Contact details */}
              <div className="space-y-1 mt-2">
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0 group-hover:text-primary" />
                  <span className="truncate">{contact.email}</span>
                </a>
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0 group-hover:text-primary" />
                  <span>{contact.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {contacts.length === 0 && (
        <div className="text-center py-6 text-sm text-muted-foreground bg-white border border-border rounded-lg">
          Keine Kontakte gefunden.
        </div>
      )}
    </div>
  );
}
