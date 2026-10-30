# GATE Prep Hub

Free, offline-first GATE preparation. Practice by topic, take full 65-question mock tests with
GATE marking, see exactly which topics are costing you marks, and get a study plan that adapts to
your mistakes.

No account. No server. No ads. Your answers stay on your device.

> **Status: development preview.** Steps 0–1 are complete: the app shell, theme, PWA and offline
> install work, and every branch has a full syllabus plus 30 original sample questions.
> Practice mode, the mock engine, analysis and the planner are being built step by step.
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
| `npm run validate:questions` | Check every syllabus and question bank (also runs before `test` and `build`) |
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
  data/        syllabus + question JSON for GA, CSE, ECE, EE, ME and CE
  db/          Dexie schema and repository (added in later steps)
scripts/       question validator, icon generator, service-worker build
docs/          question format and contribution rules
public/        manifest, icons, favicon
```

## Content

Every branch has a syllabus (`src/data/syllabus/`) and a bank of 30 original sample questions
(`src/data/questions/`). General Aptitude is shared by all branches and has 10 questions.
That is 160 questions in total, half 1-mark and half 2-mark, mixing MCQ, MSQ and NAT.

Sample questions are written for this project and are labelled `source: "sample"`. They are not
previous-year GATE questions. See [`docs/QUESTION_FORMAT.md`](docs/QUESTION_FORMAT.md) for the
schema, marking rules and how to add questions, and run `npm run validate:questions` after editing.

## Principles

- **Offline first.** Everything is precached at build time; no runtime CDN calls.
- **Lightweight.** Four runtime dependencies. Charts are hand-written SVG, no chart library.
- **Honest content.** Every sample question is original, marked as a sample, and has a real
  explanation. Previous-year GATE questions are never copied.
- **Data ownership.** Progress is stored in IndexedDB and can be exported to a JSON file.

## License

Not set yet — add one before publishing the repository.
