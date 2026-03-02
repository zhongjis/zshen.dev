# tRPC Development Guidelines (T3 Stack)

Use this skill when creating, calling, or optimizing tRPC APIs in this Next.js 16 + tRPC + Prisma project.

## Quick Start

### Create a New Router

File: `src/server/api/routers/myRouter.ts`
```typescript
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const myRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => ({ greeting: `Hello ${input.name}` })),

  createItem: publicProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.something.create({ data: input });
      return item;
    }),
});
```

### Register Router in Root

Edit `src/server/api/root.ts`:
```typescript
import { myRouter } from "@/server/api/routers/myRouter";

export const appRouter = createTRPCRouter({
  match: matchRouter,
  myRouter: myRouter,  // Add your router here
});
```

### Primary Pattern: RSC + HydrateClient

Always prefer prefetching data in Server Components and hydrating the Client Components to avoid layout shifts and loading states where possible.

**Server Component (`src/app/page.tsx`):**
```tsx
import { api, HydrateClient } from "@/trpc/server";
import MatchAnalysis from "@/app/_components/MatchAnalysis";

export default async function Page() {
  // Prefetch data - returns a promise that tRPC handles internally for hydration
  void api.match.getMatchData.prefetch({ matchId: "8652436479" });

  return (
    <HydrateClient>
      <MatchAnalysis />
    </HydrateClient>
  );
}
```

**Client Component (`src/app/_components/MatchAnalysis.tsx`):**
```tsx
"use client";

import { api } from "@/trpc/react";

export default function MatchAnalysis() {
  // This query will use the prefetched data from the server
  const [data] = api.match.getMatchData.useSuspenseQuery({ matchId: "8652436479" });
  
  return <div>{data.result.winner}</div>;
}
```

### Alternative: Call tRPC directly from RSC

For simple read-only data that doesn't need to be shared with client islands.

```typescript
import { api } from "@/trpc/server";

export default async function MyPage() {
  const data = await api.myRouter.hello({ name: "World" });
  return <div>{data.greeting}</div>;
}
```

### Call tRPC from Client Components (Standard Query)

```typescript
"use client";

import { api } from "@/trpc/react";

export default function MyComponent() {
  const { data, isLoading } = api.myRouter.hello.useQuery({ name: "World" });

  if (isLoading) return <div>Loading...</div>;
  return <div>{data?.greeting}</div>;
}
```

## Promise.all() Convention

When multiple independent async operations are required (e.g., fetching hero name, roles, and image), ALWAYS use `Promise.all()` to prevent waterfalls.

Reference: `src/server/enricher/matchEnricher.ts`
```typescript
// Correct: Parallel execution
const [heroName, roles, image] = await Promise.all([
  getHeroName(p.hero_id),
  getHeroRoles(p.hero_id),
  getHeroImage(p.hero_id),
]);

// Incorrect: Sequential execution (Waterfall)
const heroName = await getHeroName(p.hero_id);
const roles = await getHeroRoles(p.hero_id);
const image = await getHeroImage(p.hero_id);
```

## Architecture & Data Flow

**Request Flow:** Client → httpBatchStreamLink → Next.js API route (`src/app/api/trpc/[trpc]/route.ts`) → Router → Procedure → Prisma → Response

**Key Files:**
- `src/server/api/trpc.ts` - tRPC server setup (context, middleware, procedures)
- `src/server/api/root.ts` - Router composition (all routers imported here)
- `src/server/api/routers/*.ts` - Individual router implementations
- `src/app/api/trpc/[trpc]/route.ts` - Next.js API route handler
- `src/trpc/server.ts` - RSC caller with React.cache()
- `src/trpc/react.tsx` - Client-side tRPC setup with QueryClient
- `src/trpc/query-client.ts` - QueryClient config (staleTime, SuperJSON)

## Queries vs Mutations

**Use `.query()`** for:
- Data retrieval (read operations)
- GET requests equivalent
- No side effects
- Idempotent (same input = same output)

**Use `.mutation()`** for:
- Data modification (write operations)
- POST/PUT/DELETE equivalent
- Side effects (create, update, delete)
- May affect database state

## Project-Specific Patterns

### Timing Middleware (`src/server/api/trpc.ts`)
Simulates network latency in development to identify unwanted waterfalls.

### Client Query Client (`src/trpc/react.tsx`)
Browser uses singleton to maintain cache across hot reloads. Server creates fresh instance per request.

### SuperJSON Transformer
Preserves JavaScript types (Date, Set, Map, BigInt) across serialization.

## Common Pitfalls

**❌ Query DB outside tRPC** - All DB access must go through tRPC procedures with `ctx.db.*`.
**❌ Expose `DATABASE_URL` to client** - Never use `NEXT_PUBLIC_` prefix for env vars with secrets.
**❌ Use Prisma types directly in components** - Use `RouterOutputs`.
**❌ Import tRPC in client-only code** - Use `"use client"` directive.
**❌ Forget to register router in root** - Must import sub-routers in `src/server/api/root.ts`.
