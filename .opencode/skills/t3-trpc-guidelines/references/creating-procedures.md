# Creating tRPC Procedures

## Router Structure

### File: `src/server/api/routers/myRouter.ts`

```typescript
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const myRouter = createTRPCRouter({
  // Query - Data retrieval
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.something.findUnique({
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

  // Query - Collection
  getAll: publicProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.something.findMany({
        take: input.limit,
      });
    }),

  // Mutation - Create
  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.something.create({
        data: { name: input.name },
      });
      return item;
    }),

  // Mutation - Update
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.something.update({
        where: { id: input.id },
        data: { name: input.name },
      });
      return item;
    }),

  // Mutation - Delete
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.something.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
});
```

## Input Validation with Zod

### Basic Fields

```typescript
.input(z.object({
  string: z.string(),
  number: z.number(),
  boolean: z.boolean(),
  optional: z.string().optional(),
  nullable: z.string().nullable(),
}))
```

### String Constraints

```typescript
.input(z.object({
  minLength: z.string().min(3),
  maxLength: z.string().max(100),
  email: z.string().email(),
  url: z.string().url(),
  uuid: z.string().uuid(),
  regex: z.string().regex(/^[A-Z]{3}\d{3}$/),
  enum: z.enum(["active", "inactive", "pending"]),
}))
```

### Number Constraints

```typescript
.input(z.object({
  min: z.number().min(0),
  max: z.number().max(100),
  positive: z.number().positive(),
  negative: z.number().negative(),
  int: z.number().int(), // integer only
  finite: z.number().finite(), // no Infinity or NaN
}))
```

### Object Nesting

```typescript
.input(z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
  }),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
  })),
}))
```

### Transforms and Coercion

```typescript
.input(z.object({
  // Auto-convert string to number
  age: z.string().transform((val) => parseInt(val, 10)),
  // String to date
  date: z.string().transform((val) => new Date(val)),
  // Default value if missing
  role: z.string().default("user"),
  // Coerce to type
  count: z.coerce.number(), // "5" => 5, undefined => 0
}))
```

## Context Usage

### Access Database

```typescript
.query(async ({ ctx }) => {
  // ctx.db is Prisma client singleton
  const items = await ctx.db.table.findMany();
  return items;
})
```

### Access Headers (Future Auth)

```typescript
.query(async ({ ctx }) => {
  const authHeader = ctx.headers.get("authorization");
  if (!authHeader) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing auth header",
    });
  }
  // ... continue
})
```

### Access Session (NextAuth Integration)

```typescript
.query(async ({ ctx }) => {
  const session = await ctx.auth(); // Requires auth setup
  if (!session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }
  // Session has user ID, name, email, etc.
})
```

## Error Handling Patterns

### Standard Errors

```typescript
import { TRPCError } from "@trpc/server";

// Resource not found
if (!item) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Item not found",
  });
}

// Unauthorized access
if (!hasPermission) {
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "You don't have permission",
  });
}

// Validation failed
if (!isValid) {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "Invalid input",
  });
}

// Conflict (duplicate, etc.)
if (exists) {
  throw new TRPCError({
    code: "CONFLICT",
    message: "Item already exists",
  });
}

// Server error
try {
  await someOperation();
} catch (error) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Operation failed",
    cause: error,
  });
}
```

### Zod Error Handling

Error formatter in `src/server/api/trpc.ts:43-52` automatically flattens Zod errors:

```typescript
// Server
.errorFormatter({ shape, error }) {
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

Client receives detailed validation errors:

```typescript
// Client
const result = api.myRouter.create.useMutation();
if (result.error) {
  // result.error.data.zodError.fieldErrors has validation details
  console.error(result.error.data.zodError);
}
```

## Common Patterns from This Project

### Auto-Compute Lazy Queries

From `src/server/api/routers/match.ts:314-366`:

```typescript
getAnalysis: publicProcedure
  .input(z.object({ matchId: z.string() }))
  .query(async ({ ctx, input }) => {
    const { matchId } = input;

    let computedStats = await ctx.db.computedMatchStats.findUnique({
      where: { matchId },
    });

    // Auto-compute if not exists
    if (!computedStats) {
      const match = await ctx.db.sanitizedMatchData.findUnique({
        where: { matchId },
      });
      if (!match) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Sanitized match not found: ${matchId}`,
        });
      }

      const sanitized = JSON.parse(match.sanitizedData);
      const computedData = computeMatchStats(sanitized);

      computedStats = await ctx.db.computedMatchStats.create({
        data: {
          matchId,
          computedVersion: 1,
          // ... other fields
          data: computedData,
        },
      });
    }

    const computed = JSON.parse(computedStats.data) as ComputedMatchStats;
    return transformAnalysisData(computed);
  }),
```

**Pattern:** Query checks cache, computes if missing, returns result. Useful for expensive computations.

### Background Processing

From `src/server/api/routers/match.ts:22-74`:

```typescript
async function pollForParsedMatch(matchId: string, dbInstance: typeof db) {
  const MAX_POLL_TIME = 20 * 60 * 1000; // 20 minutes
  const startTime = Date.now();
  let delay = 5000; // Start with 5 seconds

  try {
    while (Date.now() - startTime < MAX_POLL_TIME) {
      await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        const match = await getMatch(matchId);

        if (match.version !== undefined) {
          await dbInstance.rawMatchData.upsert({
            where: { matchId },
            update: { rawData: JSON.stringify(match), hasParsed: true },
            create: {
              matchId,
              rawData: JSON.stringify(match),
              hasParsed: true,
            },
          });
          return; // Success
        }

        delay = Math.min(delay * 2, 60000); // Exponential backoff
      } catch (error) {
        console.error(`[OpenDota] Polling error:`, error);
        delay = Math.min(delay * 2, 60000);
      }
    }
  } catch (error) {
    console.error(`[pollForParsedMatch] Fatal error:`, error);
    throw error;
  }
}
```

**Pattern:** Async function polls external API with exponential backoff. Called from mutation via `.catch()` to handle errors.

### Mutation Chaining

From `src/app/page.tsx:62-93`:

```typescript
const fetchRawMatch = api.match.fetchRawMatch.useMutation({
  onSuccess: async (result, variables) => {
    if (result.status === "stored") {
      try {
        await sanitizeMatch.mutateAsync({ matchId: variables.matchId });
        await enrichMatch.mutateAsync({ matchId: variables.matchId });
        await computeStats.mutateAsync({ matchId: variables.matchId });
        await queryClient.invalidateQueries({
          queryKey: ["match.getMatchData", { matchId: variables.matchId }],
        });
        setSubmittedMatchId(variables.matchId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to process match: ${message}`);
      }
    }
  },
  onError: (error) => {
    toast.error(`Failed to analyze match: ${error.message}`);
  },
});
```

**Pattern:** One mutation triggers others in `.onSuccess`. Use for sequential operations that depend on each other.

## Database Query Patterns

### Find Unique

```typescript
const item = await ctx.db.table.findUnique({
  where: { id: input.id },
});
```

### Find Many with Filters

```typescript
const items = await ctx.db.table.findMany({
  where: {
    status: "active",
    createdAt: { gte: startDate },
  },
  orderBy: { createdAt: "desc" },
  take: 20,
  skip: input.offset,
});
```

### Create

```typescript
const item = await ctx.db.table.create({
  data: {
    name: input.name,
    ...otherFields,
  },
});
```

### Upsert

```typescript
const item = await ctx.db.table.upsert({
  where: { id: input.id },
  update: {
    name: input.name,
    updatedAt: new Date(),
  },
  create: {
    id: input.id,
    name: input.name,
  },
});
```

### Update

```typescript
const item = await ctx.db.table.update({
  where: { id: input.id },
  data: {
    name: input.name,
  },
});
```

### Delete

```typescript
await ctx.db.table.delete({
  where: { id: input.id },
});
```

### Transactions

```typescript
await ctx.db.$transaction(async (tx) => {
  const item = await tx.item.create({ data: input });
  const log = await tx.log.create({
    data: { itemId: item.id, action: "create" },
  });
  return { item, log };
});
```