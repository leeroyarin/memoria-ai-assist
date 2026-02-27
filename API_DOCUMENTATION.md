# API & AI Integration Documentation

Complete reference for all backend functions, database schema, client APIs, voice pipeline, and AI integration.

---

## Table of Contents

1. [Authentication API](#1-authentication-api)
2. [Database Schema & Tables](#2-database-schema--tables)
3. [Client-Side Data API](#3-client-side-data-api)
4. [Edge Functions (Backend)](#4-edge-functions-backend)
5. [AI Assistant Integration](#5-ai-assistant-integration)
6. [Voice API](#6-voice-api)
7. [Voice Input Flow](#7-voice-input-flow)

---

## 1. Authentication API

### Overview

Authentication is managed via Lovable Cloud's built-in auth system. The app uses email/password sign-up and sign-in with email verification required.

### Context & Hooks

| Module | Path | Purpose |
|--------|------|---------|
| `useAuth` | `src/hooks/useAuth.ts` | Core auth hook — manages user/session state |
| `AuthContext` | `src/contexts/AuthContext.tsx` | React context provider wrapping `useAuth` |
| `useAuthContext` | `src/contexts/AuthContext.tsx` | Consumer hook for components |
| `ProtectedRoute` | `src/components/ProtectedRoute.tsx` | Route guard — redirects unauthenticated users |

### Methods

#### `signUp(email: string, password: string): Promise<{ error: any }>`
Creates a new account. Email confirmation is required before the user can sign in.

#### `signIn(email: string, password: string): Promise<{ error: any }>`
Authenticates with email/password. Sets session and user state on success.

#### `signOut(): Promise<{ error: any }>`
Ends the current session and clears user state.

### Session Management

- Sessions are persisted in `localStorage`
- Auto-refresh is enabled — tokens are renewed automatically
- Auth state changes are tracked via `onAuthStateChange` listener
- On app load, `getSession()` hydrates the initial state

### Auth State Shape

```typescript
interface AuthContextType {
  user: User | null;       // Supabase User object
  session: Session | null; // Contains access_token, refresh_token
  loading: boolean;        // True during initial hydration
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}
```

---

## 2. Database Schema & Tables

### `profiles`

Auto-created when a user signs up (via `handle_new_user` trigger).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | No | — | Primary key, matches auth user ID |
| `notifications_enabled` | `boolean` | Yes | `true` | Push notification preference |
| `voice_feedback_enabled` | `boolean` | Yes | `true` | TTS response preference |
| `default_alarm_sound` | `text` | Yes | `'buzzer'` | Alarm sound identifier |
| `created_at` | `timestamptz` | No | `now()` | Account creation time |
| `updated_at` | `timestamptz` | No | `now()` | Last profile update |

**RLS Policies:** Users can SELECT, INSERT, UPDATE their own profile. DELETE is not permitted.

---

### `memories`

Stores user notes, facts, and observations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | No | — | Owner (references `profiles.id`) |
| `content` | `text` | No | — | Memory text content |
| `category` | `text` | Yes | — | Category label (Personal, Work, Shopping, Health, Finance, Other) |
| `tags` | `text[]` | Yes | `'{}'` | Array of tags |
| `created_at` | `timestamptz` | No | `now()` | Creation timestamp |

**RLS Policies:** Users can SELECT, INSERT, UPDATE, DELETE their own memories.

---

### `reminders`

Stores time-based and activity-based reminders.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | No | — | Owner (references `profiles.id`) |
| `title` | `text` | No | — | Reminder description |
| `type` | `text` | No | `'time'` | `time` or `activity` |
| `trigger_time` | `timestamptz` | Yes | — | When to trigger (for time-based) |
| `trigger_context` | `text` | Yes | — | Activity context (for activity-based) |
| `priority` | `text` | No | `'normal'` | `normal` or `high` |
| `status` | `text` | No | `'pending'` | `pending`, `done`, or `dismissed` |
| `alarm_sound` | `text` | Yes | — | Custom alarm sound |
| `memory_id` | `uuid` | Yes | — | Linked memory (references `memories.id`) |
| `created_at` | `timestamptz` | No | `now()` | Creation timestamp |

**RLS Policies:** Users can SELECT, INSERT, UPDATE, DELETE their own reminders.

---

### Database Functions

#### `handle_new_user()`

- **Trigger:** Fires on new auth user creation
- **Action:** Inserts a row into `profiles` with the new user's ID
- **Security:** `SECURITY DEFINER`

#### `validate_reminder_type()`

- **Trigger:** Fires on INSERT/UPDATE to `reminders`
- **Validates:**
  - `type` must be `'time'` or `'activity'`
  - `priority` must be `'normal'` or `'high'`
  - `status` must be `'pending'`, `'done'`, or `'dismissed'`
- **On failure:** Raises an exception with a descriptive message

---

## 3. Client-Side Data API

**File:** `src/api/db.ts`

All functions use the authenticated Supabase client. RLS policies enforce row-level access.

### Memories

#### `fetchMemories(): Promise<Memory[]>`

Retrieves all memories for the authenticated user, ordered by `created_at` descending.

```typescript
const memories = await fetchMemories();
// Returns: Array of { id, user_id, content, category, tags, created_at }
```

#### `createMemory(memory): Promise<Memory>`

Creates a new memory. Automatically sets `user_id` from the current session.

```typescript
const newMemory = await createMemory({
  content: "Met with John about the project",  // required
  category: "Work",                             // optional
  tags: ["meeting", "project-x"],               // optional
});
```

#### `deleteMemory(id: string): Promise<void>`

Deletes a memory by ID.

```typescript
await deleteMemory("uuid-here");
```

### Reminders

#### `fetchReminders(filter?: "time" | "activity"): Promise<Reminder[]>`

Retrieves reminders, optionally filtered by type. Ordered by `created_at` descending.

```typescript
const allReminders = await fetchReminders();
const timeOnly = await fetchReminders("time");
const activityOnly = await fetchReminders("activity");
```

#### `createReminder(reminder): Promise<Reminder>`

Creates a new reminder. Automatically sets `user_id`.

```typescript
const reminder = await createReminder({
  title: "Call dentist",          // required
  type: "time",                   // required: "time" | "activity"
  trigger_time: "2026-03-01T10:00:00Z",  // optional (for time-based)
  trigger_context: undefined,     // optional (for activity-based)
  priority: "high",               // optional: "normal" | "high"
});
```

#### `updateReminderStatus(id: string, status: "done" | "dismissed"): Promise<void>`

Updates the status of a reminder.

```typescript
await updateReminderStatus("uuid-here", "done");
```

### Profile

#### `fetchProfile(): Promise<Profile>`

Retrieves the authenticated user's profile.

```typescript
const profile = await fetchProfile();
// Returns: { id, notifications_enabled, voice_feedback_enabled, default_alarm_sound, created_at, updated_at }
```

### Counts

#### `fetchCounts(): Promise<{ memories: number; reminders: number }>`

Returns counts of total memories and pending reminders.

```typescript
const { memories, reminders } = await fetchCounts();
```

---

## 4. Edge Functions (Backend)

All edge functions are deployed automatically. JWT verification is disabled for all functions (configured in `supabase/config.toml`).

### `elevenlabs-scribe-token`

**Purpose:** Generates a single-use token for ElevenLabs Realtime Scribe (speech-to-text).

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Auth** | None required |
| **Secret** | `ELEVENLABS_API_KEY` |

**Request:** Empty body (no parameters needed)

**Response:**
```json
{ "token": "single-use-scribe-token-string" }
```

**Error Response:**
```json
{ "error": "ElevenLabs error [status]: details" }
```

---

### `elevenlabs-tts`

**Purpose:** Converts text to speech audio using ElevenLabs.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Auth** | None required |
| **Secret** | `ELEVENLABS_API_KEY` |
| **Model** | `eleven_turbo_v2_5` |
| **Output** | `audio/mpeg` (MP3, 44100Hz, 128kbps) |

**Request:**
```json
{
  "text": "Hello, how can I help you?",
  "voiceId": "EXAVITQu4vr4xnSDxMaL"  // optional, defaults to "Sarah"
}
```

**Response:** Binary MP3 audio data with `Content-Type: audio/mpeg`

**Voice Settings:**
```json
{
  "stability": 0.5,
  "similarity_boost": 0.75,
  "speed": 1.0
}
```

---

### `ai-assistant`

**Purpose:** AI-powered intent classification and response generation. Analyzes user messages and returns structured actions.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Auth** | Bearer token (user's session token) |
| **Secrets** | `LOVABLE_API_KEY` |
| **AI Model** | `google/gemini-3-flash-preview` |
| **Gateway** | `https://ai.gateway.lovable.dev/v1/chat/completions` |

**Request:**
```json
{
  "message": "Remind me to call the dentist tomorrow at 10am",
  "history": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ],
  "userLocalTime": "2026-02-27T14:30:00.000Z",
  "userTimezone": "America/New_York"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | `string` | Yes | Current user message |
| `history` | `array` | No | Previous conversation messages |
| `userLocalTime` | `string` | No | ISO timestamp of user's local time |
| `userTimezone` | `string` | No | IANA timezone identifier |

**Response:** See [AI Response Schema](#ai-response-schema) below.

**Error Responses:**

| Status | Body | Meaning |
|--------|------|---------|
| 401 | `{ "error": "Unauthorized" }` | Missing or invalid auth token |
| 402 | `{ "error": "Usage limit reached." }` | AI credits exhausted |
| 429 | `{ "error": "Rate limited, please try again later." }` | Too many requests |
| 500 | `{ "error": "description" }` | Server error |

---

## 5. AI Assistant Integration

### Architecture

```
User Voice → STT (ElevenLabs Scribe) → Text
  → ai-assistant Edge Function
    → Fetch user context (memories + reminders)
    → Build system prompt with context
    → Call Lovable AI Gateway (Gemini 3 Flash)
    → Parse tool call response
  → Execute action (save memory / create reminder / etc.)
  → TTS (ElevenLabs) → Audio playback
```

### Client-Side API

**File:** `src/api/ai.ts`

```typescript
import { processWithAI, type AIResponse } from "@/api/ai";

const result: AIResponse = await processWithAI("Remember that I parked in section B4");
```

#### `processWithAI(transcribedText: string): Promise<AIResponse>`

Sends transcribed text to the AI assistant edge function. Automatically includes the user's local time and timezone.

### AI Response Schema

```typescript
interface AIResponse {
  action: "save_memory" | "create_reminder" | "complete_reminder" | "summary" | "chat";
  data?: {
    // For save_memory
    content?: string;      // Memory text (includes temporal context)
    category?: string;     // Personal | Work | Shopping | Health | Finance | Other
    tags?: string[];       // Relevant tags

    // For create_reminder
    title?: string;        // Reminder description
    type?: "time" | "activity";
    trigger_time?: string; // ISO datetime (for time-based)
    trigger_context?: string; // Activity description (for activity-based)
    priority?: "normal" | "high";

    // For complete_reminder
    reminder_id?: string;  // UUID of the matched reminder
  };
  spoken_reply: string;    // Natural language response for TTS
}
```

### Intent Types

#### `save_memory`
**Triggered when:** User wants to note, remember, or log something.

**Example inputs:**
- "Remember I parked in section B4"
- "I had a great meeting with Sarah today"
- "Note that my passport expires in March"

**AI behavior:** Extracts content with temporal context relative to the user's local time. Suggests a category and relevant tags.

#### `create_reminder`
**Triggered when:** User wants to be reminded about something.

**Example inputs:**
- "Remind me to call the dentist tomorrow at 10am"
- "Remind me to take my medicine after lunch"
- "Set a high priority reminder to submit the report by Friday"

**AI behavior:** Determines if time-based or activity-based. Extracts `trigger_time` (ISO format, respecting user's timezone) or `trigger_context`. Assigns priority.

#### `complete_reminder`
**Triggered when:** User indicates they've finished a task matching a pending reminder.

**Example inputs:**
- "I just called the dentist"
- "Done with the report"

**AI behavior:** Matches the user's statement against pending reminders and returns the `reminder_id` of the best match.

#### `summary`
**Triggered when:** User asks for an overview of their memories and reminders.

**Example inputs:**
- "Am I forgetting anything?"
- "What do I have coming up?"
- "Give me a summary"

**AI behavior:** Analyzes memories and pending reminders, provides a spoken overview.

#### `chat`
**Triggered when:** General conversation or questions.

**Example inputs:**
- "How are you?"
- "What can you help me with?"

**AI behavior:** Responds conversationally.

### System Prompt Structure

The AI receives a system prompt that includes:

1. **Role definition** — Voice-activated memory and reminder assistant
2. **User's local time and timezone** — For interpreting relative time references
3. **User's recent memories** (up to 20) — Format: `[category] content (saved: timestamp)`
4. **User's pending reminders** (up to 20) — Format: `[id] [type/priority] title (at time/after context)`
5. **Intent classification instructions** — How to categorize user messages
6. **Data extraction rules** — What to extract for each intent type

### Tool Calling Pattern

The AI is forced to use a structured tool call (`suggest_action`) rather than free-form text:

```json
{
  "tools": [{
    "type": "function",
    "function": {
      "name": "suggest_action",
      "parameters": {
        "type": "object",
        "properties": {
          "action": { "type": "string", "enum": ["save_memory", "create_reminder", "complete_reminder", "summary", "chat"] },
          "data": { "type": "object", "properties": { "..." } },
          "spoken_reply": { "type": "string" }
        },
        "required": ["action", "spoken_reply"]
      }
    }
  }],
  "tool_choice": { "type": "function", "function": { "name": "suggest_action" } }
}
```

This ensures every response is structured and parseable.

---

## 6. Voice API

**File:** `src/api/voice.ts`

### `getScribeToken(): Promise<string>`

Fetches a single-use token for ElevenLabs Realtime Scribe WebSocket connection.

```typescript
const token = await getScribeToken();
// Use token to connect to ElevenLabs Scribe WebSocket
```

**Flow:**
1. Calls `elevenlabs-scribe-token` edge function
2. Returns the token string
3. Token is single-use — request a new one for each session

### `textToSpeech(text: string): Promise<void>`

Converts text to speech and plays it immediately.

```typescript
await textToSpeech("I've saved that memory for you.");
```

**Flow:**
1. Sends text to `elevenlabs-tts` edge function
2. Receives MP3 audio binary
3. Creates a `Blob` → `Object URL` → `Audio` element
4. Plays audio automatically

**Default voice:** Sarah (`EXAVITQu4vr4xnSDxMaL`)

---

## 7. Voice Input Flow

**File:** `src/hooks/useVoiceInput.ts`

### State Machine

```
idle ──► listening ──► thinking ──► speaking ──► idle
                                        │
                                        ▼
                                   confirming ──► idle
```

| State | Description |
|-------|-------------|
| `idle` | No activity, mic button shows default state |
| `listening` | Scribe WebSocket connected, capturing audio |
| `thinking` | Transcript sent to AI, waiting for response |
| `speaking` | TTS playing the AI's spoken reply |
| `confirming` | Reminder confirmation dialog is open |

### Hook API

```typescript
const {
  voiceState,          // Current state: VoiceState
  lastResponse,        // Last spoken reply text
  startListening,      // Begin voice capture
  stopAndProcess,      // Stop capture and run full AI pipeline
  stopAndGetTranscript,// Stop capture and return raw text (no AI)
  partialTranscript,   // Real-time partial transcript from Scribe
  isConnected,         // WebSocket connection status
  pendingReminder,     // Reminder awaiting confirmation (or null)
  confirmReminder,     // Confirm and save the pending reminder
  cancelReminder,      // Dismiss the pending reminder
} = useVoiceInput();
```

### Processing Pipeline

1. **`startListening()`**
   - Sets state to `listening`
   - Fetches a Scribe token via `getScribeToken()`
   - Connects to ElevenLabs Scribe WebSocket with echo cancellation and noise suppression
   - Scribe uses VAD (Voice Activity Detection) commit strategy

2. **`stopAndProcess()`**
   - Collects all committed transcripts + partial transcript
   - Disconnects WebSocket
   - Sets state to `thinking`
   - Calls `processWithAI(fullText)` → sends to AI assistant
   - Executes the returned action:
     - `save_memory` → calls `createMemory()`
     - `complete_reminder` → calls `updateReminderStatus()`
     - `create_reminder` → stores as `pendingReminder` (awaits confirmation)
   - Sets state to `speaking`, plays TTS
   - If reminder was created, transitions to `confirming`

3. **`confirmReminder(edited)`**
   - Saves the (possibly edited) reminder via `createReminder()`
   - Clears pending reminder, returns to `idle`

4. **`cancelReminder()`**
   - Discards pending reminder, returns to `idle`

### ElevenLabs Scribe Integration

```typescript
const scribe = useScribe({
  modelId: "scribe_v2_realtime",       // Real-time STT model
  commitStrategy: CommitStrategy.VAD,  // Voice Activity Detection
  onCommittedTranscript: () => {},     // Handled via committedTranscripts array
});
```

**Connection options:**
```typescript
await scribe.connect({
  token: singleUseToken,
  microphone: {
    echoCancellation: true,
    noiseSuppression: true,
  },
});
```

**Transcript access:**
- `scribe.committedTranscripts` — Array of finalized transcript segments
- `scribe.partialTranscript` — Current in-progress text (updates in real-time)

---

## Appendix: Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | Client `.env` | Backend API base URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client `.env` | Public API key for client requests |
| `ELEVENLABS_API_KEY` | Backend secret | ElevenLabs STT/TTS authentication |
| `LOVABLE_API_KEY` | Backend secret (auto-provisioned) | Lovable AI Gateway authentication |
| `SUPABASE_URL` | Backend (auto) | Internal backend URL |
| `SUPABASE_ANON_KEY` | Backend (auto) | Internal anon key |

---

## Appendix: Error Handling Summary

| Scenario | HTTP Status | Client Handling |
|----------|-------------|-----------------|
| Not authenticated | 401 | Redirect to login |
| AI rate limited | 429 | Toast: "Try again later" |
| AI credits exhausted | 402 | Toast: "Usage limit reached" |
| ElevenLabs API error | 500 | Toast with error details |
| Mic permission denied | — | Toast: "Mic error" |
| TTS failure | — | Silent fallback (text still shown) |
| Network error | — | Toast with error message |
