# Ritual | Production-Grade Habit Tracker

Ritual is a high-performance, mobile-first habit tracker designed for consistency and offline reliability. Built with Next.js 15, Prisma, and Tailwind v4.

## 🚀 Features

- **One-Tap Completion**: Frictionless daily tracking with smooth haptic feedback (simulated via animations).
- **Offline-First Architecture**: 
  - Uses **IndexedDB** for local storage.
  - **Mutation Queueing**: All logs are saved locally and synced to the server when back online.
  - **Optimistic UI**: Experience zero latency when logging habits.
- **Advanced Streaks**: Timezone-safe streak calculations that handle "grace periods" (day ending at 3 AM).
- **Visual Insights**: GitHub-style activity heatmaps and AI-generated coaching insights.
- **PWA Support**: Installable on iOS/Android with offline persistence.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Database**: PostgreSQL with Prisma ORM (Production) / SQLite (Local frictionless setup)
- **Storage**: IndexedDB (via `idb` library) for offline persistence
- **Calculations**: `date-fns` for timezone-safe logic

## 📦 Getting Started

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   Configure `DATABASE_URL` in `.env`, then:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

## 🧠 Technical Decisions

### Offline Sync Strategy
We use a **Command Pattern** approach for offline sync. When a user logs a habit while offline, the action is stored in an IndexedDB `mutations` store. A `useSync` hook monitors connection state and "flushes" the queue using Server Actions once connectivity is restored.

### Streak Logic
Streaks are calculated on the fly but cached in the database for performance. A streak is considered "active" if the last completion was either **Today** or **Yesterday** (relative to the user's timezone).

### UI/UX
Designed specifically for thumb-usage on mobile devices using a bottom-navigation paradigm. Glassmorphism and Backdrop-blurs are used extensively to create a premium, SaaS-quality feel.

## 🔐 Security & Privacy
- Local-only mode capability via IndexedDB.
- Private by default; no social sharing enabled.
- GDPR-friendly data export and deletion tools in Settings.
