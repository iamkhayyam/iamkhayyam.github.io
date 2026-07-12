# DESIGN.md — iamkhayyam.xyz

Documented from the live code (`styles.css`, `shared/tokens.css`). The system already exists; extend it, don't reinvent it.

## Color (zinc, two themes)
Main site tokens live in `styles.css` `:root` / `html[data-theme="dark"]`:

| Token | Light | Dark |
|---|---|---|
| `--background` | `#ffffff` | `#09090b` |
| `--foreground` | `#09090b` | `#fafafa` |
| `--muted` | `#f4f4f5` | `#27272a` |
| `--muted-fg` | `#71717a` | `#9f9fa9` |
| `--border` | `#e4e4e7` | `#27272a` |
| `--line` | color-mix of border+bg | same |
| `--success` | `#22c55e` | same |
| `--info` | `#3b82f6` | same |

Contribution greens (in `shared/tokens.css`): light `#ebedf0 → #216e39`, dark `#161b22 → #39d353`. These greens are the site's only sustained color moment.

The ASCII wordmark alone gets a fluid gradient: `linear-gradient(110deg, fg 20%, mix(info,fg 60%) 40%, mix(#a855f7,fg 60%) 55%, mix(info,fg 60%) 70%, fg 90%)`, background-clip: text, 8s flow. This is an established brand mark, not a pattern to spread elsewhere.

## Typography
- Sans: system stack (`ui-sans-serif`, SF, Inter…), body 14px/1.5.
- Mono: `ui-monospace, "SF Mono", …` — all metadata, labels, nav. Labels: 10–12px, `letter-spacing: 0.08–0.14em`, uppercase.
- Serif: IBM Plex Serif — names/subpage h1 only.
- Handwriting accent: Caveat (Google Fonts) — margin notes.
- ASCII wordmark: ANSI Shadow figlet glyphs in a `<pre class="ascii-wordmark">`, italic, `font-size: clamp(5px, 1.15vw, 12px)`, line-height 1.05.

## Layout
- `.frame`: single 640px column, `border-left/right: 1px dashed var(--line)`, centered.
- Sticky `.nav` 52px, blurred background, dashed bottom rule.
- Sections separated by dashed rules; `.fig` figure labels (`FIG_001 · …`) open hero sections.
- `.kv` two-column key/value grids for metadata.
- `.dotgrid`: radial-masked 16px dot grid, absolute inset, behind hero content.

## Components on hand
`.badge`, `.tag`, `.section-title`, `.sh` section headings with `.more` links, `.row` list rows (year / title / meta), `.cta` buttons (solid + `.secondary`), spinner circular-text badge, glow cards, contribution grid (`github-graph.js`), shader footer.

## Motion
- Durations ~150–160ms UI, `cubic-bezier(0.4,0,0.2,1)`.
- Wordmark: 1.6s left-to-right mask reveal, then infinite gradient flow. `prefers-reduced-motion` disables both.
- Theme transition on body background/color.

## Rules
- Never hardcode theme colors in components; use the tokens.
- Every page: theme-toggle button `#themeToggle` + the localStorage snippet from `index.html`.
- Subpages link `../styles.css`; root-level orphan pages (404) must use absolute `/styles.css`.
- OG image source lives at `shared/og-card.html`; regenerate `og.png` with headless Chrome at 1200×630 (see README note in that file).
