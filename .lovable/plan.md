

## Add Chat Interface

Add a text-based chat page as an alternative to voice input, allowing conversational interaction with the AI assistant. The chat will use the existing `ai-assistant` edge function and support the same actions (save memory, create reminder, summary, general chat).

### Changes

**1. Create `src/pages/ChatPage.tsx`**
- Full-screen chat UI with scrollable message list and fixed input bar at bottom (above bottom nav)
- Messages rendered with user/assistant bubbles
- On send: call `ai-assistant` edge function with the user's text message
- Handle `create_reminder` responses by showing the `ReminderConfirmDialog`
- Handle `save_memory` responses by auto-saving and showing a toast
- Display the `spoken_reply` as the assistant's chat bubble
- Maintain conversation history in local state (messages array)

**2. Update `src/components/layout/BottomNav.tsx`**
- Add a "Chat" nav item (MessageCircle icon) between Home and Memories

**3. Update `src/App.tsx`**
- Add `/chat` route inside the protected layout

**4. Update `supabase/functions/ai-assistant/index.ts`**
- Add optional `history` array parameter to accept prior conversation context
- Include history in the AI prompt for multi-turn conversation support

