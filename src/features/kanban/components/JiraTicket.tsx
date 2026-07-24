import { Plus, CheckCircle2, User, Calendar, AlertCircle } from "lucide-react";

interface JiraTicketProps {
  ticketInfo: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    assignee?: string;
    storyPoints?: number;
  };
  onAddToSprint: () => void;
}

export function JiraTicket({ ticketInfo, onAddToSprint }: JiraTicketProps) {
  const priorityColors = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  const priorityLabels = {
    high: "Hoch",
    medium: "Mittel",
    low: "Niedrig",
  };

  return (
    <div className="my-4 bg-white rounded-xl border-2 border-[#00B8E6]/20 shadow-lg overflow-hidden max-w-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00B8E6] to-[#0A1F44] px-6 py-4">
        <div className="flex items-center gap-2 text-white">
          <CheckCircle2 className="w-5 h-5" />
          <h3 className="font-semibold">Neues Jira Ticket erstellt</h3>
        </div>
      </div>

      {/* Ticket Content */}
      <div className="p-6">
        {/* Title */}
        <h4 className="text-lg font-semibold text-foreground mb-3">
          {ticketInfo.title}
        </h4>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">
          {ticketInfo.description}
        </p>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Priority */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
              priorityColors[ticketInfo.priority]
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Priorität: {priorityLabels[ticketInfo.priority]}</span>
          </div>

          {/* Story Points */}
          {ticketInfo.storyPoints && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
              <Calendar className="w-3.5 h-3.5" />
              <span>{ticketInfo.storyPoints} Story Points</span>
            </div>
          )}

          {/* Assignee */}
          {ticketInfo.assignee && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
              <User className="w-3.5 h-3.5" />
              <span>{ticketInfo.assignee}</span>
            </div>
          )}
        </div>

        {/* Ticket ID */}
        <div className="mb-4 pb-4 border-b border-border">
          <p className="text-xs text-muted-foreground">
            Ticket-ID: <span className="font-mono font-semibold text-foreground">PROJ-{Math.floor(Math.random() * 1000) + 100}</span>
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onAddToSprint}
          className="w-full bg-gradient-to-r from-[#00B8E6] to-[#0A1F44] text-white py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 font-medium shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Zum aktuellen Sprint hinzufügen</span>
        </button>
      </div>
    </div>
  );
}
