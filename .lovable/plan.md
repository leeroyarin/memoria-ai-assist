

## Plan: AI Voice Editing of Reminders + Hide FloatingActions During Voice

### Issue 1: AI can't edit existing reminders via voice

Currently the AI only supports `complete_reminder` (mark done). Need to add an `edit_reminder` action so users can say things like "Change my reminder to tomorrow" or "Rename my gym reminder to yoga".

**Changes:**

**`supabase/functions/ai-assistant/index.ts`**
- Add `edit_reminder` to the action enum and system prompt instructions
- Explain to the AI: "edit_reminder" — user wants to change the title, time, priority, or recurrence of an existing pending reminder. Return the `reminder_id` plus any fields to update.
- Add editable fields to the tool schema: `reminder_id` (required), plus optional `title`, `trigger_time`, `trigger_context`, `priority`, `type`, `recurrence`

**`src/api/ai.ts`**
- Add `"edit_reminder"` to the `AIResponse.action` union type

**`src/api/db.ts`**
- Add `updateReminder(id, fields)` function that calls `.update(fields).eq("id", id)` on the reminders table

**`src/hooks/useVoiceInput.ts`**
- Handle the `edit_reminder` action in `stopAndProcess`: call `updateReminder` with the returned fields, show a toast confirmation

### Issue 2: FloatingActions (VOICE/MANUAL) visible behind voice overlay

When the voice overlay is active, the floating action buttons remain visible and clickable beneath the blur.

**Changes:**

**`src/pages/Memories.tsx`** and **`src/pages/Reminders.tsx`**
- Pass `voice.voiceState` to `FloatingActions` or conditionally hide it: only render `FloatingActions` when `voice.voiceState === "idle"`

This is simpler and cleaner than z-index tricks — if the overlay is active, the action buttons simply aren't rendered.

### Files to modify
- `supabase/functions/ai-assistant/index.ts` — add `edit_reminder` action to prompt and tool schema
- `src/api/ai.ts` — add `edit_reminder` to action type
- `src/api/db.ts` — add `updateReminder` function
- `src/hooks/useVoiceInput.ts` — handle `edit_reminder` action
- `src/pages/Memories.tsx` — hide FloatingActions when voice is active
- `src/pages/Reminders.tsx` — hide FloatingActions when voice is active

