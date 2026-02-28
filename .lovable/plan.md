

## Plan: Public Landing Page + Move Home to `/home`

### Changes

**1. Create `src/pages/LandingPage.tsx`** (new file)
- Public page at `/` — no auth required
- Shows app branding, feature overview (Voice Input, AI Chat, Memories, Reminders, Smart Summaries, Voice Feedback), and a "Sign In / Get Started" CTA button linking to `/auth`
- Uses existing `Card`, `motion`, lucide icons — no new dependencies

**2. Create `src/pages/HomePage.tsx`** (new file)
- Move the current authenticated home content here (greeting, stats, AI overview tip, recent activity)
- This is essentially the original `Index.tsx` content before the dashboard changes were added (with stats + recent activity), mounted at `/home` behind auth

**3. Rewrite `src/pages/Index.tsx`**
- Simply re-export `LandingPage` as the default

**4. Update `src/App.tsx`**
- `/` route → `LandingPage` (outside `ProtectedRoute`)
- `/home` route → `HomePage` (inside `ProtectedRoute` + `AppLayout`)

**5. Update `src/components/layout/BottomNav.tsx`**
- Change Home link from `/` to `/home`

### Files
- `src/pages/LandingPage.tsx` — new
- `src/pages/HomePage.tsx` — new (original home content with stats/activity)
- `src/pages/Index.tsx` — simplified to render LandingPage
- `src/App.tsx` — updated routes
- `src/components/layout/BottomNav.tsx` — Home link → `/home`

