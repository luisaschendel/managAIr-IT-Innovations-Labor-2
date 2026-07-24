// Core domain types shared across all features.

export interface Contact {
  role: string;
  name: string;
  email: string;
  phone: string;
}

export interface Meeting {
  title: string;
  date: string;
  time: string;
  attendees?: string;
  location?: string;
  agenda?: string;
}

export interface SprintTask {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "pending";
  assignee?: string;
}

export interface SprintInfo {
  sprintNumber: number;
  currentWeek: number;
  totalWeeks: number;
  completedTasks: number;
  totalTasks: number;
  tasks: SprintTask[];
}

export interface MyTask {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  project: string;
}

export interface SharepointDoc {
  title: string;
  type: "Word" | "Excel" | "PowerPoint" | "PDF" | "Andere";
  lastModified: string;
  modifiedBy: string;
  url: string;
}

export interface Email {
  from: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
}

export interface LoopPage {
  title: string;
  lastEdited: string;
  editedBy: string;
  content: string;
}

export interface OnboardingContact {
  role: string;
  name: string;
  email: string;
  phone: string;
}

export interface OnboardingData {
  contacts: OnboardingContact[];
  projectGoal: string;
  dos: string[];
  donts: string[];
  nextMeeting: {
    title: string;
    date: string;
    time: string;
    location: string;
  };
  links: {
    label: string;
    url: string;
  }[];
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ProjectData {
  name: string;
  contacts: Contact[];
  meetings: Meeting[];
  sprintInfo: SprintInfo;
  sprints?: SprintInfo[];
  myTasks: MyTask[];
  sharepoint: SharepointDoc[];
  emails: Email[];
  msLoop: LoopPage[];
  onboarding: OnboardingData;
  todos?: TodoItem[];
}

export type LLMProvider = "openai" | "ollama" | "gemini";

export interface AppSettings {
  llmProvider: LLMProvider;
  openaiApiKey: string;
  openaiModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  geminiApiKey: string;
  geminiModel: string;
  projects: Record<string, ProjectData>;
}
