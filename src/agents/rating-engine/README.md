# Rating Engine Algorithms

The rating engine calculates two proprietary metrics — **Pitching+** and **Hitting+** — that evaluate college baseball players relative to the Division I average. A score of **100 = D1 Average**. Higher is always better.

## Pitching+

A weighted composite of six pitching components, each measured against D1 average benchmarks.

### Components & Weights

| Component | Weight | D1 Average | Direction |
|-----------|--------|------------|-----------|
| K% (Strikeout Rate) | 25% | 22% | Higher is better |
| BB% (Walk Rate) | 20% | 10% | Lower is better |
| Opp BA (Opponent Batting Average) | 20% | .270 | Lower is better |
| Strike% | 15% | 62% | Higher is better |
| WHIP | 10% | 1.45 | Lower is better |
| K/BB Ratio | 10% | 2.0 | Higher is better |

### Component Score Formula

For **higher-is-better** stats (K%, Strike%, K/BB):

```
component_score = 100 * (player_value / d1_average)
```

For **lower-is-better** stats (BB%, Opp BA, WHIP):

```
component_score = 100 * (d1_average / player_value)
```

A pitcher with exactly D1-average stats in every category scores 100 in each component.

### Composite Calculation

```
raw_pitching+ = (K%_score * 0.25) + (BB%_score * 0.20) + (Opp_BA_score * 0.20)
              + (Strike%_score * 0.15) + (WHIP_score * 0.10) + (K/BB_score * 0.10)
```

Weights are re-normalized if a component is missing (e.g., no strike% data):

```
adjusted_weight_i = weight_i / sum(available_weights)
```

### Minimum Qualification

Pitchers must have at least **5 innings pitched** in the target season to receive a Pitching+ rating.

---

## Hitting+

A weighted composite of seven hitting components, each measured against D1 average benchmarks.

### Components & Weights

| Component | Weight | D1 Average | Direction |
|-----------|--------|------------|-----------|
| OBP (On-Base Percentage) | 20% | .350 | Higher is better |
| SLG (Slugging Percentage) | 20% | .420 | Higher is better |
| BA (Batting Average) | 15% | .270 | Higher is better |
| OPS (On-Base Plus Slugging) | 15% | .770 | Higher is better |
| K Rate | 10% | 20% | Lower is better |
| BB Rate | 10% | 10% | Higher is better |
| ISO (Isolated Power = SLG - BA) | 10% | .150 | Higher is better |

### Component Score Formula

Same formulas as Pitching+ — ratio to D1 average, inverted for lower-is-better stats.

### Composite Calculation

```
raw_hitting+ = (OBP_score * 0.20) + (SLG_score * 0.20) + (BA_score * 0.15)
             + (OPS_score * 0.15) + (K%_score * 0.10) + (BB%_score * 0.10)
             + (ISO_score * 0.10)
```

### Minimum Qualification

Hitters must have at least **10 at-bats** in the target season to receive a Hitting+ rating.

---

## Population Normalization

After calculating raw scores for all qualified players, both Pitching+ and Hitting+ are **normalized so the population average equals exactly 100**.

```
scale_factor = 100 / mean(all_raw_scores)
normalized_score = raw_score * scale_factor
```

This ensures the ratings are properly centered regardless of the quality of the input data. A score of 100 always represents the average player in the dataset.

---

## Team Composite Ratings

Team-level ratings are **playing-time-weighted averages** of individual player ratings.

**Team Pitching+:**

```
Team P+ = sum(pitcher_P+ * IP) / sum(IP)
```

Includes all pitchers with a Pitching+ rating and at least 1 inning pitched in the season.

**Team Hitting+:**

```
Team H+ = sum(hitter_H+ * AB) / sum(AB)
```

Includes all hitters with a Hitting+ rating and at least 1 at-bat in the season.

This weighting ensures high-volume contributors (starters, everyday players) influence the team rating more than low-usage players.

---

## Rating Scale

| Rating | Range | Color |
|--------|-------|-------|
| Elite | 120+ | Gold |
| Above Average | 105-119 | Green |
| Average | 95-104 | White |
| Below Average | 80-94 | Orange |
| Poor | <80 | Red |

---

## Pipeline

The rating engine runs as an agent with three sequential steps:

1. **Calculate Pitching+** for all qualified pitchers in the target season
2. **Calculate Hitting+** for all qualified hitters in the target season
3. **Calculate team composites** for all teams using playing-time weights

The agent is idempotent — safe to re-run at any time. Each run overwrites previous ratings with fresh calculations.

## Source Files

| File | Purpose |
|------|---------|
| `constants.ts` | D1 averages, component weights, rating thresholds |
| `normalization.ts` | Component scoring, weighted composites, population normalization |
| `pitching-plus.ts` | Pitching+ calculation from season stats |
| `hitting-plus.ts` | Hitting+ calculation from season stats |
| `team-composite.ts` | IP-weighted and AB-weighted team averages |
| `agent.ts` | Orchestrates the full rating pipeline |
