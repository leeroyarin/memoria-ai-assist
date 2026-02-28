

## Problem Analysis

Two issues identified:

1. **No voice UI on Memories/Reminders pages**: The `MicButton` component explicitly returns `null` on `/memories` and `/reminders` routes (line 35-44). Meanwhile, those pages create their own separate `useVoiceInput()` instance via `FloatingActions`, but never render any listening/processing overlay. The user gets zero visual feedback.

2. **Android STT latency**: The `useScribe` hook uses `CommitStrategy.VAD` which waits for silence before committing. On Android, the WebSocket connection may also suffer from latency. We can't fully fix Android WebSocket performance, but we can optimize by showing immediate UI feedback and ensuring the connection isn't being created multiple times (the console shows "Already connected" warnings, meaning `startListening` is called while already connected).

## Plan

### 1. Create a shared VoiceOverlay component

Extract the fullscreen voice UI overlay (currently inside `MicButton` lines 48-84) into a reusable `VoiceOverlay` component that accepts `voiceState`, `partialTranscript`, `lastResponse`, and `onStopListening` as props.

### 2. Add VoiceOverlay to Memories and Reminders pages

Import and render `VoiceOverlay` in both `Memories.tsx` and `Reminders.tsx`, passing in the voice state from their existing `useVoiceInput()` hook. Also render `ReminderConfirmDialog` for pending reminders.

### 3. Fix duplicate connection warning

In `useVoiceInput.ts` `startListening`, guard against calling `scribe.connect()` when already connected by checking `scribe.isConnected` first. This prevents the "Already connected" warnings and potential double-initialization on Android.

### 4. Update MicButton to use VoiceOverlay

Refactor `MicButton` to use the extracted `VoiceOverlay` component instead of inline JSX, and remove the early return for memories/reminders pages (keep the MicButton hidden but let the overlay logic remain with each page's own hook).

### Files to create
- `src/components/VoiceOverlay.tsx` — extracted overlay + state labels

### Files to modify
- `src/pages/Memories.tsx` — add VoiceOverlay + ReminderConfirmDialog
- `src/pages/Reminders.tsx` — add VoiceOverlay + ReminderConfirmDialog  
- `src/hooks/useVoiceInput.ts` — add `isConnected` guard in `startListening`
- `src/components/layout/MicButton.tsx` — use VoiceOverlay component

