
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
