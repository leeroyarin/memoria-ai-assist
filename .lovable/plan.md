

## Create a Dashboard Page

Transform the current Home page (`/`) into a comprehensive dashboard that shows an overview of the app's features, pages, and capabilities alongside the existing stats.

### Changes

**1. Rewrite `src/pages/Index.tsx` as the Dashboard**

Keep existing stats (memory/reminder counts, recent activity) and add:

- **Welcome header** with greeting (existing) plus a brief app description
- **"What You Can Do" section** — a grid of feature cards explaining the app's capabilities:
  - **Voice Input** — Speak naturally to save memories and set reminders via the mic button
  - **AI Chat** — Conversational assistant that understands intent (save, remind, summarize)
  - **Memories** — Store and search your thoughts, ideas, and notes with categories and tags
  - **Reminders** — Time-based and activity-based reminders with priority levels
  - **Smart Summaries** — Ask AI for daily summaries and "Am I forgetting anything?" overviews
  - **Voice Feedback** — AI speaks responses aloud using text-to-speech
- **"App Pages" section** — a list/grid of the 5 main pages (Home, Chat, Memories, Reminders, Settings) with icons, descriptions, and clickable navigation links
- **Quick stats section** (existing counts cards, kept as-is)
- **Recent Activity** (existing, kept as-is)

All new sections use existing `Card`, `motion` animations, and lucide icons — no new dependencies.

### Files Modified
- `src/pages/Index.tsx` — rewritten as dashboard with feature overview, page guide, and existing stats

