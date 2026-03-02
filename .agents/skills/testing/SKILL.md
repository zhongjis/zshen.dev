---
name: testing
description: Comprehensive testing guidance for Dota2 Worker Web with Vitest and agent-browser. Use when writing tests for: (1) Database models and Prisma queries, (2) tRPC routers and server-side logic, (3) React components and UI, (4) API integrations and OpenDota interactions, (5) E2E browser testing and verification. Assumes Vitest is configured. IMPORTANT: For any browser-related testing, verification, or automation, use agent-browser CLI.
---

# Testing

## Quick Reference

### Common Commands

```bash
# Run all tests
bun test

# Run specific test file
bun test [file-path]

# Run tests in watch mode
bun test --watch

# Run tests for specific pattern
bun test [pattern]

# Run tests silently (passing tests only)
bun test --silent='passed-only'

# Run tests with coverage
bun test --coverage

# UI mode
bun test --ui
```

### Test Types

| Type | When to Use | Location |
|------|-------------|----------|
| Database Model | Prisma models, queries, data transformations | `src/server/` |
| tRPC Router | API endpoints, server actions, context logic | `src/server/` |
| React Component | UI components, user interactions, rendering | `src/app/` |
| Utility Functions | Pure functions, helpers, formatters | Anywhere |

## Core Principles

1. **Arrange-Act-Assert**: Structure each test clearly setup → execute → verify
2. **One Assertion**: Focus on one behavior per test
3. **Descriptive Names**: Test names should describe what they verify
4. **Isolation**: Tests should not depend on each other
4. **Fast**: Unit tests should run quickly (<100ms)
5. **Clear**: Test intent should be obvious from reading it

## Test Structure

### Basic Template

```typescript
import { describe, it, expect } from 'vitest'

describe('FeatureName', () => {
  describe('methodOrBehavior', () => {
    it('should do X when Y', () => {
      // Arrange
      const input = setupTestState()

      // Act
      const result = functionUnderTest(input)

      // Assert
      expect(result).toBe(expected)
    })
  })
})
```

## Mocking Patterns

### Function Mocks

```typescript
// Mock an entire module
vi.mock('./api', () => ({
  fetchData: vi.fn(() => mockData)
}))

// Mock specific function
const mockFn = vi.fn()
mockFn.mockReturnValue(42)
```

### Database Mocks

```typescript
const prismaMock = {
  user: { findMany: vi.fn() },
  match: { findUnique: vi.fn() }
}
```

## Advanced Patterns

See [references/](references/) for detailed guides:
- Database Model testing → [db-model-test.md](references/db-model-test.md)
- tRPC Router testing → [trpc-router-test.md](references/trpc-router-test.md) ⭐
- React Component testing → [react-component-test.md](references/react-component-test.md) ⭐
- Async operations → [async-test.md](references/async-test.md)

## Best Practices

- **Test behavior, not implementation**: Verify what happens, not how
- **Use test data builders**: Create helper functions to generate test data
- **Mock external dependencies**: Don't call external APIs in tests
- **Keep tests fast**: Use in-memory mocks for databases and APIs
- **Use clear assertions**: `expect(result).toBe(42)` not `expect(result.ok).toBe(true)`

## Common Patterns

### Testing Error Cases

```typescript
it('should throw when invalid input', () => {
  expect(() => validateInput(null)).toThrow('Invalid input')
})
```

### Testing Async Functions

```typescript
it('should fetch data', async () => {
  const result = await fetchData('id-123')
  expect(result).toEqual(mockData)
})
```

### Testing with Time

```typescript
it('should handle timeouts', async () => {
  vi.useFakeTimers()
  vi.advanceTimersByTime(1000)
  // ... assertions
  vi.useRealTimers()
})
```

## Running Tests

### Targeted Testing

```bash
# Run only database model tests
bun test src/server/**/*.test.ts

# Run only tRPC router tests
bun test src/server/api/routers/*.test.ts

# Run only component tests
bun test src/app/**/*.test.tsx
```

### Debugging

```bash
# Run failed tests only
bun test --run

# Run with verbose output
bun test --reporter=verbose

# Debug specific test
bun test -t "should do X"
```

## Coverage

```bash
# Generate coverage report
bun test --coverage

# View coverage in browser
npx vitest --coverage --reporter=html
open coverage/index.html
```

## Test Organization

### File Naming

- Test files: `[name].test.ts` or `[name].test.tsx`
- Test utilities: `test-utils.ts`, `mocks.ts`

### Folder Structure

```
src/
├── server/
│   ├── models/
│   │   └── user.test.ts
│   ├── api/
│   │   └── routers/
│   │       └── match.test.ts
└── app/
    └── components/
        └── MatchCard.test.tsx
```

## Common Pitfalls

- **Testing private methods**: Test public behavior only
- **Over-mocking**: Only mock external dependencies
- **Brittle tests**: Test behavior, not specific implementation details
- **Slow tests**: Use in-memory mocks, avoid real I/O
- **Complex setup**: Keep test arrangements simple and focused

## Browser Testing (agent-browser)

**IMPORTANT: For ANY browser-related testing, verification, or automation, use `agent-browser` CLI.**

### When to Use Browser Testing

| Scenario | Action |
|----------|--------|
| Verify UI renders correctly | `agent-browser open <url>` + `snapshot -i` |
| Test user interactions | Use refs from snapshot to click/fill |
| Capture visual state | `agent-browser screenshot` |
| Debug failing E2E tests | Inspect page state with snapshots |
| Verify deployed changes | Open URL and check elements |

### Quick Reference

```bash
# Core workflow
agent-browser open http://localhost:3000    # Navigate to page
agent-browser snapshot -i                   # Get interactive elements with refs
agent-browser click @e1                     # Click element by ref
agent-browser fill @e2 "text"               # Fill input by ref
agent-browser screenshot path.png           # Capture state

# Verification
agent-browser get text @e1                  # Get element text
agent-browser is visible @e1                # Check visibility
agent-browser wait --text "Success"         # Wait for text

# Cleanup
agent-browser close                         # Close browser
```

### E2E Testing Workflow

1. **Start dev server** (if not running): `pnpm dev`
2. **Navigate**: `agent-browser open http://localhost:3000`
3. **Snapshot**: `agent-browser snapshot -i` to discover elements
4. **Interact**: Use refs (`@e1`, `@e2`) from snapshot
5. **Verify**: Check text, visibility, or take screenshot
6. **Re-snapshot**: After navigation or DOM changes

### Example: Verify Match Analysis Flow

```bash
# Navigate to app
agent-browser open http://localhost:3000

# Get interactive elements
agent-browser snapshot -i
# Output shows: textbox "Match ID" [ref=e1], button "Analyze" [ref=e2]

# Fill in test match ID and submit
agent-browser fill @e1 "8652436479"
agent-browser click @e2

# Wait for results
agent-browser wait --text "Match Analysis"
agent-browser snapshot -i

# Verify results displayed
agent-browser screenshot results.png
```

### Comparison: agent-browser vs Playwright

| Use Case | Tool | Why |
|----------|------|-----|
| AI-driven verification | `agent-browser` | Designed for AI agents, ref-based interaction |
| Scripted E2E tests | `pnpm test:e2e` (Playwright) | Existing test suite, CI integration |
| Quick UI checks | `agent-browser` | Fast, interactive, no test file needed |
| Regression testing | Playwright | Automated, repeatable, assertions |

### Browser Testing Best Practices

- **Always snapshot after navigation**: DOM changes require fresh refs
- **Use test match ID**: `8652436479` for consistent test data
- **Screenshot on failure**: Capture state for debugging
- **Wait for network**: Use `agent-browser wait --load networkidle` for API calls
- **Clean up**: Close browser when done to free resources