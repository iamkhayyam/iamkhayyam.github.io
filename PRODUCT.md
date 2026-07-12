# PRODUCT.md — iamkhayyam.xyz

## What this is
Personal portfolio of Khayyam Wakil (`@iamkhayyam`), self-described "Innovative Generalist" chasing "World's Firsts." Static HTML/CSS, no build step, hosted on GitHub Pages (repo `iamkhayyam/iamkhayyam.github.io`, domain `iamkhayyam.xyz`).

## Register
brand — the site IS the product. A visitor's impression is the deliverable.

## Users
- Producers, brand leads, and founders scouting someone who can pull off a frontier-tech stunt (VR/AR, holograms, volumetric, live events at Super Bowl / SoFi / VMAs scale).
- Conference programmers, press, and collaborators verifying credibility (Emmy, Cannes Lions Grand Prix, books, SXSW board).
- Fellow builders arriving from GitHub / Web3 communities.

## Voice
Playful-serious. Prestige worn lightly. "Making people smile in YVR / LAX / LIS." Terminal-nerd surface (ASCII wordmark, FIG_ labels, mono metadata) over genuinely heavyweight credits. Never corporate, never "design engineer / component library" tone — the story is generalism and world's firsts, not craft for its own sake.

## Aesthetic lane
chanhdai.com-derived terminal spec-sheet: dashed hairline rulers, numbered figure labels (`FIG_001`), monospace metadata, kv grids, a single 640px column with dashed side rails, ANSI-shadow ASCII art as the wordmark. One flash of color: the GitHub contribution greens, plus a fluid blue→purple gradient painted only into the ASCII wordmark. Everything else zinc.

## Anti-references
- Generic SaaS landing pages (hero metric, gradient CTAs, identical card grids).
- Dribbble-portfolio gloss, oversized display serifs, editorial magazine layouts.
- Corporate resume sites. No "passionate about leveraging" copy, ever.

## Strategic principles
- Every page reads like a page from the same instrument manual: figure numbers, mono labels, dashed rules.
- Static HTML per page, all sharing `styles.css` (+ `shared/tokens.css` for components/blocks). No frameworks.
- Light and dark themes both first-class; toggle persists via `localStorage('theme')`, attribute `data-theme` on `<html>`.
