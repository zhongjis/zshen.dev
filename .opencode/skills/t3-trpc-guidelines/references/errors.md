# Error Handling with tRPC

## TRPCError Codes

### Full List

- `INTERNAL_SERVER_ERROR` - Server-side error (default fallback)
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `BAD_REQUEST` - Invalid request/input
- `UNPROCESSABLE_CONTENT` - Input validation failed (Zod)
- `CONFLICT` - Resource conflict (duplicate key, etc.)
- `TOO_MANY_REQUESTS` - Rate limit exceeded
- `METHOD_NOT_SUPPORTED` - HTTP method not allowed
- `PAYLOAD_TOO_LARGE` - Request body too big

## Basic Error Throwing

### Import and Usage

```typescript
import { TRPCError } from "@trpc/server";

export const myRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.table.findUnique({
        where: { id: input.id },
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Item not found",
        });
      }

      return item;
    }),
});
```

## Project-Specific Error Examples

### Not Found (Data Missing)

From `src/server/api/routers/match.ts:213-216,224-229`:

```typescript
// Example 1: Raw match data missing
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

// Example 2: Enriched data missing
const match = await ctx.db.enrichedMatchData.findUnique({
  where: { matchId },
  select: { matchId: true, enrichedData: true },
});
if (!match) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: `Enriched match data not found: ${matchId}`,
  });
}
```

**Pattern:** Check `null`/`undefined` after `findUnique` or `findFirst`. Throw `NOT_FOUND` with descriptive message.

### Missing Prerequisite Data

From `src/server/api/routers/match.ts:258-266`:

```typescript
const sanitized = await ctx.db.sanitizedMatchData.findUnique({
  where: { matchId },
});
if (!sanitized) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: `Sanitized match data not found for matchId: ${matchId}`,
  });
}
```

**Pattern:** Chain of data dependencies (raw → sanitized → enriched → computed). Throw appropriate `NOT_FOUND` when prerequisite missing.

### Polling Failures (Background Processing)

From `src/server/api/routers/match.ts:515-523`:

```typescript
pollForParsedMatch(matchId, ctx.db).catch((pollError) => {
  console.error(
    `[fetchRawMatch] Polling failed for match ${matchId}:`,
    pollError,
  );
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: `Failed to poll for parsed match: ${matchId}`,
    cause: pollError,
  });
});
```

**Pattern:** Catch error from async background process, wrap in `TRPCError` with `cause: pollError`. Preserves original error in error chain.

## OpenDota API Error Handling

From `src/server/api/routers/match.ts:528-540`:

```typescript
try {
  const match = await getMatch(matchId);

  // ... processing logic
} catch (error) {
  if (error instanceof OpenDotaApiError) {
    console.error(`[OpenDota] API error fetching match ${matchId}:`, {
      status: error.status,
      statusText: error.statusText,
      responseBody: error.responseBody,
      matchId: error.matchId,
      message: error.message,
    });
  } else {
    console.error(`[OpenDota] Error fetching match ${matchId}:`, error);
  }
  throw error;
}
```

**Pattern:** Distinguish between custom API errors (`OpenDotaApiError`) and generic errors. Log context-rich details for debugging.

## Zod Validation Errors (Automatic)

### Error Formatter

From `src/server/api/trpc.ts:43-52`:

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

**What It Does:**
- Detects `ZodError` in error cause
- Flattens validation errors into structured format
- Client receives `error.data.zodError` with field-level details

### Client-Side Validation Error Handling

```typescript
"use client";

import { api } from "@/trpc/react";

export default function CreateForm() {
  const mutation = api.item.create.useMutation();

  if (mutation.error?.data?.zodError) {
    const zodErrors = mutation.error.data.zodError;

    return (
      <div>
        {Object.entries(zodErrors.fieldErrors).map(([field, messages]) => (
          <div key={field} className="error">
            {field}: {messages?.join(", ")}
          </div>
        ))}
      </div>
    );
  }

  // ... else render正常状态;
}
```

**Example Output:**

```json
{
  "zodError": {
    "fieldErrors": {
      "name": ["Required field", "Min 3 characters"],
      "age": ["Must be at least 18"]
    },
    "formErrors": []
  }
}
```

## Client-Side Error Handling

### Query Errors

```typescript
const { data, error, isLoading } = api.item.getById.useQuery({ id: "123" });

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
return <div>{JSON.stringify(data)}</div>;
```

### Mutation Errors with Toast

From `src/app/page.tsx:84-88,91-92`:

```typescript
const fetchRawMatch = api.match.fetchRawMatch.useMutation({
  onSuccess: async (result, variables) => {
    try {
      // ... chain operations
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to process match: ${message}`);
    }
  },
  onError: (error) => {
    toast.error(`Failed to analyze match: ${error.message}`);
  },
});
```

**Pattern:**
1. `.onSuccess()` catches errors from mutation chain
2. `.onError()` catches errors from the mutation itself
3. Use `toast` for user notification

### Error Boundaries

```typescript
// Next.js App Router: automatic error boundaries
// client components: wrap with error boundary

import { ErrorBoundary } from "@/app/_components/ErrorBoundary";

export default function MyPage() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## Error Response Structure

### Server Response (JSON)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Item not found",
    "data": {
      "code": "NOT_FOUND",
      "httpStatus": 404,
      "path": "item.getById",
      "stack": "[...indev only...]"
    }
  }
}
```

### With Zod Errors

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid input",
    "data": {
      "code": "BAD_REQUEST",
      "httpStatus": 400,
      "zodError": {
        "fieldErrors": {
          "name": ["Required field"]
        }
      }
    }
  }
}
```

## Custom Error Messages

### Not Found Patterns

```typescript
// Generic
throw new TRPCError({
  code: "NOT_FOUND",
  message: "Item not found",
});

// Specific (for better UX)
throw new TRPCError({
  code: "NOT_FOUND",
  message: `Match data not found for matchId: ${matchId}`,
});

// With user suggestion
throw new TRPCError({
  code: "NOT_FOUND",
  message: "Match not found. Did you enter a valid match ID?",
});
```

### Bad Request Patterns

```typescript
// Generic
throw new TRPCError({
  code: "BAD_REQUEST",
  message: "Invalid input",
});

// Specific field
throw new TRPCError({
  code: "BAD_REQUEST",
  message: "Match ID must be a string",
});

// With suggestion
throw new TRPCError({
  code: "BAD_REQUEST",
  message: "Invalid match ID. Expected format: 10-digit number",
});
```

## Error Logging

### Server-Side Logging

```typescript
// From project pattern
console.log(`[OpenDota] Starting fetch for match ${matchId}`);
console.error(`[OpenDota] API error:`, {
  status: error.status,
  statusText: error.statusText,
  responseBody: error.responseBody,
  matchId: error.matchId,
  message: error.message,
});
```

### Timing Middleware Logging (Automatic)

```typescript
// src/server/api/trpc.ts:94
console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

// Output:
// [TRPC] match.getMatchData took 245ms to execute
```

## Error Testing

### Testing Not Found Path

```typescript
// In procedure
if (!item) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Item not found",
  });
}

// Should be tested but not yet implemented in project
// Future: Add Vitest tests in src/server/api/routers/match.test.ts
```

### Testing Validation Errors

```typescript
publicProcedure
  .input(z.object({
    name: z.string().min(3),
  }))
  .mutation(async ({ input }) => {
    // ... process
  })

// Client side: handle zodError
if (mutation.error?.data?.zodError) {
  // Display validation errors
}
```

## Error Recovery Patterns

### Retry Logic (Not in Project but Useful)

```typescript
const { data, error } = api.item.getById.useQuery(
  { id: "123" },
  {
    retry: (failureCount, error) => {
      // Retry on NOT_FOUND up to 2 times
      if (error.data?.code === "NOT_FOUND" && failureCount < 2) {
        return true;
      }
      return false;
    },
  },
);
```

### Fallback UI

```typescript
const { data, error, isLoading } = api.item.getById.useQuery({ id: "123" });

if (isLoading) return <div>Loading...</div>;
if (error) {
  return (
    <div className="error-state">
      <h2>Error loading data</h2>
      <p>{error.message}</p>
      <button onClick={() => refetch()}>Retry</button>
    </div>
  );
}
```

## Common Error Pitfalls

### ❌ Wrong: Silent Failures

```typescript
if (!item) {
  return null; // Client thinks data loaded but got null
}
```

### ✅ Right: Throw TRPCError

```typescript
if (!item) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Item not found",
  });
}
```

### ❌ Wrong: Generic Error Messages

```typescript
throw new TRPCError({
  code: "NOT_FOUND",
  message: "Error",
});
```

### ✅ Right: Specific Messages

```typescript
throw new TRPCError({
  code: "NOT_FOUND",
  message: `Match data not found for matchId: ${input.matchId}`,
});
```

### ❌ Wrong: Missing Error Propagation

```typescript
try {
  await asyncOperation();
} catch (error) {
  console.error(error);
  // Forgot to throw
}

return data; // Returns stale/error state
```

### ✅ Right: Re-Throw

```typescript
try {
  await asyncOperation();
} catch (error) {
  console.error(error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Operation failed",
    cause: error,
  });
}
```

## Error Codes Reference

| Code | HTTP Status | When to Use |
|------|-------------|-------------|
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `UNAUTHORIZED` | 401 | No session/token provided |
| `FORBIDDEN` | 403 | User lacks permission |
| `BAD_REQUEST` | 400 | Invalid input format |
| `UNPROCESSABLE_CONTENT` | 422 | Input validation failed (Zod) |
| `CONFLICT` | 409 | Duplicate key/resource exists |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

## When to use Each Code

1. **User input invalid** → `BAD_REQUEST` / `UNPROCESSABLE_CONTENT`
2. **Resource not found** → `NOT_FOUND`
3. **User not logged in** → `UNAUTHORIZED`
4. **User logged in but no permission** → `FORBIDDEN`
5. **Database constraint violation** → `CONFLICT`
6. **Unexpected error** → `INTERNAL_SERVER_ERROR`