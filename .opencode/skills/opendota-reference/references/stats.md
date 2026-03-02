# Stats and Benchmarks

## Overview

OpenDota calculates various derived statistics during match insertion. Most calculations are in `core/svc/util/compute.ts`.

## Key Files

| File | Location | Purpose |
|------|----------|---------|
| `compute.ts` | `core/svc/util/compute.ts` | Main calculation functions |
| `benchmarksUtil.ts` | `core/svc/util/benchmarksUtil.ts` | Benchmark percentile calculations |
| `scenariosUtil.ts` | `core/svc/util/scenariosUtil.ts` | Game scenario detection |
| `insert.ts` | `core/svc/util/insert.ts` | Where stats are computed and stored |

## Basic Stats

Most basic stats come directly from replay parsing, not calculation:

| Stat | Source | Notes |
|------|--------|-------|
| `kills` | Replay | Direct count |
| `deaths` | Replay | Direct count |
| `assists` | Replay | Direct count |
| `gold_per_min` | Replay | Calculated by game |
| `xp_per_min` | Replay | Calculated by game |
| `last_hits` | Replay | Direct count |
| `denies` | Replay | Direct count |
| `hero_damage` | Replay | Sum of all damage |
| `tower_damage` | Replay | Sum of tower damage |
| `hero_healing` | Replay | Sum of healing |

## Derived Stats

### KDA Ratio
```typescript
kda = (kills + assists) / Math.max(1, deaths)
```

### Lane Efficiency
Not directly calculated. Can be derived from:
- `lh_t[10]` - Last hits at 10 minutes
- Compare to benchmarks for the hero

### Gold/XP at Time T
From time-series arrays:
```json
{
  "gold_t": [0, 200, 450, 700, ...],
  "xp_t": [0, 150, 400, 650, ...]
}
```
Index = minute number.

## Benchmarks

### How Benchmarks Work

1. **Collection**: Stats collected across all matches for each hero
2. **Percentile Calculation**: Player's stat compared to distribution
3. **Storage**: Percentile stored with match data

### Benchmark Metrics

| Metric | Description |
|--------|-------------|
| `gold_per_min` | GPM percentile for that hero |
| `xp_per_min` | XPM percentile |
| `kills_per_min` | Kills/min percentile |
| `last_hits_per_min` | LH/min percentile |
| `hero_damage_per_min` | Damage/min percentile |
| `hero_healing_per_min` | Healing/min percentile |
| `tower_damage` | Total tower damage percentile |

### Benchmark Calculation

Location: `core/svc/util/benchmarksUtil.ts`

```typescript
// Pseudocode
function calculateBenchmark(heroId, metric, value) {
  const distribution = getBenchmarkDistribution(heroId, metric)
  const percentile = findPercentile(distribution, value)
  return {
    raw: value,
    pct: percentile
  }
}
```

## Game Scenarios

Location: `core/svc/util/scenariosUtil.ts`

### Detected Scenarios

| Scenario | Detection Logic |
|----------|-----------------|
| First Blood | First kill event in match |
| Stomp | Win with gold advantage > threshold throughout |
| Comeback | Win after being behind by > threshold |
| Close Game | Gold lead never exceeds threshold |

### Scenario Data Structure
```json
{
  "is_stomp": true,
  "is_comeback": false,
  "first_blood_time": 145,
  "first_blood_player": 3
}
```

## Match Summary Stats

### Team-Level Stats
```json
{
  "radiant_score": 45,
  "dire_score": 32,
  "radiant_gold_adv": [...],
  "radiant_xp_adv": [...]
}
```

### Duration-Based Metrics
```typescript
// Actions per minute
actions_per_min = total_actions / (duration / 60)

// Damage per minute  
damage_per_min = hero_damage / (duration / 60)
```

## How to Search for Stat Logic

```bash
# In core repo
# Find calculation functions
grep -r "function\|const.*=" svc/util/compute.ts

# Find benchmark logic
grep -r "benchmark\|percentile" svc/

# Find scenario detection
grep -r "stomp\|comeback\|first_blood" svc/

# Find where stats are inserted
grep -r "INSERT\|insert" svc/util/insert.ts
```

## API Response Shapes

### Match Object (abbreviated)
```typescript
interface MatchObject {
  match_id: number
  duration: number
  radiant_win: boolean
  radiant_score: number
  dire_score: number
  radiant_gold_adv: number[]
  radiant_xp_adv: number[]
  players: PlayerObject[]
  teamfights: Teamfight[]
}
```

### Player Object (abbreviated)
```typescript
interface PlayerObject {
  account_id: number
  hero_id: number
  kills: number
  deaths: number
  assists: number
  gold_per_min: number
  xp_per_min: number
  last_hits: number
  denies: number
  hero_damage: number
  tower_damage: number
  hero_healing: number
  gold_t: number[]
  xp_t: number[]
  lh_t: number[]
  lane_role: number  // From lane detection
  benchmarks: Record<string, { raw: number, pct: number }>
}
```

Full response shapes: `core/svc/api/MatchObjectResponse.ts`, `PlayerObjectResponse.ts`
