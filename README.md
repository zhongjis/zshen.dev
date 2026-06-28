# zshen.dev

Personal engineering portfolio for Zhongjie Shen, built with Next.js App Router, TypeScript, Tailwind CSS, Velite MDX, Upstash Redis, and Vercel.

## Local development

```sh
pnpm install
pnpm dev
```

`pnpm dev` runs Velite through `next.config.mjs` before starting Next.js. The repo uses Nix direnv for the development shell; when direnv is active, run pnpm commands directly.

## Commands

```sh
pnpm dev                                  # local dev server
pnpm build                                # production build
pnpm start                                # production server
pnpm fmt                                  # format configured files with Biome
pnpm exec tsc --noEmit --pretty false     # typecheck
```

No test script exists currently.

## Environment

Copy `.env.example` to `.env` when you want Redis-backed view counts:

```sh
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Without those variables, thought pages render with `0` views.

## Content

Velite compiles `content/projects/**/*.mdx` into `.velite`. Published entries appear at `/thoughts` and `/thoughts/[slug]`; `/projects/*` redirects to `/thoughts/*` for legacy links.

Project frontmatter supports `title`, `description`, `date`, `published`, `url`, `repository`, and `tags`. `slug` and `path` are generated from the file path.
