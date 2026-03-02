---
name: opendota-reference
description: |
  Reference guide for exploring OpenDota's web and core repositories to understand how Dota 2 match data is calculated, visualized, and processed. Use when:
  (1) Finding how OpenDota calculates player positions/roles (pos1-pos5, lane detection)
  (2) Understanding how specific graphs or visualizations are built (gold/xp graphs, heatmaps, teamfight maps)
  (3) Looking up match analysis algorithms (benchmarks, scenarios, stats computation)
  (4) Finding data structures and API response shapes for match/player data
  (5) Understanding lane detection, roaming detection, or role inference logic
  Trigger phrases: "how does opendota calculate", "where is the code for", "find opendota implementation of", "what data is used for"
---

# OpenDota Reference Skill

Find and understand implementations in OpenDota's `web` and `core` repositories.

## Repository Overview

| Repository | Tech Stack | Purpose |
|------------|------------|---------|
| [odota/web](https://github.com/odota/web) | React 17 + Redux + Recharts + Vite | Frontend UI, visualizations, data display |
| [odota/core](https://github.com/odota/core) | TypeScript/Node.js + PostgreSQL + Redis | Backend, parsing, calculations, APIs |

## Quick Reference

### Position/Lane Calculation
See [references/positions.md](references/positions.md) - Lane detection algorithms, coordinate mapping, role inference

### Graphs and Visualizations
See [references/visualizations.md](references/visualizations.md) - Component paths, data sources, rendering logic

### Stats and Benchmarks
See [references/stats.md](references/stats.md) - GPM/XPM calculations, benchmarks, scenarios

## Search Strategies

### Finding Calculation Logic (core repo)
1. Clone or search `github.com/odota/core`
2. Key directory: `svc/util/` - all computation functions
3. Key files:
   - `compute.ts` - Stats, lane detection, derived values
   - `laneMappings.ts` - 128x128 grid coordinate-to-lane mapping
   - `benchmarksUtil.ts` - Performance benchmarks
   - `scenariosUtil.ts` - Game scenarios (first blood, comeback, etc.)
   - `insert.ts` - Where calculations are invoked during match insertion

### Finding Graph Implementations (web repo)
1. Clone or search `github.com/odota/web`
2. Key directories:
   - `src/components/Visualizations/` - Reusable graph components
   - `src/components/Match/` - Match-specific displays
   - `src/components/Player/Pages/` - Player analysis pages
3. `src/utility.tsx` - Coordinate transformations, data unpacking

### Finding Data Structures
1. API responses: `core/svc/api/*.ts` (e.g., `MatchObjectResponse.ts`)
2. Proto files: `core/proto/dota_gcmessages_*.proto`
3. Frontend types: `web/src/types/`

## Common Questions

### "How does OpenDota calculate player position (pos1-pos5)?"
**Answer:** OpenDota does NOT calculate pos1-pos5 directly. It uses **lane detection** only.
- File: `core/svc/util/compute.ts#getLaneFromPosData()`
- Uses: `laneMappings.ts` - 128x128 grid mapping coordinates to lanes
- Output: Lane roles (1=safelane, 2=mid, 3=offlane, 4=jungle)
- See [references/positions.md](references/positions.md) for full details

### "What data drives the gold/xp advantage graph?"
**Answer:** `radiant_gold_adv` and `radiant_xp_adv` arrays from match data
- Component: `web/src/components/Visualizations/Graph/MatchGraph.tsx`
- Data: Arrays of per-minute gold/xp differences
- See [references/visualizations.md](references/visualizations.md)

### "How are heatmaps generated?"
**Answer:** Position data unpacked and rendered via heatmap.js
- Component: `web/src/components/Heatmap/Heatmap.tsx`
- Utility: `utility.tsx#gameCoordToUV()` converts 128x128 game coords to UV
- Library: `@mars3d/heatmap.js`

### "How does lane detection work?"
**Answer:** Coordinate-based mode calculation
- Uses `lane_pos` hash from replay parsing (position samples during laning phase)
- Maps each coordinate to a lane via `laneMappings.ts` grid
- Finds mode (most frequent lane) to determine player's lane
- Roaming if <45% time in any single lane
