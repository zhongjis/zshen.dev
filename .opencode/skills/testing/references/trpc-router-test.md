# tRPC Router Testing

Testing tRPC routers involves mocking the Prisma context and verifying API behavior.

## Overview

tRPC routers should be tested by:
1. Mocking `ctx.db` (Prisma client)
2. Mocking `ctx` context data (auth, user info)
3. Calling router procedures directly
4. Asserting on returned data or errors

## Setup

### Create Test Helpers

```typescript
// test/trpc.test-utils.ts
import { createContext } from '@/server/api/trpc'
import { mockDeep } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

export function createTestContext(overrides = {}) {
  return {
    ...createContext(),
    db: mockDeep<PrismaClient>(overrides),
  }
}
```

### Mock Prisma Responses

```typescript
mockDeep<PrismaClient>({
  match: {
    findMany: mockResolvedValue(testMatches),
    findUnique: mockResolvedValue(testMatch),
    create: mockResolvedValue(newMatch),
  }
})
```

## Testing Queries

### Basic Query Test

```typescript
import { appRouter } from '@/server/api/root'
import { createTestContext } from '@/test/trpc.test-utils'

describe('matches query', () => {
  it('should fetch all matches', async () => {
    // Arrange
    const ctx = createTestContext({
      db: {
        match: {
          findMany: vi.fn().mockResolvedValueOnce([
            { id: 1, radiantTeam: 'Team A' }
          ])
        }
      }
    })

    // Act
    const result = await appRouter.matches.query({ ctx })
    const caller = appRouter.createCaller(ctx)

    // Assert
    expect(result.matches).toHaveLength(1)
  })
})
```

### Query with Parameters

```typescript
it('should fetch match by id', async () => {
  const ctx = createTestContext()
  const caller = appRouter.createCaller(ctx)

  const match = await caller.match.getById({ id: 'match-123' })

  expect(match?.id).toBe('match-123')
  expect(ctx.db.match.findUnique).toHaveBeenCalledWith({
    where: { id: 'match-123' }
  })
})
```

### Query with Filters

```typescript
it('should filter matches by hero', async () => {
  const ctx = createTestContext()
  const caller = appRouter.createCaller(ctx)

  const matches = await caller.match.list({
    heroName: 'Pudge'
  })

  expect(matches.every(m => m.hero === 'Pudge')).toBe(true)
})
```

## Testing Mutations

### Create Mutation

```typescript
it('should create a new match', async () => {
  const ctx = createTestContext()
  const caller = appRouter.createCaller(ctx)

  const newMatch = await caller.match.create({
    radiantTeam: 'Team A',
    direTeam: 'Team B'
  })

  expect(newMatch.id).toBeDefined()
  expect(ctx.db.match.create).toHaveBeenCalledWith({
    data: expect.any(Object)
  })
})
```

### Update Mutation

```typescript
it('should update an existing match', async () => {
  const ctx = createTestContext()
  const caller = appRouter.createCaller(ctx)

  const updated = await caller.match.update({
    id: 'match-123',
    winner: 'radiant'
  })

  expect(updated.winner).toBe('radiant')
})
```

### Delete Mutation

```typescript
it('should delete a match', async () => {
  const ctx = createTestContext()
  const caller = appRouter.createCaller(ctx)

  const deleted = await caller.match.delete({ id: 'match-123' })

  expect(deleted).toBeNull()
  expect(ctx.db.match.delete).toHaveBeenCalledWith({
    where: { id: 'match-123' }
  })
})
```

## Testing Authorization

### Admin-Only Routes

```typescript
it('should throw when non-admin tries to delete', async () => {
  const ctx = createTestContext({
    user: { id: 'user-123', role: 'user' }
  })
  const caller = appRouter.createCaller(ctx)

  await expect(
    caller.admin.deleteMatch({ id: 'match-123' })
  ).rejects.toThrow('UNAUTHORIZED')
})

it('should allow admin to delete', async () => {
  const ctx = createTestContext({
    user: { id: 'admin-456', role: 'admin' }
  })
  const caller = appRouter.createCaller(ctx)

  const result = await caller.admin.deleteMatch({ id: 'match-123' })

  expect(result).toBeDefined()
})
```

## Testing Errors

### Not Found Errors

```typescript
it('should throw not found when match does not exist', async () => {
  const ctx = createTestContext({
    db: {
      match: {
        findUnique: vi.fn().mockResolvedValueOnce(null)
      }
    }
  })
  const caller = appRouter.createCaller(ctx)

  await expect(
    caller.match.getById({ id: 'nonexistent' })
  ).rejects.toThrow('Match not found')
})
```

### Validation Errors

```typescript
it('should throw validation error for invalid input', async () => {
  const ctx = createTestContext()
  const caller = appRouter.createCaller(ctx)

  await expect(
    caller.match.create({ radiantTeam: '' })
  ).rejects.toThrow('Validation error')
})
```

## Testing Side Effects

### External API Calls

```typescript
it('should call OpenDota API when fetching match', async () => {
  const ctx = createTestContext()
  const caller = appRouter.createCaller(ctx)

  // Mock fetch
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({ match_id: 123, radiant_win: true })
  } as Response)

  await caller.match.fetchFromOpenDota({ matchId: 123 })

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('api.opendota.com')
  )
})
```

### Database Effects

```typescript
it('should create related records', async () => {
  const ctx = createTestContext()
  const caller = appRouter.createCaller(ctx)

  await caller.match.create({
    radiantTeam: 'Team A',
    players: [{ name: 'Player1' }]
  })

  expect(ctx.db.player.create).toHaveBeenCalled()
  expect(ctx.db.match.create).toHaveBeenCalled()
})
```

## Testing Data Transformations

### Computed Fields

```typescript
it('should compute match duration', async () => {
  const ctx = createTestContext({
    db: {
      match: {
        findUnique: vi.fn().mockResolvedValueOnce({
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T10:45:00Z')
        })
      }
    }
  })
  const caller = appRouter.createCaller(ctx)

  const match = await caller.match.getById({ id: 'match-123' })

  expect(match.durationMinutes).toBe(45)
})
```

## Performance Testing

### Query Performance

```typescript
it('should fetch matches in under 100ms', async () => {
  const ctx = createTestContext()
  const caller = appRouter.createCaller(ctx)

  const start = performance.now()
  await caller.match.list({ limit: 100 })
  const duration = performance.now() - start

  expect(duration).toBeLessThan(100)
})
```

## Complete Example

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { appRouter } from '@/server/api/root'
import { createTestContext } from '@/test/trpc.test-utils'

describe('match router', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getById', () => {
    it('should return match data', async () => {
      const ctx = createTestContext({
        db: {
          match: {
            findUnique: vi.fn().mockResolvedValueOnce({
              id: 'match-123',
              radiantTeam: 'Team A',
              direTeam: 'Team B'
            })
          }
        }
      })

      const caller = appRouter.createCaller(ctx)
      const match = await caller.match.getById({ id: 'match-123' })

      expect(match?.id).toBe('match-123')
      expect(ctx.db.match.findUnique).toHaveBeenCalledWith({
        where: { id: 'match-123' },
        include: expect.any(Object)
      })
    })

    it('should throw when match not found', async () => {
      const ctx = createTestContext({
        db: {
          match: {
            findUnique: vi.fn().mockResolvedValueOnce(null)
          }
        }
      })

      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.match.getById({ id: 'invalid' })
      ).rejects.toThrow('Match not found')
    })
  })

  describe('create', () => {
    it('should create match successfully', async () => {
      const ctx = createTestContext()
      const caller = appRouter.createCaller(ctx)

      const match = await caller.match.create({
        radiantTeam: 'Team A',
        direTeam: 'Team B'
      })

      expect(match.id).toBeDefined()
      expect(ctx.db.match.create).toHaveBeenCalled()
    })

    it('should validate input', async () => {
      const ctx = createTestContext()
      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.match.create({ radiantTeam: '' })
      ).rejects.toThrow()
    })
  })
})
```

## Common Patterns

### Default Mock Behavior

```typescript
// Setup default mocks in test setup
beforeEach(() => {
  ctx.db.match.findMany.mockResolvedValue([])
  ctx.db.match.findUnique.mockResolvedValue(null)
  ctx.db.match.create.mockRejectedValue(new Error('Not mocked'))
})
```

### Test Data Builders

```typescript
// test/builders.ts
export function buildMatch(overrides = {}) {
  return {
    id: 'match-123',
    radiantTeam: 'Team A',
    direTeam: 'Team B',
    winner: 'radiant',
    ...overrides
  }
}

// Usage
const testMatch = buildMatch({ winner: 'dire' })
```

## Run Specific Tests

```bash
# Test specific router
bun test src/server/api/routers/match.test.ts

# Test specific procedure
bun test -t "should create match"
```