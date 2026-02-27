

## Replace FAB with Fixed VOICE / MANUAL Buttons on Memories & Reminders

Based on the screenshot, replace the expandable floating action button with two side-by-side fixed buttons ("VOICE" and "MANUAL") pinned just above the bottom nav, visible only on Memories and Reminders pages.

### Changes

**1. Update `src/components/FloatingActions.tsx`**
- Replace the expandable FAB with two fixed rectangular buttons side-by-side
- Left button: "VOICE" (primary/purple with border styling) — calls `onVoice`
- Right button: "MANUAL" (outlined/bordered) — calls `onManualAdd`
- Position: `fixed bottom-[4.5rem]` with horizontal padding, spanning the content width
- Remove the expand/collapse logic, overlay, and chat navigation option

**2. Update `src/components/layout/MicButton.tsx`**
- Hide the global mic button on `/memories` and `/reminders` routes (since voice is now handled by the page-level VOICE button)

**3. Update `src/pages/Memories.tsx` and `src/pages/Reminders.tsx`**
- No structural changes needed — they already use `<FloatingActions>` with `onManualAdd` and `onVoice` props

