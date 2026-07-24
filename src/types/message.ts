// Chat message contracts for the chat feed and routing layer.

import type { SharepointDoc, Email, LoopPage } from "./project";

export type MessageSource =
  | "jira"
  | "teams"
  | "chatgpt"
  | "gemini"
  | "sharepoint"
  | "email"
  | "msloop";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: MessageSource;
  isLoading?: boolean;
  /** True for system-initiated proactive events (reminders, alerts). */
  isProactive?: boolean;

  // Rich card payloads — only one should be set per message
  projectRedirect?: {
    projectName: string;
    projectId: string;
  };
  meetingInfo?: {
    title: string;
    date: string;
    time: string;
    attendees?: string;
    location?: string;
    agenda?: string;
  };
  meetingsList?: Array<{
    title: string;
    date: string;
    time: string;
    attendees?: string;
    location?: string;
  }>;
  sprintInfo?: {
    sprintNumber: number;
    currentWeek: number;
    totalWeeks: number;
    completedTasks: number;
    totalTasks: number;
    tasks: Array<{
      id: string;
      title: string;
      status: "completed" | "in-progress" | "pending";
      assignee?: string;
    }>;
  };
  allSprints?: Array<{
    sprintNumber: number;
    currentWeek: number;
    totalWeeks: number;
    completedTasks: number;
    totalTasks: number;
    tasks: Array<{
      id: string;
      title: string;
      status: "completed" | "in-progress" | "pending";
      assignee?: string;
    }>;
  }>;
  ticketInfo?: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    assignee?: string;
    storyPoints?: number;
  };
  myTasks?: Array<{
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    dueDate: string;
    project: string;
  }>;
  contactInfo?: Array<{
    role: string;
    name: string;
    email: string;
    phone: string;
  }>;
  showOnboardingTable?: boolean;
  showChatGPTOffer?: boolean;
  sharepointDocs?: SharepointDoc[];
  emails?: Email[];
  loopPages?: LoopPage[];
  outgoingMessage?: {
    recipient: {
      name: string;
      role: string;
      email: string;
      phone: string;
    };
    subject: string;
    body: string;
  };
}

export interface ChatHistory {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
  type: "project" | "chatgpt";
  projectName?: string;
}
