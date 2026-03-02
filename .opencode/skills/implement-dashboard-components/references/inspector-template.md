# Inspector Template

Reference for building inspector detail panels that show drill-down content when users click widget actions.

## File Location

```
src/app/_components/analysis-v2/inspector/{PanelName}Detail.tsx
```

Export from `src/app/_components/analysis-v2/inspector/index.ts`.

## Inspector Detail Boilerplate

```tsx
"use client";

import { type RouterOutputs } from "@/trpc/react";

type Analysis = NonNullable<RouterOutputs["match"]["getAnalysis"]>;
type Performance = NonNullable<RouterOutputs["match"]["getPerformance"]>;
type Gameflow = NonNullable<RouterOutputs["match"]["getGameflow"]>;

interface MyDetailProps {
  analysis: Analysis;
  performance: Performance;
  gameflow: Gameflow;
  onPanelSelect?: (panel: string) => void;
}

export function MyDetail({
  analysis,
  performance,
  gameflow,
  onPanelSelect,
}: MyDetailProps) {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-[var(--dash-text)]">
        Detail Title
      </h3>

      <div className="rounded-lg bg-[var(--dash-l1)] p-4">
        <p className="text-[var(--dash-text-muted)]">
          Detail content here. Use dashboard CSS tokens for consistent styling.
        </p>
      </div>

      {/* Numeric values */}
      <div className="flex gap-4">
        <div>
          <span className="text-[var(--dash-text-dim)] text-sm">Gold</span>
          <span className="dash-num block text-lg">12,345</span>
        </div>
        <div>
          <span className="text-[var(--dash-text-dim)] text-sm">XP</span>
          <span className="dash-num block text-lg">23,456</span>
        </div>
      </div>
    </div>
  );
}
```

---

## Existing Inspector Panels (22+)

| Panel Name              | Component                | Triggered By              |
|-------------------------|--------------------------|---------------------------|
| mvp                     | MvpDetail                | MVP widget click          |
| lanes                   | LaneOverviewDetail       | Lane overview widget      |
| lane-matchup            | LaneMatchupDetail        | Lane matchup widget       |
| teamfight               | TeamfightDetail          | Teamfight widget          |
| fight-initiation        | FightInitiationDetail    | Fight initiation widget   |
| hero:{heroId}           | PlayerDetail             | Hero/player click         |
| moments                 | MilestoneDetail          | Key moments widget        |
| building-trade          | BuildingTradeDetail      | Building trade widget     |
| objectives-timeline     | ObjectivesTimelineDetail | Objectives widget         |
| tempo-rating            | TempoRatingDetail        | Tempo rating widget       |
| draft-counters          | DraftCounterPicksDetail  | Draft counters widget     |
| draft-weaknesses        | DraftWeaknessesDetail    | Draft weaknesses widget   |
| draft-synergy           | DraftSynergyDetail       | Draft synergy widget      |
| itemization             | ItemizationDetail        | Itemization widget        |
| counter-items           | CounterItemDetail        | Counter items widget      |
| active-items            | ActiveItemDetail         | Active items widget       |
| gold-sources            | GoldSourceDetail         | Gold sources widget       |
| purchase-order          | PurchaseOrderDetail      | Purchase timeline widget  |
| buybacks                | BuybackDetail            | Buyback widget            |
| low-performers          | LowPerformersDetail      | Low performers widget     |
| fight-timings           | FightTimingsDetail       | Fight timings widget      |
| hero-power-spikes       | HeroPowerSpikesDetail    | Power spike widget        |
| power-timing-stats      | PowerTimingStatsDetail   | Power timing widget       |

---

## Panel Routing

`InspectorContent.tsx` routes panels by splitting the panel string:

```typescript
const basePanel = panel.split(":")[0];  // e.g., "hero" from "hero:123"
const heroId = panel.split(":")[1];     // e.g., "123" from "hero:123"
```

Simple panels use just the name (e.g., `"mvp"`, `"teamfight"`).
Hero-specific panels use colon syntax (e.g., `"hero:42"`).

---

## Connecting Widget → Inspector

### Simple panel
```tsx
// In widget:
<BillboardWidget
  title="MVP"
  value={mvp.name}
  onClick={() => onPanelSelect("mvp")}
/>
```

### Parameterized panel
```tsx
// In widget (with hero ID):
<div onClick={() => onPanelSelect(`hero:${player.heroId}`)}>
  {player.name}
</div>
```

---

## Data Access

Inspector details receive `analysis`, `performance`, and `gameflow` props from `InspectorContent.tsx`. Use `RouterOutputs` types:

```tsx
import { type RouterOutputs } from "@/trpc/react";

type Analysis = NonNullable<RouterOutputs["match"]["getAnalysis"]>;

// Access nested data:
const mvpData = analysis.mvp;
const teamfights = analysis.teamfights;
const players = analysis.playerStats;
```

---

## InspectorAIFooter

A shared footer component that shows AI-generated insights. Already included in the inspector layout — no need to add manually to individual details.

---

## Adding a New Inspector Panel (Full Checklist)

1. **Create detail component**
   ```
   src/app/_components/analysis-v2/inspector/MyDetail.tsx
   ```

2. **Export from barrel**
   ```typescript
   // src/app/_components/analysis-v2/inspector/index.ts
   export { MyDetail } from "./MyDetail";
   ```

3. **Add case to InspectorContent.tsx**
   ```typescript
   // In InspectorContent.tsx switch/map:
   case "my-panel":
     return <MyDetail analysis={analysis} performance={performance} gameflow={gameflow} />;
   ```

4. **Add title to getInspectorTitle()**
   ```typescript
   // In MatchDashboard.tsx:
   case "my-panel":
     return "My Panel Title";
   ```

5. **Connect widget trigger**
   ```tsx
   // In the widget that opens this panel:
   onClick={() => onPanelSelect("my-panel")}
   ```

---

## Styling Conventions

- Use `space-y-4 p-4` for panel content spacing
- Use `bg-[var(--dash-l1)]` for card backgrounds within the panel
- Use `bg-[var(--dash-l2)]` for nested elevated surfaces
- Use `text-[var(--dash-text)]` for primary text
- Use `text-[var(--dash-text-muted)]` for secondary text
- Use `text-[var(--dash-text-dim)]` for tertiary/label text
- Use `dash-num` class for numeric values
- Use `!text-green-400` / `!text-red-400` with `dash-num` for colored numbers
- Use `rounded-lg` for card borders
