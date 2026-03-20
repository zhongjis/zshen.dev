# Async Testing

Testing asynchronous code and operations with Vitest.

## Async Patterns

### Testing Async Functions

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Async functions', () => {
  it('should handle async/await', async () => {
    const result = await asyncFunction()
    expect(result).toBe('expected value')
  })

  it('should handle Promises', () => {
    return asyncFunction().then(result => {
      expect(result).toBe('expected value')
    })
  })
})
```

### Testing Promises

```typescript
describe('Promise-based functions', () => {
  it('should resolve with correct value', async () => {
    const promise = Promise.resolve('success')

    await expect(promise).resolves.toBe('success')
  })

  it('should reject with error', async () => {
    const promise = Promise.reject(new Error('Failed'))

    await expect(promise).rejects.toThrow('Failed')
  })
})
```

## Timeouts and Timing

### Waiting for Async Operations

```typescript
import { waitFor } from '@testing-library/react'

it('should wait for async update to complete', async () => {
  const { getByText } = render(<AsyncComponent />)

  // Initial state
  expect(screen.queryByText('Loaded')).not.toBeInTheDocument()

  // Wait for async operation
  await waitFor(() => {
    expect(getByText('Loaded')).toBeInTheDocument()
  })
})
```

### Fake Timers

```typescript
describe('debounced functions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce function calls', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 500)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    // Fast-forward time
    vi.advanceTimersByTime(501)

    expect(fn).toHaveBeenCalledTimes(1)
  })
})
```

### Time-based Tests

```typescript
it('should retry with exponential backoff', async () => {
  const fn = vi.fn()
    .mockRejectedValueOnce(new Error('Error 1'))
    .mockRejectedValueOnce(new Error('Error 2'))
    .mockResolvedValueOnce('success')

  vi.useFakeTimers()

  const promise = retryWithBackoff(fn, { maxRetries: 3 })

  await vi.runOnlyPendingTimersAsync()

  const result = await promise

  expect(result).toBe('success')
  expect(fn).toHaveBeenCalledTimes(3)
})
```

## API Calls

### Mocking Fetch

```typescript
describe('API calls', () => {
  it('should fetch data from API', async () => {
    const mockData = { value: 'test' }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockData
      } as Response)
    )

    const result = await fetchData('https://api.example.com/data')

    expect(result).toEqual(mockData)
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/data')
  })
})
```

### Testing External APIs

```typescript
describe('OpenDota integration', () => {
  it('should fetch match data', async () => {
    const mockMatch = {
      match_id: 1000000001,
      radiant_team: { name: 'Team A' }
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMatch
    } as Response)

    const match = await fetchMatchFromOpenDota(1000000001)

    expect(match.matchId).toBe(1000000001)
  })

  it('should handle API errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404
    } as Response)

    await expect(fetchMatchFromOpenDota(999)).rejects.toThrow('Match not found')
  })
})
```

## Database Async Operations

### Testing Database Transactions

```typescript
describe('Transactions', () => {
  it('should rollback on error', async () => {
    prismaMock.$transaction.mockImplementation(async (callback) => {
      return await callback(prismaMock)
    })

    prismaMock.match.create.mockRejectedValue(new Error('Failed'))

    await expect(
      createMatchWithPlayers(matchData, players)
    ).rejects.toThrow()

    expect(prismaMock.$transaction).toHaveBeenCalled()
  })
})
```

### Async Query Chaining

```typescript
describe('Chained queries', () => {
  it('should execute queries sequentially', async () => {
    prismaMock.match.findMany.mockResolvedValue([match1, match2])
    prismaMock.player.findMany.mockResolvedValue([player1, player2])

    const result = await getMatchWithPlayers('match-123')

    expect(result).toBeDefined()
    expect(prismaMock.match.findMany).toHaveBeenCalled()
    expect(prismaMock.player.findMany).toHaveBeenCalled()
  })
})
```

## Event-based Async

### Event Emitter Tests

```typescript
describe('Event emitter', () => {
  it('should emit event after async operation', async () => {
    const emitter = new EventTarget()
    const handler = vi.fn()

    emitter.addEventListener('data-loaded', handler)

    setTimeout(() => {
      emitter.dispatchEvent(new Event('data-loaded'))
    }, 100)

    vi.useFakeTimers()
    await vi.runOnlyPendingTimersAsync()

    expect(handler).toHaveBeenCalled()
  })
})
```

## Worker Tests

### Testing Web Workers

```typescript
describe('Worker tasks', () => {
  it('should process task in worker', async () => {
    const mockWorker = {
      postMessage: vi.fn(),
      onmessage: null,
      onerror: null
    }

    // Mock Worker constructor
    global.Worker = vi.fn(() => mockWorker) as any

    const taskPromise = processInWorker({ data: 'test' })

    // Simulate worker response
    mockWorker.onmessage?.({ data: { result: 'processed' } })

    const result = await taskPromise

    expect(result).toBe('processed')
  })
})
```

## Concurrent Operations

### Testing Parallel Execution

```typescript
describe('Concurrent operations', () => {
  it('should execute all promises in parallel', async () => {
    const fn1 = vi.fn().mockResolvedValue('result1')
    const fn2 = vi.fn().mockResolvedValue('result2')
    const fn3 = vi.fn().mockResolvedValue('result3')

    const results = await Promise.all([fn1(), fn2(), fn3()])

    expect(results).toEqual(['result1', 'result2', 'result3'])
  })
})
```

### Race Conditions

```typescript
describe('Race conditions', () => {
  it('should handle concurrent updates', async () => {
    let counter = 0
    const increment = async () => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10))
      counter++
    }

    await Promise.all([increment(), increment(), increment()])

    expect(counter).toBe(3)
  })
})
```

## Async Hooks in Context

### Testing Async Context

```typescript
describe('Async context providers', () => {
  it('should load data in context', async () => {
    const { result } = renderHook(() => useMatchContext())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.match).toBeDefined()
    })

    expect(result.current.isLoading).toBe(false)
  })
})
```

## Error Handling

### Async Error Boundaries

```typescript
describe('Async error handling', () => {
  it('should catch and handle async errors', async () => {
    const errorComponent = () => {
      throw new Error('Async error')
    }

    await expect(
      render(errorComponent)
    ).rejects.toThrow('Async error')
  })
})
```

## Streaming and Chunks

### Testing Stream Processing

```typescript
describe('Stream processing', () => {
  it('should process stream chunks', async () => {
    const chunks = ['chunk1', 'chunk2', 'chunk3']
    const stream = new ReadableStream({
      async start(controller) {
        chunks.forEach(chunk => controller.enqueue(chunk))
        controller.close()
      }
    })

    const results: string[] = []

    for await (const chunk of stream) {
      results.push(chunk)
    }

    expect(results).toEqual(chunks)
  })
})
```

## Polling Tests

### Testing Poll-based Fetching

```typescript
describe('Polling', () => {
  it('should poll until condition met', async () => {
    let attempts = 0
    const pollFn = async () => {
      attempts++
      return attempts >= 3 ? 'done' : null
    }

    vi.useFakeTimers()

    const promise = pollUntil(pollFn, { interval: 1000, maxAttempts: 5 })

    await vi.advanceTimersByTimeAsync(3000)

    const result = await promise

    expect(result).toBe('done')
    expect(attempts).toBe(3)
  })
})
```

## Retry Logic

### Exponential Backoff

```typescript
describe('Retry with backoff', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should retry with increasing delay', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockResolvedValue('success')

    const promise = retryWithBackoff(fn, {
      maxRetries: 3,
      initialDelay: 100
    })

    // First attempt
    await vi.advanceTimersByTimeAsync(0)

    // First retry after 100ms
    await vi.advanceTimersByTimeAsync(100)

    // Second retry after 200ms (exponential)
    await vi.advanceTimersByTimeAsync(200)

    // Third retry after 400ms
    await vi.advanceTimersByTimeAsync(400)

    const result = await promise

    expect(result).toBe('success')
  })
})
```

## Debounce/Throttle Tests

### Testing Debounced Functions

```typescript
describe('Debounced functions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should only execute once after delay', async () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 300)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(301)

    expect(fn).toHaveBeenCalledTimes(1)
  })
})
```

## Async Component Lifecycles

### Testing useEffect Cleanup

```typescript
describe('useEffect cleanup', () => {
  it('should cleanup on unmount', async () => {
    const cleanup = vi.fn()
    const { unmount } = renderHook(() => {
      useEffect(() => {
        return () => cleanup()
      }, [])
    })

    unmount()

    expect(cleanup).toHaveBeenCalled()
  })
})
```

## Best Practices

- **Always `await` async operations**: Don't fire-and-forget
- **Use `waitFor` for UI updates**: Don't assume instant renders
- **Clear mocks in `beforeEach`**: Avoid state leakage between tests
- **Test both success and error paths**: Don't only test happy path
- **Use fake timers judiciously**: Only when time-specific behavior needs testing
- **Avoid race conditions**: Explicitly order async operations in tests