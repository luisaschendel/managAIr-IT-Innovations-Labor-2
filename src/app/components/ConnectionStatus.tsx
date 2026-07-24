interface ConnectionStatusProps {
  isChatGPTChat: boolean;
}

const CONNECTIONS = [
  { label: "Jira", activeInProject: true },
  { label: "Teams", activeInProject: true },
  { label: "SharePoint", activeInProject: true },
  { label: "E-Mail", activeInProject: true },
  { label: "MS Loop", activeInProject: true },
  { label: "Ollama", activeInProject: true },
  { label: "Gemini", activeInProject: false }, // active only in external chats
] as const;

export function ConnectionStatus({ isChatGPTChat }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-3 text-xs flex-wrap">
      {CONNECTIONS.map(({ label, activeInProject }) => {
        const active = activeInProject ? !isChatGPTChat : isChatGPTChat;
        return (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
