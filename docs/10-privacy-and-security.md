# Privacy & security

- **No accounts, no logins, no analytics, no cookies.**
- Learner progress, flashcard boxes and preferences are stored only in the browser's `localStorage` on that device. Nothing is sent to a server.
- Learners can **export**, **import** or **reset** their progress from the Progress page.
- The `/api/curriculum` endpoint is read-only and contains curriculum data only – never learner data.
- Security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`.

This approach is consistent with the spirit of **POPIA**: no personal information about learners is collected or processed.
