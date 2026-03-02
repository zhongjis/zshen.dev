# tRPC Architecture Overview

## How tRPC Works in Next.js 15

tRPC enables end-to-end type safety across the full stack. In a Next.js 15 application with App Router, tRPC integrates deeply with React Server Components (RSC) and React Query.

### Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                            │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐       │
│  │ RSC Usage  │    │ Client     │    │ Direct     │       │
│  │ - async    │    │ - useQuery  │    │ - HTTP     │       │
│  │ - await    │    │ - useMutation│  │ - fetch    │       │
│  └──────┬─────┘    └──────┬─────┘    └──────┬─────┘       │
│         │                 │                  │              │
│         │                 │                  │              │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
┌─────────▼─────────────────▼──────────────────▼──────────────┐
│                   Transport Layer                             │
│                  (Streaming + Batch)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          httpBatchStreamLink                       │   │
│  │  - Batches multiple requests                        │   │
│  │  - Streams responses                                │   │
│  │  - Uses SuperJSON for type preservation             │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   API Route Layer                            │
│         (Next.js API Route Handler)                          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  src/app/api/trpc/[trpc]/route.ts                      │ │
│  │  - Receives tRPC requests                              │ │
│  │  - Routes to appropriate router/procedure              │ │
│  │  - Handles context creation                            │ │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Server Layer                               │
│              (tRPC Router + Procedures)                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  src/server/api/root.ts                              │ │
│  │   └── createTRPCRouter({                              │ │
│  │        match: matchRouter,                            │ │
│  │        myRouter: myRouter,                            │ │
│  │      })                                              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  src/server/api/routers/match.ts                       │ │
│  │   .query(({ ctx, input }) => { ... })                  │ │
│  │   .mutation(({ ctx, input }) => { ... })              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  src/server/api/trpc.ts                                │ │
│  │   - createTRPCContext (provides db, headers)          │ │
│  │   - timingMiddleware (dev delay + logging)             │ │
│  │   - errorFormatter (Zod error flattening)              │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────┬──────────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────────┐
│                   Data Layer                                 │
│                  (Prisma ORM)                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  prisma/schema.prisma                                   │ │
│  │  └── Defines database models and relations             │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Client to Database

### 1. Client Component Calls tRPC

```typescript
// src/app/page.tsx:38-53
const matchData = api.match.getMatchData.useQuery(
  { matchId: submittedMatchId! },
  { enabled: !!submittedMatchId },
);
```

**What happens:**
- React Query intercepts the call
- Checks if data exists in cache (staleTime: 30s)
- If cache miss, creates tRPC request
- Multiple requests batched via `httpBatchStreamLink`

### 2. Transport Layer Batches Requests

```typescript
// src/trpc/react.tsx:52-61
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

**What happens:**
- Multiple concurrent requests combined into single HTTP request
- Response streamed back as data becomes available
- SuperJSON preserves Date, Set, Map, BigInt types

### 3. API Route Handles Request

Next.js App Route at `src/app/api/trpc/[trpc]/route.ts`:
- Receives batched tRPC request
- Deserializes using SuperJSON
- Calls `createTRPCContext` with headers
- Routes to appropriate router procedure

### 4. Router Executes Procedure

```typescript
// src/server/api/routers/match.ts:201-235
getMatchData: publicProcedure
  .input(z.object({ matchId: z.string() }))
  .query(async ({ ctx, input }) => {
    const { matchId } = input;

    const rawData = await ctx.db.rawMatchData.findUnique({
      where: { matchId },
      select: { rawData: true },
    });

    if (!rawData?.rawData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Match data not found",
      });
    }

    // ... transformation logic
    return uiData;
  }),
```

**What happens:**
- `timingMiddleware` logs execution time with 100-500ms dev delay
- Zod input validation (if input schema provided)
- Context provides `db` (Prisma client singleton)
- Procedure executes database queries
- Response returned through error formatter

### 5. Context Creation

```typescript
// src/server/api/trpc.ts:27-32
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};
```

**What happens:**
- Context created per request
- Database client uses singleton pattern to prevent connection pool exhaustion
- Headers passed for auth, cookies, etc. (future use)
- Context available in all procedures via `ctx.db`, `ctx.headers`

### 6. Response Returns to Client

**Flow:**
- Error formatter flattens Zod errors (if any)
- Procedure result serialized via SuperJSON
- Response streamed through `httpBatchStreamLink`
- React Query updates cache
- Component re-renders with new data

## Server Component Call Flow

```typescript
// Example RSC call
import { api } from "@/trpc/server";

export default async function MyComponent() {
  const data = await api.match.getAnalysis({ matchId: "123" });
  return <div>{JSON.stringify(data)}</div>;
}
```

**What happens:**
- `src/trpc/server.ts` creates caller with `React.cache()`
- Direct server-side call (no HTTP)
- Data fetched and rendered on server
- Hydrated to client via `HydrateClient` (if needed)
- No network latency, faster than client calls

## Key Architectural Patterns

### 1. Singleton Query Client (Client)

```typescript
// src/trpc/react.tsx:13-23
let clientQueryClientSingleton: QueryClient | undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    return createQueryClient(); // New instance on server
  }
  clientQueryClientSingleton ??= createQueryClient(); // Singleton on browser
  return clientQueryClientSingleton;
};
```

**Why:** Prevents React Query cache resets on hot reloads in development.

### 2. Cached RSC Caller (Server)

```typescript
// src/trpc/server.ts:15-25
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");
  return createTRPCContext({ headers: heads });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);
```

**Why:** `React.cache()` ensures single instance per request lifecycle (not per file import).

### 3. Database Singleton Pattern

```typescript
// src/server/db.ts (implied from context usage)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

**Why:** Prevents connection pool exhaustion during hot reloads in development.

## When to Use RSC vs Client Calls

### Use RSC (`api.router.procedure()`) when:
- Data needed for initial page render (SSR)
- Component is already server-side
- No user interaction required
- Data fetch should happen server-side

### Use Client Calls (`api.router.procedure.useQuery()`) when:
- Need React Query caching and invalidation
- Data depends on user interaction
- Need optimistic updates for mutations
- Component needs reactivity to cache changes

### Client Mutation with Chain

```typescript
// src/app/page.tsx:58-93
const fetchRawMatch = api.match.fetchRawMatch.useMutation({
  onSuccess: async (result, variables) => {
    if (result.status === "stored") {
      await sanitizeMatch.mutateAsync({ matchId: variables.matchId });
      await enrichMatch.mutateAsync({ matchId: variables.matchId });
      await computeStats.mutateAsync({ matchId: variables.matchId });
      await queryClient.invalidateQueries({
        queryKey: ["match.getMatchData", { matchId: variables.matchId }],
      });
      setSubmittedMatchId(variables.matchId);
      console.log("[RUN ANALYSIS] Queries invalidated, triggering render");
    }
  },
  onError: (error) => {
    toast.error(`Failed to analyze match: ${error.message}`);
  },
});
```

**Pattern:** Chain mutations with invalidation to trigger re-renders after writes.