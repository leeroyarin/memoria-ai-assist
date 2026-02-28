

## Fix: Wrong Language in Speech-to-Text + Add Cancel Button

### Problem 1: Wrong language transcription
The `useScribe` hook doesn't specify a `languageCode`, so ElevenLabs auto-detects the language -- which often picks the wrong one. Fix: pass `languageCode: "eng"` in the scribe configuration.

### Problem 2: No cancel button on voice overlay
When listening/processing, the user has no way to cancel except tapping the overlay background (only during listening). Need a visible cancel button in all active voice states.

### Changes

**1. `src/hooks/useVoiceInput.ts`** -- Set English language for Scribe
- Add `languageCode: "eng"` to the `useScribe` options (line 18-22)
- Add a `cancelVoice` function that disconnects scribe and resets state to idle

**2. `src/components/VoiceOverlay.tsx`** -- Add cancel button
- Add an `onCancel` prop
- Render a cancel button (X icon or "Cancel" text) visible in all active states (listening, processing, thinking, speaking)
- Clicking it calls `onCancel` to abort the current operation

**3. `src/components/layout/MicButton.tsx`** -- Pass cancel handler to VoiceOverlay
- Wire the new `cancelVoice` function from the hook to the overlay's `onCancel` prop

**4. `src/pages/Memories.tsx` and `src/pages/Reminders.tsx`** -- Pass cancel handler to VoiceOverlay on these pages too

### Files Modified
- `src/hooks/useVoiceInput.ts`
- `src/components/VoiceOverlay.tsx`
- `src/components/layout/MicButton.tsx`
- `src/pages/Memories.tsx`
- `src/pages/Reminders.tsx`

