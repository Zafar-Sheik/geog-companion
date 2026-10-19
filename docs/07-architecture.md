# Architecture

GeoMzansi is a **static Next.js site** – there is no database and no server-side learner data.

## Stack

Next.js 15 (App Router, static generation) · React 19 · TypeScript (strict) · Tailwind CSS 4 · GSAP 3 · Motion (Aceternity UI components) · Vitest · Playwright

## Folders

```
src/
  app/                 routes (learn, flashcards, quiz, exam, toolkit, games, progress, teachers, api/curriculum)
  components/
    learn/             lesson player, quiz, flashcards, sequence, match, exam-part, callouts, markdown
    widgets/           20 interactive tools (code-split with next/dynamic)
    pages/             client components for each page
    home/, layout/, ui/, aceternity/
  content/
    lessons/*.ts       lessons as typed data (one file per topic)
    exam.ts            Exam Room case studies and memos
    index.ts           LESSONS, GLOSSARY, QUESTION_BANK, TOPIC_INDEX
  lib/
    progress.ts        XP, badges, streaks (localStorage)
    cards.ts           Leitner flashcard state (localStorage)
    prefs.ts           accessibility preferences (localStorage)
    mapcalc.ts         map calculation engine (pure functions, unit-tested)
    topics.ts          topic colours and paper structure
docs/                  this documentation (rendered at /teachers)
tests/                 Vitest unit + content tests, Playwright e2e
```

## Data flow

Lessons are plain TypeScript objects. Server components read them at build time and pass small, serialisable summaries to client components. The **glossary** and **quiz bank** are derived automatically from the lessons, so adding a term or quiz question to a lesson adds it to Flashcards, Games and the Quiz Arena.

Learner state lives in three `localStorage` keys: `geomzansi:progress`, `geomzansi:cards` and `geomzansi:prefs`, each managed by a tiny `useSyncExternalStore` store.

## Diagrams

All diagrams are hand-built **SVG** that use CSS variables, so they follow the theme. The South Africa map is drawn from about 70 longitude/latitude points (schematic). Contour maps in the cross-section tool are generated from height functions with a **marching-squares** algorithm, so the cross-section is computed from the same data the contours show.
