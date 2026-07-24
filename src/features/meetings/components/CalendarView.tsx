import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Users, MapPin, Check, X } from "lucide-react";

interface Meeting {
  title: string;
  date: string;
  time: string;
  attendees?: string;
  location?: string;
  agenda?: string;
}

interface CalendarViewProps {
  meetings: Meeting[];
  onAccept?: (title: string) => void;
  onDecline?: (title: string) => void;
}

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const DAY_NAMES = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function parseGermanDate(dateStr: string): Date | null {
  const parts = dateStr.split(".");
  if (parts.length === 3) {
    const d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

export function CalendarView({ meetings, onAccept, onDecline }: CalendarViewProps) {
  const today = new Date();

  const parsed = meetings
    .map((m) => ({ m, d: parseGermanDate(m.date) }))
    .filter((x): x is { m: Meeting; d: Date } => x.d !== null)
    .sort((a, b) => a.d.getTime() - b.d.getTime());

  const firstDate = parsed[0]?.d ?? today;

  const [viewDate, setViewDate] = useState(
    new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(firstDate.getDate());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0=Mon

  // Map day → meetings in this month
  const byDay: Record<number, Meeting[]> = {};
  for (const { m, d } of parsed) {
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      (byDay[day] = byDay[day] ?? []).push(m);
    }
  }

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const displayMeetings =
    selectedDay && byDay[selectedDay]
      ? byDay[selectedDay]
      : meetings; // fallback: all meetings

  return (
    <div className="mt-3 bg-white border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#5B5FC7] to-[#464EB8] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="text-white/70 hover:text-white p-1 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-white font-semibold text-sm">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="text-white/70 hover:text-white p-1 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-border">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="h-10 bg-slate-50/50" />;
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const hasMeeting = !!byDay[day];
          const isSelected = day === selectedDay;

          return (
            <button
              key={i}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`h-10 flex flex-col items-center justify-center gap-0.5 transition-colors relative
                ${isSelected ? "bg-primary/10" : "hover:bg-accent/50"}`}
            >
              <span
                className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday
                    ? "bg-primary text-white"
                    : isSelected
                    ? "bg-primary/20 text-primary font-semibold"
                    : "text-foreground"}`}
              >
                {day}
              </span>
              {hasMeeting && (
                <span className="w-1 h-1 rounded-full bg-primary absolute bottom-1.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Meeting details */}
      {displayMeetings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-5">
          {selectedDay
            ? "Keine Termine an diesem Tag."
            : "Keine Termine in diesem Monat."}
        </p>
      ) : (
        <div className="divide-y divide-border">
          {displayMeetings.map((m, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm text-foreground leading-snug">{m.title}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                  {m.time}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  {m.date}
                </span>
                {m.attendees && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 shrink-0" />
                    {m.attendees}
                  </span>
                )}
                {m.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {m.location}
                  </span>
                )}
              </div>

              {m.agenda && (
                <p className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-2 italic">
                  {m.agenda}
                </p>
              )}

              {onAccept && onDecline && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onAccept(m.title)}
                    className="flex-1 bg-green-600 text-white text-xs py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3 h-3" /> Annehmen
                  </button>
                  <button
                    onClick={() => onDecline(m.title)}
                    className="flex-1 bg-red-500 text-white text-xs py-1.5 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X className="w-3 h-3" /> Ablehnen
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground bg-slate-50/60">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Microsoft Teams · Online
      </div>
    </div>
  );
}
