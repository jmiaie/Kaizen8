> **Status (2026-09-30):** abandoned flashcard WIP — see [`STATUS.md`](STATUS.md).  
> `index.html` now mounts `index.tsx` via a module script; the app is still an unfinished scaffold.

# Project: Kaizen8
# Developer / Software Engineer: Jeff Milam

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy [.env.example](.env.example) to `.env.local` and set `GEMINI_API_KEY` to your Gemini API key
3. Run the app:
   `npm run dev`

## Gemini API key (server-side only)

The browser never sees the Gemini key. Client code calls `POST /api/gemini`
(see [`api/gemini.ts`](api/gemini.ts)), a Vercel-style serverless function that
reads `GEMINI_API_KEY` from the **server** environment. It uses a fixed model and
fixed prompts, and only exposes the three operations the UI uses (image
flashcards, audio transcription, infographic import). It accepts only
`image/*` / `audio/*` base64 media, at most 10 files, and at most 4 MB per
request, which is Vercel's function body limit minus some headroom.

- **Local dev:** `npm run dev` serves `/api/gemini` through a dev-only Vite
  middleware that reads `GEMINI_API_KEY` from `.env.local`. `vercel dev` also works.
- **Vercel:** set `GEMINI_API_KEY` under *Project Settings → Environment
  Variables*. The `api/` directory is deployed as a function automatically.
- **Other hosts:** a static-only host will not run `api/`; port
  `api/gemini.ts` to that platform's function format before deploying.
- **Never** name the variable `VITE_…` or reference it from client code.

`npm run build` runs `scripts/check-bundle-secrets.mjs` afterwards (`postbuild`).
It fails the build if anything in `dist/` contains the configured key value or
the string `GEMINI_API_KEY`. Run it on its own with `npm run check:bundle`.

> If a Gemini key was ever set in a build that was deployed, assume it leaked
> (older builds inlined it into the JS bundle) and rotate it.
   
### Copyright (c) 2026 Jeff Milam, EMBA. All Rights Reserved.
### GitHub: https://github.com/jmiaie
###
### This code is proprietary and private. Unauthorized copying of this file,
### via any medium, is strictly prohibited.
