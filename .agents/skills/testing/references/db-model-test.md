# Database Model Testing

Testing Prisma models and database operations with Vitest and mock repositories.

## Overview

Database model tests verify:
1. Entity relationships and schema constraints
2. Data validation and transformation logic
3. Query behavior and filtering
4. Computed properties and getters

## Setup

### Mocking Prisma Client

```typescript
// test/prisma-mock.ts
import { mockDeep } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

export const prismaMock = mockDeep<PrismaClient>()
export type PrismaMock = typeof prismaMock
```

### Test Helper Functions

```typescript
// test/builders.ts
export function buildMatch(overrides = {}) {
  return {
    id: 'match-123',
    matchId: 1000000001,
    radiantScore: 25,
    direScore: 22,
    winner: 'radiant' as const,
    startTime: new Date('2024-01-01T10:00:00Z'),
    endTime: new Date('2024-01-01T10:45:00Z'),
    durationSeconds: 2700,
    ...overrides
  }
}

export function buildPlayer(overrides = {}) {
  return {
    id: 'player-123',
    name: 'Player Name',
    personaName: 'Spectre',
    matchId: 'match-123',
    team: 'radiant' as const,
    kills: 12,
    deaths: 4,
    assists: 18,
    heroId: 78, // Spectre
    level: 25,
    ...overrides
  }
}
```

## Testing Model Queries

### Find Many

```typescript
import { prismaMock } from '@/test/prisma-mock'
import { getRecentMatches } from '@/server/db/matches'

describe('getRecentMatches', () => {
  it('should fetch recent matches', async () => {
    // Arrange
    const testMatches = [
      buildMatch({ id: 'match-1' }),
      buildMatch({ id: 'match-2' })
    ]
    prismaMock.match.findMany.mockResolvedValue(testMatches)

    // Act
    const matches = await getRecentMatches({ limit: 10 })

    // Assert
    expect(matches).toHaveLength(2)
    expect(prismaMock.match.findMany).toHaveBeenCalledWith({
      take: 10,
      orderBy: expect.any(Object)
    })
  })

  it('should apply filters', async () => {
    prismaMock.match.findMany.mockResolvedValue([])

    await getRecentMatches({
      limit: 10,
      winner: 'radiant'
    })

    expect(prismaMock.match.findMany).toHaveBeenCalledWith({
      take: 10,
      where: { winner: 'radiant' },
      orderBy: expect.any(Object)
    })
  })
})
```

### Find Unique

```typescript
describe('getMatchById', () => {
  it('should find match by id', async () => {
    const testMatch = buildMatch({ id: 'match-123' })
    prismaMock.match.findUnique.mockResolvedValue(testMatch)

    const match = await getMatchById('match-123')

    expect(match?.id).toBe('match-123')
    expect(prismaMock.match.findUnique).toHaveBeenCalledWith({
      where: { id: 'match-123' }
    })
  })

  it('should return null for non-existent match', async () => {
    prismaMock.match.findUnique.mockResolvedValue(null)

    const match = await getMatchById('nonexistent')

    expect(match).toBeNull()
  })
})
```

### Find First

```typescript
describe('getFirstMatch', () => {
  it('should find match matching criteria', async () => {
    const testMatch = buildMatch({ radiantTeam: 'Team A' })
    prismaMock.match.findFirst.mockResolvedValue(testMatch)

    const match = await getFirstMatch({ radiantTeam: 'Team A' })

    expect(match?.radiantTeam).toBe('Team A')
    expect(prismaMock.match.findFirst).toHaveBeenCalledWith({
      where: { radiantTeam: 'Team A' }
    })
  })
})
```

## Testing Model Mutations

### Create

```typescript
describe('createMatch', () => {
  it('should create match with validation', async () => {
    const inputData = {
      matchId: 1000000001,
      radiantTeam: 'Team A',
      direTeam: 'Team B',
      radiantScore: 25,
      direScore: 23
    }

    const createdMatch = buildMatch()
    prismaMock.match.create.mockResolvedValue(createdMatch)

    const match = await createMatch(inputData)

    expect(match.winner).toBe('radiant')
    expect(prismaMock.match.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        matchId: inputData.matchId,
        radiantTeam: inputData.radiantTeam
      })
    })
  })

  it('should throw on invalid data', async () => {
    const invalidData = {
      matchId: 'not-a-number',
      radiantTeam: '',
      direTeam: ''
    }

    await expect(createMatch(invalidData)).rejects.toThrow()
  })
})
```

### Update

```typescript
describe('updateMatch', () => {
  it('should update match fields', async () => {
    const existing = buildMatch({ id: 'match-123' })
    const updated = buildMatch({ id: 'match-123', winner: 'dire' })

    prismaMock.match.findUnique.mockResolvedValue(existing)
    prismaMock.match.update.mockResolvedValue(updated)

    const result = await updateMatch('match-123', { winner: 'dire' })

    expect(result.winner).toBe('dire')
    expect(prismaMock.match.update).toHaveBeenCalledWith({
      where: { id: 'match-123' },
      data: { winner: 'dire' }
    })
  })

  it('should not update if winner is already set', async () => {
    const existing = buildMatch({ id: 'match-123', winner: 'radiant' })
    prismaMock.match.findUnique.mockResolvedValue(existing)

    await expect(
      updateMatch('match-123', { winner: 'radiant' })
    ).rejects.toThrow('Winner already set')
  })
})
```

### Delete

```typescript
describe('deleteMatch', () => {
  it('should delete match and related records', async () => {
    prismaMock.match.delete.mockResolvedValue({
      id: 'match-123',
      radiantTeam: 'Team A'
    })
    prismaMock.player.deleteMany.mockResolvedValue({ count: 10 })

    await deleteMatch('match-123')

    expect(prismaMock.player.deleteMany).toHaveBeenCalledWith({
      where: { matchId: 'match-123' }
    })
    expect(prismaMock.match.delete).toHaveBeenCalledWith({
      where: { id: 'match-123' }
    })
  })
})
```

## Testing Relationships

### Nested Creates

```typescript
describe('createMatchWithPlayers', () => {
  it('should create match and players in transaction', async () => {
    const matchData = buildMatch()
    const players = [
      buildPlayer({ name: 'Player1' }),
      buildPlayer({ name: 'Player2' })
    ]

    prismaMock.$transaction.mockImplementation(async (callback) => {
      return await callback(prismaMock)
    })

    prismaMock.match.create.mockResolvedValue(matchData)
    prismaMock.player.createMany.mockResolvedValue({ count: 2 })

    await createMatchWithPlayers(matchData, players)

    expect(prismaMatch.match.create).toHaveBeenCalled()
    expect(prismaMock.player.createMany).toHaveBeenCalled()
  })
})
```

### Eager Loading

```typescript
describe('getMatchWithPlayers', () => {
  it('should load match and related players', async () => {
    const match = buildMatch()
    const players = [
      buildPlayer({ matchId: 'match-123' }),
      buildPlayer({ matchId: 'match-123' })
    ]

    prismaMock.match.findUnique.mockResolvedValue({
      ...match,
      players
    })

    const result = await getMatchWithPlayers('match-123')

    expect(result?.players).toHaveLength(2)
    expect(prismaMock.match.findUnique).toHaveBeenCalledWith({
      where: { id: 'match-123' },
      include: { players: true }
    })
  })
})
```

## Testing Data Transformations

### Computed Properties

```typescript
describe('Match duration', () => {
  it('should calculate duration in minutes', () => {
    const match = buildMatch({
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T10:45:00Z')
    })

    expect(match.durationMinutes).toBe(45)
  })

  it('should format duration as MM:SS', () => {
    const match = buildMatch({ durationSeconds: 1847 })

    expect(formatDuration(match.durationSeconds)).toBe('30:47')
  })
})
```

### Data Sanitization

```typescript
describe('OpenDota match import', () => {
  it('should sanitize API response', async () => {
    const apiData = {
      match_id: 1000000001,
      radiant_score: 25,
      dire_score: 22,
      radiant_win: true
    }

    const sanitized = sanitizeMatchData(apiData)

    expect(sanitized.winner).toBe('radiant')
    expect(sanitized.matchId).toBe(1000000001)
  })

  it('should handle missing fields', async () => {
    const partialData = {
      match_id: 1000000001,
      radiant_score: 25,
      // Missing dire_score
      radiant_win: true
    }

    const sanitized = sanitizeMatchData(partialData)

    expect(sanitized.direScore).toBe(0)
  })
})
```

## Testing Query Complexity

### Performance Checks

```typescript
describe('Query performance', () => {
  it('should not include eager load for list queries', async () => {
    prismaMock.match.findMany.mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => {
        resolve([])
      }, 10))
    })

    const start = performance.now()
    await getRecentMatches({ limit: 100 })
    const duration = performance.now() - start

    expect(duration).toBeLessThan(100)
  })
})
```

## Testing Constraints

### Unique Constraints

```typescript
describe('Match uniqueness', () => {
  it('should not allow duplicate match IDs', async () => {
    const existing = buildMatch({ matchId: 1000000001 })
    prismaMock.match.findUnique.mockResolvedValue(existing)

    await expect(
      createMatch({ matchId: 1000000001, radiantTeam: 'Team A', direTeam: 'Team B' })
    ).rejects.toThrow('Match already exists')
  })
})
```

### Validation Rules

```typescript
describe('Score validation', () => {
  it('should require positive scores', async () => {
    await expect(
      createMatch({
        matchId: 1000000001,
        radiantTeam: 'Team A',
        direTeam: 'Team B',
        radiantScore: -1,
        direScore: 25
      })
    ).rejects.toThrow('Invalid score')
  })

  it('should require winner score >= loser score', async () => {
    await expect(
      createMatch({
        matchId: 1000000001,
        radiantTeam: 'Team A',
        direTeam: 'Team B',
        radiantScore: 10,
        direScore: 25,
        winner: 'radiant'
      })
    ).rejects.toThrow('Winner score must be highest')
  })
})
```

## Testing Complex Queries

### Aggregations

```typescript
describe('Match statistics', () => {
  it('should calculate win rate for team', async () => {
    prismaMock.match.groupBy.mockResolvedValue([
      { winner: 'radiant', _count: 7 },
      { winner: 'dire', _count: 3 }
    ])

    const stats = await getTeamStats('Team A')

    expect(stats.winRate).toBeCloseTo(0.7)
    expect(prismaMock.match.groupBy).toHaveBeenCalledWith({
      by: ['winner'],
      where: expect.any(Object)
    })
  })

  it('should calculate average duration', async () => {
    prismaMock.match.findMany.mockResolvedValue([
      buildMatch({ durationSeconds: 1800 }),
      buildMatch({ durationSeconds: 2400 }),
      buildMatch({ durationSeconds: 2700 })
    ])

    const avgDuration = await getAverageDuration()

    expect(avgDuration).toBe(2300)
  })
})
```

## Complete Example

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { prismaMock } from '@/test/prisma-mock'
import { buildMatch, buildPlayer } from '@/test/builders'
import * as matchService from '@/server/services/matches'

describe('Match Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    prismaMock.$disconnect.mockReset()
  })

  describe('getMatchById', () => {
    it('should return match exists', async () => {
      const testMatch = buildMatch({ id: 'match-123' })
      prismaMock.match.findUnique.mockResolvedValue(testMatch)

      const match = await matchService.getMatchById('match-123')

      expect(match?.id).toBe('match-123')
      expect(prismaMock.match.findUnique).toHaveBeenCalledWith({
        where: { id: 'match-123' },
        include: expect.any(Object)
      })
    })

    it('should return null not found', async () => {
      prismaMock.match.findUnique.mockResolvedValue(null)

      const match = await matchService.getMatchById('invalid')

      expect(match).toBeNull()
    })
  })

  describe('createMatch', () => {
    it('should create new match', async () => {
      const inputData = {
        matchId: 1000000001,
        radiantTeam: 'Team A',
        direTeam: 'Team B',
        radiantScore: 25,
        direScore: 22
      }

      const createdMatch = buildMatch(inputData)
      prismaMock.match.create.mockResolvedValue(createdMatch)

      const result = await matchService.createMatch(inputData)

      expect(result.winner).toBe('radiant')
      expect(prismaMock.match.create).toHaveBeenCalledWith({
        data: expect.objectContaining(inputData)
      })
    })

    it('should validate required fields', async () => {
      const invalidData = { matchId: 1000000001, radiantTeam: '' }

      await expect(matchService.createMatch(invalidData)).rejects.toThrow()
    })
  })

  describe('sanitization', () => {
    it('should compute winner from scores', async () => {
      const apiData = {
        match_id: 1000000001,
        radiant_score: 25,
        dire_score: 22
      }

      const sanitized = matchService.sanitizeMatchData(apiData)

      expect(sanitized.winner).toBe('radiant')
    })

    it('should format timestamps', async () => {
      const apiData = {
        match_id: 1000000001,
        start_time: 1704110400
      }

      const sanitized = matchService.sanitizeMatchData(apiData)

      expect(sanitized.startTime.getTime()).toBe(1704110400000)
    })
  })
})
```

## Common Patterns

### Test Data Factory

```typescript
export class MatchFactory {
  static create(overrides = {}) {
    return buildMatch(overrides)
  }

  static withPlayers(playerCount = 10) {
    const match = buildMatch()
    const players = Array.from({ length: playerCount }, (_, i) =>
      buildPlayer({ id: `player-${i}`, name: `Player ${i}` })
    )
    return { match, players }
  }
}
```

### Behavior Verification

```typescript
it('should call correct Prisma method', () => {
  prismaMock.match.findMany.mockResolvedValue([])

  await getRecentMatches({ limit: 10 })

  expect(prismaMock.match.findMany).toHaveBeenCalledWith({
    take: 10,
    orderBy: { startTime: 'desc' }
  })
})
```