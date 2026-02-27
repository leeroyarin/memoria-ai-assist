

## Add Manual Memory/Reminder Creation + Fix Bottom Nav Overlap

Three changes: add manual add buttons to Memories and Reminders pages, support offline queuing, and fix content being hidden behind the bottom nav.

### Changes

**1. Fix bottom nav content overlap — `src/components/layout/AppLayout.tsx`**
- Increase `pb-20` to `pb-24` or `pb-28` to ensure all page content scrolls above the bottom nav and mic button

**2. Create `src/components/AddMemoryDialog.tsx`**
- Drawer/dialog with fields: content (textarea), category (select: Personal/Work/Shopping/Health/Finance/Other), tags (comma-separated input)
- On submit: call `createMemory()` directly, invalidate queries, show toast
- Offline support: if `createMemory` fails due to network, save to `localStorage` queue and show "Saved offline — will sync when online" toast

**3. Create `src/components/AddReminderDialog.tsx`**
- Drawer/dialog with fields: title, type toggle (time/activity), trigger_time (datetime-local) or trigger_context (text), priority toggle
- On submit: call `createReminder()` directly, invalidate queries, show toast
- Same offline queue fallback as memories

**4. Update `src/pages/Memories.tsx`**
- Add a floating `+` button (or header button) that opens `AddMemoryDialog`

**5. Update `src/pages/Reminders.tsx`**
- Add a floating `+` button (or header button) that opens `AddReminderDialog`

**6. Create `src/hooks/useOfflineSync.ts`**
- On mount, check `localStorage` for queued items
- Listen for `online` event; when back online, flush queued memories/reminders to the database and invalidate queries
- Queue structure: `{ type: "memory" | "reminder", data: {...}, timestamp: number }[]`

**7. Wire offline sync in `src/components/layout/AppLayout.tsx`**
- Call `useOfflineSync()` at the layout level so it runs globally

