---
name: zshen.dev
description: Personal engineering portfolio for Zhongjie Shen
colors:
  bg: "oklch(18% 0.028 284)"
  surface: "oklch(22% 0.024 284)"
  fg: "oklch(89% 0.012 86)"
  muted: "oklch(66% 0.014 88)"
  stone: "oklch(50% 0.018 88)"
  border: "oklch(32% 0.018 284)"
  border-soft: "oklch(27% 0.016 284)"
  accent: "oklch(78% 0.18 151)"
  accent-quiet: "oklch(57% 0.09 151)"
  seal: "oklch(70% 0.105 42)"
  shadow-ink: "oklch(9% 0.018 284)"
  accent-soft: "color-mix(in oklch, accent 12%, transparent)"
  seal-soft: "color-mix(in oklch, seal 10%, transparent)"
  paper-line: "color-mix(in oklch, fg 5%, transparent)"
typography:
  display:
    fontFamily: "Charter, Georgia, Palatino, Times New Roman, serif"
    fontSize: "clamp(2.625rem, 8vw, 5.25rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Charter, Georgia, Palatino, Times New Roman, serif"
    fontSize: "clamp(1.5rem, 3vw, 2.125rem)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Charter, Georgia, Palatino, Times New Roman, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.58
  label:
    fontFamily: "ui-monospace, JetBrains Mono, SF Mono, Fira Code, Consolas, Monaco, monospace"
    fontSize: "0.75rem"
    lineHeight: 1.2
    letterSpacing: "0.025em"
rounded:
  none: "0px"
  dot: "999px"
spacing:
  shell-width: "min(1040px, calc(100vw - 48px))"
  rail-width: "176px"
  shell-gap: "clamp(48px, 8vw, 132px)"
  panel-max: "720px"
components:
  nav-link:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    padding: "0 0 0 14px"
  row-link:
    textColor: "{colors.fg}"
    padding: "20px 0 19px"
  button-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
    padding: "0.5rem 1.25rem"
motion:
  duration:
    fast: "160ms"
    mid: "280ms"
    slow: "680ms"
  easing:
    out-quart: "cubic-bezier(0.25, 1, 0.5, 1)"
    out-quint: "cubic-bezier(0.22, 1, 0.36, 1)"
    out-expo: "cubic-bezier(0.16, 1, 0.3, 1)"
---

# Design System: zshen.dev

## 1. Overview

**Creative North Star: "The Personal Workshop Notebook"**

This system is a compact dark portfolio for a builder whose work spans enterprise software, AI tooling, Nix, Kubernetes, and small personal systems. The physical scene is a developer and potential customer reading the site on a large display in a dim office after hours. The page should feel discovered, precise, and lived-in, not converted from a portfolio template.

The shell may keep Mitchell Hashimoto-inspired layout mechanics: sticky rail, compact navigation, hash-target panels, and restrained footer attribution. That influence stops at structure. The identity should come from Zhongjie's copy, panda mark, project choices, serif rhythm, green signals, and the quiet particle field.

**Key Characteristics:**

- Dark purple workshop field, not pure black.
- Serif-first typography with mono labels only where metadata earns it.
- CSS-driven navigation, panels, motion, and particle field.
- Rows, rules, and metadata instead of generic cards.
- Personal evidence before marketing claims.

## 2. Colors

Committed dark workshop palette. Purple-black carries most of the surface; green acts as signal, not decoration. Seal ochre appears only as a secondary warmth for hover or detail.

### Primary

- **Workshop Purple Field** (`bg`): main page field. It is dark, tinted, and physical, never pure black.
- **Signal Green** (`accent`): active nav state, text links, focus rings, particle highlights, and small signs of life.
- **Quiet Signal Green** (`accent-quiet`): row numbers and low-volume metadata that should still feel active.

### Secondary

- **Seal Ochre** (`seal`): rare warmth for link hover, page finales, or personal marks. Use it as a human counterpoint to green, not a competing accent.

### Neutral

- **Notebook Surface** (`surface`): raised or grouped areas when the page needs a plane.
- **Warm Ink** (`fg`): primary text. It is tinted toward the system hue, never pure white.
- **Dim Annotation** (`muted`): body support copy and inactive nav.
- **Stone Metadata** (`stone`): footer, counters, and secondary labels.
- **Hard Rule** (`border`) and **Soft Rule** (`border-soft`): list dividers and structural lines.

### Named Rules

**The Signal Rarity Rule.** Green marks state, links, focus, and small living details. If a section becomes green because it needs excitement, the section is wrong.

**The No Pure Extremes Rule.** Never use pure black or pure white. Every neutral stays tinted toward the purple workshop field.

## 3. Typography

**Display Font:** Charter, Georgia, Palatino, Times New Roman, serif.

**Body Font:** Charter, Georgia, Palatino, Times New Roman, serif.

**Label/Mono Font:** UI monospace stack with JetBrains Mono, SF Mono, Fira Code, Consolas, Monaco, monospace.

**Character:** Serif type makes the site feel like a technical notebook rather than a developer tool cliché. Mono is reserved for navigation, counters, metadata, and numbers, not for generic technical flavor.

### Hierarchy

- **Display** (500, `clamp(2.625rem, 8vw, 5.25rem)`, `0.98`): the site name and largest identity moments.
- **Headline** (500, `clamp(1.5rem, 3vw, 2.125rem)`, `1.12`): panel headings such as Consulting, Sparks, and Misc.
- **Title** (500, `1.0625rem`, `1.25`): row titles and compact project names.
- **Body** (400, `1rem`, `1.58`): explanatory copy, usually capped around 54ch to 65ch (`.measure`). `.type-body-sm` drops to `0.9375rem` for dense metadata rows.
- **Label** (`0.6875rem` to `0.75rem`, restrained tracking): nav, counters, metadata, and type kickers.

### Named Rules

**The Serif Is the Voice Rule.** Do not replace the serif stack with a generic product sans unless the brand direction changes again.

**The Mono Must Earn It Rule.** Mono appears only where it behaves like a label, counter, nav system, or machine annotation.

## 4. Elevation

The homepage is flat by default. Depth comes from tonal layering, rules, spacing, and active states. Shadows are reserved for richer project-page surfaces like `.page-finale` and `.editorial-card`, where the content needs a physical plane.

### Shadow Vocabulary

- **Soft Ink Shadow** (`0 18px 56px color-mix(in oklch, var(--shadow-ink) 70%, transparent)`): large, quiet, and atmospheric. Use only for feature surfaces, not routine rows.
- **Focus Ring** (`0 0 0 2px var(--accent), 0 0 0 5px var(--bg)`): interactive clarity. It is functional, not decorative glow.

### Named Rules

**The Flat Rows Rule.** Portfolio rows stay flat. Hover moves them horizontally by `0.25rem`; it does not lift them into cards.

## 4b. Motion

Motion is CSS-only, transform/opacity based, and tokenized. Durations: `--dur-fast` 160ms, `--dur-mid` 280ms (default for hover/link transitions), `--dur-slow` 680ms (entrance reveals). Easing: `--ease-out-quart` `cubic-bezier(0.25, 1, 0.5, 1)`, `--ease-out-quint` `cubic-bezier(0.22, 1, 0.36, 1)`, `--ease-out-expo` `cubic-bezier(0.16, 1, 0.3, 1)`.

Entrance helpers: `.motion-enter` (fade-up via `ease-out-expo`) and `.motion-fade` (opacity via `ease-out-quint`), staggered by `.motion-delay-1` through `.motion-delay-5` (90ms steps). All entrance motion and the particle orb collapse to a static end-state under `prefers-reduced-motion`.

## 5. Components

### Navigation

Sticky desktop rail with a `176px` column and `clamp(48px, 8vw, 132px)` gap. Links use mono labels at `0.75rem`, muted color at rest, green on hover and active. Active state uses a `6px` green dot plus color, driven by CSS `:has()` and `:target`.

Mobile navigation becomes a wrapped horizontal group under the heading. The dot disappears on mobile because the compact layout uses color and position instead.

### Mark

The identity mark is `/panda-mark.png`, rendered at `32px` with `image-rendering: pixelated`. Treat it as a small personal artifact, not a logo system that needs surrounding ceremony.

### Panels

Panels are hash-target sections. `#index` is visible by default; other panels replace it through CSS. Each panel maxes at `720px` and enters with a short fade-up using `ease-out-quart`. Preserve Server Component behavior and avoid client JavaScript for this routing.

### Rows

Portfolio rows use top and bottom rules instead of cards. Padding is `20px 0 19px`; hover shifts the row `0.25rem` to the right and turns text green. Consulting rows place a mono number first; project rows place metadata at the far edge. Project-page `.work-row` is a richer variant: a `2.5rem` leading column, hover tints the surface and expands inline padding, and a seal-colored `.work-arrow` slides `0.25rem` right.

### Links

Text links are green with a 1px underline and `0.24em` underline offset. Hover moves to seal ochre. Contact links are icon-only, stone at rest, green on hover, with the full focus ring.

### Buttons

Buttons are square-edged, bordered, and subdued: `border-radius: 0`, `1px solid var(--border)`, `0.5rem 1.25rem` padding, surface background. Hover nudges up by `-1px`, strengthens border color with green, and turns text green. Quiet buttons remove the border and use green tint only on hover.

### Particle Field

The CSS particle orb is allowed because it is authored in the site's own language, not a client-side spectacle. It should stay CSS-only, calm at rest, and respectful of `prefers-reduced-motion`.

### Feature surfaces

Reserved for project pages, not the flat homepage. `.editorial-card` and `.page-finale` are square-edged bordered planes (`border-radius: 0`) over a `surface`/`bg` mix, carrying the Soft Ink Shadow; `.editorial-card` adds a faint diagonal `paper-line` ruling and `.page-finale` a large off-edge seal-tinted ring. `.principle-card` is a top-ruled block whose closing line jumps to display serif at `clamp(1.2rem, 2.4vw, 1.7rem)`. `.editorial-rule` is a hairline gradient divider that warms to accent at its midpoint.

### Chips

`.quiet-chip` is a bordered inline tag on a translucent `surface` mix, muted text at `0.82rem`, square-edged. Used for compact metadata, not as a card substitute.

## 6. Do's and Don'ts

### Do:

- **Do** keep Mitchell attribution as structural lineage only: layout, sticky rail, and navigation logic.
- **Do** make new visual choices more Zhongjie-specific through copy, marks, project evidence, and small personal artifacts.
- **Do** use rows, rules, metadata, and compact panels before reaching for cards.
- **Do** keep motion transform-and-opacity based, using `ease-out-quart`, `ease-out-quint`, or `ease-out-expo`.
- **Do** preserve the dark OKLCH workshop field and the rare green signal system.

### Don't:

- **Don't** make the site feel like a copied portfolio template, Chronark clone, or Mitchell homage.
- **Don't** use a generic SaaS hero, hero-metric template, identical card grid, gradient text, decorative glass, pure black, or pure white.
- **Don't** use colored side-stripe borders wider than 1px on cards, rows, callouts, or alerts.
- **Don't** add client JavaScript, canvas, or new dependencies to solve homepage navigation or the particle field.
- **Don't** use monospace as costume for technical credibility. Use it only for labels, nav, counters, and metadata.
