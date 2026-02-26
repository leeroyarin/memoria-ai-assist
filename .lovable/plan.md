

## Reminder Confirmation & Edit Flow

Currently, when a reminder is created via voice, it's saved directly to the database with no confirmation step. This plan adds a confirmation overlay with editable fields before saving.

### Changes

**1. Add "confirming" voice state to `useVoiceInput.ts`**
- Add new state `"confirming"` to `VoiceState` type
- Instead of calling `createReminder()` immediately, store the parsed reminder data in state (`pendingReminder`)
- Set state to `"confirming"` after TTS speaks the confirmation
- Expose `pendingReminder`, `confirmReminder(editedData)`, and `cancelReminder()` from the hook

**2. Create `ReminderConfirmDialog.tsx` component**
- A bottom sheet / dialog that shows the parsed reminder details in editable form fields:
  - Title (text input)
  - Type (time / activity toggle)
  - Trigger time (datetime input, shown if type=time)
  - Trigger context (text input, shown if type=activity)
  - Priority (normal / high toggle)
- "Confirm" button saves to DB and closes
- "Cancel" button discards and closes

**3. Update `MicButton.tsx`**
- Import and render `ReminderConfirmDialog` when `voiceState === "confirming"`
- Pass `pendingReminder`, `confirmReminder`, and `cancelReminder` as props
- The overlay dismisses and returns to idle after confirm/cancel

**4. Update AI spoken reply**
- The AI already generates a spoken confirmation (e.g., "I'll remind you to call Mom at 3 PM"). No backend change needed — the TTS plays this, then the edit UI appears for visual confirmation.

### Flow
```text
Voice → AI parses → TTS speaks confirmation → Edit dialog appears
  ├─ User taps "Confirm" → saved to DB → idle
  └─ User taps "Cancel" or edits fields → modified/discarded → idle
```

