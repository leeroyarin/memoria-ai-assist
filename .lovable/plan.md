

## Complete Reminder via Voice/Chat

When a user tells the AI they've finished a task (e.g., "I just called Mom" or "I finished grocery shopping"), the AI should match it against pending reminders and mark the matching one(s) as done.

### Changes

**1. Update `supabase/functions/ai-assistant/index.ts`**
- Include reminder `id` in the fetched reminders data so the AI can reference specific reminders
- Add `"complete_reminder"` as a new action enum value
- Add `reminder_id` to the tool's data properties so the AI returns which reminder to mark done
- Update system prompt to instruct the AI: when the user says they've done something that matches a pending reminder, use action `"complete_reminder"` with the matching `reminder_id`

**2. Update `src/api/ai.ts`**
- Add `"complete_reminder"` to the `AIResponse.action` type
- Add `reminder_id?: string` to the `data` interface

**3. Update `src/pages/ChatPage.tsx`**
- Handle `action === "complete_reminder"`: call `updateReminderStatus(reminder_id, "done")` and show a toast

**4. Update `src/hooks/useVoiceInput.ts`**
- Handle `action === "complete_reminder"`: call `updateReminderStatus(reminder_id, "done")` and show a toast

