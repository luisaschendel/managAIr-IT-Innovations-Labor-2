// Parses dd/mm/yyyy date strings.

/**
 * Parses a date string in dd/mm/yyyy format (e.g. "27/04/2026").
 * Optionally applies a time string like "10:00-11:00" (uses start time).
 * Returns null on any parse failure.
 */
export function parseGermanDate(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr?.trim()) return null;

  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // 0-indexed
  const year = parseInt(match[3], 10);

  const date = new Date(year, month, day, 0, 0, 0, 0);

  if (timeStr) {
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      date.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
    }
  }

  return date;
}

/** Returns the difference in hours between two dates (can be negative). */
export function hoursDiff(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / (1000 * 60 * 60);
}
