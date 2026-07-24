// Contracts for the LLM service layer.

export interface LLMChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  error?: string;
}

export type ProjectAction =
  | "sprint_status"
  | "meetings"
  | "meeting_single"
  | "my_tasks"
  | "create_ticket"
  | "contacts"
  | "onboarding"
  | "sharepoint"
  | "email"
  | "msloop"
  | "send_message"
  | "chatgpt_offer"
  | "text";

export interface ProjectResponse {
  action: ProjectAction;
  content: string;
  ticketData?: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    storyPoints: number;
  };
  messageData?: {
    recipientName: string;
    subject: string;
    body: string;
  };
  error?: string;
}

export interface LLMConfig {
  provider: "openai" | "ollama" | "gemini";
  apiKey: string;
  model: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  geminiApiKey?: string;
  geminiModel?: string;
}

export type ClassificationResult = "INTERN" | "EXTERN";

export interface OverviewResponse {
  action: "project_redirect" | "overview_answer" | "clarify";
  projectId?: string;    // e.g. "bmw", "haspa", "volkswagen"
  projectName?: string;  // e.g. "BMW", "Haspa", "Volkswagen"
  content: string;
  error?: string;
}
