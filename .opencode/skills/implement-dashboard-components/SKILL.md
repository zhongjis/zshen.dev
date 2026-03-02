# Skill: Implement Dashboard Components

Implement dashboard UI components for the Dota 2 match analysis app. This covers domain widgets, tab content, inspector detail panels, and dashboard chrome.

## Architecture Overview

The dashboard uses a **two-layer architecture**:

### Layer 1: Dashboard Library (`src/components/dashboard/`)
Reusable, domain-agnostic primitives. Think of these as the "design system" for the dashboard.

- **Chrome**: `MatchDashboard`, `ContextBar`, `TabBar`, `FilterBar`, `InspectorDrawer`, `InspectorHeader`
- **Widget primitives**: `Widget`, `StatWidget`, `BillboardWidget`, `ChartWidget`, `TableWidget`, `CompareWidget`, `SummaryWidget`, `ListWidget`
- **Layout**: `WidgetCanvas` (24-column responsive grid)
- **Adapters**: `DashCard`, `DashSelect`, `DashTable`, `DashScrollArea` (shadcn wrappers with dashboard tokens)
- **Context**: `ScopeContext`, `DashboardContext`, `TimeSyncContext`
- **Utilities**: `cn()` helpers, `DashboardProgress`, CSS tokens

### Layer 2: Analysis Content (`src/app/_components/analysis-v2/`)
Domain-specific implementations that USE Layer 1 primitives.

- **Tabs**: 9 tab content components in `tabs/`
- **Widgets**: 64+ domain widgets in `widgets/`
- **Inspector details**: 22+ inspector detail panels in `inspector/`
- **Types**: `DOMAIN_TABS`, `DomainTab`, `DashboardUrlState`, `AICommentary` in `types.ts`

### Re-export Bridge (`src/components/dashboard/tabs/`)
Pure re-export files that expose analysis-v2 tab content through the dashboard library namespace. Named `{Domain}Tab.tsx` (e.g., `OverviewTab.tsx` re-exports `OverviewTabContent`).

---

## Grid System (24-column)

The `WidgetCanvas` uses a responsive 24-column grid:

```
Breakpoints:  base (4-col) → md (8-col) → lg (16-col) → xl (24-col)
Gap:          gap-3
```

### Widget Sizes

| Size             | base     | md           | lg            | xl            |
|------------------|----------|--------------|---------------|---------------|
| `"full"`         | 4 cols   | 8 cols       | 16 cols       | 24 cols       |
| `"half"`         | 4 cols   | 8 cols       | 8 cols        | 12 cols       |
| `"third"`        | 4 cols   | 4 cols       | 8 cols        | 8 cols        |
| `"quarter"`      | 4 cols   | 4 cols       | 4 cols        | 6 cols        |
| `"twoThirds"`    | 4 cols   | 8 cols       | 12 cols       | 16 cols       |
| `"threeQuarters"`| 4 cols   | 8 cols       | 12 cols       | 18 cols       |

Type: `WidgetSize = "full" | "half" | "third" | "quarter" | "twoThirds" | "threeQuarters"`

---

## Tabs (DOMAIN_TABS)

There are **9 domain tabs** defined in `src/app/_components/analysis-v2/types.ts`:

```typescript
const DOMAIN_TABS = [
  "overview", "combat", "economy", "objectives",
  "items", "power", "laning", "draft", "map-control"
] as const;
```

| Tab           | Content Component       | Re-export File          | Description                     |
|---------------|-------------------------|-------------------------|---------------------------------|
| overview      | OverviewTabContent      | OverviewTab.tsx         | Match summary, MVP, key stats   |
| combat        | CombatTabContent        | CombatTab.tsx           | Kill matrix, teamfights, fights |
| economy       | EconomyTabContent       | EconomyTab.tsx          | Gold/XP graphs, net worth       |
| objectives    | ObjectivesTabContent    | ObjectivesTab.tsx       | Towers, Roshan, buildings       |
| items         | ItemsTabContent         | ItemsTab.tsx            | Itemization, counter items      |
| power         | PowerTabContent         | PowerTab.tsx            | Power spikes, hero curves       |
| laning        | LaningTabContent        | LaningTab.tsx           | Lane matchups, early game       |
| draft         | DraftTabContent         | DraftTab.tsx            | Draft analysis, synergies       |
| map-control   | MapControlTabContent    | *(direct import)*       | Wards, map control              |

**Note**: `MapControlTabContent` has no re-export in `dashboard/tabs/` — it's imported directly from `analysis-v2/tabs` in `MatchDashboard.tsx`.

---

## Data Flow

```
Page (RSC) fetches data via tRPC
  → MatchDashboard receives { matchData, analysis, performance, gameflow }
    → Builds tabContentProps = { matchData!, analysis!, performance!, gameflow!, onPanelSelect }
      → Spreads tabContentProps to active tab content component
        → Tab renders domain widgets with specific data slices
          → Widgets use Widget/StatWidget/BillboardWidget/etc. primitives
```

### MatchDashboard Props
```typescript
interface MatchDashboardProps {
  matchId: string;
  matchData: RouterOutputs["match"]["getMatchData"] | null;
  analysis: RouterOutputs["match"]["getAnalysis"] | null;
  performance: RouterOutputs["match"]["getPerformance"] | null;
  gameflow: RouterOutputs["match"]["getGameflow"] | null;
}
```

### URL State Management
`useDashboardUrl()` hook manages tab/panel/compare/team/player state via URL search params:
```typescript
const { tab, panel, compare, team, player, setTab, setPanel, setCompare } = useDashboardUrl();
```

State shape: `{ tab, panel, player, team, t, compare }` — all nullable strings stored as URL params.

---

## Widget Primitives

All primitives live in `src/components/dashboard/widgets/`. Import from there.

### Base Widget
```typescript
interface WidgetProps {
  title: string;
  size?: WidgetSize;        // default: "half"
  className?: string;
  footer?: ReactNode;       // optional footer below content
  children: ReactNode;
}
```

### StatWidget
```typescript
interface StatWidgetProps {
  title: string;
  value: string | number;
  size?: WidgetSize;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  className?: string;
  footer?: ReactNode;
}
```

### BillboardWidget
```typescript
interface BillboardWidgetProps {
  title: string;
  value: ReactNode;          // Can be JSX, not just string/number
  size?: WidgetSize;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  footer?: ReactNode;
  tooltip?: ReactNode;       // Shadcn Tooltip content
  onClick?: () => void;
}
```

### ChartWidget
```typescript
interface ChartWidgetProps {
  title: string;
  size?: WidgetSize;
  className?: string;
  footer?: ReactNode;
  children: ReactNode;      // Recharts chart goes here
}
```

### TableWidget
```typescript
interface TableWidgetProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: TableColumn<T>[];  // Custom column type, NOT tanstack ColumnDef
  size?: WidgetSize;
  className?: string;
  footer?: ReactNode;
  onRowClick?: (row: T) => void;
  sortable?: boolean;
  onInspect?: (row: T) => void;
  scope?: string;
}

interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
}
```

### CompareWidget
```typescript
interface CompareWidgetProps {
  title: string;
  size?: WidgetSize;
  className?: string;
  footer?: ReactNode;
  children: ReactNode;       // Render comparison content
}
```

### SummaryWidget
```typescript
interface SummaryWidgetProps {
  title: string;
  items: SummaryItem[];
  size?: WidgetSize;
  className?: string;
  footer?: ReactNode;
}

interface SummaryItem {
  label: string;
  value: string | number;
  icon?: ReactNode;
}
```

### ListWidget
```typescript
interface ListWidgetProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  size?: WidgetSize;
  className?: string;
  footer?: ReactNode;
  emptyMessage?: string;
}
```

---

## Inspector Panels

Inspector details show drill-down content when a user clicks a widget's detail action. They live in `src/app/_components/analysis-v2/inspector/`.

### Current Inspector Panels (22+)
MvpDetail, LaneOverviewDetail, LaneMatchupDetail, TeamfightDetail, FightInitiationDetail, PlayerDetail, MilestoneDetail, BuildingTradeDetail, ObjectivesTimelineDetail, TempoRatingDetail, DraftCounterPicksDetail, DraftWeaknessesDetail, DraftSynergyDetail, ItemizationDetail, CounterItemDetail, ActiveItemDetail, GoldSourceDetail, PurchaseOrderDetail, BuybackDetail, LowPerformersDetail, FightTimingsDetail, HeroPowerSpikesDetail, PowerTimingStatsDetail.

Panel routing: `panel` URL param → `InspectorContent.tsx` → splits `panel.split(':')[0]` for base panel, `panel.split(':')[1]` for optional heroId.

---

## CSS Design Tokens

Dashboard uses custom CSS properties defined in `src/components/dashboard/utils/tokens.css`:

```css
/* Background layers */
--dash-l0    /* Base background (darkest) */
--dash-l1    /* Card/widget background */
--dash-l2    /* Elevated surfaces */

/* Accent colors */
--dash-accent
--dash-accent-muted

/* Text */
--dash-text
--dash-text-muted
--dash-text-dim
```

**⚠️ `--dash-bg` does NOT exist. Use `--dash-l0` for base backgrounds.**

### Numeric values class
Use `.dash-num` for mono-spaced numeric display. When combining with Tailwind color utilities, add `!` modifier (e.g., `!text-green-400`) because `.dash-num` has its own color.

---

## Conventions & Patterns

### All components are client components
Every file must have `"use client"` at the top.

### Import aliases
Always use `@/` imports, never relative `../../../`.

### Types
Use `RouterOutputs` from `@/trpc/react` for data types. Never import Prisma types directly.

```typescript
import { type RouterOutputs } from "@/trpc/react";
type Analysis = RouterOutputs["match"]["getAnalysis"];
```

### Widget → Inspector connection
Widgets trigger inspector panels via `onPanelSelect(panelName)`:
```typescript
<BillboardWidget
  title="MVP"
  value={mvp.name}
  onClick={() => onPanelSelect("mvp")}
/>
```

For hero-specific panels, use colon syntax: `onPanelSelect(\`hero:\${heroId}\`)`.

### BillboardWidget Tooltips
Use shadcn `Tooltip` with dark-theme inline styles:
```tsx
tooltip={
  <div style={{ color: "#e2e2e2", fontSize: "0.85rem" }}>
    Tooltip explanation text
  </div>
}
```

### ScopeProvider (Optional)
Only used by tabs that need team/player filtering. Currently only `OverviewTabContent` and `EconomyTabContent` use it. Do NOT treat as a mandatory pattern.

```tsx
// Only if your tab needs team/player scope filtering:
<ScopeProvider matchData={matchData}>
  <WidgetCanvas>{/* widgets */}</WidgetCanvas>
</ScopeProvider>
```

### TimeSyncContext
For charts that need synchronized time cursors, wrap with `TimeSyncProvider` (handled at MatchDashboard level, not per-tab).

---

## Adding a New Tab (Checklist)

1. Add tab name to `DOMAIN_TABS` array in `src/app/_components/analysis-v2/types.ts`
2. Create `{Domain}TabContent.tsx` in `src/app/_components/analysis-v2/tabs/`
3. Export from `src/app/_components/analysis-v2/tabs/index.ts`
4. Create re-export `{Domain}Tab.tsx` in `src/components/dashboard/tabs/`
5. Export from `src/components/dashboard/tabs/index.ts`
6. Add tab entry in `MatchDashboard.tsx` tab content map
7. Add `getInspectorTitle()` cases for any new panels
8. Add tab metadata (icon, label) to `DomainTabs.tsx` TAB_META

---

## Adding a New Widget (Checklist)

1. Create widget file in `src/app/_components/analysis-v2/widgets/`
2. Export from `src/app/_components/analysis-v2/widgets/index.ts`
3. Choose appropriate primitive: `StatWidget`, `BillboardWidget`, `ChartWidget`, `TableWidget`, `CompareWidget`, `SummaryWidget`, `ListWidget`, or base `Widget`
4. Set `size` prop for grid placement
5. Add `onClick` handler if widget should open an inspector panel
6. Use `"use client"` directive
7. Use `@/` imports only

---

## Adding an Inspector Panel (Checklist)

1. Create detail component in `src/app/_components/analysis-v2/inspector/`
2. Export from `src/app/_components/analysis-v2/inspector/index.ts`
3. Add case to `InspectorContent.tsx` switch
4. Add title to `getInspectorTitle()` in `MatchDashboard.tsx`
5. Connect widget via `onPanelSelect("panel-name")`

---

## Anti-Patterns

- ❌ Import Prisma types → use `RouterOutputs` from tRPC
- ❌ Use `--dash-bg` → use `--dash-l0`
- ❌ Use `.dash-num` with Tailwind colors without `!` modifier
- ❌ Put tab content in `src/components/dashboard/` → belongs in `analysis-v2/tabs/`
- ❌ Put domain widgets in `src/components/dashboard/` → belongs in `analysis-v2/widgets/`
- ❌ Add new tab without updating `DOMAIN_TABS` in `types.ts`
- ❌ Circular imports from `dashboard/tabs/` back to `analysis-v2/`
- ❌ Direct DB access in components → use tRPC procedures
- ❌ Relative imports `../../../` → always `@/`
- ❌ Omit `"use client"` directive
- ❌ Use ScopeProvider in every tab → only when team/player filtering needed
- ❌ Use `ColumnDef` from tanstack → use custom `TableColumn<T>` interface

---

## Reference Templates

Detailed implementation templates with full code examples:

- **[Widget Template](references/widget-template.md)** — How to build domain widgets with each primitive
- **[Tab Template](references/tab-template.md)** — How to build tab content components
- **[Inspector Template](references/inspector-template.md)** — How to build inspector detail panels
