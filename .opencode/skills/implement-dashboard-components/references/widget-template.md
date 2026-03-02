# Widget Template

Reference for building domain widgets using dashboard widget primitives.

## File Location

```
src/app/_components/analysis-v2/widgets/{WidgetName}Widget.tsx
```

Export from `src/app/_components/analysis-v2/widgets/index.ts`.

## Common Boilerplate

```tsx
"use client";

import { type RouterOutputs } from "@/trpc/react";
import { StatWidget } from "@/components/dashboard/widgets/StatWidget";
// or: BillboardWidget, ChartWidget, TableWidget, CompareWidget, SummaryWidget, ListWidget, Widget

type Analysis = RouterOutputs["match"]["getAnalysis"];

interface MyWidgetProps {
  data: NonNullable<Analysis>["someField"];
  onPanelSelect?: (panel: string) => void;
}

export function MyWidget({ data, onPanelSelect }: MyWidgetProps) {
  return (
    <StatWidget
      title="My Metric"
      value={data.value}
      size="quarter"
      trend={data.change > 0 ? "up" : "down"}
      trendLabel={`${Math.abs(data.change)}%`}
    />
  );
}
```

---

## Widget Primitive Examples

### StatWidget — Single numeric stat with optional trend

```tsx
"use client";

import { StatWidget } from "@/components/dashboard/widgets/StatWidget";

export function KdaWidget({ kda }: { kda: number }) {
  return (
    <StatWidget
      title="KDA Ratio"
      value={kda.toFixed(2)}
      size="quarter"
      subtitle="Kills + Assists / Deaths"
      trend={kda > 3 ? "up" : kda > 1.5 ? "neutral" : "down"}
      trendLabel={kda > 3 ? "Strong" : kda > 1.5 ? "Average" : "Weak"}
    />
  );
}
```

**Props reference:**
- `value: string | number` — The main displayed value
- `trend?: "up" | "down" | "neutral"` — Trend indicator arrow/color
- `trendLabel?: string` — Text next to trend indicator
- `subtitle?: string` — Gray text below value
- `footer?: ReactNode` — Optional footer content

---

### BillboardWidget — Hero/prominent display with optional icon and tooltip

```tsx
"use client";

import { type ReactNode } from "react";
import { BillboardWidget } from "@/components/dashboard/widgets/BillboardWidget";
import { DotaImage } from "@/components/ui/DotaImage";

export function MvpSpotlightWidget({
  heroName,
  heroImage,
  subtitle,
  onPanelSelect,
}: {
  heroName: string;
  heroImage: string;
  subtitle: string;
  onPanelSelect?: (panel: string) => void;
}) {
  return (
    <BillboardWidget
      title="MVP"
      value={heroName}
      size="third"
      subtitle={subtitle}
      icon={<DotaImage src={heroImage} alt={heroName} width={48} height={48} />}
      onClick={() => onPanelSelect?.("mvp")}
      tooltip={
        <div style={{ color: "#e2e2e2", fontSize: "0.85rem" }}>
          Player with the highest performance score
        </div>
      }
    />
  );
}
```

**Props reference:**
- `value: ReactNode` — Can be JSX, not just text
- `icon?: ReactNode` — Icon/image displayed prominently
- `tooltip?: ReactNode` — Shadcn Tooltip content (use dark-theme inline styles)
- `onClick?: () => void` — Makes widget clickable (opens inspector panel)
- `subtitle?: string` — Secondary text

---

### ChartWidget — Wrapper for Recharts visualizations

```tsx
"use client";

import { ChartWidget } from "@/components/dashboard/widgets/ChartWidget";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export function GoldGraphWidget({ data }: { data: Array<{ time: number; gold: number }> }) {
  return (
    <ChartWidget title="Gold Over Time" size="half">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="gold" stroke="var(--dash-accent)" />
        </LineChart>
      </ResponsiveContainer>
    </ChartWidget>
  );
}
```

**Props reference:**
- `children: ReactNode` — Recharts chart content
- Use `var(--dash-accent)` and other CSS tokens for chart colors
- Wrap chart in `<ResponsiveContainer>` for responsive sizing

---

### TableWidget — Data table with custom column renderer

```tsx
"use client";

import { TableWidget, type TableColumn } from "@/components/dashboard/widgets/TableWidget";

interface PlayerRow {
  heroId: number;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
}

const columns: TableColumn<PlayerRow>[] = [
  { key: "name", header: "Player", render: (row) => row.name },
  { key: "kills", header: "K", render: (row) => row.kills, width: "3rem" },
  { key: "deaths", header: "D", render: (row) => row.deaths, width: "3rem" },
  { key: "assists", header: "A", render: (row) => row.assists, width: "3rem" },
];

export function ScoreboardWidget({
  players,
  onPanelSelect,
}: {
  players: PlayerRow[];
  onPanelSelect?: (panel: string) => void;
}) {
  return (
    <TableWidget
      title="Scoreboard"
      data={players}
      columns={columns}
      size="half"
      onRowClick={(row) => onPanelSelect?.(`hero:${row.heroId}`)}
    />
  );
}
```

**Props reference:**
- `columns: TableColumn<T>[]` — Custom column type (NOT tanstack `ColumnDef`)
- `TableColumn<T>` has: `key`, `header`, `render(row) → ReactNode`, optional `width`
- `onRowClick?: (row: T) => void` — Row click handler
- `subtitle?: string` — Secondary description text
- `sortable?: boolean` — Enable column sorting
- `onInspect?: (row: T) => void` — Inspect row action

---

### CompareWidget — Side-by-side comparison content

```tsx
"use client";

import { CompareWidget } from "@/components/dashboard/widgets/CompareWidget";

export function TeamCompareWidget({
  radiant,
  dire,
}: {
  radiant: { name: string; score: number };
  dire: { name: string; score: number };
}) {
  return (
    <CompareWidget title="Team Comparison" size="half">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-green-400 text-lg font-bold">{radiant.score}</div>
          <div className="text-[var(--dash-text-muted)]">{radiant.name}</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 text-lg font-bold">{dire.score}</div>
          <div className="text-[var(--dash-text-muted)]">{dire.name}</div>
        </div>
      </div>
    </CompareWidget>
  );
}
```

---

### SummaryWidget — Key-value summary list

```tsx
"use client";

import { SummaryWidget, type SummaryItem } from "@/components/dashboard/widgets/SummaryWidget";

export function MatchSummaryWidget({ duration, mode, region }: {
  duration: string;
  mode: string;
  region: string;
}) {
  const items: SummaryItem[] = [
    { label: "Duration", value: duration },
    { label: "Game Mode", value: mode },
    { label: "Region", value: region },
  ];

  return <SummaryWidget title="Match Info" items={items} size="quarter" />;
}
```

---

### ListWidget — Rendered list of items

```tsx
"use client";

import { ListWidget } from "@/components/dashboard/widgets/ListWidget";

interface Milestone {
  id: string;
  time: string;
  description: string;
}

export function MilestonesWidget({ milestones }: { milestones: Milestone[] }) {
  return (
    <ListWidget<Milestone>
      title="Key Milestones"
      items={milestones}
      size="third"
      emptyMessage="No milestones found"
      renderItem={(item) => (
        <div className="flex justify-between py-1">
          <span className="dash-num">{item.time}</span>
          <span className="text-[var(--dash-text-muted)]">{item.description}</span>
        </div>
      )}
    />
  );
}
```

---

### Base Widget — Fully custom content

Use base `Widget` when no specialized primitive fits:

```tsx
"use client";

import { Widget } from "@/components/dashboard/widgets/Widget";

export function CustomWidget({ children }: { children: React.ReactNode }) {
  return (
    <Widget title="Custom Analysis" size="half">
      {children}
    </Widget>
  );
}
```

---

## Grid Size Guide

Choose `size` based on content density:

| Size             | Best for                              | XL width |
|------------------|---------------------------------------|----------|
| `"quarter"`      | Single stat, small number             | 6 cols   |
| `"third"`        | Billboard, small list                 | 8 cols   |
| `"half"`         | Chart, table, comparison              | 12 cols  |
| `"twoThirds"`    | Wide chart, detailed table            | 16 cols  |
| `"threeQuarters"`| Large visualization                   | 18 cols  |
| `"full"`         | Full-width timeline, kill matrix      | 24 cols  |

---

## CSS Token Usage

```tsx
// Background layers
<div className="bg-[var(--dash-l0)]">Base</div>
<div className="bg-[var(--dash-l1)]">Card</div>
<div className="bg-[var(--dash-l2)]">Elevated</div>

// Text
<span className="text-[var(--dash-text)]">Primary</span>
<span className="text-[var(--dash-text-muted)]">Secondary</span>
<span className="text-[var(--dash-text-dim)]">Tertiary</span>

// Accent
<span className="text-[var(--dash-accent)]">Highlighted</span>

// Numeric values (monospace)
<span className="dash-num">12,345</span>
// With color override (requires ! modifier):
<span className="dash-num !text-green-400">+500</span>
```
