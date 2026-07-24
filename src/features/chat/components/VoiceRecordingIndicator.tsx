export function VoiceRecordingIndicator() {
  return (
    <div className="px-6 py-3 bg-accent border-t border-border flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-sm text-accent-foreground">Höre zu...</span>
      <div className="flex gap-1 ml-auto">
        {[0, 150, 300, 450].map((delayMs) => (
          <div
            key={delayMs}
            className="w-1 bg-primary rounded animate-pulse"
            style={{
              height:
                delayMs === 0
                  ? "1rem"
                  : delayMs === 150
                  ? "1.5rem"
                  : delayMs === 300
                  ? "1.25rem"
                  : "1.75rem",
              animationDelay: `${delayMs}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
