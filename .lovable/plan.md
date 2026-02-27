

## Create API & AI Integration Documentation

Create a comprehensive `API_DOCUMENTATION.md` file at the project root covering all backend functions, database schema, client APIs, and AI integration details.

### Document Structure

**1. Authentication API**
- Sign up, sign in, sign out via AuthContext
- Session management and protected routes

**2. Database Schema & Tables**
- `profiles` — user settings (notifications, voice feedback, alarm sound)
- `memories` — user memories (content, category, tags)
- `reminders` — user reminders (title, type, trigger_time/context, priority, status)
- Database functions: `handle_new_user`, `validate_reminder_type`

**3. Client-Side Data API (`src/api/db.ts`)**
- `fetchMemories()` — GET all memories ordered by date
- `createMemory({ content, category?, tags? })` — INSERT memory
- `deleteMemory(id)` — DELETE memory
- `fetchReminders(filter?)` — GET reminders with optional type filter
- `createReminder({ title, type, trigger_time?, trigger_context?, priority? })` — INSERT reminder
- `updateReminderStatus(id, status)` — UPDATE reminder status
- `fetchProfile()` — GET user profile
- `fetchCounts()` — GET memory/reminder counts

**4. Edge Functions (Backend)**
- `elevenlabs-scribe-token` — generates single-use STT token
- `elevenlabs-tts` — text-to-speech conversion, returns MP3 audio
- `ai-assistant` — AI intent classification and response generation

**5. AI Assistant Integration**
- Request/response schema with tool-calling pattern
- Intent types: save_memory, create_reminder, complete_reminder, summary, chat
- System prompt structure with user context injection
- Lovable AI Gateway usage (model: gemini-3-flash-preview)

**6. Voice API (`src/api/voice.ts`)**
- `getScribeToken()` — fetch STT token from edge function
- `textToSpeech(text)` — call TTS edge function and play audio

**7. Voice Input Flow (`useVoiceInput` hook)**
- State machine: idle → listening → thinking → speaking → confirming → idle
- ElevenLabs Scribe realtime WebSocket integration
- Full processing pipeline documentation

### File
- `API_DOCUMENTATION.md` — new file at project root

