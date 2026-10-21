# Pratham Saurabh — Portfolio

A minimal developer portfolio with an interactive WebGL wireframe landscape, built from scratch with React, TypeScript, Vite, Three.js, and React Three Fiber.

## Run locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

## Deployment

Deploy to Netlify by importing this repository, using build command `npm run build` and publish directory `dist`. Point your existing custom domain to the new Netlify site when ready.

## Before launching

- Add your real resume to `public/resume.pdf` (the Resume navigation currently points there).
- Confirm the contact email and LinkedIn URL in `src/App.tsx`.
- Update work and project descriptions with any missing specifics or exact dates.
- Test the design on mobile and under reduced-motion settings.

The WebGL scene is automatically disabled when reduced motion is requested.
