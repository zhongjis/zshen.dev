# Tab Template

Reference for building tab content components in the dashboard.

## File Locations

- **Content**: `src/app/_components/analysis-v2/tabs/{Domain}TabContent.tsx`
- **Re-export**: `src/components/dashboard/tabs/{Domain}Tab.tsx`
- **Export barrel**: Both directories have `index.ts`

## Tab Content Boilerplate

```tsx
"use client";

import { type RouterOutputs } from "@/trpc/react";
import { WidgetCanvas } from "@/components/dashboard/WidgetCanvas";
import { MyWidget } from "../widgets/MyWidget";
import { AnotherWidget } from "../widgets/AnotherWidget";

interface MyTabContentProps {
  matchData: NonNullable<RouterOutputs["match"]["getMatchData"]>;
  analysis: NonNullable<RouterOutputs["match"]["getAnalysis"]>;
  performance: NonNullable<RouterOutputs["match"]["getPerformance"]>;
  gameflow: NonNullable<RouterOutputs["match"]["getGameflow"]>;
  onPanelSelect: (panel: string) => void;
}

export function MyTabContent({
  matchData,
  analysis,
  performance,
  gameflow,
  onPanelSelect,
}: MyTabContentProps) {
  return (
    <WidgetCanvas>
      <MyWidget
        data={analysis.someField}
        onPanelSelect={onPanelSelect}
      />
      <AnotherWidget
        data={performance.otherField}
      />
    </WidgetCanvas>
  );
}
```

---

## Existing Tabs

| Tab           | Content File                  | Description                          |
|---------------|-------------------------------|--------------------------------------|
| overview      | OverviewTabContent.tsx        | Match summary, MVP, key stats        |
| combat        | CombatTabContent.tsx          | Kill matrix, teamfights, fight stats |
| economy       | EconomyTabContent.tsx         | Gold/XP graphs, net worth, sources   |
| objectives    | ObjectivesTabContent.tsx      | Towers, Roshan, building trades      |
| items         | ItemsTabContent.tsx           | Itemization, counter items, actives  |
| power         | PowerTabContent.tsx           | Power spikes, hero curves, timing    |
| laning        | LaningTabContent.tsx          | Lane matchups, early game analysis   |
| draft         | DraftTabContent.tsx           | Draft analysis, synergies, counters  |
| map-control   | MapControlTabContent.tsx      | Wards, map control visualization     |

---

## Creating the Re-export

After creating the tab content, add a re-export in the dashboard library:

```tsx
// src/components/dashboard/tabs/MyTab.tsx
export { MyTabContent } from "@/app/_components/analysis-v2/tabs/MyTabContent";
```

Then add to the barrel export:

```tsx
// src/components/dashboard/tabs/index.ts
export { MyTabContent } from "./MyTab";
```

---

## Data Access Patterns

### Tab receives all data via props
Tabs receive the full `tabContentProps` from `MatchDashboard`. Destructure only what you need:

```tsx
export function EconomyTabContent({
  analysis,
  gameflow,
  onPanelSelect,
}: MyTabContentProps) {
  // Only use analysis and gameflow for this tab
  const goldData = gameflow.goldAdvantage;
  const netWorth = analysis.economy.netWorth;
  // ...
}
```

### Type derivation
Always derive types from `RouterOutputs`:

```tsx
import { type RouterOutputs } from "@/trpc/react";

type Analysis = NonNullable<RouterOutputs["match"]["getAnalysis"]>;
type PlayerStats = Analysis["playerStats"][number];
```

**Never** import Prisma types directly.

---

## ScopeProvider (Optional Pattern)

Only use when your tab needs team/player filtering. Currently used by `OverviewTabContent` and `EconomyTabContent`.

```tsx
"use client";

import { ScopeProvider } from "@/components/dashboard/context/ScopeContext";
import { WidgetCanvas } from "@/components/dashboard/WidgetCanvas";

export function MyFilterableTabContent({ matchData, analysis, onPanelSelect }: Props) {
  return (
    <ScopeProvider matchData={matchData}>
      <WidgetCanvas>
        {/* Widgets here can access scope context for team/player filtering */}
      </WidgetCanvas>
    </ScopeProvider>
  );
}
```

**Do NOT wrap every tab with ScopeProvider.** Only add it when the tab's widgets need team/player scope filtering.

---

## useDashboardUrl Hook

Access URL state for deep-linking and compare mode:

```tsx
import { useDashboardUrl } from "@/hooks/useDashboardUrl";

export function MyTabContent({ matchData, onPanelSelect }: Props) {
  const { compare, team, player } = useDashboardUrl();

  // compare: string | null — player slot for compare mode
  // team: "radiant" | "dire" | null
  // player: string | null — player slot
  // ...
}
```

---

## Widget Layout in WidgetCanvas

`WidgetCanvas` is a 24-column responsive grid. Widgets flow automatically. Control layout through widget `size` props:

```tsx
<WidgetCanvas>
  {/* Row 1: 3 quarter-width stats = 18 cols at xl, wraps nicely */}
  <StatWidget title="Kills" value={kills} size="quarter" />
  <StatWidget title="Deaths" value={deaths} size="quarter" />
  <StatWidget title="Assists" value={assists} size="quarter" />

  {/* Row 2: One wide chart */}
  <ChartWidget title="Gold Graph" size="full">
    {/* chart content */}
  </ChartWidget>

  {/* Row 3: Two halves side by side */}
  <TableWidget title="Radiant" data={radiant} columns={cols} size="half" />
  <TableWidget title="Dire" data={dire} columns={cols} size="half" />
</WidgetCanvas>
```

---

## Adding a New Tab (Full Checklist)

1. **Add to DOMAIN_TABS** — `src/app/_components/analysis-v2/types.ts`
   ```typescript
   const DOMAIN_TABS = [..., "my-tab"] as const;
   ```

2. **Create content** — `src/app/_components/analysis-v2/tabs/MyTabContent.tsx`

3. **Export from barrel** — `src/app/_components/analysis-v2/tabs/index.ts`
   ```typescript
   export { MyTabContent } from "./MyTabContent";
   ```

4. **Create re-export** — `src/components/dashboard/tabs/MyTab.tsx`
   ```typescript
   export { MyTabContent } from "@/app/_components/analysis-v2/tabs/MyTabContent";
   ```

5. **Export from dashboard barrel** — `src/components/dashboard/tabs/index.ts`
   ```typescript
   export { MyTabContent } from "./MyTab";
   ```

6. **Register in MatchDashboard** — `src/components/dashboard/MatchDashboard.tsx`
   Add entry to the tab content map:
   ```typescript
   "my-tab": <MyTabContent {...tabContentProps} />,
   ```

7. **Add inspector titles** — In `getInspectorTitle()` within `MatchDashboard.tsx`, add cases for any panels your tab introduces.

8. **Add tab metadata** — In `DomainTabs.tsx`, add icon and label to `TAB_META`.
