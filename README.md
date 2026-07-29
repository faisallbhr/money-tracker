# Money Tracker

Offline-first Money Tracker built with Vue 3, TypeScript, Vite, Pinia, Dexie, Tailwind CSS v4, and vite-plugin-pwa.

Data is stored only in this browser using IndexedDB.

## Setup

```sh
npm install
npm run dev
```

## Checks

```sh
npm run lint
npm run test
npm run build
```

## GitHub Pages

This app uses Vue Router hash history, so refresh works on GitHub Pages without server rewrites.

Set `VITE_BASE_PATH` when deploying under a repository path:

```sh
VITE_BASE_PATH=/money-tracker/ npm run build
```

The included GitHub Actions workflow builds and deploys `dist` to GitHub Pages.
