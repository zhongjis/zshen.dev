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
pnpm fmt                                  # Biome format/write for configured files
pnpm exec tsc --noEmit --pretty false     # typecheck
```

No test script exists currently. For code changes, run focused typecheck plus `pnpm build` when build-affecting.

## Current stack facts

- Next.js 16 App Router, TypeScript, Tailwind CSS, deployed on Vercel.
- Velite compiles MDX from `content/projects/**/*.mdx` into `.velite`. Import generated project data from `.velite`.
- `velite.config.ts` defines content schema. `next.config.mjs` runs Velite before Next build.
- Do NOT reintroduce Contentlayer or `contentlayer/generated`; migration is complete.
- App Router route handler `app/api/incr/route.ts` is the Redis view-counter API (`POST /api/incr`).

## Design Context

Design direction lives in two root docs; read them before changing visuals.

- `PRODUCT.md` — strategy: register `brand`, audience, brand personality, anti-references, design principles.
- `DESIGN.md` — visual system: "Personal Workshop Notebook", dark purple OKLCH field, Charter serif, rare green signal, mono labels, rows-not-cards. Source tokens live in `global.css` `:root`.
- Keep Mitchell Hashimoto influence as structural lineage only (sticky rail, hash-target panels). No gradient text, decorative glass, pure black/white, or colored side-stripe borders.
- Run `/impeccable` commands for design work; live mode is configured in `.impeccable/live/config.json`.

## Where to edit

| Task | Location | Notes |
| --- | --- | --- |
| Add active project | `content/projects/*.mdx` | Follow `velite.config.ts` schema: `published`, `title`, `description`, `date`, optional `url`, `repository`, `tags`; `slug`/`path` are generated |
| Edit layout/metadata | `app/layout.tsx` | Root layout, fonts, metadata |
| Modify thoughts listing | `app/(site)/thoughts/page.tsx` | Server component; keep published filtering/sort pattern |
| Modify thought detail | `app/(site)/thoughts/[slug]/page.tsx` | Imports project data from `.velite` |
| Change MDX schema/rendering | `velite.config.ts`, `mdx-components.tsx` | Keep Velite output compatible with existing imports |
| Modify page views | `app/api/incr/route.ts`, `app/(site)/thoughts/[slug]/view.tsx` | Uses Upstash Redis REST env vars |
| Change styling/animations | `tailwind.config.js`, `global.css` | Match existing Tailwind/custom CSS patterns |
| Add page route | `app/(site)/{route}/page.tsx` | App Router only; legacy `/projects/*` redirects to `/thoughts/*` in `next.config.mjs` |

## Conventions

- Server Components by default. Add `"use client"` only for hooks, event handlers, or browser APIs.
- New pages go under `app/`; do not add Pages Router pages.
- API routes go under `app/api/` unless doing a deliberate Pages Router migration.
- TypeScript strict mode: no `as any`, no `@ts-ignore`, no `@ts-nocheck` unless user explicitly approves.
- Biome is formatting/linting tool. Do not add ESLint or Prettier.
- Path aliases: `@/*` -> repo root; `.velite` and `.velite/*` -> generated Velite output.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | Redis connection URL |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth token |

## Known build warnings

Env-less local `pnpm build` succeeds but warns that `highstorm.mdx`/`planetfall.mdx` have empty bodies and Upstash Redis env vars are missing. Do not treat these as failures unless working on content quality or view counts.
