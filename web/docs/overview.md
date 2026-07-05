# Web Overview

## Purpose

`web/` contains the browser application that parses workout programs, previews
them, and runs a live workout screen with optional shared state backed by the
API.

## Runtime Shape

- Framework: Next.js 16 App Router
- Language: TypeScript
- Rendering model: static export (`output: 'export'`)
- Dev server: `npm run dev` on port `3030`
- Build output: `web/web-build/dev` or `web/web-build/prod`

## Important Files

- `app/page.tsx` mounts `ProgramExecutor`.
- `components/features/ProgramExecutor.tsx` owns setup mode, live mode, shared
  state polling, and workout control actions.
- `components/features/ProgramParser.tsx` parses, validates, previews, and
  persists the last valid input in browser localStorage.
- `components/features/ProgramScreen.tsx` renders the active screen and drives
  timing sounds.
- `lib/parsers/program-parser.ts` converts the markdown-like program format
  into typed runtime structures.
- `lib/validators/program-validator.ts` enforces duration and structural
  rules.
- `config/app-config.ts` defines API root selection, breakpoints, duration
  limits, and component defaults.

## External Dependencies

- The frontend reads and writes shared workout state either from browser
  localStorage or from the Chalice API.
- `NEXT_PUBLIC_APP_ENV` controls whether `appConfig.apiRoot` points at the dev
  or prod API hostname.
- Static assets are deployed by the infrastructure layer from
  `web/web-build/<env>/`.

## Notes For Agents

- This package is client-heavy and uses browser APIs such as localStorage and
  Web Audio.
- Several older docs used `3000` and `../web-build/...`; those values were
  stale. The current source uses port `3030` and a build directory inside
  `web/`.
