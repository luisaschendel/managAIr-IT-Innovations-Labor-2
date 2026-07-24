import { Users, Target, AlertCircle, Calendar, Link as LinkIcon } from "lucide-react";
import type { OnboardingData } from "../../../types/project";

interface OnboardingTableProps {
  data: OnboardingData;
}

export function OnboardingTable({ data }: OnboardingTableProps) {
  return (
    <div className="mt-4 mb-6 bg-white border border-border rounded-xl overflow-hidden shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-accent">
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Kategorie</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Inhalt/Beschreibung</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Links/Quick Links</th>
          </tr>
        </thead>
        <tbody>
          {/* Points of Contact */}
          <tr className="border-t border-border">
            <td className="px-4 py-4 align-top">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span>Points of Contact</span>
              </div>
            </td>
            <td className="px-4 py-4">
              <div className="space-y-2 text-sm">
                {data.contacts.map((c, i) => (
                  <div key={i}>
                    <span className="font-medium">{c.role}:</span> {c.name}
                    <br />
                    <span className="text-muted-foreground">
                      {c.email} | {c.phone}
                    </span>
                  </div>
                ))}
              </div>
            </td>
            <td className="px-4 py-4">
              <div className="space-y-1">
                <a href="#" className="text-primary text-sm hover:underline flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  Organigramm
                </a>
                <a href="#" className="text-primary text-sm hover:underline flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  Team-Kontakte
                </a>
              </div>
            </td>
          </tr>

          {/* Projektziel */}
          <tr className="border-t border-border bg-accent/30">
            <td className="px-4 py-4 align-top">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Target className="w-4 h-4 text-primary" />
                <span>Projektziel</span>
              </div>
            </td>
            <td className="px-4 py-4 text-sm">{data.projectGoal}</td>
            <td className="px-4 py-4">
              <div className="space-y-1">
                <a href="#" className="text-primary text-sm hover:underline flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  Projektcharter
                </a>
                <a href="#" className="text-primary text-sm hover:underline flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  Vision Board
                </a>
              </div>
            </td>
          </tr>

          {/* Do's and Dont's */}
          <tr className="border-t border-border">
            <td className="px-4 py-4 align-top">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <AlertCircle className="w-4 h-4 text-primary" />
                <span>Do's & Dont's</span>
              </div>
            </td>
            <td className="px-4 py-4">
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-green-700">✓ Do's:</span>
                  <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-0.5">
                    {data.dos.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-medium text-red-700">✗ Dont's:</span>
                  <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-0.5">
                    {data.donts.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </td>
            <td className="px-4 py-4">
              <div className="space-y-1">
                <a href="#" className="text-primary text-sm hover:underline flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  Team Guidelines
                </a>
                <a href="#" className="text-primary text-sm hover:underline flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  Code Standards
                </a>
              </div>
            </td>
          </tr>

          {/* Nächster Regeltermin */}
          <tr className="border-t border-border bg-accent/30">
            <td className="px-4 py-4 align-top">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Nächster Regeltermin</span>
              </div>
            </td>
            <td className="px-4 py-4">
              <div className="text-sm">
                <div className="font-medium mb-1">{data.nextMeeting.title}</div>
                <div className="text-muted-foreground">
                  Datum: {data.nextMeeting.date}
                  <br />
                  Uhrzeit: {data.nextMeeting.time}
                  <br />
                  Ort: {data.nextMeeting.location}
                </div>
              </div>
            </td>
            <td className="px-4 py-4">
              <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                Zum Termin hinzufügen
              </button>
            </td>
          </tr>

          {/* Zugangsdaten & Tools */}
          <tr className="border-t border-border">
            <td className="px-4 py-4 align-top">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <LinkIcon className="w-4 h-4 text-primary" />
                <span>Zugangsdaten & Tools</span>
              </div>
            </td>
            <td className="px-4 py-4 text-sm">
              <div className="text-muted-foreground">
                Zugang zu allen relevanten Tools wurde bereits eingerichtet.
                Bitte überprüfen Sie Ihre E-Mails für Anmeldeinformationen.
              </div>
            </td>
            <td className="px-4 py-4">
              <div className="space-y-1.5">
                {data.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    className="text-primary text-sm hover:underline flex items-center gap-1 font-medium"
                  >
                    <LinkIcon className="w-3 h-3" />
                    {link.label}
                  </a>
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
