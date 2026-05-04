# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-01  
**Commit:** cca5ca1  
**Branch:** main

## OVERVIEW

Personal portfolio site (zshen.dev) built with Next.js 13.5 App Router + Contentlayer for MDX content. Deployed on Vercel.

## STRUCTURE

```
zshen.dev/
├── app/                    # App Router pages + components
│   ├── components/         # Shared UI: analytics, card, mdx, nav, particles
│   ├── contact/            # Contact page (client component, social links)
│   └── projects/           # Project listing + dynamic [slug] pages
│       └── [slug]/         # Individual project pages (MDX rendered)
├── content/                # MDX source files (processed by Contentlayer)
│   ├── projects/           # Active project entries (3 MDX files)
│   └── chronark-projects/  # Forked/template content (17 MDX files)
├── pages/api/              # Pages Router — API routes ONLY
│   └── incr.ts             # Redis page view counter endpoint
├── public/                 # Static assets + fonts (CalSans)
├── types/                  # Type declarations (mdx.d.ts)
└── util/                   # Utilities (useMousePosition hook)
```

## WHERE TO LOOK

| Task                      | Location                          | Notes                                         |
| ------------------------- | --------------------------------- | --------------------------------------------- |
| Add a new project         | `content/projects/*.mdx`          | Requires: published, title, description, date |
| Edit page layout/metadata | `app/layout.tsx`                  | Root layout, fonts, OG metadata               |
| Modify project listing    | `app/projects/page.tsx`           | Server component, ISR (revalidate=60)         |
| Change MDX rendering      | `contentlayer.config.js`          | Document types, rehype/remark plugins          |
| Add MDX components        | `mdx-components.tsx`              | Custom h1/h2 styling                          |
| Modify page view tracking | `pages/api/incr.ts`               | Upstash Redis increment                       |
| Change animations/styling | `tailwind.config.js`, `global.css`| Custom fade-in/title/fade-left/right anims    |
| Add a new page route      | `app/{route}/page.tsx`            | App Router convention                         |
| API routes                | `pages/api/`                      | Pages Router — only place using it             |

## ARCHITECTURE NOTES

- **Mixed routing**: App Router for all pages, Pages Router solely for `pages/api/incr.ts` (Redis view counter)
- **Content pipeline**: Contentlayer reads `content/**/*.mdx` → generates typed data at build → imported via `contentlayer/generated`
- **Two content types**: `Project` (from `./projects/**/*.mdx`) and `Page` (from `pages/**/*.mdx`) defined in `contentlayer.config.js`
- **ISR**: Projects page uses `revalidate = 60` for incremental static regeneration
- **View counts**: Stored in Upstash Redis, fetched server-side via `mget`, incremented client-side via `/api/incr`

## CONVENTIONS

- **Biome** (rome.json) for linting/formatting — run `pnpm fmt`
- **TypeScript strict mode** — no `as any`, no `@ts-ignore`
- **Server components by default** — only `app/components/card.tsx`, `app/components/nav.tsx`, `app/contact/page.tsx` use `"use client"`
- **pnpm** as package manager
- **Path aliases**: `@/*` → project root, `contentlayer/generated` → `.contentlayer/generated`
- **Fonts**: Inter (Google Fonts) for body, CalSans (local, `public/fonts/`) for display headings

## ANTI-PATTERNS

- Do NOT add `"use client"` unless the component uses hooks, event handlers, or browser APIs
- Do NOT use Pages Router for new pages — App Router only (`pages/` is exclusively for API routes)
- Do NOT install eslint/prettier — project uses Biome (rome.json)
- Do NOT use npm/yarn — use **pnpm**

## ENVIRONMENT

| Variable                  | Purpose                    |
| ------------------------- | -------------------------- |
| `UPSTASH_REDIS_REST_URL`  | Redis connection URL       |
| `UPSTASH_REDIS_REST_TOKEN`| Redis auth token           |

## COMMANDS

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm fmt          # Format with Biome
nix develop       # Enter Nix dev shell (node, pnpm, yarn)
```

## NOTES

- Project was forked/inspired by chronark.com — `content/chronark-projects/` contains original template content
- README TODOs: add Vercel analytics, developer section, art section
- `tailwindcss-debug-screens` overlay appears in dev mode (conditional in layout.tsx)
- Particles background on homepage uses Canvas API (`app/components/particles.tsx`)
- Custom text effect `.text-edge-outline` in `global.css` uses `-webkit-text-stroke`
