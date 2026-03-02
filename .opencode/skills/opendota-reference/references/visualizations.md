# Graphs and Visualizations

## Overview

OpenDota web uses React + Recharts for most graphs, with heatmap.js for position heatmaps.

## Key Files

| Component | File Path | Purpose |
|-----------|-----------|---------|
| MatchGraph | `src/components/Visualizations/Graph/MatchGraph.tsx` | Gold/XP advantage over time |
| Heatmap | `src/components/Heatmap/Heatmap.tsx` | Position heatmaps |
| DotaMap | `src/components/DotaMap/DotaMap.tsx` | Base map component |
| TeamfightMap | `src/components/Match/TeamfightMap/TeamfightMap.tsx` | Teamfight positions |
| BenchmarkGraph | `src/components/Hero/BenchmarkGraphs.tsx` | Hero performance benchmarks |
| Wardmap | `src/components/Player/Pages/Wardmap/Wardmap.tsx` | Ward placement heatmaps |

## Coordinate System

OpenDota uses a 128x128 game coordinate system:
- Origin: (0, 0) at bottom-left
- Center: (64, 64) approximately
- Max: (127, 127) at top-right

### Utility Functions

Location: `src/utility.tsx`

```typescript
// Convert game coordinates to UV (0-1 range)
function gameCoordToUV(x, y) {
  return {
    u: x / 127,
    v: 1 - (y / 127)  // Flip Y for screen coords
  }
}

// Unpack position data from compressed format
function unpackPositionData(data) {
  // Converts { "x,y": count } to array of positions
}

// Calculate distance between positions
function calculateDistance(pos1, pos2) {
  return Math.sqrt((pos2.x - pos1.x)**2 + (pos2.y - pos1.y)**2)
}
```

## Gold/XP Advantage Graph

### Component
`src/components/Visualizations/Graph/MatchGraph.tsx`

### Data Source
Match API returns arrays:
```json
{
  "radiant_gold_adv": [0, 150, -200, 500, ...],
  "radiant_xp_adv": [0, 100, -50, 300, ...]
}
```
- Each element = advantage at that minute
- Positive = Radiant ahead, Negative = Dire ahead

### Rendering
Uses Recharts `<LineChart>` with custom styling for positive/negative areas.

## Heatmaps

### Component
`src/components/Heatmap/Heatmap.tsx`

### Library
`@mars3d/heatmap.js`

### Data Source
Position data in format:
```json
{
  "lane_pos": {
    "84,92": 5,
    "85,91": 3,
    "86,90": 2
  }
}
```
Keys are "x,y" coordinates, values are sample counts.

### How It Works
1. Parse lane_pos keys into coordinate arrays
2. Convert game coords to UV via `gameCoordToUV()`
3. Pass to heatmap.js with intensity = count value
4. Overlay on DotaMap component

## Teamfight Visualization

### Component
`src/components/Match/TeamfightMap/TeamfightMap.tsx`

### Data Source
Match API `teamfights` array:
```json
{
  "teamfights": [
    {
      "start": 600,
      "end": 620,
      "deaths_pos": {"72,85": 2, "73,84": 1},
      "players": [...]
    }
  ]
}
```

### Rendering
1. Calculate average position from deaths_pos
2. Render death markers on DotaMap
3. Show player icons at their death locations

## Performance Benchmarks

### Component
`src/components/Hero/BenchmarkGraphs.tsx`, `BenchmarkGraph.tsx`

### Data Source
Benchmark API returns percentile distributions:
```json
{
  "gold_per_min": {
    "raw": 450.5,
    "pct": 0.65
  },
  "xp_per_min": {...},
  "kills_per_min": {...}
}
```

### Rendering
Spider/radar chart or bar chart showing where player falls in distribution.

## Laning Graph

### Component
`src/components/Match/Laning/Graph.tsx`

### Data Source
Player objects contain:
```json
{
  "gold_t": [0, 200, 450, 700, ...],
  "xp_t": [0, 150, 400, 650, ...],
  "lh_t": [0, 3, 8, 15, ...]
}
```
- Arrays indexed by minute
- `_t` suffix = time-series data

## How to Search for Visualization Code

```bash
# In web repo
# Find all visualization components
ls src/components/Visualizations/

# Find graph-related components
grep -r "LineChart\|BarChart\|RadarChart" src/

# Find heatmap usage
grep -r "heatmap" src/

# Find DotaMap usage
grep -r "DotaMap" src/
```
