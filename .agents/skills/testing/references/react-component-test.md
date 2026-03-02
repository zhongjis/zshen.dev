# React Component Testing

Testing React components with Vitest and Testing Library.

## Setup

### Installation

```bash
bun add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  }
})
```

### Test Setup

```typescript
// test/setup.ts
import '@testing-library/jest-dom'
```

## Basic Patterns

### Smoke Test (Does it render?)

```typescript
import { render, screen } from '@testing-library/react'
import { MatchCard } from './MatchCard'

describe('MatchCard', () => {
  it('should render', () => {
    render(<MatchCard match={mockMatch} />)
    expect(screen.getByText('Team A')).toBeInTheDocument()
  })
})
```

### User Interactions

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteButton } from './DeleteButton'

it('should call onDelete when clicked', async () => {
  const onDelete = vi.fn()
  render(<DeleteButton onDelete={onDelete} />)

  await userEvent.click(screen.getByRole('button', { name: /delete/i }))

  expect(onDelete).toHaveBeenCalledTimes(1)
})
```

### Conditional Rendering

```typescript
it('should show loading state while fetching', () => {
  render(<MatchCard isLoading />)
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  expect(screen.queryByText('Team A')).not.toBeInTheDocument()
})

it('should show match data after loading', () => {
  render(<MatchCard match={mockMatch} />)
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  expect(screen.getByText('Team A')).toBeInTheDocument()
})
```

## Testing with tRPC

### Using TRPCProvider

```typescript
// test/trpc.ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@/server/api/root'

export function createTestTRPCClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      }
    }
  })

  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000/api/trpc',
      })
    ]
  })

  return { queryClient, trpcClient }
}
```

### Mocking tRPC Queries

```typescript
import { render, screen } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { trpc } from '@/utils/trpc'

describe('MatchList', () => {
  it('should display matches from tRPC', async () => {
    const queryClient = new QueryClient()

    // Mock query response
    vi.mocked(trpc.match.list.useQuery).mockReturnValue({
      data: [mockMatch1, mockMatch2],
      isLoading: false,
      error: null,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <MatchList />
      </QueryClientProvider>
    )

    expect(screen.getByText('Team A')).toBeInTheDocument()
    expect(screen.getByText('Team B')).toBeInTheDocument()
  })
})
```

## Testing UI Components

### Forms

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MatchForm } from './MatchForm'

describe('MatchForm', () => {
  it('should submit form data', async () => {
    const onSubmit = vi.fn()
    render(<MatchForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/radiant team/i), 'Team A')
    await userEvent.type(screen.getByLabelText(/dire team/i), 'Team B')
    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      radiantTeam: 'Team A',
      direTeam: 'Team B'
    })
  })
})
```

### Lists and Tables

```typescript
describe('MatchTable', () => {
  it('should render all matches', () => {
    const matches = [
      { id: 1, radiantTeam: 'Team A', winner: 'radiant' },
      { id: 2, radiantTeam: 'Team C', winner: 'dire' },
    ]

    render(<MatchTable matches={matches} />)

    expect(screen.getByRole('cell', { name: 'Team A' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Team C' })).toBeInTheDocument()
  })

  it('should show empty state when no matches', () => {
    render(<MatchTable matches={[]} />)
    expect(screen.getByText('No matches found')).toBeInTheDocument()
  })
})
```

### Modals and Dialogs

```typescript
describe('DeleteModal', () => {
  it('should open modal when delete button clicked', async () => {
    render(<MatchRow match={mockMatch} />)

    await userEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(screen.getByRole('dialog', { name: /confirm deletion/i })).toBeInTheDocument()
  })

  it('should call onConfirm when confirmed', async () => {
    const onConfirm = vi.fn()
    render(
      <DeleteModal isOpen onConfirm={onConfirm} onCancel={vi.fn()} match={mockMatch} />
    )

    await userEvent.click(screen.getByRole('button', { name: /confirm/i }))

    expect(onConfirm).toHaveBeenCalledWith(mockMatch.id)
  })
})
```

## Testing Accessibility

### ARIA Labels

```typescript
it('should have accessible button labels', () => {
  render(<DeleteButton />)
  expect(screen.getByRole('button', { name: /delete match/i })).toBeInTheDocument()
})

it('should use semantic HTML', () => {
  render(<MatchCard match={mockMatch} />)
  expect(screen.getByRole('article')).toBeInTheDocument()
})
```

### Keyboard Navigation

```typescript
it('should be keyboard accessible', async () => {
  render(<MatchRow match={mockMatch} />)

  await userEvent.tab() // Focus first interactive element
  await userEvent.keyboard('{Enter}') // Trigger action

  // Verify action occurred
})
```

## Testing Loading and Error States

### Loading States

```typescript
describe('MatchDetail', () => {
  it('should show loading spinner', () => {
    render(<MatchDetail isLoading match={null} />)
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('should show match data when loaded', () => {
    render(<MatchDetail isLoading={false} match={mockMatch} />)
    expect(screen.getByText('Team A')).toBeInTheDocument()
  })
})
```

### Error States

```typescript
it('should display error message', () => {
  render(
    <MatchDetail
      isLoading={false}
      match={null}
      error="Failed to load match"
    />
  )

  expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
})
```

## Testing Responsive UI

### Mobile Views

```typescript
it('should collapse table on mobile', () => {
  // Mock window.innerWidth
  window.innerWidth = 375

  render(<MatchTable matches={matches} />)

  expect(screen.getByTestId('mobile-layout')).toBeInTheDocument()
  expect(screen.queryByTestId('desktop-layout')).not.toBeInTheDocument()
})
```

## Testing with Context

### Theme Context

```typescript
describe('ThemedComponent', () => {
  it('should use light theme', () => {
    render(
      <ThemeProvider theme="light">
        <MatchCard />
      </ThemeProvider>
    )
    expect(screen.getByTestId('match-card')).toHaveClass('light')
  })

  it('should use dark theme', () => {
    render(
      <ThemeProvider theme="dark">
        <MatchCard />
      </ThemeProvider>
    )
    expect(screen.getByTestId('match-card')).toHaveClass('dark')
  })
})
```

## Testing Custom Hooks

### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react'
import { useMatchData } from '@/hooks/useMatchData'

describe('useMatchData', () => {
  it('should fetch and return match data', async () => {
    const { result } = renderHook(() => useMatchData('match-123'))

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.match?.id).toBe('match-123')
    expect(result.current.isLoading).toBe(false)
  })
})
```

## Complete Example

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MatchCard } from './MatchCard'

const mockMatch = {
  id: 'match-123',
  radiantTeam: 'Team A',
  direTeam: 'Team B',
  winner: 'radiant',
  duration: 1800,
}

describe('MatchCard', () => {
  beforeEach(() => {
    // Setup mocks
  })

  afterEach(() => {
    cleanup()
  })

  describe('rendering', () => {
    it('should display match information', () => {
      render(<MatchCard match={mockMatch} />)

      expect(screen.getByText('Team A')).toBeInTheDocument()
      expect(screen.getByText('Team B')).toBeInTheDocument()
      expect(screen.getByText('30:00')).toBeInTheDocument()
    })

    it('should highlight winner', () => {
      render(<MatchCard match={mockMatch} />)

      const winnerText = screen.getByText('Team A (Winner)')
      expect(winnerText).toHaveClass('text-green-500')
    })
  })

  describe('interactions', () => {
    it('should open modal on delete click', async () => {
      render(<MatchCard match={mockMatch} />)

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /delete/i }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('should call onDelete when confirmed', async () => {
      const onDelete = vi.fn()
      render(<MatchCard match={mockMatch} onDelete={onDelete} />)

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /delete/i }))

      await user.click(screen.getByRole('button', { name: /confirm/i }))

      expect(onDelete).toHaveBeenCalledWith('match-123')
    })
  })

  describe('edge cases', () => {
    it('should show loading state', () => {
      render(<MatchCard isLoading />)

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
    })

    it('should show error state', () => {
      render(
        <MatchCard
          isLoading={false}
          match={null}
          error="Failed to load"
        />
      )

      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    })
  })
})
```

## Best Practices

- **Test user behavior**, not implementation details
- **Use semantic queries** (getByRole, getByLabelText) over getByTestId
- **Mock child components** for complex trees
- **Test accessibility** with ARIA queries
- **Keep tests fast** by avoiding full render trees
- **Use waitFor** for async assertions
- **Clean up** after each test (cleanup, vi.clearAllMocks)