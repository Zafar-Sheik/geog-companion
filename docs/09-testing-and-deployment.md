# Testing & deployment

## Commands

| Command | |
|---|---|
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript strict check |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm test` | Unit and content-integrity tests (Vitest) |
| `npm run test:e2e` | Browser tests on desktop and mobile (Playwright; needs a production build) |
| `npm run check` | typecheck + lint + test + build |

## What is tested

- **Map calculation engine** – distance, area, gradient, magnetic declination, magnetic bearing, vertical exaggeration, bearings and tolerance.
- **Content integrity** – every lesson, quiz, sorter, sequence, match and exam question is well-formed.
- **End-to-end** – home page, lesson navigation, quiz feedback, flashcards, Exam Room self-marking, Toolkit calculations, preferences and no sideways scrolling on phones.

## Deployment

The site is fully static apart from the build-time docs, so it can be hosted on any Node host or static platform that supports Next.js (e.g. Vercel, Netlify, or `next start` on a school server). No environment variables or databases are required.
