
## Wave 1 - Task 2: Clean Dependencies & Fix fmt Script

**Completed:** 2026-03-01

### Changes Made
1. **Ghost dependencies removed from dependencies:**
   - @next/mdx (^13.5.4)
   - markdown-wasm (^1.2.0)
   - react-wrap-balancer (^1.1.0)

2. **Ghost dependencies removed from devDependencies:**
   - @opentelemetry/api (1.6.0)
   - @tailwindcss/line-clamp (^0.4.4)

3. **OpenTelemetry overrides removed:**
   - All 7 @opentelemetry/* entries cleared from pnpm.overrides (was for Next.js 13 compat)

4. **fmt script updated:**
   - Changed from: `pnpm rome check . --apply-unsafe && pnpm rome format . --write`
   - Changed to: `pnpm biome check . --apply-unsafe && pnpm biome format . --write`

### Verification
- grep shows zero matches for ghost deps and opentelemetry in package.json
- pnpm install completed successfully
- fmt script now references biome (matching rome.json → biome.json migration)

### Blocked Dependencies
- contentlayer@0.3.4 has unmet peer dependency on esbuild@0.17.x||0.18.x (found 0.19.4)
  - Not critical for this task; will be addressed in future codemod phase

### Next Steps
- Task 5 (codemod) can now proceed with clean deps

## Wave 1 - Task 6: Update tsconfig.json for Next.js 16

**Completed:** 2026-03-01

### Changes Made
1. **target:** Changed from `es5` to `ES2017` (required for Next.js 16+)
2. **moduleResolution:** Changed from `node` to `bundler` (modern Next.js/TypeScript recommendation)
3. **Removed contentlayer path:** Deleted `"contentlayer/generated": ["./.contentlayer/generated"]`
4. **Added Velite path:** Added `".velite/*": ["./.velite/*"]` (for Velite MDX content replacement)

### Verification
- JSON validity: ✓ Confirmed with `node -e`
- target: ✓ ES2017
- moduleResolution: ✓ bundler
- Paths configured: ✓ @/* and .velite/* present
- contentlayer references: ✓ Zero matches (fully removed)
- Other options preserved: ✓ strict, baseUrl, all other settings intact

### Key Points
- ES2017 is minimum target for Next.js 16 compatibility
- "bundler" moduleResolution aligns with modern bundler tooling (vs deprecated Node resolution)
- Velite output directory convention: `./.velite/*`
- All other compiler options preserved (strict: true, etc.)

### Blocked By
- None; independent configuration change

### Blocks
- Tasks 7, 8 (Velite path now available for imports)

## Node.js 22 Upgrade - Task 3

**Date:** 2026-03-01

### Changes Made
1. Updated `flake.nix` line 21: `prev.nodejs` → `prev.nodejs_22`
2. Removed `node2nix` from packages (incompatible with build, not needed for dev)
3. Ran `nix flake update` to lock nixpkgs input

### Verification Results
✅ `nix develop -c node -v` outputs: v22.22.0
✅ `nix develop -c echo ok` succeeds (flake evaluates without errors)
✅ `flake.lock` updated to lock new nixpkgs revision

### Technical Notes
- `node2nix` failed during build with npm not found error in sandboxed environment
- Removing it from packages doesn't affect dev environment functionality
- Yarn and pnpm still available (node_22 includes nodePackages)
- Flake supports multi-platform: x86_64-linux, aarch64-linux, x86_64-darwin, aarch64-darwin

### Dependencies Met
- Task 3 complete
- Ready for Task 13 verification (needs Node 22)

## Wave 1 - Task 1: Set Up Velite Config

**Completed:** 2026-03-01

### Changes Made
1. **Installed Velite** as devDependency (`velite@0.3.1`)
2. **Created `velite.config.ts`** mirroring Contentlayer schema:
   - Project collection reading from `content/projects/**/*.mdx`
   - Fields: title, description (nullable, defaults to ""), date (isodate, optional), published (boolean, default false), url (optional), repository (optional), body (mdx), slug (path)
   - Computed fields via `.transform()`: slug strips first path segment, path prefixed with `/projects/`
3. **Added `.velite` to `.gitignore`**
4. **Upgraded rehype-pretty-code** from 0.10.1 → 0.14.1 (old version incompatible with Velite's unified pipeline)
5. **Added shiki@3.23.0** (required by rehype-pretty-code 0.14.x)
6. **Upgraded remark-gfm** from 3.0.1 → 4.0.1 (v3 CJS was incompatible with Velite's unified v11 ESM internals — caused `this.getData is not a function` error)

### Plugin Configuration
- remarkPlugins: [remarkGfm]
- rehypePlugins: [rehypeSlug, [rehypePrettyCode, { theme: "github-dark" }], rehypeAutolinkHeadings]
- Order matches original contentlayer.config.js

### Root Cause of `this.getData is not a function`
- **remark-gfm v3.0.1** (CJS) was incompatible with Velite's internal unified v11 (ESM)
- The error appeared on any MDX file with actual body content (nix-config.mdx) but not empty-body files
- Upgrading to remark-gfm v4.0.1 (ESM, unified v11 compatible) resolved it completely
- rehype-pretty-code v0.10.1 had the same class of issue (shiki 0.14.x `this.getData` API); upgrading to v0.14.1 + shiki 3.x fixed it

### Verification
- `pnpm exec velite build` exits 0 with 0 errors
- `.velite/projects.json` contains 3 projects with correct fields
- All computed fields (slug, path) match Contentlayer's output format
- LSP diagnostics clean on velite.config.ts
- nix-config.mdx MDX body compiles to JSX successfully

### Output (`.velite/projects.json`)
- highstorm: published=false, empty body, slug="highstorm", path="/projects/highstorm"
- nix-config: published=true, full MDX body, slug="nix-config", path="/projects/nix-config", repository="zhongjis/nix-config"
- planetfall: published=true, empty body, slug="planetfall", path="/projects/planetfall"

## Wave 2a - Task 5: Next.js 16 + React 19 Codemod Upgrade

**Completed:** 2026-03-01

### Changes Made
1. Ran `pnpm dlx @next/codemod@canary upgrade latest` (non-interactive defaults) to perform framework/runtime upgrade.
2. Upgraded core versions in `package.json`:
   - `next`: `13.5.x` → `16.1.6`
   - `react` / `react-dom`: `18.2.0` → `19.2.4`
   - `@types/react` / `@types/react-dom`: upgraded to React 19-compatible versions (`19.2.14` / `19.2.3`)
3. Codemod-updated source files:
   - `app/projects/[slug]/page.tsx` (async params shape for modern App Router)
   - `pages/api/incr.ts` (`req.ip` migration to `ipAddress(req)` with `@vercel/functions`)
   - `app/components/mdx.tsx`, `types/mdx.d.ts`
4. Manual fixup after codemod:
   - Corrected `generateStaticParams` return typing in `app/projects/[slug]/page.tsx` by splitting `Params` from `Props` and returning `Promise<Params[]>`.

### Verification
- `pnpm install` exits 0
- `node -e` version check confirms:
  - `next=16.1.6` (starts with `16.`)
  - `react=19.2.4` (starts with `19.`)
- LSP diagnostics clean for changed TS/TSX/DTS files

### Notes
- Codemod also created `eslint.config.mjs` via `next-lint-to-eslint-cli` recommendation.
- Peer warnings remain for `next-contentlayer` and `framer-motion` (known follow-up compatibility work).

### Additional Manual Fixups (Post-verification)
- Build-time module resolution required migrating `contentlayer/generated` imports to `@/.contentlayer/generated` in project pages.
- React 19 compatibility required upgrading `framer-motion` to `12.34.3`.
- Next.js 16 font handling required moving imports from `@next/font/*` to `next/font/*` and removing `@next/font` dependency.
- `next build` now defaults to Turbopack in v16; this repo currently needs explicit webpack mode for successful production build verification (`next build --webpack`).
- Build succeeded end-to-end after these fixups (with expected missing Upstash env warnings and content warnings).

## Wave 2b - Task 9: Update next.config.mjs for Velite Integration

**Completed:** 2026-03-01

### Changes Made
1. **Removed Contentlayer import:** Deleted `import { withContentlayer } from "next-contentlayer"`
2. **Removed Contentlayer wrapper:** Changed `export default withContentlayer(nextConfig)` → `export default nextConfig`
3. **Removed experimental.mdxRs:** Deleted `experimental: { mdxRs: true }` block (Velite handles MDX compilation, no longer needed)
4. **Added Velite build integration:**
   - Imported `build` from "velite"
   - Added webpack config with custom plugin that hooks into compiler.hooks.beforeCompile
   - Async call to `await build()` ensures Velite generates `.velite/` before Next.js compilation
5. **Removed pageExtensions:** No longer needed since Velite handles MDX files independently

### Config Structure
```javascript
import { build } from "velite";
const nextConfig = {
  webpack: (config) => {
    config.plugins.push(
      new (class {
        apply(compiler) {
          compiler.hooks.beforeCompile.tapPromise("velite", async () => {
            await build();
          });
        }
      })(),
    );
    return config;
  },
};
export default nextConfig;
```

### Verification
- ✓ Config exports valid object (typeof === 'object')
- ✓ webpack config present and valid
- ✓ Zero Contentlayer references (grep confirms)
- ✓ Velite build function accessible from module
- ✓ Syntax valid (Node.js imports successfully)

### Technical Notes
- Webpack plugin pattern: Custom anonymous class with `apply(compiler)` method
- Hook used: `compiler.hooks.beforeCompile.tapPromise()` ensures Velite builds before Next.js compilation
- Velite build is async, hence tapPromise (not tap)
- Plugin registration via `config.plugins.push()` is standard Next.js webpack config pattern

### Blocks
- Task 13 (Next.js build verification) can now proceed without Contentlayer errors

## Task 9: Migrate Contentlayer Imports to Velite (Consumer Files)

### Import path mapping:
- Contentlayer: `import { allProjects } from "@/.contentlayer/generated"` → Velite: `import { projects } from ".velite"`
- Contentlayer: `import type { Project } from "@/.contentlayer/generated"` → Velite: `import type { Project } from ".velite"`
- tsconfig alias: `.velite/*` → `./.velite/*`

### Key data shape differences:
- Velite uses `projects` (not `allProjects`)
- Velite: `project.body` is a string directly (MDX compiled code)
- Contentlayer: `project.body.code` was nested object
- Velite projects have: title, description, date, published, body, slug, path, repository (optional)

### Remaining contentlayer reference:
- `app/components/mdx.tsx` still imports from `next-contentlayer/hooks` — needs separate MDX rendering task

### Notes:
- Zero LSP errors after migration
- The `.velite/index.d.ts` derives Project type from velite.config.ts collections schema automatically

## Task 8: MDX Component Rewrite for Velite

### Key Discovery: next-mdx-remote/rsc is WRONG for Velite
- Velite's `s.mdx()` outputs **already-compiled JavaScript** function-body strings, NOT raw MDX source
- The compiled output looks like: `const{Fragment:n,jsx:e}=arguments[0];function _createMdxContent(t){...}`
- `next-mdx-remote/rsc` expects raw MDX source → would fail with Velite output
- Correct pattern: `new Function(code)({ ...runtime }).default` using `react/jsx-runtime`

### Velite MDX Rendering Pattern (Official)
```tsx
import * as runtime from 'react/jsx-runtime'

function useMDXComponent(code: string) {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}
```

### Interface Compatibility
- Kept same `Mdx({ code }: MdxProps)` interface for [slug]/page.tsx compatibility
- [slug]/page.tsx currently does `<Mdx code={project.body.code} />` — this works because:
  - Old Contentlayer: `project.body.code` was the compiled MDX string
  - New Velite: `project.body` IS the compiled MDX string (body field from `s.mdx()`)
  - [slug]/page.tsx will need update in another task to use `project.body` instead of `project.body.code`

### TypeScript Improvements
- Removed `@ts-nocheck` directive
- Added proper HTML element type annotations to all component props (e.g. `React.HTMLAttributes<HTMLHeadingElement>`)
- No `any` types needed — `clsx` properly typed with `(string | undefined | null | false)[]`
- Zero LSP diagnostics

### No Additional Dependencies Needed
- Did NOT need to install `next-mdx-remote` — Velite's pattern only requires `react/jsx-runtime` (already available)


## Wave 2b - Task 10: Migrate pages/api/incr.ts to App Router Route Handler

**Completed:** 2026-03-01

### Changes Made
1. **Created `app/api/incr/route.ts`** as App Router Route Handler
   - Exports `runtime = "edge"` (replaces Pages Router `config.runtime`)
   - Exports named `POST()` function (replaces `default export` with method check)
   - Uses `NextRequest`/`NextResponse` from `next/server`
2. **Fixed dedup bug**: Added missing `return` before `new NextResponse(null, { status: 202 })` on line 42 of original
   - Original: `new NextResponse(null, { status: 202 })` — created response but didn't return it
   - Fix: `return new NextResponse(null, { status: 202 })` — properly exits early when dedup blocks
   - Without fix: counter incremented even when same IP visited within 24h
3. **IP extraction changed**: `req.ip` → `request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1'`
   - `req.ip` is not available in App Router Route Handlers
   - x-forwarded-for header is standard for IP extraction in edge runtime
4. **Deleted `pages/api/incr.ts`** and empty `pages/` directory

### Key Differences: Pages Router API → App Router Route Handler
- `export default function handler(req)` → `export async function POST(request)`
- `export const config = { runtime: 'edge' }` → `export const runtime = 'edge'`
- Method checked via `req.method !== 'POST'` → Named export handles routing
- `req.ip` → `request.headers.get('x-forwarded-for')`

### Verification
- ✓ LSP diagnostics clean on new route.ts
- ✓ pages/api/incr.ts removed
- ✓ pages/ directory removed (was only entry)
- ✓ Consumer (app/projects/[slug]/view.tsx) uses `/api/incr` path — unchanged
- ✓ Redis key format preserved: `pageviews:projects:{slug}` and `deduplicate:{hash}:{slug}`

## Wave 3 - Task 13: Final Contentlayer Cleanup

**Completed:** 2026-03-01

### Changes Made
1. **Removed contentlayer packages:** `pnpm remove contentlayer next-contentlayer` (removed 206 transitive packages)
2. **Deleted contentlayer.config.js** (no longer needed)
3. **Deleted .contentlayer/ directory** (replaced by .velite/)
4. **Updated .gitignore:** Removed `.contentlayer` entry, kept `.velite` (fixed duplicate `.velite` line)
5. **Added engines field to package.json:** `"engines": { "node": ">=22" }`
6. **Fixed tsconfig.json paths:** Added `.velite` → `./.velite` mapping (base path, not just glob) for `from ".velite"` imports
7. **Fixed velite.config.ts:** Changed `clean: true` → `clean: false` to prevent .velite/ being emptied during multi-pass webpack compilation

### Build Issue: velite `clean: true` + webpack multi-compilation
- Velite's `clean: true` empties the `.velite/` output directory before each build
- Next.js webpack triggers `beforeCompile` hook 3 times (multiple compilation passes)
- With `clean: true`, the third pass would clean the second pass's output, then write, but the files were gone by type-checking time
- Fix: Set `clean: false` — velite overwrites files in-place without wiping the directory

### tsconfig.json path resolution
- `.velite/*` → `./.velite/*` only resolves subpath imports like `.velite/projects`
- `from ".velite"` (bare module) needs a separate `.velite` → `./.velite` mapping
- Both paths are now present for complete coverage

### Verification
- ✓ `pnpm exec tsc --noEmit` exits 0
- ✓ `pnpm build` compiles and type-checks successfully (prerender errors are expected without Redis env vars)
- ✓ Zero contentlayer references in source (only comments in velite.config.ts explaining migration rationale)
- ✓ Zero LSP diagnostics on all changed files
- ✓ package.json has `engines.node >= 22`

### Prerender Errors (Pre-existing, Not Related)
- `Failed to parse URL from /pipeline` — Upstash Redis client needs `UPSTASH_REDIS_REST_URL` env var
- These only occur during static generation without env vars (expected in local builds)