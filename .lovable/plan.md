

## Fix Auth Navigation Flow

The "Get Started" button navigates to `/auth`, which works. However, after successful login, `AuthPage` redirects to `/` (the public landing page) instead of `/home` (the authenticated dashboard). This creates a loop where logged-in users keep seeing the landing page.

### Changes

**1. `src/pages/AuthPage.tsx`** — Change redirect from `/` to `/home`
- Line 19: `<Navigate to="/" replace />` → `<Navigate to="/home" replace />`

**2. `src/pages/LandingPage.tsx`** — Add redirect for already-logged-in users
- If user is already authenticated, redirect them to `/home` instead of showing the landing page

### Files Modified
- `src/pages/AuthPage.tsx`
- `src/pages/LandingPage.tsx`

