# Upgrade Node.js Runtime & Next.js to Latest

## TL;DR

> **Quick Summary**: Upgrade zshen.dev from Next.js 13.5 → 16.x and Node.js → 22 LTS, replacing the abandoned Contentlayer MDX pipeline with Velite, migrating React 18 → 19, and modernizing all deprecated APIs.
> 
> **Deliverables**:
> - Next.js 16.x with React 19 running on Node.js 22 LTS
> - Velite-powered MDX content pipeline replacing Contentlayer
> - Migrated API route from Pages Router to App Router
> - Updated Nix dev shell with Node 22
> - Zero visual/behavioral regressions
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 → Task 5 → Task 7/8 → Task 13 → Final Wave

---

## Context

### Original Request
Update Node.js runtime to latest LTS on Vercel and update Next.js to latest stable version.

### Interview Summary
**Key Discussions**:
- Node.js target: **22 LTS (Jod)** — user selected for battle-tested stability
- Contentlayer is abandoned and incompatible with Next.js 14+ — must be replaced
- ULW mode — proceed without extended interview

**Research Findings**:
- Next.js latest stable: 16.1.6 (released Jan 2026). Requires React 19, Node 20.9+
- Contentlayer `next-contentlayer@0.3.4` only supports `next ^12 || ^13` — hard blocker
- Velite is the community-standard Contentlayer replacement with similar schema API
- `framer-motion` v10 incompatible with React 19 — must migrate to `motion` package
- `@next/font` deprecated in Next.js 14, removed in later versions — must use `next/font`
- Node 22 is Maintenance LTS until April 2027

### Metis Review
**Identified Gaps** (addressed):
- BUG: `pages/api/incr.ts` line 42 missing `return` before dedup response — fixed during migration
- Ghost dependencies (`@next/mdx`, `markdown-wasm`, `react-wrap-balancer`, `@tailwindcss/line-clamp`) — removed in cleanup
- `@ts-nocheck` in mdx.tsx — addressed during Velite rewrite
- Analytics component in `<head>` — moved to `<body>` with `next/script`
- `fmt` script references `rome` instead of `biome` — fixed
- `@opentelemetry/*` overrides no longer needed — removed
- `rehype-pretty-code` v0.10.1 callback APIs may differ in newer versions — tested during Velite setup

---

## Work Objectives

### Core Objective
Upgrade the zshen.dev stack from Next.js 13.5/React 18/Node ~20 to Next.js 16.x/React 19/Node 22, replacing the abandoned Contentlayer with Velite, while preserving identical site behavior and visual appearance.

### Concrete Deliverables
- `package.json` with Next.js 16.x, React 19, Node 22 engine, Velite, motion (replacing framer-motion)
- `velite.config.ts` replacing `contentlayer.config.js` with identical schema
- `app/api/incr/route.ts` replacing `pages/api/incr.ts` (with dedup bug fix)
- Updated `next.config.mjs` (no Contentlayer wrapper, Velite build trigger)
- Updated `tsconfig.json` (bundler moduleResolution, Velite paths)
- Updated `flake.nix` with Node.js 22
- All imports migrated from Contentlayer → Velite, `@next/font` → `next/font`, `framer-motion` → `motion`

### Definition of Done
- [ ] `pnpm build` exits code 0
- [ ] `pnpm exec tsc --noEmit` exits code 0
- [ ] All 4 pages render with content (home, projects, project detail, contact)
- [ ] API route `/api/incr` responds to POST with 202
- [ ] No `contentlayer` or `next-contentlayer` references remain in source
- [ ] No `@next/font` references remain in source
- [ ] No `framer-motion` references remain in source
- [ ] `node -v` shows v22.x in dev shell

### Must Have
- Next.js 16.x with React 19
- Node.js 22 LTS on Vercel and in Nix dev shell
- Velite MDX pipeline with identical content schema
- All existing pages render identically
- API view counter works with IP dedup (bug fixed)

### Must NOT Have (Guardrails)
- ❌ Tailwind CSS v3 → v4 upgrade (separate ticket)
- ❌ New error.tsx / loading.tsx / not-found.tsx files
- ❌ Vercel Analytics integration (README TODO, separate work)
- ❌ Test infrastructure setup (no tests exist, not adding them here)
- ❌ Biome version upgrade (only fix the script name)
- ❌ Next.js middleware addition
- ❌ Any visual/styling changes
- ❌ Migration of `content/chronark-projects/` template content
- ❌ Touching `app/components/particles.tsx` or `app/components/nav.tsx`
- ❌ Adding new features of any kind

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (no test infrastructure, not in scope to add)
- **Agent-Executed QA**: ALWAYS (mandatory for all tasks)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Build verification**: Bash — `pnpm build`, `pnpm exec tsc --noEmit`
- **Page rendering**: Bash (curl) — fetch pages, assert content presence
- **API testing**: Bash (curl) — POST to API, assert status codes
- **Content integrity**: Bash (curl + grep) — verify MDX renders with prose classes

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — cleanup + new config, MAX PARALLEL):
├── Task 1: Velite config setup [unspecified-high]
├── Task 2: Clean ghost deps + OpenTelemetry overrides + fix fmt script [quick]
├── Task 3: Update flake.nix for Node 22 [quick]
└── Task 4: Update tsconfig.json for modern settings + Velite paths [quick]

Wave 2a (Core upgrade — SEQUENTIAL, must complete before 2b):
└── Task 5: Run Next.js upgrade codemod + React 19 [deep]

Wave 2b (Parallel migrations — after Task 5, MAX PARALLEL):
├── Task 6: Migrate @next/font → next/font in layout.tsx [quick]
├── Task 7: Migrate Contentlayer imports → Velite across all files [unspecified-high]
├── Task 8: Rewrite mdx.tsx for Velite MDX rendering [unspecified-high]
├── Task 9: Migrate framer-motion → motion in card.tsx [quick]
├── Task 10: Migrate pages/api/incr.ts → app/api/incr/route.ts [unspecified-high]
├── Task 11: Update next.config.mjs (remove Contentlayer, add Velite) [quick]
└── Task 12: Move Analytics + async params fix [quick]

Wave 3 (Cleanup + build verification — SEQUENTIAL):
└── Task 13: Remove Contentlayer, add engines field, full build [unspecified-high]

Wave FINAL (Independent review, 4 parallel):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality review [unspecified-high]
├── Task F3: Full QA — all pages + API [unspecified-high]
└── Task F4: Scope fidelity check [deep]

Critical Path: Task 1 → Task 7 → Task 8 → Task 13 → Final
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 7 (Wave 2b)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 7, 8, 11 | 1 |
| 2 | — | 5 | 1 |
| 3 | — | 13 | 1 |
| 4 | — | 7, 8 | 1 |
| 5 | 2 | 6, 7, 8, 9, 10, 11, 12 | 2a |
| 6 | 5 | 13 | 2b |
| 7 | 1, 4, 5 | 13 | 2b |
| 8 | 1, 4, 5 | 13 | 2b |
| 9 | 5 | 13 | 2b |
| 10 | 5 | 13 | 2b |
| 11 | 1, 5 | 13 | 2b |
| 12 | 5 | 13 | 2b |
| 13 | 6-12 | Final | 3 |
| F1-F4 | 13 | — | Final |

### Agent Dispatch Summary

- **Wave 1**: 4 tasks — T1 → `unspecified-high`, T2-T4 → `quick`
- **Wave 2a**: 1 task — T5 → `deep`
- **Wave 2b**: 7 tasks — T6 → `quick`, T7-T8 → `unspecified-high`, T9 → `quick`, T10 → `unspecified-high`, T11 → `quick`, T12 → `quick`
- **Wave 3**: 1 task — T13 → `unspecified-high`
- **Final**: 4 tasks — F1 → `oracle`, F2-F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Set up Velite config mirroring Contentlayer schema

  **What to do**:
  - Install Velite: `pnpm add -D velite`
  - Create `velite.config.ts` at project root with:
    - `Project` collection reading from `content/projects/**/*.mdx`
    - Fields: `published` (boolean), `title` (string, required), `description` (string, required), `date` (string, optional), `url` (string, optional), `repository` (string, optional)
    - Computed fields: `slug` (extracted from file path), `path` (computed as `projects/{slug}`)
    - MDX body field that compiles MDX content
  - Configure same rehype/remark plugins: `remarkGfm`, `rehypeSlug`, `rehypePrettyCode` (theme: github-dark), `rehypeAutolinkHeadings`
  - Verify `rehype-pretty-code` v0.10.1 callback APIs (`onVisitLine`, `onVisitHighlightedLine`, `onVisitHighlightedWord`) work with Velite's MDX pipeline. If not, find compatible version.
  - Add `.velite/` to `.gitignore`
  - Test: `pnpm exec velite build` should succeed and produce `.velite/` output directory

  **Must NOT do**:
  - Do NOT change the content MDX files themselves
  - Do NOT add the `Page` document type (unused in current site — only `Project` is imported)
  - Do NOT touch `content/chronark-projects/`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Config-heavy task requiring careful schema translation between two MDX tools
  - **Skills**: [`bun`]
    - `bun`: pnpm package installation and script execution
  - **Skills Evaluated but Omitted**:
    - `typescript`: Velite config is TS but straightforward schema definition, no complex type work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 7, 8, 11
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `contentlayer.config.js` (entire file) — Source schema to replicate exactly. Fields, computed fields, rehype/remark plugin configuration.

  **API/Type References**:
  - `app/projects/article.tsx` — The `Project` type shape used by consumers. Velite output must match this interface.

  **External References**:
  - Velite docs: https://velite.js.org/guide/introduction — Setup guide and schema API
  - Velite + Next.js: https://velite.js.org/guide/with-nextjs — Integration pattern
  - Velite collections: https://velite.js.org/reference/collections — Collection definition API

  **WHY Each Reference Matters**:
  - `contentlayer.config.js`: Source of truth for what Velite must replicate. Every field, every computed property, every plugin.
  - `article.tsx`: Shows the exact shape consumers expect — ensures Velite output is compatible.
  - Velite docs: Needed to translate Contentlayer concepts to Velite equivalents.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Velite builds content successfully
    Tool: Bash
    Preconditions: Velite installed, velite.config.ts created
    Steps:
      1. Run `pnpm exec velite build`
      2. Check exit code is 0
      3. Run `ls .velite/` — verify output directory exists with generated files
      4. Run `node -e "import('./.velite/index.js').then(m => console.log(JSON.stringify(m.projects[0], null, 2)))"` — verify project entries exist with title, description, slug, published fields
    Expected Result: Build succeeds, .velite/ contains project data with all expected fields
    Failure Indicators: Build error, missing .velite/ directory, missing fields in output
    Evidence: .sisyphus/evidence/task-1-velite-build.txt

  Scenario: Velite schema matches Contentlayer output shape
    Tool: Bash
    Preconditions: Velite build completed
    Steps:
      1. Inspect generated output for a project entry
      2. Verify fields present: body/content, date, description, published, slug, title
      3. Verify body/content field contains compiled MDX content (not empty string)
    Expected Result: Field names match what app/projects/article.tsx expects
    Failure Indicators: Missing fields, empty body, wrong field names
    Evidence: .sisyphus/evidence/task-1-velite-schema.txt
  ```

  **Commit**: YES (groups with Tasks 2-4)
  - Message: `chore: prepare foundation for Next.js 16 upgrade`
  - Files: `velite.config.ts`, `.gitignore`
  - Pre-commit: `pnpm exec velite build`

- [ ] 2. Clean ghost dependencies, remove OpenTelemetry overrides, fix fmt script

  **What to do**:
  - Remove unused dependencies from `package.json`:
    - `@next/mdx` (never imported)
    - `markdown-wasm` (never imported)
    - `react-wrap-balancer` (never imported)
    - `@tailwindcss/line-clamp` from devDependencies (deprecated, built into TW 3.3+)
  - Remove ALL `@opentelemetry/*` entries from `pnpm.overrides` section (were for Next.js 13 compat)
  - Fix `fmt` script: change `pnpm rome check . --apply-unsafe && pnpm rome format . --write` → `pnpm biome check . --apply-unsafe && pnpm biome format . --write`
  - Run `pnpm install` to update lockfile

  **Must NOT do**:
  - Do NOT upgrade Biome version
  - Do NOT remove any actually-used dependencies
  - Do NOT modify any source files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple package.json edits — remove lines, rename command
  - **Skills**: [`bun`]
    - `bun`: Package manager operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 5 (codemod needs clean deps)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `package.json` — Current dependencies, scripts.fmt, pnpm.overrides sections

  **WHY Each Reference Matters**:
  - `package.json`: The only file being modified. Need to identify exact dep names and override keys.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Ghost dependencies removed
    Tool: Bash
    Preconditions: package.json edited
    Steps:
      1. Run `grep -c '@next/mdx\|markdown-wasm\|react-wrap-balancer\|@tailwindcss/line-clamp' package.json`
      2. Verify output is 0
    Expected Result: Zero matches — all ghost deps removed
    Failure Indicators: Any match count > 0
    Evidence: .sisyphus/evidence/task-2-ghost-deps.txt

  Scenario: OpenTelemetry overrides removed
    Tool: Bash
    Preconditions: package.json edited
    Steps:
      1. Run `grep -c 'opentelemetry' package.json`
      2. Verify output is 0
    Expected Result: Zero OpenTelemetry references
    Failure Indicators: Any match > 0
    Evidence: .sisyphus/evidence/task-2-otel-removed.txt

  Scenario: fmt script references biome
    Tool: Bash
    Preconditions: package.json edited
    Steps:
      1. Run `node -e "console.log(require('./package.json').scripts.fmt)"`
      2. Verify output contains 'biome' and does NOT contain 'rome'
    Expected Result: fmt script uses biome
    Failure Indicators: 'rome' appears in script
    Evidence: .sisyphus/evidence/task-2-fmt-script.txt
  ```

  **Commit**: YES (groups with Tasks 1, 3, 4)
  - Message: `chore: prepare foundation for Next.js 16 upgrade`
  - Files: `package.json`, `pnpm-lock.yaml`
  - Pre-commit: `pnpm install`

- [ ] 3. Update flake.nix for Node.js 22

  **What to do**:
  - In `flake.nix`, change the Node.js overlay from `prev.nodejs` to `prev.nodejs_22`
  - Verify the overlay line: `nodejs = prev.nodejs;` → `nodejs = prev.nodejs_22;`
  - Test: `nix develop -c node -v` should output `v22.x.x`

  **Must NOT do**:
  - Do NOT change any other Nix configuration
  - Do NOT add new packages to the dev shell

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single-line change in flake.nix
  - **Skills**: [`nix-flakes`]
    - `nix-flakes`: Understanding of Nix flake overlay syntax for Node.js version pinning

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 15 (verification needs correct Node version)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `flake.nix` — Current overlay: `nodejs = prev.nodejs;` line within the nixpkgs overlay

  **WHY Each Reference Matters**:
  - `flake.nix`: Only file being modified. Need to find the exact overlay line.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Nix dev shell provides Node 22
    Tool: Bash
    Preconditions: flake.nix updated
    Steps:
      1. Run `nix develop -c node -v`
      2. Verify output starts with 'v22.'
    Expected Result: Node.js 22.x available in dev shell
    Failure Indicators: Different version or build failure
    Evidence: .sisyphus/evidence/task-3-node-version.txt

  Scenario: flake evaluates without errors
    Tool: Bash
    Preconditions: flake.nix updated
    Steps:
      1. Run `nix develop -c echo ok`
      2. Verify exit code 0 and output is 'ok'
    Expected Result: Flake evaluates without errors
    Failure Indicators: Evaluation error, missing attribute
    Evidence: .sisyphus/evidence/task-3-flake-check.txt
  ```

  **Commit**: YES (groups with Tasks 1, 2, 4)
  - Message: `chore: prepare foundation for Next.js 16 upgrade`
  - Files: `flake.nix`, `flake.lock`
  - Pre-commit: `nix develop -c node -v`

- [ ] 4. Update tsconfig.json for modern settings + Velite paths

  **What to do**:
  - Change `"target": "es5"` → `"target": "ES2017"` (Next.js 16 minimum)
  - Change `"moduleResolution": "node"` → `"moduleResolution": "bundler"`
  - Remove path alias: `"contentlayer/generated": ["./.contentlayer/generated"]`
  - Add Velite path alias: `".velite/*": ["./.velite/*"]` (adjust based on Velite output structure)
  - Keep all other tsconfig settings unchanged

  **Must NOT do**:
  - Do NOT change `strict: true`
  - Do NOT add or remove other compiler options
  - Do NOT change the `@/*` path alias

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small, targeted edits to a JSON config file
  - **Skills**: [`typescript`]
    - `typescript`: tsconfig.json configuration knowledge

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Tasks 7, 8
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `tsconfig.json` — Current config with `es5` target, `node` moduleResolution, and `contentlayer/generated` path

  **WHY Each Reference Matters**:
  - `tsconfig.json`: Direct modification target. Must understand current structure to change only intended fields.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: tsconfig has modern settings
    Tool: Bash
    Preconditions: tsconfig.json updated
    Steps:
      1. Run `node -e "const c = require('./tsconfig.json'); console.log(c.compilerOptions.target, c.compilerOptions.moduleResolution)"`
      2. Verify output is 'ES2017 bundler' (or similar casing)
      3. Run `grep -c 'contentlayer' tsconfig.json` — verify output is 0
    Expected Result: Modern target/moduleResolution, no contentlayer references
    Failure Indicators: Old values remain or contentlayer path still present
    Evidence: .sisyphus/evidence/task-4-tsconfig.txt
  ```

  **Commit**: YES (groups with Tasks 1, 2, 3)
  - Message: `chore: prepare foundation for Next.js 16 upgrade`
  - Files: `tsconfig.json`
  - Pre-commit: `pnpm exec tsc --noEmit` (may fail until Wave 2 completes — that's OK)

- [ ] 5. Run Next.js upgrade codemod + React 19 upgrade

  **What to do**:
  - Run `pnpm dlx @next/codemod@canary upgrade latest` — this automates:
    - Next.js version bump to 16.x
    - React + React DOM upgrade to 19
    - Automated code transformations (imports, config changes)
  - After codemod: manually verify and fix any issues it reports
  - Update `@types/react` and `@types/react-dom` to React 19 compatible versions
  - If codemod fails due to Contentlayer peer dep conflict, use `--force` flag on pnpm install or remove `next-contentlayer` first
  - Verify `pnpm install` succeeds without errors

  **Must NOT do**:
  - Do NOT manually change things the codemod handles
  - Do NOT accept codemod suggestions to add features (middleware, etc.)
  - Do NOT change files outside what the codemod touches

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Codemod may produce complex output requiring interpretation and manual fixups
  - **Skills**: [`bun`, `typescript`]
    - `bun`: pnpm operations for version management
    - `typescript`: Understanding type-level breaking changes in React 19

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential — must complete before Wave 2 tasks
  - **Blocks**: Tasks 6, 9, 10, 11, 12, 13
  - **Blocked By**: Task 2 (needs clean deps)

  **References**:

  **Pattern References**:
  - `package.json` — Current Next.js 13.5.4, React 18.2.0 versions
  - `next.config.mjs` — May be modified by codemod

  **External References**:
  - Next.js 16 upgrade guide: https://nextjs.org/docs/app/building-your-application/upgrading
  - Next.js codemods: https://nextjs.org/docs/app/building-your-application/upgrading/codemods
  - React 19 migration: https://react.dev/blog/2024/12/05/react-19

  **WHY Each Reference Matters**:
  - `package.json`: Source of version constraints, codemod reads and modifies this
  - Next.js upgrade guide: Authoritative source for breaking changes and required manual steps
  - React 19 migration: Documents breaking changes in React's API

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Next.js 16 installed
    Tool: Bash
    Preconditions: Codemod completed
    Steps:
      1. Run `node -e "console.log(require('next/package.json').version)"`
      2. Verify output starts with '16.'
    Expected Result: Next.js 16.x installed
    Failure Indicators: Version < 16 or installation error
    Evidence: .sisyphus/evidence/task-5-nextjs-version.txt

  Scenario: React 19 installed
    Tool: Bash
    Preconditions: Codemod completed
    Steps:
      1. Run `node -e "console.log(require('react/package.json').version)"`
      2. Verify output starts with '19.'
    Expected Result: React 19.x installed
    Failure Indicators: Version < 19
    Evidence: .sisyphus/evidence/task-5-react-version.txt

  Scenario: pnpm install succeeds
    Tool: Bash
    Preconditions: All version bumps applied
    Steps:
      1. Run `pnpm install`
      2. Verify exit code 0
      3. Check no peer dependency errors (warnings OK)
    Expected Result: Clean install
    Failure Indicators: Non-zero exit code or unresolved peer deps
    Evidence: .sisyphus/evidence/task-5-pnpm-install.txt
  ```

  **Commit**: YES (groups with Tasks 6-10)
  - Message: `feat: upgrade Next.js 16, React 19, replace Contentlayer with Velite`
  - Files: `package.json`, `pnpm-lock.yaml`, any codemod-modified files
  - Pre-commit: `pnpm install`

- [ ] 6. Migrate @next/font → next/font in layout.tsx

  **What to do**:
  - In `app/layout.tsx`, change:
    - `import { Inter } from "@next/font/google"` → `import { Inter } from "next/font/google"`
    - `import LocalFont from "@next/font/local"` → `import localFont from "next/font/local"` (note: lowercase `localFont` is the new convention, but match existing usage)
  - Remove `@next/font` from `package.json` dependencies (if not already removed by codemod)
  - NOTE: The Next.js codemod in Task 5 may handle this automatically. Check first before making manual changes.

  **Must NOT do**:
  - Do NOT change font configuration (weight, subsets, etc.)
  - Do NOT change how fonts are applied to elements

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Two import path changes
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 7, 8, 9, 10 after Task 5)
  - **Parallel Group**: Wave 2b
  - **Blocks**: Task 15
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - `app/layout.tsx` — Current font imports using `@next/font/*`

  **WHY Each Reference Matters**:
  - `app/layout.tsx`: Direct modification target. Import lines to change.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: No @next/font references remain
    Tool: Bash
    Preconditions: layout.tsx updated
    Steps:
      1. Run `grep -rn '@next/font' app/`
      2. Verify no output (exit code 1)
      3. Run `grep -n 'next/font' app/layout.tsx`
      4. Verify matches show correct `next/font/google` and `next/font/local` imports
    Expected Result: All font imports use next/font, zero @next/font references
    Failure Indicators: Any @next/font reference found
    Evidence: .sisyphus/evidence/task-6-font-migration.txt
  ```

  **Commit**: YES (groups with Tasks 5, 7-10)
  - Message: `feat: upgrade Next.js 16, React 19, replace Contentlayer with Velite`
  - Files: `app/layout.tsx`

- [ ] 7. Migrate Contentlayer imports → Velite across all consumer files

  **What to do**:
  - Update `app/projects/page.tsx`:
    - Change import from `import { allProjects } from "contentlayer/generated"` → import from Velite output (e.g., `import { projects } from "@/.velite"`)
    - Adjust data access if field names differ (Velite may use `projects` not `allProjects`)
  - Update `app/projects/[slug]/page.tsx`:
    - Same import migration as above
    - Data access: `allProjects.find(...)` → `projects.find(...)` (or equivalent)
  - Update `app/projects/article.tsx`:
    - Change `import type { Project } from "@/.contentlayer/generated"` → import Project type from Velite output
    - Ensure type shape matches: `{ url?, title, description, repository?, date?, slug, published? }`
  - Verify all Contentlayer imports are gone: `grep -rn 'contentlayer' app/` should return nothing

  **Must NOT do**:
  - Do NOT change component logic or rendering
  - Do NOT modify how data is filtered, sorted, or displayed
  - Do NOT change the `Article` component interface beyond the type import

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple files with import changes that must maintain type compatibility
  - **Skills**: [`typescript`]
    - `typescript`: Ensuring type imports resolve correctly with new paths

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 8, 9, 10 after Task 5)
  - **Parallel Group**: Wave 2b
  - **Blocks**: Tasks 11, 15
  - **Blocked By**: Tasks 1 (Velite config), 4 (tsconfig paths), 5 (Next.js upgrade)

  **References**:

  **Pattern References**:
  - `app/projects/page.tsx` — Uses `allProjects` import, filters by `.published`, sorts by `.date`
  - `app/projects/[slug]/page.tsx` — Uses `allProjects.find(p => p.slug === slug)`, accesses `.body.code`
  - `app/projects/article.tsx` — Type definition for `Project` with url, title, description, repository, date, slug, published

  **External References**:
  - Velite output API: https://velite.js.org/guide/with-nextjs — How to import generated data

  **WHY Each Reference Matters**:
  - Each consumer file shows exactly what fields and access patterns are used — Velite output must satisfy all of them.
  - The `.body.code` access in `[slug]/page.tsx` is critical — this is how MDX is rendered. Velite may use a different field name.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Zero Contentlayer references in source
    Tool: Bash
    Preconditions: All imports migrated
    Steps:
      1. Run `grep -rn 'contentlayer' app/ --include='*.tsx' --include='*.ts'`
      2. Verify no output (exit code 1)
    Expected Result: Zero contentlayer references in app directory
    Failure Indicators: Any match found
    Evidence: .sisyphus/evidence/task-7-no-contentlayer.txt

  Scenario: TypeScript resolves Velite imports
    Tool: Bash
    Preconditions: Imports updated, tsconfig paths set
    Steps:
      1. Run `pnpm exec tsc --noEmit 2>&1 | grep -i 'velite\|cannot find module'`
      2. Verify no "cannot find module" errors for Velite paths
    Expected Result: TypeScript resolves all Velite imports
    Failure Indicators: Module resolution errors
    Evidence: .sisyphus/evidence/task-7-ts-imports.txt
  ```

  **Commit**: YES (groups with Tasks 5, 6, 8-10)
  - Message: `feat: upgrade Next.js 16, React 19, replace Contentlayer with Velite`
  - Files: `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`, `app/projects/article.tsx`

- [ ] 8. Rewrite mdx.tsx for Velite MDX rendering

  **What to do**:
  - Replace `app/components/mdx.tsx` entirely:
    - Remove `useMDXComponent` from `next-contentlayer/hooks`
    - Remove `@ts-nocheck` directive
    - Implement new MDX rendering based on Velite's output format:
      - If Velite outputs compiled MDX code: use `next-mdx-remote/rsc` with `MDXRemote` component
      - If Velite outputs HTML string: render with `dangerouslySetInnerHTML` (less ideal) or compile step
      - If Velite outputs raw MDX: use `next-mdx-remote/rsc` to compile on-the-fly
    - Install `next-mdx-remote` if needed: `pnpm add next-mdx-remote`
    - Pass custom MDX components (existing h1/h2 styles from `mdx-components.tsx`) to the renderer
  - The rendered output must preserve existing code syntax highlighting (rehype-pretty-code)
  - Exported component interface should remain compatible with `[slug]/page.tsx` usage

  **Must NOT do**:
  - Do NOT change the custom heading styles in `mdx-components.tsx`
  - Do NOT change how the MDX component is called from `[slug]/page.tsx`
  - Do NOT add new MDX components

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core rendering pipeline change — most complex task, requires understanding MDX compilation approaches
  - **Skills**: [`typescript`]
    - `typescript`: React component typing, MDX type definitions

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 7, 9, 10 after Task 5)
  - **Parallel Group**: Wave 2b
  - **Blocks**: Task 15
  - **Blocked By**: Tasks 1 (Velite config/output), 4 (tsconfig), 5 (Next.js upgrade)

  **References**:

  **Pattern References**:
  - `app/components/mdx.tsx` — Current implementation using `useMDXComponent(code)` from `next-contentlayer/hooks`. Contains `@ts-nocheck`.
  - `app/projects/[slug]/page.tsx` — How the Mdx component is consumed: `<Mdx code={project.body.code} />`
  - `mdx-components.tsx` — Custom h1/h2 components that must be passed to the new renderer

  **External References**:
  - next-mdx-remote RSC: https://github.com/hashicorp/next-mdx-remote — Server component MDX rendering
  - Velite MDX output docs: https://velite.js.org/reference/types — What Velite generates for MDX content

  **WHY Each Reference Matters**:
  - `mdx.tsx`: The file being rewritten. Understanding the current interface is critical.
  - `[slug]/page.tsx`: The consumer — shows what props the new component must accept.
  - `mdx-components.tsx`: Custom components that must be passed through to the renderer.
  - next-mdx-remote docs: The likely replacement rendering approach.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: MDX component renders project content
    Tool: Bash (curl)
    Preconditions: Dev server running with Velite + new mdx.tsx
    Steps:
      1. Run `curl -s localhost:3000/projects/nix-config`
      2. Verify response contains '<article' tag
      3. Verify response contains 'prose' class (Tailwind typography)
      4. Verify response contains '<pre' or '<code' tags (code blocks from rehype-pretty-code)
    Expected Result: MDX renders with article wrapper, prose styling, and syntax-highlighted code
    Failure Indicators: Empty article, no prose class, no code blocks
    Evidence: .sisyphus/evidence/task-8-mdx-render.txt

  Scenario: No @ts-nocheck in new implementation
    Tool: Bash
    Preconditions: mdx.tsx rewritten
    Steps:
      1. Run `grep -c 'ts-nocheck\|ts-ignore\|as any' app/components/mdx.tsx`
      2. Verify output is 0
    Expected Result: Clean TypeScript — no escape hatches
    Failure Indicators: Any type suppression found
    Evidence: .sisyphus/evidence/task-8-no-ts-escape.txt
  ```

  **Commit**: YES (groups with Tasks 5-7, 9-10)
  - Message: `feat: upgrade Next.js 16, React 19, replace Contentlayer with Velite`
  - Files: `app/components/mdx.tsx`

- [ ] 9. Migrate framer-motion → motion in card.tsx

  **What to do**:
  - Uninstall `framer-motion`: `pnpm remove framer-motion`
  - Install `motion`: `pnpm add motion`
  - In `app/components/card.tsx`, change:
    - `import { useMotionTemplate, useMotionValue, useSpring } from "framer-motion"` → `import { useMotionTemplate, useMotionValue, useSpring } from "motion/react"`
  - Verify the API surface is identical (these three hooks have the same signatures in motion v11+)

  **Must NOT do**:
  - Do NOT change any animation logic or values
  - Do NOT change the component's visual behavior
  - Do NOT touch any other file

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Package swap + single import line change
  - **Skills**: [`bun`]
    - `bun`: Package removal and installation

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 7, 8, 10 after Task 5)
  - **Parallel Group**: Wave 2b
  - **Blocks**: Task 15
  - **Blocked By**: Task 5 (React 19 required for motion v11)

  **References**:

  **Pattern References**:
  - `app/components/card.tsx` — Current imports from `framer-motion`: `useMotionTemplate`, `useMotionValue`, `useSpring`

  **External References**:
  - Motion migration guide: https://motion.dev/docs/upgrade-guide — framer-motion to motion migration

  **WHY Each Reference Matters**:
  - `card.tsx`: Only file using framer-motion. Import path is the only change needed.
  - Motion upgrade guide: Confirms API compatibility and correct import paths.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: No framer-motion references remain
    Tool: Bash
    Preconditions: Migration complete
    Steps:
      1. Run `grep -rn 'framer-motion' app/ package.json`
      2. Verify no output
      3. Run `grep -n 'motion/react' app/components/card.tsx`
      4. Verify import exists
    Expected Result: framer-motion completely replaced by motion
    Failure Indicators: Any framer-motion reference found
    Evidence: .sisyphus/evidence/task-9-motion-migration.txt

  Scenario: motion package installed correctly
    Tool: Bash
    Preconditions: Package swapped
    Steps:
      1. Run `node -e "require('motion/react')" && echo "OK"`
      2. Verify output is "OK"
    Expected Result: motion/react resolves without error
    Failure Indicators: Module not found error
    Evidence: .sisyphus/evidence/task-9-motion-installed.txt
  ```

  **Commit**: YES (groups with Tasks 5-8, 10)
  - Message: `feat: upgrade Next.js 16, React 19, replace Contentlayer with Velite`
  - Files: `app/components/card.tsx`, `package.json`, `pnpm-lock.yaml`

- [ ] 10. Migrate pages/api/incr.ts → app/api/incr/route.ts

  **What to do**:
  - Create `app/api/incr/route.ts` as an App Router Route Handler
  - Port the logic from `pages/api/incr.ts`:
    - POST-only handler (return 405 for other methods, or just export `POST` function)
    - JSON body parsing: `const body = await request.json(); const slug = body.slug`
    - IP extraction: change `req.ip` to `request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1'`
    - Same Redis operations: hash IP, check dedup key, increment pageviews
    - **FIX BUG**: Add missing `return` before `new NextResponse(null, { status: 202 })` on the dedup path (line ~42 in original). Without the return, the counter increments even when dedup should block it.
  - Keep Edge runtime: `export const runtime = "edge"`
  - Delete `pages/api/incr.ts` after new route is verified working
  - If `pages/` directory is now empty, delete it entirely
  - Update consumer `app/projects/[slug]/view.tsx` if the API path changes (it shouldn't — `/api/incr` stays the same)

  **Must NOT do**:
  - Do NOT change Redis key format (`pageviews:projects:{slug}`)
  - Do NOT change dedup TTL (24h)
  - Do NOT add new functionality to the endpoint
  - Do NOT change the response format

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: API migration with bug fix and IP extraction changes
  - **Skills**: [`typescript`]
    - `typescript`: NextRequest/NextResponse typing in App Router context

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 7, 8, 9 after Task 5)
  - **Parallel Group**: Wave 2b
  - **Blocks**: Task 15
  - **Blocked By**: Task 5 (Next.js upgrade)

  **References**:

  **Pattern References**:
  - `pages/api/incr.ts` — Current implementation: Edge runtime, POST handler, IP dedup via hashed key, Redis increment. BUG on line ~42: missing return.
  - `app/projects/[slug]/view.tsx` — Consumer: `fetch("/api/incr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) })`

  **External References**:
  - App Router Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

  **WHY Each Reference Matters**:
  - `pages/api/incr.ts`: Source logic to port. Must understand the dedup flow and identify the return bug.
  - `view.tsx`: Consumer — verifies the API path `/api/incr` doesn't change.
  - Route Handlers docs: Correct export pattern for App Router API routes.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: API route responds to POST
    Tool: Bash (curl)
    Preconditions: Dev server running with new route
    Steps:
      1. Run `curl -s -X POST -H 'Content-Type: application/json' -d '{"slug":"test-qa"}' localhost:3000/api/incr -o /dev/null -w '%{http_code}'`
      2. Verify output is '202'
    Expected Result: POST returns 202
    Failure Indicators: 404, 405, 500, or other non-202 status
    Evidence: .sisyphus/evidence/task-10-api-post.txt

  Scenario: API rejects non-POST methods
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. Run `curl -s -X GET localhost:3000/api/incr -o /dev/null -w '%{http_code}'`
      2. Verify output is '405' (Method Not Allowed)
    Expected Result: GET returns 405
    Failure Indicators: 200 or 500
    Evidence: .sisyphus/evidence/task-10-api-method-reject.txt

  Scenario: Old pages/api route removed
    Tool: Bash
    Preconditions: Migration complete
    Steps:
      1. Run `ls pages/api/incr.ts 2>&1`
      2. Verify file does not exist
      3. Run `ls app/api/incr/route.ts`
      4. Verify file exists
    Expected Result: Old file gone, new file present
    Failure Indicators: Old file still exists or new file missing
    Evidence: .sisyphus/evidence/task-10-route-migration.txt
  ```

  **Commit**: YES (groups with Tasks 5-9)
  - Message: `feat: upgrade Next.js 16, React 19, replace Contentlayer with Velite`
  - Files: `app/api/incr/route.ts` (new), `pages/api/incr.ts` (deleted), possibly `pages/` directory

- [ ] 11. Update next.config.mjs — remove withContentlayer, add Velite build trigger

  **What to do**:
  - Remove `import { withContentlayer } from "next-contentlayer"` from `next.config.mjs`
  - Remove the `withContentlayer()` wrapper around `nextConfig`
  - Remove `experimental: { mdxRs: true }` (no longer needed — Velite handles MDX compilation)
  - Add Velite build integration per Velite's Next.js guide. Typical pattern:
    ```js
    import { build } from 'velite'
    // In webpack or turbopack config:
    // Add velite build step before Next.js compilation
    ```
  - Keep `pageExtensions` if still needed, or remove if default is sufficient
  - Export the config directly: `export default nextConfig`

  **Must NOT do**:
  - Do NOT add new experimental flags
  - Do NOT add Turbopack config (Next.js 16 defaults to Turbopack, no config needed)
  - Do NOT change the config structure beyond what's needed

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Config file cleanup — remove wrapper, add build hook
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6-10 after Task 5)
  - **Parallel Group**: Wave 2b
  - **Blocks**: Task 15
  - **Blocked By**: Task 5 (Next.js upgrade — need to see what codemod already changed)

  **References**:

  **Pattern References**:
  - `next.config.mjs` — Current config: imports withContentlayer, wraps nextConfig, has experimental.mdxRs
  
  **External References**:
  - Velite + Next.js integration: https://velite.js.org/guide/with-nextjs — How to trigger Velite build from next.config

  **WHY Each Reference Matters**:
  - `next.config.mjs`: Direct modification target. Need to understand current wrapper structure.
  - Velite docs: Required pattern for build integration.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: next.config clean of Contentlayer
    Tool: Bash
    Preconditions: Config updated
    Steps:
      1. Run `grep -c 'contentlayer\|withContentlayer' next.config.mjs`
      2. Verify output is 0
    Expected Result: Zero Contentlayer references in config
    Failure Indicators: Any match found
    Evidence: .sisyphus/evidence/task-11-config-clean.txt

  Scenario: next.config exports valid config
    Tool: Bash
    Preconditions: Config updated
    Steps:
      1. Run `node -e "import('./next.config.mjs').then(c => console.log(typeof c.default))"`
      2. Verify output is 'object'
    Expected Result: Config exports a valid object
    Failure Indicators: Import error or undefined
    Evidence: .sisyphus/evidence/task-11-config-valid.txt
  ```

  **Commit**: YES (groups with Tasks 5-10)
  - Message: `feat: upgrade Next.js 16, React 19, replace Contentlayer with Velite`
  - Files: `next.config.mjs`

- [ ] 12. Move Analytics from head to body + async params fix

  **What to do**:
  - In `app/layout.tsx`:
    - Move `<Analytics />` component from inside `<head>` to inside `<body>` (before closing `</body>` tag)
    - Or convert to use `next/script` with `strategy="afterInteractive"` for the Beam Analytics script
  - In `app/projects/[slug]/page.tsx`:
    - Make `params` async: change function signature to accept `Promise<{ slug: string }>`
    - Add `const { slug } = await params` at the start of the function body
    - Update `generateMetadata` similarly if it uses params
    - Update `generateStaticParams` if needed
  - Check if Next.js 16 codemod (Task 5) already handled the params change — skip if so

  **Must NOT do**:
  - Do NOT change the Analytics tracking behavior
  - Do NOT add new analytics
  - Do NOT change page layout beyond moving the Analytics component

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small targeted changes in two files
  - **Skills**: [`typescript`]
    - `typescript`: Async params typing

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6-11 after Task 5)
  - **Parallel Group**: Wave 2b
  - **Blocks**: Task 15
  - **Blocked By**: Task 5 (Next.js upgrade — need to see what codemod already changed)

  **References**:

  **Pattern References**:
  - `app/layout.tsx` — `<Analytics />` currently inside `<head>` tag
  - `app/projects/[slug]/page.tsx` — `params` accessed as `params?.slug` synchronously
  - `app/components/analytics.tsx` — The Analytics component implementation (Beam Analytics script)

  **External References**:
  - Next.js async params: https://nextjs.org/docs/app/building-your-application/upgrading/version-15#params--searchparams

  **WHY Each Reference Matters**:
  - `layout.tsx`: Where Analytics component needs to move from head to body.
  - `[slug]/page.tsx`: Where params async change is needed.
  - `analytics.tsx`: Understand what the component renders to decide best placement approach.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Analytics not in head
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. Run `curl -s localhost:3000 | grep -A2 '</head>'`
      2. Verify no script tags for analytics appear before </head>
      3. Run `curl -s localhost:3000 | grep -B2 '</body>'`
      4. Verify analytics script appears before </body>
    Expected Result: Analytics renders in body, not head
    Failure Indicators: Analytics script in head
    Evidence: .sisyphus/evidence/task-12-analytics-body.txt

  Scenario: Dynamic project page renders (async params working)
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. Run `curl -s localhost:3000/projects/nix-config -o /dev/null -w '%{http_code}'`
      2. Verify output is '200'
    Expected Result: Page renders without params-related error
    Failure Indicators: 500 error, params undefined
    Evidence: .sisyphus/evidence/task-12-async-params.txt
  ```

  **Commit**: YES (groups with Tasks 5-11)
  - Message: `feat: upgrade Next.js 16, React 19, replace Contentlayer with Velite`
  - Files: `app/layout.tsx`, `app/projects/[slug]/page.tsx`

- [ ] 13. Final cleanup — remove Contentlayer, add engines field, verify build

  **What to do**:
  - Remove packages: `pnpm remove contentlayer next-contentlayer`
  - Delete `contentlayer.config.js`
  - Delete `.contentlayer/` directory if it exists
  - Update `.gitignore`: remove `.contentlayer` entry, ensure `.velite` is present
  - Add to `package.json`: `"engines": { "node": ">=22" }` — this tells Vercel to use Node 22 runtime
  - Run full build: `pnpm build`
  - Fix any remaining TypeScript or build errors
  - Run `pnpm exec tsc --noEmit` to verify zero type errors

  **Must NOT do**:
  - Do NOT remove any other packages
  - Do NOT make source code changes (all migration should be done by now)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Build verification may reveal issues that need debugging
  - **Skills**: [`bun`, `typescript`]
    - `bun`: Package removal, build commands
    - `typescript`: Diagnosing type errors

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential — depends on ALL Wave 2 tasks)
  - **Blocks**: Final Verification Wave
  - **Blocked By**: Tasks 5-12 (all Wave 2 tasks)

  **References**:

  **Pattern References**:
  - `package.json` — Contentlayer deps to remove, engines field to add
  - `.gitignore` — Update .contentlayer → .velite entries
  - `contentlayer.config.js` — File to delete

  **WHY Each Reference Matters**:
  - `package.json`: Remove dead deps, add engines field for Vercel runtime.
  - `.gitignore`: Clean up generated directory references.
  - `contentlayer.config.js`: Verify deletion target exists.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Build succeeds
    Tool: Bash
    Preconditions: All migration tasks complete
    Steps:
      1. Run `pnpm build`
      2. Verify exit code 0
    Expected Result: Production build completes without errors
    Failure Indicators: Non-zero exit code, compilation errors
    Evidence: .sisyphus/evidence/task-13-build.txt

  Scenario: Zero type errors
    Tool: Bash
    Preconditions: Build completed
    Steps:
      1. Run `pnpm exec tsc --noEmit`
      2. Verify exit code 0
    Expected Result: No TypeScript errors
    Failure Indicators: Type errors reported
    Evidence: .sisyphus/evidence/task-13-tsc.txt

  Scenario: No Contentlayer traces remain
    Tool: Bash
    Preconditions: Cleanup complete
    Steps:
      1. Run `grep -rn 'contentlayer' . --include='*.ts' --include='*.tsx' --include='*.js' --include='*.mjs' --include='*.json' --exclude-dir=node_modules --exclude-dir=.git`
      2. Verify no output (exit code 1)
      3. Run `ls contentlayer.config.js 2>&1`
      4. Verify file does not exist
    Expected Result: Zero Contentlayer references anywhere in project
    Failure Indicators: Any match found or config file still exists
    Evidence: .sisyphus/evidence/task-13-no-contentlayer.txt

  Scenario: Node.js engines field present
    Tool: Bash
    Preconditions: package.json updated
    Steps:
      1. Run `node -e "console.log(require('./package.json').engines.node)"`
      2. Verify output is '>=22' or similar
    Expected Result: engines.node constraint set for Vercel
    Failure Indicators: undefined or missing
    Evidence: .sisyphus/evidence/task-13-engines.txt
  ```

  **Commit**: YES
  - Message: `chore: remove Contentlayer remnants, add Node.js engine constraint`
  - Files: `package.json`, `pnpm-lock.yaml`, `.gitignore`, `contentlayer.config.js` (deleted)
  - Pre-commit: `pnpm build`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `pnpm exec tsc --noEmit` + `pnpm build`. Review all changed files for: `as any`/`@ts-ignore`/`@ts-nocheck`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names. Verify no `contentlayer`, `@next/font`, or `framer-motion` references remain.
  Output: `Build [PASS/FAIL] | TypeCheck [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Full QA — All Pages + API** — `unspecified-high`
  Start dev server. Curl every page: `/`, `/projects`, `/projects/nix-config`, `/projects/zshen-dev`, `/projects/spotify-stats`, `/contact`. Verify each returns 200 with expected content. POST to `/api/incr` with valid and invalid payloads. Test dedup behavior. Save all evidence to `.sisyphus/evidence/final-qa/`.
  Output: `Pages [N/N pass] | API [N/N pass] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git diff). Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Detect cross-task contamination. Flag any Tailwind v4 changes, new features, or styling modifications.
  Output: `Tasks [N/N compliant] | Scope [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

| After | Message | Files | Pre-commit |
|-------|---------|-------|------------|
| Tasks 1-4 | `chore: prepare foundation for Next.js 16 upgrade` | velite.config.ts, tsconfig.json, flake.nix, package.json | `pnpm exec tsc --noEmit` |
| Tasks 5-12 | `feat: upgrade Next.js 16, React 19, replace Contentlayer with Velite` | All migrated files, next.config.mjs, layout.tsx | `pnpm build` |
| Task 13 | `chore: remove Contentlayer remnants, add Node.js engine constraint` | package.json, .gitignore, contentlayer.config.js (deleted) | `pnpm build` |
| Final wave | `chore: post-upgrade verification complete` | Evidence files only if any fixes needed | `pnpm build` |

---

## Success Criteria

### Verification Commands
```bash
pnpm build                    # Expected: exits 0, no errors
pnpm exec tsc --noEmit        # Expected: exits 0, no type errors
node -v                       # Expected: v22.x.x
curl -s localhost:3000         # Expected: contains "zshen"
curl -s localhost:3000/projects # Expected: contains project titles
curl -s -X POST -H 'Content-Type: application/json' -d '{"slug":"test"}' localhost:3000/api/incr -w '%{http_code}' # Expected: 202
```

### Final Checklist
- [ ] All "Must Have" items present and verified
- [ ] All "Must NOT Have" items confirmed absent
- [ ] Zero `contentlayer` references in source files
- [ ] Zero `@next/font` references in source files
- [ ] Zero `framer-motion` references in source files
- [ ] `pnpm build` passes
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] All pages render with content
- [ ] API route works with dedup
