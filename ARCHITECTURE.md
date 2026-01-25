# Ritual - Architecture & Design

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js Server Actions, Prisma ORM, PostgreSQL
- **Auth**: NextAuth.js (v5)
- **Offline/PWA**: Service Workers (via `next-pwa` or custom sw), IndexedDB (`idb`), Background Sync

## Directory Structure
```
/src
  /app
    /(auth)/               # Authentication routes (Login, Register)
    /(dashboard)/          # Protected application routes
      /layout.tsx          # Dashboard shell (Sidebar, SyncStatus)
      /page.tsx            # "Today" view
      /habits/             # Habit management
      /stats/              # Analytics & Heatmaps
      /settings/           # User settings
    /api/                  # API endpoints (Sync, Webhooks)
    /offline/              # Fallback for offline (if cached pages fail)
    /sw.ts                 # Service Worker entry logic
  /components
    /ui/                   # Reusable atomic molecules (Buttons, Inputs)
    /habits/               # Habit-specific components (HabitCard, Tracker)
    /stats/                # Charts, Heatmaps
    /layout/               # Navigation, Sidebar
  /lib
    /db/                   # Database clients
      index.ts             # Prisma client
      indexed-db.ts        # Client-side storage (idb)
      sync.ts              # Sync engine
    /actions/              # Server Actions (Mutations)
    /utils.ts              # Helpers (cn, dates)
    /hooks/                # Custom hooks (useHabits, useOffline)
  /styles
    globals.css            # Global styles, variables, typography
  /types
    index.ts               # Shared types
```

## Database Schema (Prisma)
- **User**: Auth & Profile
- **Habit**: Definitions of habits (frequency, color, goal)
- **HabitLog**: Daily completion records
- **SyncLog**: Tracking sync state (optional, for conflicts)

## Offline Strategy
1. **Reads**: All habit data is cached in `IndexedDB`. The UI reads from IDB first (Optimistic UI).
2. **Writes**: User actions update `IndexedDB` immediately + add to a `MutationQueue` in IDB.
3. **Sync**:
   - `SyncEngine` listens for `online` event.
   - On connection, flushes `MutationQueue` to Server Actions.
   - Pulls latest data from Server to reconcile.
4. **PWA**: Service Worker caches App Shell (HTML/JS/CSS) for offline load.

## Code Quality Standards
- **Strict TypeScript**: No `any`.
- **Server Components**: Fetch data on server where possible, pass to client for interactivity.
- **Tailwind**: Use `class-variance-authority` (cva) or standard patterns for variants.
- **Aesthetics**: Glassmorphism, smooth transitions (Framer Motion).
