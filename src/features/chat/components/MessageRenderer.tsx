// Renders a chat message plus its rich card payload (sprint, tasks, meetings, contacts, ...).
import type { Message } from "../../../types/message";
import type { AppSettings, ProjectData } from "../../../types/project";
import { ChatMessage } from "./ChatMessage";
import { SprintTimeline } from "../../kanban/components/SprintTimeline";
import { TaskList } from "../../kanban/components/TaskList";
import { JiraTicket } from "../../kanban/components/JiraTicket";
import { CalendarView } from "../../meetings/components/CalendarView";
import { ContactList } from "../../contacts/components/ContactList";
import { OnboardingTable } from "../../integrations/components/OnboardingTable";
import { ProjectRedirectCard } from "../../integrations/components/ProjectRedirectCard";
import { ChatGPTOffer } from "../../integrations/components/ChatGPTOffer";
import { SharepointCard } from "../../integrations/components/SharepointCard";
import { EmailCard } from "../../integrations/components/EmailCard";
import { MsLoopCard } from "../../integrations/components/MsLoopCard";
import { OutgoingMessageCard } from "../../integrations/components/OutgoingMessageCard";

interface MessageRendererProps {
  message: Message;
  projectData?: ProjectData;
  settings?: AppSettings;
  currentProjectId?: string;
  onAcceptChatGPT: (messageId: string) => void;
  onDeclineChatGPT: (messageId: string) => void;
  onAcceptMeeting: (title: string) => void;
  onDeclineMeeting: (title: string) => void;
  onAddTicketToSprint: (title: string) => void;
  onSwitchToProject: (projectId: string) => void;
  onRemoveMessage: (messageId: string) => void;
}

export function MessageRenderer({
  message,
  projectData: projectDataProp,
  settings,
  currentProjectId,
  onAcceptChatGPT,
  onDeclineChatGPT,
  onAcceptMeeting,
  onDeclineMeeting,
  onAddTicketToSprint,
  onSwitchToProject,
  onRemoveMessage,
}: MessageRendererProps) {
  // Resolve projectData: prefer explicit prop, fall back to settings lookup
  const projectData =
    projectDataProp ??
    (settings && currentProjectId ? settings.projects[currentProjectId] : undefined);

  return (
    <div>
      {(message.content || !message.showChatGPTOffer) && (
        <ChatMessage
          role={message.role}
          content={message.content}
          source={message.source}
          isLoading={message.isLoading}
        />
      )}

      {message.sprintInfo && (
        <SprintTimeline
          sprintNumber={message.sprintInfo.sprintNumber}
          currentWeek={message.sprintInfo.currentWeek}
          totalWeeks={message.sprintInfo.totalWeeks}
          completedTasks={message.sprintInfo.completedTasks}
          totalTasks={message.sprintInfo.totalTasks}
          tasks={message.sprintInfo.tasks}
          allSprints={message.allSprints}
        />
      )}

      {message.showOnboardingTable && projectData && (
        <OnboardingTable data={projectData.onboarding} />
      )}

      {message.showChatGPTOffer && (
        <ChatGPTOffer
          onAccept={() => onAcceptChatGPT(message.id)}
          onDecline={() => onDeclineChatGPT(message.id)}
        />
      )}

      {message.ticketInfo && (
        <JiraTicket
          ticketInfo={message.ticketInfo}
          onAddToSprint={() => onAddTicketToSprint(message.ticketInfo!.title)}
        />
      )}

      {message.myTasks && <TaskList tasks={message.myTasks} />}

      {message.contactInfo && <ContactList contacts={message.contactInfo} />}

      {message.meetingInfo && (
        <CalendarView
          meetings={[message.meetingInfo]}
          onAccept={() => onAcceptMeeting(message.meetingInfo!.title)}
          onDecline={() => onDeclineMeeting(message.meetingInfo!.title)}
        />
      )}

      {message.meetingsList && <CalendarView meetings={message.meetingsList} />}

      {message.projectRedirect && (
        <ProjectRedirectCard
          projectName={message.projectRedirect.projectName}
          projectId={message.projectRedirect.projectId}
          onSwitchProject={() => onSwitchToProject(message.projectRedirect!.projectId)}
        />
      )}

      {message.sharepointDocs && <SharepointCard docs={message.sharepointDocs} />}
      {message.emails && <EmailCard emails={message.emails} />}
      {message.loopPages && <MsLoopCard pages={message.loopPages} />}

      {message.outgoingMessage && (
        <OutgoingMessageCard
          recipient={message.outgoingMessage.recipient}
          subject={message.outgoingMessage.subject}
          body={message.outgoingMessage.body}
          onSend={() => {}}
          onCancel={() => onRemoveMessage(message.id)}
        />
      )}
    </div>
  );
}
