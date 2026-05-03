# Design Direction

## Register
Brand. The homepage is a portfolio surface where the design is part of the trust signal.

## Color strategy
Committed dark workshop palette in OKLCH. Purple-black space carries the page, with green reserved for navigation state, labels, the `zs` mark, and the weather field.

Exact tokens:

- `--bg: oklch(18% 0.028 284)`
- `--surface: oklch(22% 0.024 284)`
- `--fg: oklch(89% 0.012 86)`
- `--muted: oklch(66% 0.014 88)`
- `--stone: oklch(50% 0.018 88)`
- `--border: oklch(32% 0.018 284)`
- `--border-soft: oklch(27% 0.016 284)`
- `--accent: oklch(78% 0.18 151)`
- `--accent-quiet: oklch(57% 0.09 151)`
- `--shadow-ink: oklch(9% 0.018 284)`

## Theme scene
A developer and customer read the site on a large display in a dim office after hours. The page should feel like opening a quiet workshop notebook, not a SaaS landing page.

## Typography
Serif-first workshop typography. Use Charter, Georgia, Palatino, and Times New Roman as the display and body stack. Use UI monospace only for labels, navigation, row numbers, metadata, and the `zs` mark.

Headings should be compact and confident. Body copy should stay under roughly 54 to 65 characters where possible. Labels use small mono uppercase with restrained tracking.

## Layout
Compact shell: `min(1040px, calc(100vw - 48px))`.

Desktop grid: 176px rail plus flexible content, with a 48px to 132px gap. The rail is sticky and holds identity plus navigation. Footer belongs to grid column 2 so contacts sit with the page content rather than being tucked inside the rail.

Panels use CSS `:target` routing. Index is visible by default. Active navigation state is driven by `:has()` and a small green dot.

## Motion
Motion is quiet. Panels settle with a short fade and vertical lift. The weather field uses CSS only, with calm current lines that briefly become more energetic. Respect `prefers-reduced-motion` globally.

## Implementation constraints
Keep the homepage as a Server Component. Do not add client JavaScript, canvas, or new dependencies. Keep routing in CSS. Preserve nav labels, consulting items, sparks items, misc nix-config link, and footer contacts.

## Anti-goals
No generic SaaS hero, no gradient text, no decorative glass, no pure black or pure white literals, no colored side stripe border wider than 1px, no client-side copied template script, and no visual change that alters the content strategy.
