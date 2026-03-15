# Deployment Guide

## Option 1: Vercel + Managed Postgres

### Prerequisites
- Vercel account
- PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.)
- Redis instance (Upstash recommended for serverless)

### Steps

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USER/college-baseball-analytics.git
   git push -u origin main
   ```

2. **Import project in Vercel**
   - Connect your GitHub repo at [vercel.com/new](https://vercel.com/new)
   - Vercel auto-detects Next.js — no special settings needed

3. **Set environment variables** in Vercel dashboard:
   ```
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   TARGET_SCHOOL_NAME=Old Dominion
   AGENT_SCRAPE_DELAY_MS=2000
   AGENT_MAX_RETRIES=3
   CRON_SECRET=<generate-a-random-string>
   ```

4. **Run initial database migration**
   ```bash
   npx prisma db push
   ```

5. **Cron job** is configured in `vercel.json` to run the agent pipeline daily at 6:00 AM UTC. The `CRON_SECRET` env var authenticates cron requests.

6. **Manual agent trigger** via POST:
   ```bash
   curl -X POST https://your-app.vercel.app/api/agents
   # Or a specific agent:
   curl -X POST https://your-app.vercel.app/api/agents \
     -H "Content-Type: application/json" \
     -d '{"agentName": "data-collection"}'
   ```

---

## Option 2: Docker Compose (Self-Hosted)

### Prerequisites
- Docker and Docker Compose installed
- A server (VPS, cloud instance, etc.)

### Steps

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USER/college-baseball-analytics.git
   cd college-baseball-analytics
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start all services**
   ```bash
   docker compose up -d
   ```
   This starts: Next.js app (port 3000), PostgreSQL (port 5432), Redis (port 6379)

4. **Run database migration**
   ```bash
   docker compose exec app npx prisma db push
   ```

5. **Run the agent pipeline**
   ```bash
   docker compose run agents
   ```

6. **Set up cron** (on the host machine):
   ```bash
   crontab -e
   # Add this line for daily runs at 6 AM:
   0 6 * * * cd /path/to/college-baseball-analytics && docker compose run --rm agents
   ```

---

## Agent Pipeline

The agent pipeline runs 6 agents in sequence:

1. **data-collection** — Scrapes rosters, stats, and schedules
2. **player-summary** — Calculates derived stats, detects two-way players
3. **rpi** — Scrapes RPI rankings from Warren Nolan / Boydsworld
4. **rating-engine** — Computes Pitching+ and Hitting+ ratings
5. **schedule-projection** — Generates win probabilities for games
6. **matchup-modeling** — Projects pitcher-vs-hitter matchup outcomes

Run manually with:
```bash
npx tsx scripts/run-agents.ts              # Full pipeline
npx tsx scripts/run-agents.ts rpi          # Single agent
npx tsx scripts/run-agents.ts rating-engine --season 2025
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `TARGET_SCHOOL_NAME` | Yes | School to track (e.g., "Old Dominion") |
| `TARGET_SCHOOL_ID` | No | NCAA school ID (auto-detected if blank) |
| `AGENT_SCRAPE_DELAY_MS` | No | Delay between scrape requests (default: 2000) |
| `AGENT_MAX_RETRIES` | No | Max retries per agent (default: 3) |
| `CRON_SECRET` | No | Vercel cron authentication secret |
| `TRACKMAN_API_KEY` | No | Future: TrackMan API key for Stuff+/Location+ |
| `TRACKMAN_API_URL` | No | Future: TrackMan API endpoint |
