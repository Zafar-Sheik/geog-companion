# GeoMzansi

**An interactive Grade 12 Geography companion for Northwood Boys' High School learners (CAPS, NSC Paper 1 & Paper 2).**
The sister app of *CodeMzansi*: same learning design, same accessibility features. Built with Next.js, GSAP and Aceternity UI patterns.

- 📚 **24 lessons** in short steps covering every Grade 12 topic: Climate & Weather, Geomorphology, Settlement, Economic Geography of SA, Mapwork & GIS
- 🧭 **20 interactive tools**: mid-latitude & tropical cyclone labs, SA weather systems map, station models, valley and urban climates, drainage patterns, stream ordering, river profiles & rejuvenation, river capture, meanders, urban land-use models, SA economic map, a map-calculation engine, contour → cross-section, bearing protractor, GIS layer lab, raster vs vector
- 🃏 **Flashcards** with spaced repetition (Leitner boxes) for 279 key concepts, plus a searchable glossary
- ⚔️ **Quiz Arena**: mixed-topic rounds drawn from 120+ questions, relaxed or timed
- 📝 **Exam Room**: 16 NSC-style case studies with sources, interactive figures and marking memos for self-marking, plus exam technique
- 🎮 **Games**: Concept Pairs, True/False Blitz, Odd One Out, Definition Hangman
- 🧠 **ADHD & accessibility**: step mode, focus mode, focus sprints, calm mode, reading ruler, dyslexia-friendly fonts, read-aloud, high contrast
- 🔒 **No accounts, no tracking**: everything is stored on the learner's device

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Command | |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript strict check |
| `npm run lint` | ESLint (zero warnings) |
| `npm test` | Map-engine and content-integrity tests (Vitest) |
| `npm run test:e2e` | Browser tests on desktop + mobile (Playwright; needs a production build) |
| `npm run check` | typecheck + lint + test + build |

## Documentation

Teacher and developer docs live in [`docs/`](docs) and are rendered in the site at **`/teachers`**: overview, teacher quick-start, CAPS curriculum map, learning design, ADHD & accessibility, design system, architecture, content authoring, testing & deployment, privacy, FAQ.

> An independent study aid. Always confirm exam details with your teacher and the latest DBE examination guidelines.
