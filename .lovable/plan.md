

## Voice-Activated Memory & Reminder System — Web Prototype

### 1. Enable Lovable Cloud & AI
- Set up Lovable Cloud for backend (database, auth, edge functions)
- Enable Lovable AI for the "Middle Man" intelligence
- Connect ElevenLabs for STT and TTS via connector

### 2. Authentication & Database
- Implement email-based login/signup with Supabase Auth
- Create `profiles` table for user preferences (default alarm sound, wake word preference)
- Create `memories` table (id, user_id, content, category, tags, created_at)
- Create `reminders` table (id, user_id, memory_id, type: time|activity, trigger_time, trigger_context, alarm_sound, priority: normal|high, status: pending|done|dismissed, created_at)
- Set up RLS so users only access their own data

### 3. Core Layout & Navigation
- Mobile-first responsive layout with bottom navigation
- Pages: Home/Dashboard, Memories, Reminders, Settings
- Persistent floating mic button for voice input

### 4. Voice Interaction System
- **Speech-to-Text**: ElevenLabs STT edge function for transcribing voice input
- **Text-to-Speech**: ElevenLabs TTS edge function for AI spoken responses
- Mic button with recording state UI (pulsing animation, "Listening..." state)
- Visual feedback during API chain: "Listening..." → "Processing..." → "AI is thinking..." → spoken response

### 5. Memory Bank (Digital Notes)
- Voice-to-note: speak a note, it gets transcribed and saved
- List view of all memories with search and category filters
- Categories auto-suggested by AI (e.g., Personal, Work, Shopping, Health)
- Manual edit/delete capabilities

### 6. Reminder System
- **Time-based**: "Remind me in 10 minutes to check the oven" → parsed by AI into scheduled reminder
- **Activity-based**: "After I finish eating, remind me to call Mom" → stored with context trigger, surfaced via AI check-ins
- AI edge function parses natural language commands to extract: reminder text, type, trigger time/context, priority level
- Reminder list with status (pending/done/dismissed) and ability to snooze or dismiss
- Browser notifications for time-based reminders (with permission prompt)
- Visual + audio alerts with customizable alarm sounds (selection UI in settings)

### 7. AI "Middle Man" Proactive Assistant
- Edge function that fetches user's recent memories and pending reminders
- "Am I forgetting anything?" voice command triggers AI synthesis
- AI analyzes context and provides spoken summary of pending tasks and suggestions
- Dashboard widget showing AI-generated daily overview

### 8. Settings Page
- Default alarm sound selection (from preset library)
- Notification preferences
- Voice feedback toggle (TTS on/off)
- Account management

### 9. Modular Architecture (for future mobile extraction)
- API calls abstracted into separate service files: `api/voice.ts`, `api/ai.ts`, `api/db.ts`
- Business logic in custom hooks: `useVoiceInput`, `useReminders`, `useMemories`, `useAIAssistant`
- UI components fully decoupled from data logic

