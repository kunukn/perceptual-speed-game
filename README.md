# Perceptual Speed Game

A prototype web game that measures how fast and accurately you spot matching letter pairs.

## Demo

**Live:** https://kunukn.github.io/perceptual-speed-game/

Scan to play on your phone:

<img src="docs/qrcode.png" alt="QR code linking to the live demo" width="160" />

## How to Play

- Each round shows two rows of 4 letters — one row uppercase, one lowercase.
- Count how many vertical pairs are the **same letter** (case-insensitive).
- Pick the count (0–4).
- 10 rounds per game. You're scored on correct answers and total time.

## Getting Started

**Prerequisites:** Node.js >= 24, pnpm 11.

```bash
pnpm install
pnpm dev      # start the Vite dev server (http://localhost:5173)
```

## Scripts

| Script           | Description                                    |
| ---------------- | ---------------------------------------------- |
| `pnpm dev`       | Start the Vite dev server                      |
| `pnpm build`     | Type-check (`tsc -b`) and build for production |
| `pnpm preview`   | Preview the production build locally           |
| `pnpm lint`      | Run Oxlint                                     |
| `pnpm typecheck` | Run the TypeScript compiler                    |
| `pnpm format`    | Format `src` with Prettier                     |

## Tech Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Emotion · shadcn/Radix UI · Zustand · XState.

## Deployment

Pushing to `main` auto-deploys to GitHub Pages via GitHub Actions
(`.github/workflows/deploy.yml`). `VITE_BASE_PATH` sets the project subpath at build time.
