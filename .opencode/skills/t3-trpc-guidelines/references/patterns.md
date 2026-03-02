# Project-Specific tRPC Patterns

This document outlines patterns and conventions unique to this T3 Stack project (Dota 2 Match Analyzer).

## Timing Middleware Pattern

### Location: `src/server/api/trpc.ts:82-97`

```typescript
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
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

### Purpose

1. **Waterfall Detection:** Simulates network latency (100-500ms) in development to expose sequential API calls that should be parallel. Without artificial delay, local development masks waterfalls (sequential requests) that cause poor performance in production.

2. **Execution Timing:** Logs procedure execution time for performance monitoring. Format: `[TRPC] {router}.{procedure} took {ms}ms to execute`.

3. **Dev vs Prod Behavior:** Only adds delay in `isDev` environment. Production logs execution time but without artificial delay.

### When to Remove

- If you find the delay slows down development too much
- If you're confident your API calls are properly optimized
- If you prefer to detect waterfalls via Chrome DevTools instead

### Logs Example

```
[TRPC] match.getMatchData took 245ms to execute
[TRPC] match.getAnalysis took 156ms to execute
[TRPC] match.fetchRawMatch took 412ms to execute
```

## Context Structure

### Location: `src/server/api/trpc.ts:27-32`

```typescript
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,        // Prisma client singleton
    ...opts,   // headers
  };
};
```

### Available in Procedures

```typescript
.query(async ({ ctx, input }) => {
  // ctx.db - Prisma client (singleton pattern)
  const data = await ctx.db.table.findMany();

  // ctx.headers - Next.js Headers object (for auth, cookies)
  const auth = ctx.headers.get("authorization");

  return data;
})
```

### Context Usage Patterns

#### Direct Database Access (DO THIS)

```typescript
// ✅ Correct
.query(async ({ ctx }) => {
  const items = await ctx.db.table.findMany();
  return items;
})

// ❌ Wrong - Don't import db directly
.query(async () => {
  const items = await db.table.findMany(); // No context access
  return items;
})
```

#### Future: Auth Session Access

```typescript
// When auth added (NextAuth.js integration)
.export const protectedProcedure = t.procedure
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, session: ctx.session } });
  });
```

## Database Singleton Pattern

### Location: `src/server/db.ts` (implied)

**Problem:** Prisma Client creates a connection pool. In development, hot reloads create multiple instances, exhausting the pool.

**Solution:** Use `globalThis` singleton pattern:

```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma as db };
```

### How tRFC Uses It

```typescript
// Context passes singleton
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,  // Imported from src/server/db.ts (singleton)
    ...opts,
  };
};
```

**Result:** All procedures use same database instance across hot reloads.

## RSC Hydration Pattern

### Location: `src/trpc/server.ts:15-30`

```typescript
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
```

### Explanation

1. **`cache()` Wrapper:** React's `React.cache()` ensures single instance per request lifecycle (not per file import). Critical for Next.js App Router RSC.

2. **`headers()` Import:** Next.js function to get incoming request headers. Sets `"x-trpc-source": "rsc"` to distinguish RSC calls from client calls.

3. **`createCaller()`:** Creates server-side tRPC caller that bypasses HTTP transport (direct function call, no fetch).

4. **`createHydrationHelpers()`:** Exports `api` (same interface as client but for RSC) and `HydrateClient` component for data caching/dehydration.

### Usage Example

```typescript
import { api, HydrateClient } from "@/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  // Prefetch data for client hydration
  await api.match.getMatchData.prefetch({ matchId: params.id });

  return (
    <div>
      {/* Server-rendered content */}
      <div>Match: {params.id}</div>

      {/* Client component with prefetched data */}
      <HydrateClient>
        <MatchDetail matchId={params.id} />
      </HydrateClient>
    </div>
  );
}
```

## Client Query Client Singleton

### Location: `src/trpc/react.tsx:13-23`

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

### Why This Pattern

1. **Server:** New instance per request to prevent cache pollution between requests.

2. **Browser:** Singleton maintains React Query cache across hot reloads in development. Without this, data fetched before hot reload disappears after refresh.

### Usage

```typescript
export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  // ... rest of setup
}
```

## httpBatchStreamLink Configuration

### Location: `src/trpc/react.tsx:52-61`

```typescript
httpBatchStreamLink({
  transformer: SuperJSON,
  url: getBaseUrl() + "/api/trpc",
  headers: () => {
    const headers = new Headers();
    headers.set("x-trpc-source", "nextjs-react");
    return headers;
  },
}),
```

### What It Does

1. **Batching:** Combines multiple tRPC requests into single HTTP request. Reduces network overhead.

2. **Streaming:** Uses server-sent events (SSE) to stream responses as data available. Improves perceived latency.

3. **SuperJSON:** Transforms JavaScript types (Date, Set, Map, BigInt) for serialization.

4. **Headers Source Marker:** `"x-trpc-source": "nextjs-react"` distinguishes client from RSC calls.

### Example: Batched Request

```typescript
// Three queries batched into single HTTP request
const data1 = api.match.getMatchData.useQuery({ matchId: "123" });
const data2 = api.match.getAnalysis.useQuery({ matchId: "123" });
const data3 = api.match.getPerformance.useQuery({ matchId: "123" });

// All sent together, received as streaming responses
```

## Query Client Configuration

### Location: `src/trpc/query-client.ts:7-25`

```typescript
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
```

### Key Settings

1. **`staleTime: 30s`**: Data considered fresh for 30 seconds. Prevents immediate refetch on client hydration. Reduces redundant API calls.

2. **`serializeData: SuperJSON.serialize`**: Uses SuperJSON to preserve JavaScript types during dehydration (server-to-HTML).

3. **`shouldDehydrateQuery`:** Custom logic includes pending queries in dehydration, enabling seamless hydration of loading states.

4. **`deserializeData: SuperJSON.deserialize`**: Reconstructs Date/Set/Map/BigInt objects on client rehydration.

## Error Formatter

### Location: `src/server/api/trpc.ts:43-52`

```typescript
errorFormatter({ shape, error }) {
  return {
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  },
}
```

### What It Does

- Flattens Zod validation errors into structured format.
- Client receives detailed field-level validation errors.

### Client Error Example

```typescript
const mutation = api.match.create.useMutation();

if (mutation.error?.data) {
  const zodErrors = mutation.error.data.zodError;
  console.log(zodErrors.fieldErrors);
  // { name: ["Required field"], age: ["Must be at least 18"] }
}
```

## Router Composition

### Location: `src/server/api/root.ts:9-14`

```typescript
export const appRouter = createTRPCRouter({
  match: matchRouter,
  // Add more routers here
  // myRouter: myRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
```

### Pattern

1. **Sub-routers** defined in `src/server/api/routers/*.ts`.
2. **Root router** manually imports and composes all sub-routers.
3. **Type inference:** `AppRouter` type exported for type-safe client calls.
4. **Server caller:** `createCaller` for server-side RPC bypassing HTTP.

### Adding New Router

```typescript
// 1. Create router
// src/server/api/routers/users.ts
export const usersRouter = createTRPCRouter({
  // procedures
});

// 2. Import and add to root
// src/server/api/root.ts
import { usersRouter } from "@/server/api/routers/users";

export const appRouter = createTRPCRouter({
  match: matchRouter,
  users: usersRouter,
});
```

## Sub-router Organization

### File Structure

```
src/server/api/
├── trpc.ts          # Context, middleware, procedures
├── root.ts          # Router composition
└── routers/
    ├── match.ts     # Match-related procedures
    └── users.ts     # User-related procedures (future)
```

### Naming Conventions

- Router files: `{noun}s.ts` (match.ts, users.ts, posts.ts)
- Router exports: `{noun}Router` (matchRouter, usersRouter)
- Procedures: `{verb}{Entity}` (getById, createItem, updateUser)

## Procedure Patterns from Project

### Auto-compute Lazy Queries

From `src/server/api/routers/match.ts:314-366`:

```typescript
getAnalysis: publicProcedure.query(async ({ ctx, input }) => {
  // Check cache first
  let computedStats = await ctx.db.computedMatchStats.findUnique({
    where: { matchId: input.matchId },
  });

  // Compute if missing
  if (!computedStats) {
    const match = await ctx.db.sanitizedMatchData.findUnique({
      where: { matchId: input.matchId },
    });
    // ... compute logic
    computedStats = await ctx.db.computedMatchStats.create(...);
  }

  return transformAnalysisData(JSON.parse(computedStats.data));
});
```

### Mutation with Background Polling

From `src/server/api/routers/match.ts:513-527`:

```typescript
fetchRawMatch: publicProcedure.mutation(async ({ ctx, input }) => {
  const { matchId } = input;
  console.log(`[OpenDota] Starting fetch for match ${matchId}`);

  try {
    const match = await getMatch(matchId);

    if (match.version !== undefined) {
      // Already parsed
      await ctx.db.rawMatchData.upsert({ ... });
      return { status: "stored" as const, matchId };
    }

    // Request parsing
    await requestParsing(matchId);

    // Start background polling
    pollForParsedMatch(matchId, ctx.db).catch((pollError) => {
      console.error(`[fetchRawMatch] Polling failed:`, pollError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to poll for parsed match: ${matchId}`,
        cause: pollError,
      });
    });

    return { status: "parsing_requested" as const, matchId };
  } catch (error) {
    // Handle OpenDota API errors
    if (error instanceof OpenDotaApiError) {
      console.error(`[OpenDota] API error:`, {
        status: error.status,
        statusText: error.statusText,
        // ...
      });
    }
    throw error;
  }
});
```

**Pattern:** Mutation triggers external operation, starts background polling, uses `.catch()` to handle polling failures.

## Common Pitfalls Specific to This Project

### Don't Modify `generated/prisma/`

```typescript
// ❌ WRONG
import { PrismaClient } from "@generated/prisma/client";

// ✅ CORRECT
import { PrismaClient } from "@prisma/client";
```

**Why:** `generated/prisma/` excluded from TypeScript config. Regenerate schema with `pnpm postinstall` or `prisma generate`.

### Don't Query DB Outside tRPC

```typescript
// ❌ WRONG - Direct Prisma use in component
import { db } from "@/server/db";
const data = await db.table.findMany();

// ✅ CORRECT - Through tRPC procedure
const data = await api.table.getAll.useQuery();
```

### Don't Skip Timing Middleware

```typescript
// ❌ WRONG - Waterfalls not detected
export const publicProcedure = t.procedure;

// ✅ CORRECT - Maintains project pattern
export const publicProcedure = t.procedure.use(timingMiddleware);
```

### Don't Forget Router Registration

```typescript
// ❌ WRONG - Router exists but not registered
// src/server/api/root.ts
export const appRouter = createTRPCRouter({
  match: matchRouter,
  // users: usersRouter, // Missing!
});

// ✅ CORRECT - Add to root router
export const appRouter = createTRPCRouter({
  match: matchRouter,
  users: usersRouter,
});
```