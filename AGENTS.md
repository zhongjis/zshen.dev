# AGENTS.md
This file is agent execution contract for `zshen.dev`. Keep it short; stale facts cause bad changes.

## Environment workflow

IMPORTANT: direnv loads this repo's Nix flake automatically.

- Run repo commands directly: `pnpm build`, `pnpm fmt`, `pnpm exec tsc --noEmit --pretty false`.
- Do NOT prefix normal commands with `nix develop`.
- Use `nix develop` only as fallback when direnv is inactive/unavailable or you are outside the repo shell.
- Use pnpm only. Do not use npm/yarn.

## Commands

```bash
pnpm dev                                  # local dev server
pnpm build                                # production build; runs Velite first via next.config.mjs
pnpm start                                # production server
pnpm fmt                                  # Biome check/write formatting
pnpm exec tsc --noEmit --pretty false     # typecheck
```

No test script exists currently. For code changes, run focused typecheck plus `pnpm build` when build-affecting.

## Current stack facts

- Next.js 16 App Router, TypeScript, Tailwind CSS, deployed on Vercel.
- Velite compiles MDX from `content/projects/**/*.mdx` into `.velite`. Import generated project data from `.velite`.
- `velite.config.ts` defines content schema. `next.config.mjs` runs Velite before Next build.
- Do NOT reintroduce Contentlayer or `contentlayer/generated`; migration is complete.
- Pages Router is used only for `pages/api/incr.ts` Redis view-counter API.

## Where to edit

| Task | Location | Notes |
| --- | --- | --- |
| Add active project | `content/projects/*.mdx` | Follow `velite.config.ts` schema: `published`, `title`, `description`, `date` |
| Edit layout/metadata | `app/layout.tsx` | Root layout, fonts, metadata |
| Modify project listing | `app/projects/page.tsx` | Server component; keep filtering/sorting pattern |
| Modify project detail | `app/projects/[slug]/page.tsx` | Imports project data from `.velite` |
| Change MDX schema/rendering | `velite.config.ts`, `mdx-components.tsx` | Keep Velite output compatible with existing imports |
| Modify page views | `pages/api/incr.ts` | Uses Upstash Redis REST env vars |
| Change styling/animations | `tailwind.config.js`, `global.css` | Match existing Tailwind/custom CSS patterns |
| Add page route | `app/{route}/page.tsx` | App Router only |

## Conventions

- Server Components by default. Add `"use client"` only for hooks, event handlers, or browser APIs.
- New pages go under `app/`; do not add Pages Router pages.
- API routes stay in `pages/api/` unless doing a deliberate migration.
- TypeScript strict mode: no `as any`, no `@ts-ignore`, no `@ts-nocheck` unless user explicitly approves.
- Biome is formatting/linting tool. Do not add ESLint or Prettier.
- Path aliases: `@/*` -> repo root; `.velite` and `.velite/*` -> generated Velite output.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | Redis connection URL |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth token |

## Known build warnings

`pnpm build` currently succeeds but warns that `highstorm.mdx` and `planetfall.mdx` have empty bodies. Do not treat these warnings as failures unless working on content quality.
