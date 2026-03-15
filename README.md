# College Baseball Analytics Platform

A full-stack college baseball analytics application focused on player evaluation, team comparison, and predictive performance modeling.

## Core Rating Systems

- **Pitching+** — 100 = Division I average pitcher performance
- **Hitting+** — 100 = Division I average hitter performance

Every player receives an individual rating, and every team has aggregate Pitching+ and Hitting+ scores. Compare player vs. player and team vs. team across all D1 programs.

## Features

- **Player Dashboards** — Year-by-year stats, career splits, Pitching+/Hitting+ ratings with component breakdowns
- **Team Pages** — Aggregate ratings, full rosters, schedule projections
- **Comparative Analytics** — Team vs. team and player vs. player side-by-side comparisons
- **Matchup Modeling** — Pitcher-vs-hitter projected outcomes for upcoming games
- **Game Projections** — Win probabilities and expected outcomes for every scheduled game
- **Session Playback** — Filter and step through player performance over time

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+, TypeScript, Tailwind CSS, Recharts, shadcn/ui |
| Backend | Next.js API Routes, Prisma ORM |
| Database | PostgreSQL |
| Cache/Queue | Redis, BullMQ |
| Agents | 6 specialized data collection and analysis agents |
| Deployment | Vercel or Docker Compose |

## Multi-Agent Architecture

1. **Data Collection Agent** — Scrapes public college baseball stats
2. **Player Summary Agent** — Cleans data, builds structured profiles
3. **RPI Agent** — Retrieves current team RPI rankings
4. **Schedule + Projection Agent** — Calculates game win probabilities
5. **Matchup Modeling Agent** — Projects pitcher-vs-hitter outcomes
6. **Rating Engine Agent** — Calculates Pitching+, Hitting+, and team composites

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Local Development

\`\`\`bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
\`\`\`

### Docker

\`\`\`bash
docker compose up -d
\`\`\`

### Vercel

Connect the repo to Vercel, add environment variables (DATABASE_URL via Neon, REDIS_URL via Upstash), and deploy.

## Future Enhancements

- **Stuff+** and **Location+** ratings (pending TrackMan API access)
- Real-time game scoring
- Conference tournament projections
- Mobile app

## License

Private — All rights reserved.
