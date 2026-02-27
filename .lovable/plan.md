

## Rearrange Mic Button to Avoid Chat Overlap

The floating mic button at `bottom-20` overlaps with the chat page's text input, creating a poor UX. The fix: hide the global mic button on the `/chat` route and instead embed a mic icon directly inside the chat input bar.

### Changes

**1. `src/components/layout/MicButton.tsx`**
- Use `useLocation()` to detect the current route
- Hide the entire mic button when on `/chat`

**2. `src/pages/ChatPage.tsx`**
- Add a mic icon button inside the input bar (next to the Send button)
- Wire it to the same voice pipeline (`useVoiceInput` hook)
- When recording, show the listening overlay inline or replace the input area with a "Listening..." indicator
- After transcription, auto-fill the text into the chat input (instead of processing directly), letting the user review before sending — or process directly with the same flow

**3. `src/components/layout/BottomNav.tsx`**
- No changes needed; the nav stays as-is

### Flow on Chat Page
```text
Input bar: [  Type a message...  ] [🎤] [➤]
  - Tap 🎤 → starts listening → input shows "Listening..."
  - Speech transcribed → text placed in input field → user can edit or tap Send
  - OR: process immediately like voice flow (AI → response bubble)
```

This keeps the global mic button available on all other pages (Home, Memories, Reminders, Settings) while giving the chat page a clean, integrated experience.

