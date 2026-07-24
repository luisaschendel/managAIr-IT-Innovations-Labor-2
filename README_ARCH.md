# Architecture Guide — BPC AI Assistant

This document describes the feature-based architecture of the project. Read this before adding new features or touching existing code.

---

## Directory Structure

```
src/
├── app/                        # App shell (thin wiring layer only)
│   ├── App.tsx                 # Root component — composes features, no business logic
│   └── components/
│       ├── AppHeader.tsx       # Logo + project selector + connection status
│       └── ConnectionStatus.tsx
│
├── features/                   # One folder per product domain
│   ├── auth/
│   │   ├── components/LoginScreen.tsx
│   │   ├── hooks/useAuth.ts    # isLoggedIn, userData, handleLogin
│   │   └── types.ts            # UserData
│   │
│   ├── chat/
│   │   ├── components/
│   │   │   ├── ChatMessage.tsx         # Single message bubble (text + markdown)
│   │   │   ├── ChatSidebar.tsx         # Chat history navigation
│   │   │   ├── ChatInput.tsx           # Text input + mic + send button
│   │   │   ├── AssistantOverlay.tsx    # Floating proactive-assistant panel
│   │   │   ├── MessageRenderer.tsx     # Dispatches rich cards per message type
│   │   │   ├── ExternalChatWarning.tsx # "Externer Gemini-Chat" banner
│   │   │   ├── ChatEmptyState.tsx      # Empty state when no chats exist
│   │   │   └── VoiceRecordingIndicator.tsx
│   │   ├── hooks/
│   │   │   ├── useChat.ts          # All chat state (messages, history, chat CRUD)
│   │   │   └── useMessageRouter.ts # AI routing: classify → project LLM → keyword fallback
│   │   └── types.ts                # (re-exports Message, ChatHistory from types/)
│   │
│   ├── kanban/
│   │   └── components/
│   │       ├── SprintTimeline.tsx  # Sprint progress + week timeline
│   │       ├── TaskList.tsx        # Jira-style task cards
│   │       └── JiraTicket.tsx      # Ticket creation confirmation card
│   │
│   ├── meetings/
│   │   └── components/
│   │       └── CalendarView.tsx    # Month grid + meeting selector
│   │
│   ├── contacts/
│   │   └── components/
│   │       └── ContactList.tsx     # Team contacts with avatars
│   │
│   ├── integrations/
│   │   └── components/
│   │       ├── SharepointCard.tsx      # SharePoint document list
│   │       ├── EmailCard.tsx           # Outlook email list
│   │       ├── MsLoopCard.tsx          # Microsoft Loop pages
│   │       ├── OnboardingTable.tsx     # Onboarding info for new team members
│   │       ├── ProjectRedirectCard.tsx # Prompt to switch project context
│   │       └── ChatGPTOffer.tsx        # Offer to escalate to external AI
│   │
│   ├── project/
│   │   ├── components/ProjectSelector.tsx  # Dropdown to switch project context
│   │   ├── hooks/useProjectSelector.ts     # currentProject, add/switch project
│   │   └── types.ts                        # ProjectEntry
│   │
│   ├── todos/
│   │   ├── components/TodoPanel.tsx        # Pinnable per-project todo panel
│   │   └── hooks/useTodos.ts
│   │
│   └── settings/
│       └── components/DummyDataEditor.tsx  # In-app data & LLM settings editor
│
├── services/
│   ├── llm/
│   │   ├── llmService.ts   # Unified API client: Gemini, OpenAI, Ollama
│   │   └── types.ts        # LLMConfig, ProjectResponse, ProjectAction, etc.
│   └── reminder/           # Proactive reminders: event discovery, context, dispatch
│
├── lib/
│   └── keywordMatcher.ts   # Fallback intent detection (German keyword matching)
│
├── types/
│   ├── project.ts  # Core domain models: Contact, Meeting, SprintTask, ProjectData…
│   └── message.ts  # Chat types: Message, ChatHistory, MessageSource
│
└── data/
    ├── defaults.ts  # DEFAULT_DATA — seed data for all three demo projects
    └── storage.ts   # localStorage read/write (swap here to add a real backend)
```

---

## Architectural Principles

### 1. Feature-Based, Not File-Type-Based

Code is grouped by **what it does**, not what kind of file it is. A feature owns its components, hooks, and types.

**Do:**
```
features/kanban/components/TaskList.tsx
features/kanban/hooks/useKanban.ts
features/kanban/types.ts
```

**Don't:**
```
components/TaskList.tsx
hooks/useKanban.ts
types/KanbanTypes.ts
```

### 2. Separation of Concerns

| Layer | Location | Responsibility |
|-------|----------|----------------|
| UI | `features/*/components/` | Render HTML, handle local events |
| Logic | `features/*/hooks/` | State, async operations, business rules |
| API | `services/llm/` | All external HTTP calls |
| Data | `data/` | localStorage persistence |
| Types | `types/` | Shared TypeScript contracts |

**Rule:** Components must not call `fetch()` directly. Route all API calls through `services/llm/llmService.ts`.

### 3. Smart Hooks, Dumb Components

- **Components** receive props and emit callbacks. They should have zero awareness of where data comes from.
- **Hooks** own state and side effects. They accept dependencies as parameters rather than importing globals.

```tsx
// Good — dumb component
function TaskList({ tasks, onComplete }) { ... }

// Good — smart hook
function useKanban(projectId: string) {
  const [tasks, setTasks] = useState([]);
  // ...
  return { tasks, handleComplete };
}
```

### 4. Types as Contracts

All shared data shapes live in `src/types/`. These are the contracts between modules — change them only with care, and always update consumers.

- `types/project.ts` — server/storage data (Contact, Meeting, ProjectData, AppSettings)
- `types/message.ts` — chat UI data (Message, ChatHistory)
- `services/llm/types.ts` — AI layer data (LLMConfig, ProjectResponse)

### 5. Clean API Layer

All AI provider calls go through `services/llm/llmService.ts`. Never call `fetch()` with an LLM URL from a component or hook directly.

```ts
// Good
import { sendProjectMessage } from "../../../services/llm/llmService";

// Bad
const res = await fetch("https://api.openai.com/v1/chat/completions", ...);
```

---

## How to Add a New Feature

### Example: Adding a "Risk Board" feature

1. **Create the feature directory:**
   ```
   src/features/risks/
   ├── components/RiskBoard.tsx
   ├── hooks/useRisks.ts
   └── types.ts
   ```

2. **Define types in `types.ts`:**
   ```ts
   export interface Risk {
     id: string;
     title: string;
     severity: "high" | "medium" | "low";
   }
   ```
   If the Risk will be stored in `ProjectData`, also add it to `types/project.ts`.

3. **Add a new `ProjectAction`** in `services/llm/types.ts`:
   ```ts
   export type ProjectAction =
     | "sprint_status" | "risks" | ...
   ```

4. **Handle the action** in `features/chat/hooks/useMessageRouter.ts`:
   ```ts
   case "risks":
     addMessage(chatId, { ...base, source: "jira", risks: projectData.risks });
     break;
   ```

5. **Add the payload to `Message`** in `types/message.ts`:
   ```ts
   risks?: Risk[];
   ```

6. **Add the renderer** in `features/chat/components/MessageRenderer.tsx`:
   ```tsx
   {message.risks && <RiskBoard risks={message.risks} />}
   ```

7. **Wire up** in `App.tsx` if the feature needs top-level callbacks.

---

## Data Flow

```
User types message
      ↓
App.tsx → handleSendMessage()
      ↓
useMessageRouter.handleProjectMessage()
      ↓
classifyRequest() → "INTERN" or "EXTERN"
      ↓
INTERN → sendProjectMessage() → LLM returns { action, content }
EXTERN → sendExternalMessage() → Gemini/Ollama returns plain text
      ↓
Action mapped to Message with rich card payload
      ↓
useChat.addMessage() → React state update
      ↓
MessageRenderer renders the appropriate card
```

---

## Storage

All persistence goes through `src/data/storage.ts`. Currently backed by `localStorage`.

To replace with a real backend:
1. Rewrite `loadAppSettings()` to `GET /api/settings`
2. Rewrite `saveAppSettings()` to `PUT /api/settings`
3. No other files need to change.

---

## LLM Configuration

Provider is configured in the Settings panel (⚙️) at runtime. The config flows:

```
AppSettings.geminiApiKey / ollamaBaseUrl / etc.
      ↓
useMessageRouter builds LLMConfig
      ↓
llmService.callLLM() selects provider URL + auth
```

Supported providers: **Gemini** (default), **Ollama** (local), **OpenAI**.

