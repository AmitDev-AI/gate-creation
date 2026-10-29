# GATE Prep Hub

Free, offline-first GATE preparation. Practice by topic, take full 65-question mock tests with
GATE marking, see exactly which topics are costing you marks, and get a study plan that adapts to
your mistakes.

No account. No server. No ads. Your answers stay on your device.

> **Status: development preview.** Step 0 (app shell, theme, PWA, offline install) is complete.
> The question bank, practice mode, mock engine, analysis and planner are being built step by step.
> The home screen shows the live build status.

## Requirements

- Windows 11 (also works on macOS/Linux)
- Node.js 20.19+ or 22+ — install with `winget install OpenJS.NodeJS.LTS`
- ~300 MB free RAM for the dev server, ~250 MB disk for `node_modules`

## Setup on Windows

Open **PowerShell** in this folder:

```powershell
npm install
npm run dev
```

Then open http://localhost:5173.

If PowerShell blocks `npm.ps1` with an execution-policy error:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload (http://localhost:5173) |
| `npm run build` | Typecheck, production build, then generate `dist/sw.js` + `dist/404.html` |
| `npm run preview` | Serve the production build locally — **use this to test offline/PWA** |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | TypeScript only, no build |
| `npm run icons` | Regenerate the PWA icons (only needed if the mark changes) |

## Testing offline mode

The service worker is only registered in production builds.

1. `npm run build`
2. `npm run preview`
3. Open the printed URL (usually http://localhost:4173) and let it load fully.
4. DevTools → **Application → Service Workers** → confirm it is activated.
5. DevTools → **Network** → set **Offline**, then reload. The app should still open.
6. Optional: DevTools → **Application → Manifest** → install, then launch it from the Start menu.

## Project structure

```
src/
  app/         router, error boundary, build roadmap
  components/  shared UI (buttons, cards, badges, icons, shell)
  features/    one folder per screen
  hooks/       theme, online status, install prompt, storage report
  lib/         small pure helpers (formatting, class names, storage probes)
  domain/      pure logic: scoring, timer, weak topics, planner (added in later steps)
  data/        syllabus + question JSON (added in step 1)
  db/          Dexie schema and repository (added in later steps)
scripts/       icon generator, service-worker template, build-time precache
public/        manifest, icons, favicon
```

## Principles

- **Offline first.** Everything is precached at build time; no runtime CDN calls.
- **Lightweight.** Four runtime dependencies. Charts are hand-written SVG, no chart library.
- **Honest content.** Every sample question is original, marked as a sample, and has a real
  explanation. Previous-year GATE questions are never copied.
- **Data ownership.** Progress is stored in IndexedDB and can be exported to a JSON file.

## License

Not set yet — add one before publishing the repository.
