# Calling tRPC from React Components

## Server Component (RSC) Calls

### Basic Query Call

```typescript
import { api } from "@/trpc/server";

export default async function MyPage() {
  const data = await api.match.getMatchData({
    matchId: "7892345121",
  });

  return <div>{JSON.stringify(data)}</div>;
}
```

**Characteristics:**
- Direct server call (no HTTP, no fetch)
- Data fetched and rendered on server
- Type-safe with full inference
- Automatically dehydrated to client via Next.js streaming
- Faster than client calls (no network latency)

### Prefetching for Client Hydration

```typescript
import { api, HydrateClient } from "@/trpc/server";

export default async function Page() {
  // Prefetch data for client components
  await api.match.getAnalysis.prefetch({ matchId: "123" });

  return (
    <div>
      <HydrateClient>
        <ClientComponent />
      </HydrateClient>
    </div>
  );
}
```

**How it works:**
- `prefetch()` stores data in QueryClient cache
- `HydrateClient` component serializes cache to HTML
- Client rehydrates from dehydrated state (no initial fetch)
- Seamless transition from server-rendered data to client interactivity

### Multiple Parallel Queries

```typescript
export default async function Page() {
  const [matchData, analysis, performance] = await Promise.all([
    api.match.getMatchData({ matchId: "123" }),
    api.match.getAnalysis({ matchId: "123" }),
    api.match.getPerformance({ matchId: "123" }),
  ]);

  return (
    <div>
      {/* Use all data */}
    </div>
  );
}
```

**Note:** Use `Promise.all()` for parallel queries. tRPC doesn't auto-parallelize in RSC context.

### Error Handling in RSC

```typescript
export default async function Page() {
  try {
    const data = await api.match.getById({ id: "123" });
    return <div>{JSON.stringify(data)}</div>;
  } catch (error) {
    // TRPCError not directly accessible in RSC
    // Use error boundary or conditional rendering
    return <div>Error loading data</div>;
  }
}
```

**Limitation:** Can't catch `TRPCError` directly in RSC. Use error boundaries (Next.js App Router automatic) or handle via try-catch with generic fallback.

## Client Component Calls

### Basic Query

```typescript
"use client";

import { api } from "@/trpc/react";

export default function MyComponent() {
  const { data, isLoading, error } = api.match.getMatchData.useQuery({
    matchId: "7892345121",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### Conditional Queries with `enabled`

```typescript
// From src/app/page.tsx:38-53
const [submittedMatchId, setSubmittedMatchId] = useState<string | null>(null);

const matchData = api.match.getMatchData.useQuery(
  { matchId: submittedMatchId! },
  { enabled: !!submittedMatchId }, // Only query when submittedMatchId exists
);
```

**When to use:**
- Query depends on user input
- Query depends on previous data
- Need to delay query execution

### Multiple Client Queries

```typescript
export default function Dashboard() {
  const matchData = api.match.getMatchData.useQuery({ matchId: "123" });
  const analysis = api.match.getAnalysis.useQuery({ matchId: "123" });

  // Both queries batched automatically via httpBatchStreamLink
  // React Query caches independently

  if (matchData.isLoading || analysis.isLoading) return <div>Loading...</div>;

  return <div>{/* Use data */}</div>;
}
```

**Automatic Batching:** React Query + `httpBatchStreamLink` automatically batches concurrent requests into single HTTP request.

### Mutations

```typescript
export default function CreateForm() {
  const mutation = api.match.create.useMutation({
    onSuccess: (data) => {
      console.log("Created:", data);
      toast.success("Item created");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
  });

  const handleSubmit = () => {
    mutation.mutate({ name: "New Item" });
  };

  return (
    <button onClick={handleSubmit} disabled={mutation.isPending}>
      {mutation.isPending ? "Creating..." : "Create"}
    </button>
  );
}
```

### Mutation with Async Chaining

```typescript
// From src/app/page.tsx:58-93
const fetchRawMatch = api.match.fetchRawMatch.useMutation({
  onSuccess: async (result, variables) => {
    if (result.status === "stored") {
      try {
        // Chain multiple mutations
        await sanitizeMatch.mutateAsync({ matchId: variables.matchId });
        await enrichMatch.mutateAsync({ matchId: variables.matchId });
        await computeStats.mutateAsync({ matchId: variables.matchId });

        // Invalidate queries to trigger re-renders
        await queryClient.invalidateQueries({
          queryKey: ["match.getMatchData", { matchId: variables.matchId }],
        });

        setSubmittedMatchId(variables.matchId);
      } catch (error) {
        toast.error(`Failed to process match: ${error.message}`);
      }
    }
  },
});
```

**Note:** Use `.mutateAsync()` in `.onSuccess` callback for sequential operations. Use standard `.mutate()` outside callbacks.

### Optimistic Updates (Not in Project but Common)

```typescript
const mutation = api.item.update.useMutation({
  onMutate: async (newItem) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["item", "list"] });

    // Snapshot previous value
    const previousData = queryClient.getQueryData(["item", "list"]);

    // Optimistically update to new value
    queryClient.setQueryData(["item", "list"], (old) => ({
      ...old,
      items: old.items.map((item) =>
        item.id === newItem.id ? { ...item, ...newItem } : item,
      ),
    }));

    // Return context with previous data
    return { previousData };
  },
  onError: (err, newItem, context) => {
    // Roll back to previous value on error
    queryClient.setQueryData(["item", "list"], context.previousData);
  },
  onSettled: () => {
    // Refetch to ensure server state
    queryClient.invalidateQueries({ queryKey: ["item", "list"] });
  },
});
```

## Type Inference

### Helper Types

```typescript
import type { RouterInputs, RouterOutputs } from "@/trpc/react";

// Infer input types
type GetMatchDataInput = RouterInputs["match"]["getMatchData"];
// { matchId: string }

// Infer output types
type GetMatchDataOutput = RouterOutputs["match"]["getMatchData"];
// { result: ..., metadata: ..., ... }
```

### Type-Safe Component Props

```typescript
type Props = {
  matchId: RouterInputs["match"]["getMatchData"]["matchId"];
};

export default function MatchInfo({ matchId }: Props) {
  const data = api.match.getMatchData.useQuery({ matchId });
  return <div>{JSON.stringify(data)}</div>;
}
```

## Prefetching and Hydration

### Prefetch in Server Components

```typescript
import { api, HydrateClient } from "@/trpc/server";
import ClientComponent from "./ClientComponent";

export default async function Page() {
  const matchId = "123";

  // Prefetch for client component
  await api.match.getMatchData.prefetch({ matchId });
  await api.match.getAnalysis.prefetch({ matchId });

  return (
    <div>
      <HydrateClient>
        <ClientComponent matchId={matchId} />
      </HydrateClient>
    </div>
  );
}
```

### Client Component Uses Prefetched Data

```typescript
"use client";

import { api } from "@/trpc/react";

export default function ClientComponent({ matchId }: { matchId: string }) {
  // Data already prefetched, no loading state
  const matchData = api.match.getMatchData.useQuery({ matchId });
  const analysis = api.match.getAnalysis.useQuery({ matchId });

  if (!matchData.data || !analysis.data) return <div>Loading...</div>;

  return <div>{/* Data already available */}</div>;
}
```

**Benefits:**
- No initial loading state on client
- Faster perceived performance
- Seamless hydration
- Type-safe prefetch (same API as queries)

## Common Patterns

### Query Invalidation

```typescript
const queryClient = useQueryClient();

const mutation = api.item.create.useMutation({
  onSuccess: () => {
    // Invalidate specific query
    queryClient.invalidateQueries({ queryKey: [["item", "get"]] });

    // Invalidate all queries in router
    queryClient.invalidateQueries({ queryKey: [["item"]] });

    // Invalidate with predicate
    queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey.includes("item");
      },
    });
  },
});
```

### Refetching

```typescript
const { data, refetch } = api.item.getById.useQuery({ id: "123" });

const handleRefresh = () => {
  refetch(); // Manual refetch
};
```

### Polling (Auto-Refresh)

```typescript
const { data } = api.match.getMatchData.useQuery(
  { matchId: "123" },
  {
    refetchInterval: 5000, // Poll every 5 seconds
  },
);
```

### Infinite Queries (Pagination)

```typescript
const { data, fetchNextPage, hasNextPage } = api.match.list.useInfiniteQuery(
  { limit: 10 },
  {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  },
);

return (
  <div>
    {data?.pages.map((page) =>
      page.items.map((item) => <div key={item.id}>{item.name}</div>),
    )}
    {hasNextPage && <button onClick={() => fetchNextPage()}>Load More</button>}
  </div>
);
```

## When to Use Which

| Scenario | Recommended Approach |
|----------|---------------------|
| Data needed for SSR | RSC call (`await api.router.procedure()`) + prefetch for client |
| Data only used in client | Client React Query (`.useQuery()`) |
| User form submission | Mutation with `.onSuccess` callback |
| Sequential operations | Chained mutations with `.mutateAsync()` |
| Prefetching for interactivity | `HydrateClient` + `prefetch()` in RSC |
| Optimistic UI feedback | Mutation with `onMutate` rollback |
| Background polls | Query with `refetchInterval` |
| Infinite scroll | `.useInfiniteQuery()` |

## Troubleshooting

### Data Not Loading
- Check `enabled` option condition
- Verify context provider wraps app
- Check network tab for HTTP errors
- Use loggerLink for debugging (enabled in dev)

### Stale Data
- Check `staleTime` config (`src/trpc/query-client.ts:13`)
- Manually invalidate queries after mutations
- Use `refetchOnWindowFocus: false` if not needed

### Hydration Mismatch
- Ensure client and server use same data format
- Check SuperJSON transformer consistency
- Verify `HydrateClient` usage

### Too Many Requests
- React Query auto-batches; check if manual requests
- Use `refetchOnMount: false` if not needed
- Check for redundant queries in component tree