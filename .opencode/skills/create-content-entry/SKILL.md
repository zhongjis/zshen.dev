---
name: create-content-entry
description: Create new zshen.dev content entries with the repo's actual MDX patterns. Use this whenever the user asks to create a new project, add a project post, draft an MDX entry, document a build, write a project-style post, or add something to `content/projects/`, even if they describe it casually. Also use it when the user says "blog post" for this repo and you need to check whether that request should map to the existing projects collection. This skill handles frontmatter, tone, banner choices, and verification for new content entries.
---

# Create Content Entry

Create new content for this repo in the same voice and structure as the existing content collection.

This repo currently has one real content collection: `content/projects/**/*.mdx`, compiled by `velite.config.ts` and published under `/thoughts`. Treat that as the default target unless you verify that a separate blog collection exists. Legacy `/projects/*` URLs redirect to `/thoughts/*` in `next.config.mjs`.

## Mandatory Preparation

Load `writing-clearly-and-concisely` before drafting prose. Use it to keep the copy concrete, brief, and free of generic AI filler.

Load `clarify` if the request includes headings, labels, calls to action, or other UX-facing copy that needs to read naturally.

Load `next-best-practices` only if the request expands beyond content creation into new routes, a new collection, or rendering changes.

Load `react-doctor` only if the work also changes React or Next.js UI code.

## Repo Reality

- Content is defined by `velite.config.ts`.
- The active collection is `projects/**/*.mdx` under `content/`.
- Frontmatter shape is: `title`, optional `description`, optional `date`, `published`, optional `url`, optional `repository`, optional `tags`.
- `slug` and `path` are derived automatically from the file path.
- Existing published examples live in `content/projects/`.

Do not rely on stale Contentlayer references if the repo is already using Velite.

## When the User Says "Blog Post"

Do not assume the repo has a dedicated blog collection.

First inspect the repo:
- Look for a blog content directory such as `content/blog/`.
- Look for a route such as `app/blog/`.
- Look for a collection in `velite.config.ts` that supports blog posts.

If a real blog collection exists, use it.

If it does not exist, do not invent blog infrastructure. Either:
- create a project-style MDX entry when the request is really a build note, project write-up, or portfolio entry, and explicitly state that the repo has no blog collection so the work was mapped to `content/projects/`, or
- explain the mismatch and ask one focused question only if the distinction changes the implementation.

## Workflow

### 1. Ground on the local pattern

Read these before writing:
- `velite.config.ts`
- one published example in `content/projects/`
- the target content directory

Use the repo's actual conventions, not generic MDX conventions.

### 2. Choose the right target file

For project entries, create a new file in `content/projects/<slug>.mdx`.

Derive the slug from the title or project name:
- lowercase
- words separated by hyphens
- keep it short and readable

Before creating the file, check for slug collisions or near-duplicate filenames in `content/projects/`. Routing is path-derived in this repo, so the filename is the main source of truth for the final slug.

Avoid placeholders like `new-project.mdx` or `draft-1.mdx` unless the user explicitly asks for them.

### 3. Build the frontmatter

Use this minimal safe template for project entries:

```mdx
---
title: Project Title
description: One clear sentence about what the project is.
date: "2026-03-20"
published: false
---
```

Add these fields only when they are verified:

```mdx
repository: owner/repo
url: https://example.com
```

Notes:
- Default to `published: false` unless the user clearly wants the entry live now.
- If the user does not explicitly ask to publish, keep it unpublished even when the request sounds complete or polished.
- Use the current session date when creating a new entry unless the user gives a different date.
- Include `repository` only when the user provides one or when the correct repo can be confirmed from nearby repo context.
- If the request is hypothetical or the repo name is missing, omit `repository` rather than guessing one.
- `repository` must be `owner/repo`, not a full GitHub URL.
- Include `url` only when there is a real external project URL.
- A missing `description` is technically valid because Velite supplies a default, but prefer writing one so the list row and header stay specific.
- Never invent repos, URLs, dates, or claims.

### 4. Build the body in the repo's style

Use the existing published entries as the model:
- short, concrete paragraphs
- personal first person when describing systems Zhongjie runs
- repository or live-project links only when verified via frontmatter
- no body tag line or banner by default; use frontmatter `tags` for topics

Prefer this minimal safe body structure when repo details are unknown:

```mdx
Opening paragraph.

Second paragraph with the architecture, stack, or purpose.

Closing sentence.
```

When repository, URL, or topics are verified, put them in frontmatter:

```mdx
---
title: Project Title
description: One clear sentence about what the project is.
date: "2026-03-20"
published: false
repository: owner/repo
url: https://example.com
tags:
  - nix
  - homelab
---

Opening paragraph.

Second paragraph with the architecture, stack, or purpose.

Closing line with the repo or live project.
```

If there is no confirmed repository or live URL, end with a normal closing sentence instead of fabricating a link.

If the user asks for a banner, do not assume one is part of the current pattern:
- use a wide banner-style image only when one exists and the user wants it
- prefer a repository preview image over a narrow logo only after verifying it for that repository
- only use a banner URL that you verified for that specific project or repository
- if you cannot verify a repo-specific banner or suitable image, omit the banner instead of guessing
- do not copy a banner from another project just because the visual shape fits

When a repository image is needed, verify it from the actual repository page or metadata first. Do not fabricate Open Graph URLs such as guessed `opengraph.githubassets.com/...` patterns.

If `repository` is omitted because it is unknown, the banner should usually be omitted too. Do not pair an unverified or hypothetical project with a guessed repository preview image.

Hard rule: if `repository` is absent, the draft must not contain any repo-derived image, repo link, or guessed `owner/repo` anywhere in the frontmatter or body.

Safe fallback example for a hypothetical project:

```mdx
---
title: Mac Dev Flake
description: A Nix flake for rebuilding my macOS development setup.
date: "2026-03-20"
published: false
---

I use this project to keep my macOS development environment reproducible.

The flake brings my system settings, shell tools, and editor config into one place so a new machine is easier to set up.

It has made my local setup easier to rebuild and maintain.
```

### 5. Tone

Write like the existing site:
- personal but not casual-for-the-sake-of-it
- technically confident
- brief and concrete
- focused on what was built, how it works, and why it exists

Avoid:
- hype
- startup marketing language
- filler like "showcases", "leverages", "robust", "cutting-edge"
- vague summaries that could describe any project

Good pattern:
- "I use this repository to track the Kubernetes cluster I run at home."

Bad pattern:
- "This cutting-edge platform showcases a robust self-hosted Kubernetes experience."

### 6. Verify before finishing

After writing the file:
- read the new file back
- confirm the frontmatter matches `velite.config.ts`
- confirm the file path produces the intended slug
- run the project's relevant content check; prefer `pnpm build` when you need to verify the MDX compiles cleanly

If the entry is user-visible or the user asks for verification, also check the rendered page or the compiled output.

## Output Expectations

When you use this skill successfully, you should produce:
- one new or updated MDX content file in the correct directory
- frontmatter that matches the repo schema
- prose that matches the site's voice
- a brief report of what changed, where it lives, and how it was verified
- when remapping a blog request, an explicit sentence that the repo does not support blog routing/collection and that the work was mapped to a project entry instead

## Never

- Do not invent a blog collection, route, or schema that the repo does not have.
- Do not publish by default.
- Do not leave placeholder copy unless the user asked for a stub.
- Do not use unsupported frontmatter fields such as `banner`, `cover`, or `slug` unless the repo schema actually supports them.
- Do not assume a narrow logo is equivalent to the wide repository-style banner pattern used elsewhere.
- Do not invent `repository` values for hypothetical projects.
- Do not guess or fabricate repository banner URLs.
- Do not reuse unrelated repository images as stand-ins for missing banners.
- Do not infer a likely GitHub repo name from the title and present it as fact.
- Do not commit changes unless the user explicitly asks.
