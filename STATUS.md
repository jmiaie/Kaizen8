# Status — Kaizen8

**Updated:** 2026-09-30 (PT)  
**Visibility:** public  
**Maturity:** abandoned WIP (last push ~2026-04)  
**Role:** Learning / flashcard React app (Gemini-assisted)

## Honest positioning

Vite + React + TypeScript UI (`App.tsx`, flashcard / study / mirror / import views) with `@google/genai` via `services/geminiService.ts`. `index.html` relies on **CDN Tailwind + esm.sh importmap**; there is **no** module script wiring `index.tsx` into `#root` in the checked-in HTML.

| Claim | Reality |
|-------|---------|
| `npm run build` ships the app | Build emits essentially the HTML shell; **app entry wiring is incomplete** for a normal Vite SPA bundle |
| Runs without keys | Needs `GEMINI_API_KEY` in `.env.local` for Gemini features |
| Proprietary / private (README footer) | Remote is **public** — footer legal text is inconsistent |

## Offline check (2026-09-30, box)

```bash
npm install
npm run build   # completed; output is HTML-only shell (2 modules) — not a full SPA bundle
```

Runtime / Gemini calls **not** exercised.

## What is **not** claimed

- Active users, retention, or learning-outcome metrics  
- That importmap CDN pins are a security-reviewed supply chain

## Next (owner)

1. Archive **or** fix entry (`<script type="module" src="/index.tsx">`) + real Vite React plugin build  
2. Align LICENSE / README “proprietary” language with public visibility  
3. Prefer one learning-product story if ScholarOS remains the education bet
