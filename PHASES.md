# Project Phases

---

## Phase 1 — Architecture & Planning ✅

**Status:** Completed

- Defined system architecture and data models
- Isolated service layers (API, database, voice processing)
- Established tech stack: React + Vite + TypeScript + Tailwind + Supabase

---

## Phase 2 — Web Prototype ✅

**Status:** Completed / In Progress

- Voice input capture and transcription (ElevenLabs Scribe)
- AI-powered processing and chat interface
- Memories CRUD with categories and tags
- Reminders system (time-based and contextual)
- User authentication and profile management
- Settings and preferences
- Responsive mobile-first UI with bottom navigation

---

## Phase 3 — Native Mobile Migration

**Status:** Planned · 10 Weeks

### 3.1 — Foundation (Weeks 1–2)

**Goal:** Scaffold the native app shell and establish build pipelines.

| Deliverable | Details |
|---|---|
| Framework setup | Capacitor integration with existing React codebase |
| Project scaffolding | iOS (Xcode) and Android (Android Studio) project configs |
| CI/CD pipeline | Automated builds via GitHub Actions or Fastlane |
| Dev environment docs | Setup guide for local native development |

**Acceptance Criteria:**
- App launches on iOS simulator and Android emulator
- Hot-reload works for web layer changes
- CI builds produce `.ipa` and `.apk` artifacts

**Dependencies:** None — can begin immediately.

---

### 3.2 — Core Native Features (Weeks 3–5)

**Goal:** Replace web-based workarounds with true native capabilities.

| Deliverable | Details |
|---|---|
| Push notifications | FCM (Android) + APNs (iOS) with server-triggered delivery |
| Background voice processing | Native microphone access, background audio session handling |
| Biometric authentication | Face ID / Touch ID (iOS), Fingerprint / Face Unlock (Android) |
| Secure storage | Keychain (iOS) / Keystore (Android) for tokens and secrets |

**Acceptance Criteria:**
- Push notifications received when app is backgrounded/closed
- Voice input works without the app in foreground (where OS permits)
- Biometric prompt gates app access; falls back to PIN/password
- Auth tokens stored in platform-secure storage

**Dependencies:** 3.1 complete (native shell running).

---

### 3.3 — Offline-First Architecture (Weeks 6–7)

**Goal:** Enable full functionality without network connectivity.

| Deliverable | Details |
|---|---|
| Local database | SQLite via `@capacitor-community/sqlite` |
| Sync engine | Bi-directional sync between local SQLite and cloud database |
| Conflict resolution | Last-write-wins with optional manual merge for conflicts |
| Offline queue | Queued mutations replay on reconnect |

**Acceptance Criteria:**
- Memories and reminders are readable/writable in airplane mode
- Data syncs correctly when connectivity is restored
- No data loss during conflict scenarios (verified via test suite)

**Dependencies:** 3.1 complete; cloud database schema stable from Phase 2.

---

### 3.4 — Polish & Platform-Specific UX (Weeks 8–9)

**Goal:** Deliver a native-feeling experience on each platform.

| Deliverable | Details |
|---|---|
| iOS refinements | SF Symbols, native transitions, Dynamic Type support |
| Android refinements | Material You theming, predictive back gestures, adaptive icons |
| Haptic feedback | Contextual haptics on key interactions (save, delete, confirm) |
| App icons & splash screens | Platform-compliant assets for all device sizes |
| Accessibility audit | VoiceOver (iOS) and TalkBack (Android) compatibility |

**Acceptance Criteria:**
- App passes platform design review guidelines
- Haptics fire on defined interaction points
- Splash screen displays correctly on all supported screen sizes
- Accessibility audit shows zero critical issues

**Dependencies:** 3.2 and 3.3 feature-complete.

---

### 3.5 — Store Submission (Week 10)

**Goal:** Publish to App Store and Google Play.

| Deliverable | Details |
|---|---|
| App Store listing | Screenshots, description, keywords, privacy policy |
| Play Store listing | Feature graphic, description, content rating questionnaire |
| Beta testing | TestFlight (iOS) + Internal Testing Track (Android) |
| Compliance review | Data privacy declarations, permissions justifications |
| Launch | Public release on both stores |

**Acceptance Criteria:**
- Beta tested by ≥10 users with no P0/P1 bugs remaining
- Store listings approved on first submission (or resubmitted within 48h)
- Privacy policy and terms of service published and linked

**Dependencies:** All prior milestones (3.1–3.4) complete.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| App Store rejection | Medium | High | Follow guidelines strictly; pre-review with Apple/Google checklists |
| Background audio restrictions | High | Medium | Implement graceful degradation; document OS limitations |
| Sync conflicts at scale | Low | High | Comprehensive test suite; manual merge UI as fallback |
| Capacitor plugin gaps | Medium | Medium | Evaluate native plugin alternatives; budget time for custom plugins |

---

## Timeline Summary

```
Week  1–2   ██████░░░░░░░░░░░░░░  Foundation
Week  3–5   ░░░░░░██████████░░░░  Core Native Features
Week  6–7   ░░░░░░░░░░░░░░████░░  Offline-First
Week  8–9   ░░░░░░░░░░░░░░░░████  Polish & Platform
Week 10     ░░░░░░░░░░░░░░░░░░██  Store Submission
```
