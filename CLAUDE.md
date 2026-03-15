# College Baseball Analytics Platform — Development Plan

## Project Overview

Build a full-stack college baseball analytics application focused on player evaluation, team comparison, and predictive performance modeling. The app centers around two proprietary rating systems — **Pitching+** and **Hitting+** — where 100 = Division I average. The platform uses a multi-agent architecture to collect, organize, analyze, and project player and team performance using publicly available college baseball data.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts/Viz**: Recharts + D3.js for advanced visualizations
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: shadcn/ui

### Backend
- **Runtime**: Node.js with Next.js API routes + standalone agent services
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache**: Redis (for agent job queues, rate limiting, caching)
- **Job Queue**: BullMQ (Redis-backed, for agent task orchestration)
- **API**: REST endpoints via Next.js API routes

### Infrastructure
- **Deployment**: Vercel (frontend + API routes) OR Docker Compose (self-hosted)
- **Containerization**: Docker + Docker Compose
- **Database Hosting**: Neon (Vercel) or self-hosted PostgreSQL container

---

## Directory Structure

```
college-baseball-analytics/
├── CLAUDE.md                          # This file — project instructions
├── docker-compose.yml                 # Full stack orchestration
├── Dockerfile                         # Multi-stage build for Next.js app
├── Dockerfile.agents                  # Agent worker services
├── .env.example                       # Environment variable template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── seed.ts                        # Seed script for initial data
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Landing / home dashboard
│   │   ├── players/
│   │   │   ├── page.tsx               # Player directory/search
│   │   │   └── [playerId]/
│   │   │       └── page.tsx           # Individual player dashboard
│   │   ├── pitchers/
│   │   │   ├── page.tsx               # Pitcher directory
│   │   │   └── [pitcherId]/
│   │   │       └── page.tsx           # Individual pitcher dashboard
│   │   ├── hitters/
│   │   │   ├── page.tsx               # Hitter directory
│   │   │   └── [hitterId]/
│   │   │       └── page.tsx           # Individual hitter dashboard
│   │   ├── teams/
│   │   │   ├── page.tsx               # Team directory
│   │   │   └── [teamId]/
│   │   │       └── page.tsx           # Team page with aggregate metrics
│   │   ├── compare/
│   │   │   ├── teams/
│   │   │   │   └── page.tsx           # Team vs team comparison
│   │   │   └── players/
│   │   │       └── page.tsx           # Player vs player comparison
│   │   ├── matchups/
│   │   │   ├── page.tsx               # Upcoming matchup projections
│   │   │   └── [gameId]/
│   │   │       └── page.tsx           # Specific game matchup detail
│   │   ├── schedule/
│   │   │   └── page.tsx               # Season schedule with projections
│   │   └── api/
│   │       ├── players/
│   │       │   └── route.ts
│   │       ├── teams/
│   │       │   └── route.ts
│   │       ├── ratings/
│   │       │   └── route.ts
│   │       ├── matchups/
│   │       │   └── route.ts
│   │       ├── projections/
│   │       │   └── route.ts
│   │       ├── schedule/
│   │       │   └── route.ts
│   │       ├── rpi/
│   │       │   └── route.ts
│   │       └── agents/
│   │           └── route.ts           # Agent status + manual trigger endpoints
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── dashboard/
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── PitcherDashboard.tsx
│   │   │   ├── HitterDashboard.tsx
│   │   │   ├── RatingGauge.tsx        # Visual gauge for Pitching+/Hitting+
│   │   │   ├── SeasonFilter.tsx       # Year-by-year filtering
│   │   │   ├── CareerSplits.tsx
│   │   │   └── SessionPlayback.tsx    # Session filtering and playback
│   │   ├── comparison/
│   │   │   ├── TeamCompare.tsx
│   │   │   ├── PlayerCompare.tsx
│   │   │   └── RadarChart.tsx
│   │   ├── matchups/
│   │   │   ├── MatchupCard.tsx
│   │   │   ├── PitcherVsHitter.tsx
│   │   │   └── GameProjection.tsx
│   │   ├── ratings/
│   │   │   ├── PitchingPlusDisplay.tsx
│   │   │   ├── HittingPlusDisplay.tsx
│   │   │   ├── StuffPlusPlaceholder.tsx   # Placeholder for future TrackMan
│   │   │   └── LocationPlusPlaceholder.tsx # Placeholder for future TrackMan
│   │   ├── charts/
│   │   │   ├── PerformanceTrend.tsx
│   │   │   ├── RatingDistribution.tsx
│   │   │   ├── WinProbabilityChart.tsx
│   │   │   └── MatchupHeatmap.tsx
│   │   └── team/
│   │       ├── TeamOverview.tsx
│   │       ├── RosterTable.tsx
│   │       └── ScheduleTable.tsx
│   ├── lib/
│   │   ├── db.ts                      # Prisma client singleton
│   │   ├── redis.ts                   # Redis client
│   │   ├── queue.ts                   # BullMQ queue setup
│   │   └── utils.ts                   # Shared utilities
│   ├── agents/
│   │   ├── index.ts                   # Agent orchestrator / runner
│   │   ├── base-agent.ts              # Abstract base class for all agents
│   │   ├── data-collection/
│   │   │   ├── agent.ts               # Agent 1: Data Collection Agent
│   │   │   ├── scrapers/
│   │   │   │   ├── ncaa-stats.ts      # NCAA stats scraper
│   │   │   │   ├── team-roster.ts     # Team roster scraper
│   │   │   │   └── game-logs.ts       # Game log scraper
│   │   │   └── parsers/
│   │   │       ├── pitcher-stats.ts
│   │   │       └── hitter-stats.ts
│   │   ├── player-summary/
│   │   │   ├── agent.ts               # Agent 2: Player Summary / Dashboard Agent
│   │   │   ├── profile-builder.ts
│   │   │   └── dashboard-generator.ts
│   │   ├── rpi/
│   │   │   ├── agent.ts               # Agent 3: RPI Agent
│   │   │   └── rpi-scraper.ts
│   │   ├── schedule-projection/
│   │   │   ├── agent.ts               # Agent 4: Schedule + Projection Agent
│   │   │   ├── schedule-parser.ts
│   │   │   └── win-probability.ts
│   │   ├── matchup-modeling/
│   │   │   ├── agent.ts               # Agent 5: Matchup Modeling Agent
│   │   │   ├── pitcher-hitter-align.ts
│   │   │   └── outcome-projector.ts
│   │   └── rating-engine/
│   │       ├── agent.ts               # Agent 6: Rating Engine Agent
│   │       ├── pitching-plus.ts       # Pitching+ calculator
│   │       ├── hitting-plus.ts        # Hitting+ calculator
│   │       ├── team-composite.ts      # Team-level aggregate ratings
│   │       └── normalization.ts       # Normalize to D1 average = 100
│   ├── models/
│   │   ├── types.ts                   # Shared TypeScript types/interfaces
│   │   └── constants.ts              # D1 averages, weight configs, etc.
│   └── hooks/
│       ├── usePlayer.ts
│       ├── useTeam.ts
│       ├── useRatings.ts
│       ├── useMatchups.ts
│       └── useComparison.ts
└── scripts/
    ├── run-agents.ts                  # CLI to manually trigger agent runs
    ├── seed-data.ts                   # Seed database with sample data
    └── calculate-ratings.ts           # Standalone rating recalculation
```

---

## Phase 1: Foundation (Build First)

### 1A. Project Initialization

```bash
npx create-next-app@latest college-baseball-analytics --typescript --tailwind --app --src-dir
cd college-baseball-analytics
npm install prisma @prisma/client zustand @tanstack/react-query recharts d3 bullmq ioredis cheerio axios zod
npm install -D @types/d3 @types/node
npx shadcn-ui@latest init
```

### 1B. Database Schema (Prisma)

Create `prisma/schema.prisma` with these models:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Team {
  id              String    @id @default(cuid())
  name            String
  abbreviation    String?
  conference      String?
  division        String?   @default("D1")
  rpiRank         Int?
  rpiRating       Float?
  teamPitchingPlus Float?   // Aggregate team Pitching+
  teamHittingPlus  Float?   // Aggregate team Hitting+
  logoUrl         String?
  scheduleUrl     String?
  rosterUrl       String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  players         Player[]
  homeGames       Game[]    @relation("HomeTeam")
  awayGames       Game[]    @relation("AwayTeam")
  scheduleEntries ScheduleEntry[]
}

model Player {
  id              String    @id @default(cuid())
  firstName       String
  lastName        String
  team            Team      @relation(fields: [teamId], references: [id])
  teamId          String
  position        String    // P, C, 1B, 2B, SS, 3B, LF, CF, RF, DH, UT
  playerType      PlayerType
  classYear       String?   // Fr, So, Jr, Sr, R-Fr, etc.
  bats            String?   // L, R, S
  throws          String?   // L, R
  height          String?
  weight          Int?
  hometown        String?

  // Rating scores
  pitchingPlus    Float?    // Pitching+ score (100 = D1 avg)
  hittingPlus     Float?    // Hitting+ score (100 = D1 avg)
  stuffPlus       Float?    // Placeholder — null until TrackMan
  locationPlus    Float?    // Placeholder — null until TrackMan

  seasonStats     SeasonStats[]
  pitcherMatchups PitcherMatchup[] @relation("PitcherInMatchup")
  hitterMatchups  PitcherMatchup[] @relation("HitterInMatchup")

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([teamId])
  @@index([playerType])
}

enum PlayerType {
  PITCHER
  HITTER
  TWO_WAY
}

model SeasonStats {
  id              String    @id @default(cuid())
  player          Player    @relation(fields: [playerId], references: [id])
  playerId        String
  season          Int       // e.g., 2024
  gamesPlayed     Int?
  gamesStarted    Int?

  // Pitcher stats
  wins            Int?
  losses          Int?
  era             Float?
  inningsPitched  Float?
  strikeouts      Int?
  walks           Int?
  hits_allowed    Int?
  earnedRuns      Int?
  strikePercent   Float?    // Strike %
  bbPercent       Float?    // BB%
  kPercent        Float?    // K%
  oppBattingAvg   Float?    // Opponent BA
  whip            Float?
  kPerNine        Float?
  bbPerNine       Float?

  // Hitter stats
  atBats          Int?
  hits            Int?
  doubles         Int?
  triples         Int?
  homeRuns        Int?
  rbi             Int?
  runs            Int?
  stolenBases     Int?
  battingAvg      Float?
  obp             Float?    // On-base percentage
  slg             Float?    // Slugging
  ops             Float?
  kRateHitting    Float?    // K% as hitter
  bbRateHitting   Float?    // BB% as hitter
  babip           Float?
  isoSlg          Float?    // Isolated power

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([playerId, season])
  @@index([playerId])
}

model Game {
  id              String    @id @default(cuid())
  date            DateTime
  homeTeam        Team      @relation("HomeTeam", fields: [homeTeamId], references: [id])
  homeTeamId      String
  awayTeam        Team      @relation("AwayTeam", fields: [awayTeamId], references: [id])
  awayTeamId      String
  homeScore       Int?
  awayScore       Int?
  status          GameStatus @default(SCHEDULED)

  // Projections
  homeWinProb     Float?    // Projected home win probability
  awayWinProb     Float?
  projectedHomeRuns Float?
  projectedAwayRuns Float?

  matchups        PitcherMatchup[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([homeTeamId])
  @@index([awayTeamId])
  @@index([date])
}

enum GameStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  POSTPONED
}

model PitcherMatchup {
  id              String    @id @default(cuid())
  game            Game      @relation(fields: [gameId], references: [id])
  gameId          String
  pitcher         Player    @relation("PitcherInMatchup", fields: [pitcherId], references: [id])
  pitcherId       String
  hitter          Player    @relation("HitterInMatchup", fields: [hitterId], references: [id])
  hitterId        String

  // Projected outcomes
  projectedBA     Float?
  projectedK      Float?
  projectedBB     Float?
  projectedHR     Float?
  advantage       String?   // "PITCHER" | "HITTER" | "NEUTRAL"

  createdAt       DateTime  @default(now())

  @@index([gameId])
  @@index([pitcherId])
  @@index([hitterId])
}

model ScheduleEntry {
  id              String    @id @default(cuid())
  team            Team      @relation(fields: [teamId], references: [id])
  teamId          String
  date            DateTime
  opponentName    String
  isHome          Boolean
  result          String?   // "W 5-3", "L 2-4", etc.
  gameId          String?   // Link to Game if created

  createdAt       DateTime  @default(now())

  @@index([teamId])
  @@index([date])
}

model RpiRanking {
  id              String    @id @default(cuid())
  teamName        String
  rank            Int
  rating          Float
  record          String?
  conferenceRecord String?
  scrapedAt       DateTime  @default(now())
  season          Int

  @@index([season])
  @@index([rank])
}

model AgentRun {
  id              String    @id @default(cuid())
  agentName       String    // "data-collection", "rpi", "rating-engine", etc.
  status          AgentStatus @default(PENDING)
  startedAt       DateTime?
  completedAt     DateTime?
  itemsProcessed  Int       @default(0)
  errors          String[]
  metadata        Json?

  @@index([agentName])
  @@index([status])
}

enum AgentStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

### 1C. Environment Variables

Create `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/college_baseball"
REDIS_URL="redis://localhost:6379"

# Target school configuration
TARGET_SCHOOL_NAME="Old Dominion"
TARGET_SCHOOL_ID=""

# Agent configuration
AGENT_SCRAPE_DELAY_MS=2000
AGENT_MAX_RETRIES=3

# Optional: Future TrackMan API
TRACKMAN_API_KEY=""
TRACKMAN_API_URL=""
```

---

## Phase 2: Agent System (Build Second)

### Agent Base Class

Create `src/agents/base-agent.ts` — all agents extend this:

```typescript
export abstract class BaseAgent {
  abstract name: string;
  abstract description: string;

  abstract run(params?: Record<string, any>): Promise<AgentRunResult>;

  protected async logRun(status: AgentStatus, itemsProcessed: number, errors: string[]): Promise<void> {
    // Log to AgentRun table
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Agent 1: Data Collection Agent

**Purpose**: Scrape publicly available college baseball stats from NCAA, team websites, and stats aggregators.

**Data sources to scrape** (in priority order):
1. **stats.ncaa.org** — Official NCAA stats (player stats, team stats, game logs)
2. **Individual team athletics sites** — Rosters, schedules, box scores
3. **boydsworld.com/data** — Historical data, RPI, schedules
4. **d1baseball.com** — Rankings, stats (respect robots.txt)
5. **warrennolan.com** — RPI, SOS, schedules

**Implementation details**:
- Use `cheerio` + `axios` for HTML scraping
- Respect `robots.txt` and add 2-second delays between requests
- Store raw scraped data, then parse into structured SeasonStats records
- Pull historical data for all players on the target school's roster
- Pull historical data for batters on all opponent teams on the target school's schedule
- Handle pagination, rate limiting, and retry logic
- Log all scrape runs to AgentRun table

**Key functions**:
```
scrapeTeamRoster(teamUrl) → Player[]
scrapePlayerStats(playerUrl, seasons) → SeasonStats[]
scrapeGameLogs(teamId, season) → GameLog[]
scrapeOpponentBatters(schedule) → Player[] + SeasonStats[]
```

### Agent 2: Player Summary / Dashboard Agent

**Purpose**: Clean, normalize, and organize raw data into structured player profiles.

**Responsibilities**:
- Deduplicate player records (transfers, name variations)
- Calculate derived stats (OPS, ISO, wOBA, FIP, K/9, BB/9, etc.)
- Generate career splits (by season, by opponent quality, home/away, conference/non-conference)
- Build structured JSON profiles for each player that the frontend consumes
- Flag data quality issues (missing stats, outlier values)

**Key functions**:
```
buildPlayerProfile(playerId) → PlayerProfile
calculateDerivedStats(seasonStats) → EnrichedStats
generateCareerSplits(playerId) → CareerSplits
```

### Agent 3: RPI Agent

**Purpose**: Retrieve current RPI rankings and team strength metrics.

**Data sources**:
- warrennolan.com/baseball/rpi
- NCAA official RPI
- boydsworld.com RPI data

**Responsibilities**:
- Scrape current RPI rankings (rank, rating, record)
- Match scraped team names to internal Team records
- Update Team.rpiRank and Team.rpiRating
- Run daily or on-demand

### Agent 4: Schedule + Projection Agent

**Purpose**: Parse schedules, evaluate opponent strength, and project game outcomes.

**Responsibilities**:
- Parse the target school's full season schedule
- For each scheduled game, look up opponent's RPI, team Pitching+, and team Hitting+
- Calculate projected win probability using: `f(team_pitching_plus, team_hitting_plus, opp_pitching_plus, opp_hitting_plus, rpi_diff, home_away)`
- Generate season-long projections (expected record, projected runs scored/allowed)
- Update Game records with projections

**Win probability model (initial version)**:
```
1. Calculate team strength differential = (own_hitting_plus - opp_pitching_plus) + (own_pitching_plus - opp_hitting_plus)
2. Apply home-field advantage adjustment (+3 to +5 points)
3. Weight by RPI difference
4. Convert to probability using logistic function
```

### Agent 5: Matchup Modeling Agent

**Purpose**: Align expected pitcher-hitter matchups and project individual outcomes.

**Responsibilities**:
- For upcoming games, identify probable starting pitchers (from rotation patterns or announced starters)
- Align starting pitcher vs. opponent's lineup
- For each pitcher-hitter pair:
  - Compare pitcher's K%, BB%, opp BA against hitter's K rate, BB rate, BA
  - Factor in pitcher's Pitching+ vs. hitter's Hitting+
  - Generate projected outcome (projected BA, K prob, BB prob, HR prob)
- Determine matchup advantage (PITCHER, HITTER, or NEUTRAL)
- Store results in PitcherMatchup table

**Matchup projection formula (v1)**:
```
pitcher_dominance = pitcher_pitching_plus / 100
hitter_dominance = hitter_hitting_plus / 100

projected_BA = league_avg_BA * (hitter_BA / league_avg_BA) * (pitcher_opp_BA / league_avg_BA)
projected_K_rate = league_avg_K * (pitcher_K_pct / league_avg_K) * (hitter_K_rate / league_avg_K)
// Apply regression and matchup quality adjustments
```

### Agent 6: Rating Engine Agent

**Purpose**: Calculate and update all Pitching+, Hitting+, and team composite ratings.

**Pitching+ calculation (100 = D1 average)**:
```
Components and initial weights:
- K%: 25%
- BB%: 20% (inverted — lower is better)
- Strike%: 15%
- Opp BA: 20% (inverted — lower is better)
- WHIP: 10% (inverted)
- K/BB ratio: 10%

For each component:
  component_score = 100 * (d1_avg / player_value)   [for "lower is better" stats]
  component_score = 100 * (player_value / d1_avg)    [for "higher is better" stats]

Pitching+ = weighted_sum(component_scores)
Normalize so league average = exactly 100
```

**Hitting+ calculation (100 = D1 average)**:
```
Components and initial weights:
- BA: 15%
- OBP: 20%
- SLG: 20%
- OPS: 15%
- K rate: 10% (inverted)
- BB rate: 10%
- ISO: 10%

For each component:
  component_score = 100 * (player_value / d1_avg)    [for "higher is better" stats]
  component_score = 100 * (d1_avg / player_value)     [for "lower is better" stats]

Hitting+ = weighted_sum(component_scores)
Normalize so league average = exactly 100
```

**Team composite ratings**:
```
Team Pitching+ = weighted average of all pitcher Pitching+ scores on roster
  (weight by innings pitched)
Team Hitting+ = weighted average of all hitter Hitting+ scores on roster
  (weight by at-bats)
```

**Stuff+ and Location+ placeholders**:
- Create the database columns (already in schema as nullable)
- Create placeholder UI components that display "Coming Soon — Requires TrackMan Data"
- Create empty calculation functions with TODO comments documenting planned formulas:
  ```
  Stuff+ (future): Based on pitch velocity, spin rate, movement, extension
  Location+ (future): Based on pitch location accuracy, zone %, edge %
  Pitching+ (future version): Will incorporate Stuff+ and Location+ as additional weighted components
  ```

### Agent Orchestration

Create `src/agents/index.ts` — orchestrates the agent pipeline:

```
Execution order:
1. Data Collection Agent (scrape latest data)
2. Player Summary Agent (clean + enrich data)
3. RPI Agent (update rankings)
4. Rating Engine Agent (recalculate all ratings)
5. Schedule + Projection Agent (update game projections)
6. Matchup Modeling Agent (project pitcher-hitter matchups)

Can be triggered:
- On a cron schedule (daily at 6 AM ET)
- Manually via API endpoint POST /api/agents
- Individually via POST /api/agents/:agentName
```

---

## Phase 3: API Layer (Build Third)

### API Routes

All routes under `src/app/api/`:

**GET /api/players**
- Query params: `teamId`, `playerType`, `search`, `sortBy`, `limit`, `offset`
- Returns: Player list with latest ratings

**GET /api/players/:id**
- Returns: Full player profile with all season stats, career splits, ratings

**GET /api/teams**
- Query params: `conference`, `search`, `sortBy`
- Returns: Team list with aggregate ratings and RPI

**GET /api/teams/:id**
- Returns: Full team profile with roster, aggregate ratings, schedule

**GET /api/ratings/leaders**
- Query params: `type` (pitching|hitting), `limit`, `season`
- Returns: Top rated players by Pitching+ or Hitting+

**GET /api/matchups/:gameId**
- Returns: All pitcher-hitter matchup projections for a specific game

**GET /api/projections/schedule**
- Query params: `teamId`
- Returns: Full season projection with win probabilities per game

**GET /api/compare/teams**
- Query params: `team1Id`, `team2Id`
- Returns: Side-by-side team comparison (ratings, stats, roster strength)

**GET /api/compare/players**
- Query params: `player1Id`, `player2Id`
- Returns: Side-by-side player comparison (stats, ratings, splits)

**GET /api/rpi**
- Query params: `season`, `limit`
- Returns: Current RPI rankings

**POST /api/agents**
- Body: `{ agentName?: string }` (omit to run full pipeline)
- Returns: AgentRun record

**GET /api/agents/status**
- Returns: Latest run status for each agent

---

## Phase 4: Frontend / UI (Build Fourth)

### Design Direction

Use a **clean, data-forward sports analytics aesthetic**:
- Dark theme primary (deep navy #0a1628) with bright accent colors
- Data-dense layouts with clear visual hierarchy
- Bold typography for ratings (Pitching+/Hitting+ displayed prominently)
- Color-coded performance indicators (green = above avg, red = below avg, gold = elite)
- Rating scale: <80 = red, 80-95 = orange, 95-105 = white/neutral, 105-120 = green, >120 = gold
- Clean card-based layouts for player profiles
- Responsive — works on desktop and tablet

### Page Specifications

**Home Page** (`/`):
- Quick overview of target team's upcoming games with win probabilities
- Top-rated pitchers and hitters leaderboard (by Pitching+ and Hitting+)
- Recent agent run status
- Quick search for players/teams

**Player Dashboard** (`/players/[playerId]`):
- Hero section with player name, photo placeholder, team, position, class year
- Large Pitching+ or Hitting+ gauge display (based on player type)
- Stuff+ and Location+ placeholder badges (grayed out, "Coming Soon")
- Year-by-year stat table with season filter dropdown
- Career splits section (by season, home/away, conference/non-conference)
- Performance trend charts (rating over seasons)
- Upcoming matchups section (if applicable)

**Pitcher Dashboard** (`/pitchers/[pitcherId]`):
- Same as player dashboard but pitcher-focused layout
- K%, BB%, Strike%, WHIP, ERA prominently displayed
- Pitching+ gauge with component breakdown (shows contribution of each stat to the rating)
- Hitter matchup history (if available)

**Hitter Dashboard** (`/hitters/[hitterId]`):
- Same as player dashboard but hitter-focused layout
- BA, OBP, SLG, OPS prominently displayed
- Hitting+ gauge with component breakdown
- Pitcher matchup history (if available)

**Team Page** (`/teams/[teamId]`):
- Team overview: name, conference, record, RPI rank
- Aggregate Team Pitching+ and Team Hitting+ displays
- Full roster table sortable by Pitching+/Hitting+
- Schedule with projected outcomes and win probabilities
- Team strength breakdown visualization

**Team Comparison** (`/compare/teams`):
- Select two teams from dropdowns
- Side-by-side comparison: Team Pitching+, Team Hitting+, RPI, record
- Radar chart comparing team strengths
- Roster depth comparison
- Head-to-head projection if they play each other

**Player Comparison** (`/compare/players`):
- Select two players from searchable dropdowns
- Side-by-side stat comparison table
- Rating gauge comparison
- Overlay trend charts
- Matchup advantage analysis

**Matchup Projections** (`/matchups`):
- List of upcoming games with projected outcomes
- Click into game for detailed pitcher-vs-hitter matchup cards
- Each matchup card shows: pitcher Pitching+ vs hitter Hitting+, projected BA, K%, advantage

**Schedule & Projections** (`/schedule`):
- Calendar or list view of target team's full season
- Each game shows: opponent, RPI, projected win probability, expected score
- Season totals: projected record, strength of schedule

### Session Playback and Filtering

The "Session Playback" feature allows users to:
- Filter player performance data by specific date ranges, series, or sessions
- View game-by-game or series-by-series stat progressions
- Animate or step through a player's performance across a selected time period
- Implementation: Date range picker + sequential game log data rendered as a timeline/stepper component

---

## Phase 5: Docker & Deployment (Build Fifth)

### Dockerfile (Next.js App)

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### Dockerfile.agents (Agent Workers)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production
COPY . .
RUN npx prisma generate
RUN npx tsc --project tsconfig.agents.json
CMD ["node", "dist/agents/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/college_baseball
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  agents:
    build:
      context: .
      dockerfile: Dockerfile.agents
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/college_baseball
      - REDIS_URL=redis://redis:6379
      - AGENT_SCRAPE_DELAY_MS=2000
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: college_baseball
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

### Vercel Deployment

For Vercel deployment:
- The Next.js app deploys directly to Vercel
- Use **Neon** (neon.tech) for PostgreSQL — Vercel has native integration
- Use **Upstash** for Redis — serverless Redis with Vercel integration
- Agent workers run as Vercel Cron Jobs (via `vercel.json`) or as a separate service on Railway/Render

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/agents",
      "schedule": "0 10 * * *"
    }
  ]
}
```

Update `next.config.mjs`:
```javascript
const nextConfig = {
  output: 'standalone',  // Required for Docker
};
```

---

## Phase 6: Future Enhancements (Document Now, Build Later)

### TrackMan Integration (When API Access Available)
- Ingest pitch-level data: velocity, spin rate, movement, release point, location
- Build **Stuff+** model: grade pitch quality independent of outcome
- Build **Location+** model: grade pitch command and zone accuracy
- Update **Pitching+** to incorporate Stuff+ and Location+ as weighted components
- Add pitch-level visualizations: heat maps, movement plots, tunnel charts

### Additional Future Features
- User authentication and saved comparisons
- Real-time game scoring integration
- Conference tournament bracket projections
- Draft stock / prospect evaluations
- Historical season replay and trend analysis
- Mobile-native app (React Native)
- Push notifications for game projections

---

## Build Order Summary

Execute in this order when using Claude Code:

1. **Initialize project** — Next.js, dependencies, Prisma schema, run migrations
2. **Build Agent 1** (Data Collection) — Get real data flowing in
3. **Build Agent 2** (Player Summary) — Clean and structure the data
4. **Build Agent 3** (RPI) — Get team rankings
5. **Build Agent 6** (Rating Engine) — Calculate Pitching+ and Hitting+
6. **Build Agent 4** (Schedule + Projection) — Generate game projections
7. **Build Agent 5** (Matchup Modeling) — Pitcher vs hitter projections
8. **Build API routes** — Expose all data to frontend
9. **Build layout and navigation** — App shell, sidebar, header
10. **Build home page** — Overview dashboard
11. **Build team pages** — Team directory and detail views
12. **Build player dashboards** — Pitcher and hitter dashboards with ratings
13. **Build comparison pages** — Team vs team, player vs player
14. **Build matchup and schedule pages** — Game projections
15. **Build placeholder components** — Stuff+ and Location+ coming soon modules
16. **Docker setup** — Dockerfiles and docker-compose
17. **Vercel deployment config** — vercel.json, env vars, cron setup
18. **Testing and polish** — End-to-end testing, UI refinements

---

## Key Constraints and Rules

- **100 = D1 Average**: All Pitching+ and Hitting+ ratings MUST normalize to this baseline
- **No TrackMan yet**: Stuff+ and Location+ are placeholder-only — display "Coming Soon" in UI
- **Respect scraping ethics**: 2-second delays between requests, respect robots.txt, don't hammer servers
- **Data freshness**: Agent pipeline should be runnable on-demand and on a daily cron
- **Stateless agents**: Each agent run is idempotent — can be re-run safely
- **TypeScript everywhere**: No JavaScript files — full TypeScript across frontend, backend, and agents
- **Target school configurable**: The app should work for any D1 school by changing the TARGET_SCHOOL env var and running the data collection agent
