# College Baseball Analytics

## Project Overview
Full-stack college baseball analytics platform focused on player evaluation, team comparison, and predictive performance modeling. Centers around two proprietary rating systems — **Pitching+** and **Hitting+** — where **100 = Division I average**.

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Recharts, D3.js, shadcn/ui, Zustand, TanStack Query
- **Backend**: Next.js API routes + standalone agent services, TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Cache/Queue**: Redis + BullMQ
- **Deployment**: Docker Compose (self-hosted) or Vercel + Neon + Upstash

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npx prisma validate  # Validate Prisma schema
npx prisma generate  # Generate Prisma client
npx prisma migrate dev  # Run migrations (dev)
npx prisma db push   # Push schema to DB without migration
```

## Key Conventions
- **TypeScript everywhere** — no JavaScript files
- **100 = D1 Average** — all Pitching+ and Hitting+ ratings normalize to this baseline
- **Stuff+ and Location+** are placeholder-only until TrackMan data is available
- Respect scraping ethics: 2-second delays, respect robots.txt
- Agent runs are idempotent — safe to re-run
- Target school is configurable via `TARGET_SCHOOL_NAME` env var

## Directory Structure
- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — React components (ui/, layout/, dashboard/, etc.)
- `src/lib/` — Shared utilities (db, redis, queue)
- `src/models/` — TypeScript types and constants
- `src/agents/` — Multi-agent data pipeline
- `prisma/` — Database schema and migrations

## Database
Prisma schema at `prisma/schema.prisma`. Key models: Team, Player, SeasonStats, Game, PitcherMatchup, ScheduleEntry, RpiRanking, AgentRun.

## Rating System
- **Pitching+**: Weighted composite of K%, BB%, Strike%, Opp BA, WHIP, K/BB ratio
- **Hitting+**: Weighted composite of BA, OBP, SLG, OPS, K rate, BB rate, ISO
- Component weights defined in `src/models/constants.ts`
