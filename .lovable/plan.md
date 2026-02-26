

## Next Phase: Database, Auth, ElevenLabs Voice & AI

This phase covers three major areas: (1) database schema + authentication, (2) ElevenLabs STT/TTS voice integration, and (3) AI Middle Man edge function. Here is the implementation plan:

---

### 1. Database Schema & RLS

Create three tables via migration:

- **profiles** (`id` uuid PK → auth.users, `default_alarm_sound` text, `voice_feedback_enabled` boolean, `notifications_enabled` boolean, `created_at`, `updated_at`)
- **memories** (`id` uuid PK, `user_id` uuid → profiles, `content` text, `category` text, `tags` text[], `created_at`)
- **reminders** (`id` uuid PK, `user_id` uuid → profiles, `memory_id` uuid nullable → memories, `title` text, `type` text check time|activity, `trigger_time` timestamptz nullable, `trigger_context` text nullable, `alarm_sound` text nullable, `priority` text default 'normal', `status` text default 'pending', `created_at`)

RLS policies: users can only SELECT/INSERT/UPDATE/DELETE their own rows on all three tables. Auto-create profile on signup via trigger.

### 2. Authentication

- Create `src/pages/AuthPage.tsx` with email login/signup form (tab toggle)
- Create `src/hooks/useAuth.ts` hook wrapping `supabase.auth`
- Add auth context provider and protected route wrapper
- Wire Settings page sign-in/sign-out buttons to real auth
- Redirect unauthenticated users to `/auth`

### 3. ElevenLabs Voice (STT + TTS)

- Connect ElevenLabs via connector (will prompt for API key)
- Install `@elevenlabs/react` for realtime STT
- Create edge functions:
  - `elevenlabs-scribe-token` — generates single-use realtime STT token
  - `elevenlabs-tts` — converts AI response text to speech audio
- Create `src/api/voice.ts` service abstraction
- Create `src/hooks/useVoiceInput.ts` hook using `useScribe` for mic recording
- Wire MicButton to real voice pipeline: record → transcribe → process → respond

### 4. AI Middle Man Edge Function

- Create `supabase/functions/ai-assistant/index.ts` using Lovable AI (gemini-3-flash-preview)
- Accepts user's transcribed text + fetches their memories/reminders from DB
- Determines intent: save memory, create reminder, or answer "Am I forgetting anything?"
- Returns structured response (action + data + spoken reply text)
- Create `src/api/ai.ts` service abstraction
- Create `src/hooks/useAIAssistant.ts` hook

### 5. Wire Everything Together

- MicButton flow: Listening → transcribe (STT) → AI processes → save to DB → speak response (TTS)
- Update Memories page to fetch/display real data with search
- Update Reminders page to fetch/display real data with tabs filtering
- Update Dashboard with live counts and recent activity
- Add visual states: "Listening..." → "Processing..." → "AI is thinking..." → spoken response

### 6. Modular Architecture

All API calls abstracted into `src/api/` files, all business logic in `src/hooks/`, UI components decoupled from data.

---

### Technical Notes

- ElevenLabs connector will be used for STT/TTS API key management
- Lovable AI (no extra API key needed) powers the Middle Man via `gemini-3-flash-preview`
- `verify_jwt = false` on edge functions with manual auth validation in code
- Browser notifications for time-based reminders via Notification API with permission prompt

