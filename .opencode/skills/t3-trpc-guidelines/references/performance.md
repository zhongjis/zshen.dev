# tRPC Performance Optimization

## Batching: Automatic Request Chaining

### What is Batching?

Batching combines multiple concurrent tRPC requests into a single HTTP request, reducing network overhead and latency.

### How It Works

```typescript
// Client component - three queries
const matchData = api.match.getMatchData.useQuery({ matchId: "123" });
const analysis = api.match.getAnalysis.useQuery({ matchId: "123" });
const performance = api.match.getPerformance.useQuery({ matchId: "123" });

// All three requests batched into single HTTP request at `/api/trpc`
// Responses streamed back as they become available
```

### Configuration

From `src/trpc/react.tsx:52-61`:

```typescript
httpBatchStreamLink({
  transformer: SuperJSON,
  url: getBaseUrl() + "/api/trpc",
  // No config needed - auto-batches concurrent requests
}),
```

**Why Streaming?**
- Responses start streaming as soon as first procedure completes
- No waiting for all procedures to finish
- Better perceived performance than batching without streaming

**When NOT Batched:**
- Mutations never batched (fire immediately)
- Queries with `refetchOnMount: false` or disabled via `enabled`
- Manual `mutation.mutate()` calls (not useMutation hooks)

## Stale Time: When to Refetch

### Current Configuration

From `src/trpc/query-client.ts:13`:

```typescript
staleTime: 30 * 1000,  // 30 seconds
```

### What is Stale Time?

Time (in milliseconds) that cached data is considered "fresh." No refetch needed.

### Behavior

1. **Fresh (<30s old):** Use cached data immediately, no network request
2. **Stale (>30s old):** Return cached data to user, then refetch in background
3. **Cache Miss:** Fetch from network, store in cache with timestamp

### Why 30 seconds?

Balances freshness and performance:

- **SSR Hydration:** Data fetched in Server Component remains fresh when client hydrates (no immediate refetch)
- **Short Cache (1-5s):** Too aggressive, triggers unnecessary refetches
- **Long Cache (5min+):** Data too stale, users see outdated info
- **30s:** Sweet spot for most use cases

### Customizing Stale Time

```typescript
// Per-query override
const data = api.match.getMatchData.useQuery(
  { matchId: "123" },
  {
    staleTime: 60 * 1000,  // 1 minute (longer for less frequent updates)
  },
);

// Global override (not in project but possible)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Global 60s
    },
  },
});
```

### Use Cases

| Data Type | Recommended Stale Time |
|-----------|----------------------|
| Real-time match data | 5-15s |
| User profile | 5-10min |
| Static config | Infinity |
| Analytics aggregates | 1-5min |
| Leaderboard | 30-60s |

## Prefetching and Hydration

### Prefetch in Server Components

```typescript
import { api, HydrateClient } from "@/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  // Prefetch for Client Component
  await api.match.getMatchData.prefetch({ matchId: params.id });
  await api.match.getAnalysis.prefetch({ matchId: params.id });

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

### How It Works

1. Server calls `prefetch()` - executes procedure + stores in QueryClient cache
2. `HydrateClient` serializes cache and embeds in HTML
3. Client browser rehydrates from dehydrated state (SuperJSON transforms data)
4. Client requests already in cache, no initial network call overhead

### Benefits

- **No Initial Loading State** - Data available immediately on client
- **Faster Perceived Performance** - User sees data without waiting
- **Smaller Bundle** - No duplicated data fetching on server and client
- **Type-Safe** - Same types as `useQuery` calls

### When Not to Prefetch

- Data rarely used (prefetch cost > benefit)
- Data changes frequently (prefetch outdated quickly)
- Client-only features (no SSR benefit)

## Query Invalidation

### Manual Invalidation

```typescript
const queryClient = useQueryClient();

// Invalidate specific query
await queryClient.invalidateQueries({
  queryKey: [["match", "getMatchData"], { matchId: "123" }],
});

// Invalidate all queries in router
await queryClient.invalidateQueries({
  queryKey: [["match"]],
});

// Invalidate with predicate
await queryClient.invalidateQueries({
  predicate: (query) => {
    return query.queryKey[0]?.[0] === "match";
  },
});
```

### Post-Mutation Invalidation Pattern

From `src/app/page.tsx:62-93`:

```typescript
const fetchRawMatch = api.match.fetchRawMatch.useMutation({
  onSuccess: async (result, variables) => {
    if (result.status === "stored") {
      try {
        await sanitizeMatch.mutateAsync({ matchId: variables.matchId });
        await enrichMatch.mutateAsync({ matchId: variables.matchId });
        await computeStats.mutateAsync({ matchId: variables.matchId });

        // Invalidate queries dependent on match data
        await queryClient.invalidateQueries({
          queryKey: ["match.getMatchData", { matchId: variables.matchId }],
        });

        setSubmittedMatchId(variables.matchId);
      } catch (error) {
        // ... handle error
      }
    }
  },
});
```

**Pattern:**
1. Mutation completes successfully
2. Invalidate queries that depend on invalidated data
3. Components using those queries re-fetch and re-render

### Automatic Invalidation (Not in Project but Useful)

```typescript
const mutation = api.item.create.useMutation({
  onSuccess: () => {
    queryClient.refetchQueries({
      queryKey: [["item", "getList"]],
    });
  },
});
```

**Note:** `invalidateQueries` marks data as stale (background refetch). `refetchQueries` immediately re-fetches (blocks UI).

## React Query Caching Strategies

### Cache Key Structure

tRPC automatically generates cache keys from router and procedure names:

```
[["match", "getMatchData"], { matchId: "123" }]
[["match", "getAnalysis"], { matchId: "123" }]
[["match", "getPerformance"], { matchId: "123" }]
```

**Key Parts:**
1. Router name: `match`
2. Procedure name: `getMatchData`, `getAnalysis`, etc.
3. Input parameters: `{ matchId: "123" }`

### Shared Data Across Procedures

```typescript
// Cache reuse: same matchId
const matchData = api.match.getMatchData.useQuery({ matchId: "123" });
const analysis = api.match.getAnalysis.useQuery({ matchId: "123" });

// Different inputs different cache
const matchA = api.match.getMatchData.useQuery({ matchId: "123" });
const matchB = api.match.getMatchData.useQuery({ matchId: "456" });
```

### Garbage Collection

**Default Behavior:** Cached queries removed after 5 minutes of inactivity unless `gcTime` overridden.

```typescript
// Override garbage collection time
const data = api.match.getMatchData.useQuery(
  { matchId: "123" },
  {
    gcTime: 60 * 60 * 1000, // 1 hour (not in project but possible)
  },
);
```

**Note:** In React Query v5, `cacheTime` renamed to `gcTime`.

## Optimistic Updates

### Pattern for Instant Feedback

```typescript
const mutation = api.item.update.useMutation({
  // Before mutation: snapshot current data
  onMutate: async (newItem) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({
      queryKey: [["item", "getById"], { id: newItem.id }],
    });

    // Snapshot previous value
    const previousData = queryClient.getQueryData([["item", "getById"], { id: newItem.id }]);

    // Optimistically update
    queryClient.setQueryData([["item", "getById"], { id: newItem.id }], (old) => ({
      ...old,
      ...newItem,
    }));

    // Return context for rollback
    return { previousData };
  },

  // Error: Roll back to previous value
  onError: (error, newItem, context) => {
    queryClient.setQueryData(
      [["item", "getById"], { id: newItem.id }],
      context.previousData,
    );
  },

  // Success: Refetch from server
  onSettled: () => {
    queryClient.invalidateQueries({
      queryKey: [["item", "getById"], { id: newItem.id }],
    });
  },
});
```

**When to Use:**
- Immediate user feedback needed (e.g., form submissions)
- Mutations likely to succeed (low failure rate)
- Rollback cost negligible

## Polling and Real-Time Updates

### Auto-Polling

```typescript
const data = api.match.getMatchData.useQuery(
  { matchId: "123" },
  {
    refetchInterval: 5000, // Poll every 5 seconds
  },
);
```

### Window Focus Polling (Default)

```typescript
const data = api.match.getMatchData.useQuery(
  { matchId: "123" },
  {
    refetchOnWindowFocus: true, // Default (refetch when tab focused)
  },
);
```

### Disable Unwanted Refetches

```typescript
const data = api.match.getMatchData.useQuery(
  { matchId: "123" },
  {
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Don't refetch on mount
    refetchOnReconnect: false, // Don't refetch on reconnect
  },
);
```

## Infinite Queries (Pagination)

### Basic Setup

```typescript
const { data, fetchNextPage, hasNextPage } = api.match.list.useInfiniteQuery(
  { limit: 20 },
  {
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor; // Return undefined for last page
    },
  },
);

return (
  <div>
    {data?.pages.map((page) =>
      page.items.map((match) => (
        <div key={match.id}>{match.matchId}</div>
      )),
    )}

    {hasNextPage && <button onClick={() => fetchNextPage()}>Load More</button>}
  </div>
);
```

### Procedure Implementation

```typescript
list: publicProcedure.input(z.object({ limit, cursor })).query(async ({ ctx, input }) => {
  const items = await ctx.db.match.findMany({
    take: input.limit + 1, // Take one extra to check if more pages exist
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy: { createdAt: "desc" },
  });

  const nextCursor = items.length > input.limit ? items[items.length - 1].id : undefined;

  return {
    items: items.slice(0, input.limit),
    nextCursor,
  };
})
```

## Performance Monitoring

### Timing Middleware (Built-in)

From `src/server/api/trpc.ts:82-97`:

```typescript
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});
```

**Logs:**
```
[TRPC] match.getMatchData took 245ms to execute
[TRPC] match.getAnalysis took 156ms to execute
[TRPC] match.fetchRawMatch took 412ms to execute
```

**What to Monitor:**
- Slow procedures (>500ms): Optimize DB queries or add caching
- Waterfalls: Sequential calls that should be parallel
- Hot reloads: Unexpected cache invalidations

### Custom Performance Logging

```typescript
export const myRouter = createTRPCRouter({
  expensiveQuery: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const start = Date.now();

      const data = await ctx.db.table.findUnique({ ... });

      const end = Date.now();
      console.log(`[PERF] expensiveQuery for ${input.id} took ${end - start}ms`);

      return data;
    }),
});
```

## Waterfall Detection

### Problem: Sequential Calls

```typescript
// BAD: Sequential calls (waterfall)
const matchData = api.match.getMatchData.useQuery({ matchId: "123" });

// Waits for matchData to complete
const analysis = api.match.getAnalysis.useQuery({
  matchId: matchData.data?.matchId, // Dependency waterfall
});
```

### Solution: Parallel Calls

```typescript
// GOOD: Parallel calls
const matchData = api.match.getMatchData.useQuery({ matchId: "123" });
const analysis = api.match.getAnalysis.useQuery({ matchId: "123" }); // No dependency

// Both batched into single request
```

### Identifying Waterfalls

1. Check timing middleware logs
2. Look for `isLoading` states preventing other queries
3. Use Chrome DevTools Network tab
4. Check if `enabled: !!condition` delays queries unnecessarily

## Common Performance Pitfalls

### ❌ Too Frequent Polling

```typescript
const data = api.match.getMatchData.useQuery(
  { matchId: "123" },
  {
    refetchInterval: 100, // Every 100ms (overkill)
  },
);
```

**Fix:** Reduce to reasonable interval (5-60s depending on use case).

### ❌ Premature Invalidation

```typescript
const mutation = api.item.create.useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [["item"]] }); // Broad scope
  },
});
```

**Fix:** Invalidate only affected queries:

```typescript
queryClient.invalidateQueries({
  queryKey: [["item", "getList"]],
});
```

### ❌ Missing Prefetch

```typescript
// Server Component
export default async function Page({ params }) {
  // No prefetch - Client fetches data
  return <ClientView matchId={params.id} />;
}
```

**Fix:** Prefetch for hydration.

### ❌ Over-Fetching

```typescript
// Fetch all fields when only name needed
const item = await ctx.db.item.findUnique({
  where: { id: input.id },
  // Missing `select` - fetches all columns
});
```

**Fix:** Use `select` to fetch only needed fields.

### ❌ N+1 Query Problem

```typescript
// In procedure
for (const itemId of itemIds) {
  const item = await ctx.db.item.findUnique({ where: { id: itemId } }); // N queries
}
```

**Fix:** Use single query with `in` operator:

```typescript
const items = await ctx.db.item.findMany({
  where: { id: { in: itemIds } },
}); // 1 query
```

## Performance Checklist

For new features:

- [ ] Are queries batched (`httpBatchStreamLink`)?
- [ ] Is `staleTime` appropriate for data type?
- [ ] Can queries run in parallel (no waterfalls)?
- [ ] Are procedures monitored via timing middleware?
- [ ] Is only necessary data fetched (`select` clauses)?
- [ ] Are invalidations scoped to affected queries only?
- [ ] Can expensive queries be cached or computed lazily?
- [ ] Are polling intervals reasonable?
- [ ] Can hot paths be optimized (profiling needed)?
- [ ] Are N+1 query problems avoided?

## Optimization Steps

1. **Measure:** Use timing middleware logs to identify slow procedures (>500ms)
2. **Analyze:** Check for N+1 queries, sequential calls, over-fetching
3. **Optimize:** Add caching (Redis, CDN), batch queries, prefetch data
4. **Validate:** Rerun with timing middleware, verify improvements
5. **Monitor:** Keep logs, track performance degradation over time

### Tools to Use

- **Timing Middleware:** Built-in execution time measurement
- **Chrome DevTools:** Network tab, Performance tab
- **React Query DevTools:** Cache state, query status, dependency graph
- **Prisma Studio:** Inspect database queries during development
- **Vitest (Future):** Performance tests for procedures (not yet in project)