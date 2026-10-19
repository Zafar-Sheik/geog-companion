# Writing lessons & exam questions

## A lesson

Lessons live in `src/content/lessons/<topic>.ts`:

```ts
{
  slug: "valley-climates",
  paper: 1,                       // 1, 2 or "both"
  topic: "Climate & Weather",
  order: 5,
  title: "Valley climates",
  tagline: "Why farmers plant orchards halfway up the slope.",
  emoji: "⛰️",
  caps: "Gr 12 Climate & Weather · Local climates: …",
  objectives: ["…"],
  styles: ["visual", "kinaesthetic"],
  xp: 110,
  terms: [{ term: "Katabatic wind", def: "…" }],   // feed flashcards, glossary & games
  chunks: [{ id: "daynight", title: "Day and night in a valley", minutes: 8, blocks: [ … ] }],
}
```

## Block types

| Block | Use |
|---|---|
| `text` | Markdown |
| `callout` | `key`, `tip`, `mistake`, `memory`, `exam`, `break`, `real-world` |
| `keypoints` | "Remember these" list |
| `table` | Comparison tables (markdown allowed in cells) |
| `widget` | Any interactive tool, e.g. `{ type: "widget", widget: "sorter", props: { … } }` |
| `sequence` | Put steps in order |
| `match` | Column A ↔ Column B |
| `terms` | The lesson's key terms as flashcards |
| `flashcards` | Custom flashcards |
| `quiz` | Multiple-choice quiz with explanations (added to the Quiz Arena automatically) |
| `exam` | One exam-style question with a self-marking memo |

## Exam questions

`src/content/exam.ts` holds Exam Room case studies: a `source` (extract or data), an optional interactive `figure`, and `parts`, each with `marks`, a cognitive `level` and a `memo` list. List **more memo points than marks** – learners can earn marks for any valid point, as in real memos.

## Checks

`npm test` validates the content: unique slugs and ids, quiz answers point at real options, every sorter item has a valid bucket, sequences have at least three steps, memos have enough points, and every calculation in the map engine is correct.
