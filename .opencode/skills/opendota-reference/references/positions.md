# Position and Lane Detection

## Overview

OpenDota uses **coordinate-based lane detection**, NOT traditional pos1-pos5 role detection. There is no ML model or hero meta analysis for role inference.

## Key Files

| File | Location | Purpose |
|------|----------|---------|
| `compute.ts` | `core/svc/util/compute.ts` | `getLaneFromPosData()` function |
| `laneMappings.ts` | `core/svc/util/laneMappings.ts` | 128x128 coordinate grid |
| `insert.ts` | `core/svc/util/insert.ts` | Where lane detection is called |

## Lane Detection Algorithm

### Function: `getLaneFromPosData(lanePos, isRadiant)`

Location: `core/svc/util/compute.ts` lines ~307-358

```typescript
// Pseudocode
function getLaneFromPosData(lanePos, isRadiant) {
  const validPositions = []
  
  // Iterate through lane_pos hash (position samples during laning)
  for (const [key, count] of Object.entries(lanePos)) {
    const [x, y] = key.split(',').map(Number)
    const lane = laneMappings[y][x]  // 128x128 grid lookup
    validPositions.push(...Array(count).fill(lane))
  }
  
  // Find mode (most common lane)
  const mode = findMode(validPositions)
  
  // Check for roaming (spread across lanes)
  const isRoaming = validPositions.filter(l => l === mode).length / validPositions.length < 0.45
  
  // Map lane to lane_role
  const laneRoles = {
    1: isRadiant ? 1 : 3,  // Bot: Radiant safe, Dire off
    2: 2,                   // Mid
    3: isRadiant ? 3 : 1,  // Top: Radiant off, Dire safe
    4: 4,                   // Radiant jungle
    5: 4                    // Dire jungle (both map to jungle role)
  }
  
  return isRoaming ? 0 : laneRoles[mode]
}
```

### Lane Mapping Grid

`laneMappings.ts` contains a 128x128 grid where each cell maps to a lane:
- `1` = Bot lane
- `2` = Mid lane
- `3` = Top lane
- `4` = Radiant jungle
- `5` = Dire jungle

### Lane Role Output

| Lane Role | Meaning | Radiant | Dire |
|-----------|---------|---------|------|
| 0 | Roaming | <45% time in any lane | <45% time in any lane |
| 1 | Safelane | Bot | Top |
| 2 | Mid | Mid | Mid |
| 3 | Offlane | Top | Bot |
| 4 | Jungle | Radiant/Dire jungle | Radiant/Dire jungle |

## What OpenDota Does NOT Calculate

- **Position 1-5 roles** (carry, mid, offlane, soft support, hard support)
- **Farm priority** - No analysis of gold distribution
- **Hero meta roles** - No lookup of typical hero positions
- **Draft-based role inference**

## Steam/Valve Position Data

Valve's proto files have role definitions but OpenDota doesn't use them:

```proto
// From dota_gcmessages_*.proto
enum DOTA_LobbyPosition {
  k_eSafelane = 0;
  k_eMidlane = 1;
  k_eOfflane = 2;
  k_eSupport = 3;
  k_eHardSupport = 4;
}
```

OpenDota's `lane_role` is purely coordinate-based from replay parsing.

## Fantasy Roles (Pro Matches Only)

For pro matches, there's a fantasy role in the database:
- `core` = 1
- `support` = 2

This is from tournament data, not calculated.

## How to Search for Position Logic

```bash
# In core repo
grep -r "getLaneFromPosData" svc/
grep -r "lane_role" svc/
grep -r "laneMappings" svc/

# Find where it's called during match insertion
# File: svc/util/insert.ts, lines ~180-185
```
