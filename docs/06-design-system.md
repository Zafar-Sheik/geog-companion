# Colours, type & design system

## Topic colours

| Token | Light | Meaning |
|---|---|---|
| `--t-climate` | `#0369a1` sky blue | Climate & Weather |
| `--t-geomorph` | `#c2410c` river-cut earth | Geomorphology |
| `--t-settlement` | `#7c3aed` violet | Settlement |
| `--t-economic` | `#a16207` gold | Economic Geography |
| `--t-mapwork` | `#4d7c0f` topo-map green | Mapwork & GIS |

## Meaning colours

| Token | Use |
|---|---|
| `--brand` (teal) | Actions, links, "you can click this" |
| `--success` | Correct answers, completion |
| `--danger` | Errors and common mistakes **only** |
| `--memory` (pink) | Memory hooks, flashcards |
| `--exam` (amber) | Exam tips, Exam Room |
| `--water`, `--land`, `--contour` | Maps and diagrams |

All tokens are redefined for dark mode and high-contrast mode in `src/app/globals.css`.

## Type

- **Space Grotesk** – headings and numbers
- **Inter** – body text (switchable to Atkinson Hyperlegible or OpenDyslexic)
- **JetBrains Mono** – calculation working

## Components

- **Callouts** – key idea, tip, common mistake, memory hook, exam tip, brain break, real world
- **WidgetFrame** – the shell for every interactive tool: title, one-line instruction, play area
- **GlowCard, Bento grid, 3D cards, aurora background, floating dock** – Aceternity UI patterns, all disabled or simplified in calm mode
