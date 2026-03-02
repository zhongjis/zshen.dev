---
name: t3-trpc-guidelines
description: Use when working with tRPC in this T3 Stack project. Covers router/procedure creation, calling tRPC endpoints from Server/Client components, project-specific patterns (timing middleware, context structure), error handling, and optimization. Trigger phrases include "create tRPC", "call tRPC", "trpc router", "trpc endpoint", "tRPC procedure".
---

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

// Mutations
const mutation = api.myRouter.createItem.useMutation({
  onSuccess: () => {
    console.log("Created!");
  },
});

const handleSubmit = () => mutation.mutate({ title: "New Item" });
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

**Context Structure** (`createTRPCContext`):
```typescript
export const createTRPCContext = async (opts: { headers: Headers }) => ({
  db,        // Prisma client with singleton pattern
  headers: opts.headers,
});
```

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
- Example: `fetchRawMatch`, `sanitizeMatch`, `enrichMatch`, `computeStats` in `src/server/api/routers/match.ts:484-693`

## Project-Specific Patterns

### Timing Middleware (`src/server/api/trpc.ts:82-97`)
```typescript
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // Artificial delay in dev (100-500ms) to catch waterfall bugs
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();
  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);
```

**Purpose:** Simulates network latency in development to identify unwanted waterfalls (sequential requests that should be parallel). Remove if not needed.

**Note:** Log messages show execution time with format `[TRPC] {router}.{procedure} took {ms}ms to execute`.

### RSC Hydration (`src/trpc/server.ts:25-30`)
```typescript
const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
```

**Pattern:** Uses `React.cache()` to ensure single instance per request. `HydrateClient` prefetches data for SSR, then client hydrates from dehydrated state.

### Client Query Client (`src/trpc/react.tsx:13-23`)
```typescript
let clientQueryClientSingleton: QueryClient | undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern
  clientQueryClientSingleton ??= createQueryClient();
  return clientQueryClientSingleton;
};
```

**Pattern:** Browser uses singleton to maintain cache across hot reloads. Server creates fresh instance per request.

### SuperJSON Transformer (`src/trpc/react.tsx:53`, `src/trpc/query-client.ts:16-17`)
```typescript
transformer: SuperJSON  // In httpBatchStreamLink
serializeData: SuperJSON.serialize  // In dehydrate config
```

**Purpose:** Transforms Date, Set, Map, BigInt, and plain objects to preserve JavaScript types across serialization.

### Links Setup (`src/trpc/react.tsx:46-61`)
```typescript
links: [
  loggerLink({
    enabled: (op) =>
      process.env.NODE_ENV === "development" ||
      (op.direction === "down" && op.result instanceof Error),
  }),
  httpBatchStreamLink({
    transformer: SuperJSON,
    url: getBaseUrl() + "/api/trpc",
    headers: () => {
      const headers = new Headers();
      headers.set("x-trpc-source", "nextjs-react");
      return headers;
    },
  }),
]
```

**LoggerLink**: Logs tRPC operations in dev mode and errors in production.
**httpBatchStreamLink**: Uses streaming + HTTP batch for optimal performance with React Query.

## Error Handling

### Throw Errors in Procedures (`src/server/api/routers/match.ts:213-216,224-229`)
```typescript
import { TRPCError } from "@trpc/server";

throw new TRPCError({
  code: "NOT_FOUND",
  message: "Match data not found",
});
```

**Common Codes:**
- `NOT_FOUND` - Resource doesn't exist
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `INTERNAL_SERVER_ERROR` - Server error (see `src/server/api/trpc.ts:43-52`)
- `BAD_REQUEST` - Invalid request
- `CONFLICT` - Resource conflict (e.g., duplicate key)

### Error Formatter (`src/server/api/trpc.ts:43-52`)
```typescript
errorFormatter({ shape, error }) {
  return {
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError ? error.cause.flatten() : null,
    };
  },
}
```

**Purpose:** Flattens Zod errors so client gets detailed validation feedback.

## Common Pitfalls

**❌ Query DB outside tRPC** - All DB access must go through tRPC procedures with `ctx.db.*`.

**❌ Expose `DATABASE_URL` to client** - Never use `NEXT_PUBLIC_` prefix for env vars with secrets.

**❌ Modify `generated/prisma/` directly** - Regenerate with `pnpm postinstall` or `prisma generate`.

**❌ Use Prisma types directly in components** - Go through tRPC and inferred types (`RouterOutputs` from `src/trpc/react.tsx:32-39`).

**❌ Import tRPC in client-only code** - Use `"use client"` directive at file top for `src/trpc/react.tsx` components.

**❌ Skip timing middleware** - Can hide waterfall bugs; remove only if intentional.

**❌ Bypass context access** - Always use `ctx.db` to access database; don't import `db` directly in routers.

**❌ Ignore staleTime config** - `src/trpc/query-client.ts:13` sets `staleTime: 30 * 1000` (30s) to avoid immediate refetches on client hydration.

**❌ Forget to register router in root** - Must import sub-routers in `src/server/api/root.ts`.

**❌ Use `any` types** - Leverage TypeScript inference from Zod schemas and tRPC.

## When to Use This Skill

Use `t3-trpc-guidelines` when:
- Creating new tRPC routers/procedures
- Calling tRPC from Server or Client components
- Debugging tRPC requests/responses
- Implementing caching, batching, or optimization
- Handling errors with `TRPCError`
- Working with timing middleware or context
- Setting up mutations with `onSuccess`/`onError` callbacks
- Prefetching data with `HydrateClient`

## Type Inference Helpers

```typescript
import type { RouterInputs, RouterOutputs } from "@/trpc/react";

// Input types
type CreateItemInput = RouterInputs["myRouter"]["createItem"];
// Equivalent to: { title: string }

// Output types
type HelloOutput = RouterOutputs["myRouter"]["hello"];
// Equivalent to: { greeting: string }
```

## Testing Considerations

- Run `pnpm typecheck` to verify TypeScript strict compliance
- Use `pnpm check` to run Biome linting and formatting
- For procedure testing: Set up Vitest with mocked tRPC context (not yet implemented in project)
- Test error paths by checking `TRPCError` codes

## Performance Optimization

**Batching:** `httpBatchStreamLink` automatically batches requests (default).
**StaleTime:** 30s default prevents unnecessary refetches on hydration (`src/trpc/query-client.ts:13`).
**Prefetching:** Use `await api.procedure.prefetch({ key: value })` in Server Components for data needed in Client Components.

See `references/performance.md` for detailed optimization strategies.