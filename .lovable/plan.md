

## UI Layout and Interaction Fixes

Three issues to address: (1) Chat input hidden behind bottom nav, (2) Mic button positioning, (3) Add multi-option FAB for Memories/Reminders pages.

### Changes

**1. Fix Chat page layout — `src/pages/ChatPage.tsx`**
- Change the container from `h-[calc(100vh-5rem)]` to account for bottom nav height (~4.5rem nav + 1.5rem padding)
- Make the input bar fixed/sticky just above the bottom nav (e.g., `fixed bottom-[4.5rem]`) so it's always visible without scrolling
- Adjust the message scroll area to leave room for the fixed input bar

**2. Reposition Mic button — `src/components/layout/MicButton.tsx`**
- Move from `fixed bottom-20 left-1/2 -translate-x-1/2` (centered) to `fixed bottom-[4.5rem] right-4` (bottom-right, above the nav bar) for better thumb reachability
- Slightly smaller or same size, positioned to the right so it doesn't overlap content

**3. Replace single + button with expandable FAB — `src/pages/Memories.tsx` and `src/pages/Reminders.tsx`**
- Remove the header + button
- Add a floating action button (bottom-right, above mic button area) that expands on tap to show 2-3 options:
  - **Manual** (Plus icon) — opens the existing AddMemoryDialog / AddReminderDialog
  - **Voice** (Mic icon) — triggers voice input via `useVoiceInput().startListening()`
  - **Chat** (MessageCircle icon) — navigates to `/chat`
- Use framer-motion for the expand/collapse animation
- Create a shared `FloatingActions` component used by both pages

**4. Adjust `AppLayout.tsx`**
- On `/chat` route, hide the global MicButton (already done) and ensure the layout padding works with the new fixed chat input

### Component: `src/components/FloatingActions.tsx`
- Props: `onManualAdd`, `onVoice` (optional), `showVoice` (default true)
- Renders a FAB at bottom-right above nav
- On tap, expands upward showing 3 small circular buttons: Manual (+), Voice (Mic), Chat (navigate)
- Tap outside or tap main button again to collapse

