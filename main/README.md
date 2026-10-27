# Portfolio

Personal portfolio for Esther Thompson — coding and film projects, an animated tech-stack "garden", a bottom music player, and an experimental Three.js jar.

Built with **React 19**, **React Router 7**, **Vite**, **SCSS**, **Framer Motion**, and **React Three Fiber**.

## Getting started

```bash
npm install
npm run dev      # start the dev server at http://localhost:3000
```

## Scripts

| Command           | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Start the Vite dev server (alias: `npm start`)  |
| `npm run build`   | Production build to `build/`                    |
| `npm run preview` | Serve the production build locally              |
| `npm run lint`    | Run ESLint                                      |
| `npm test`        | Run the Vitest test suite                       |
| `npm run optimize:images` | Resize + convert `src/assets/images/` to WebP (see below) |

## Images

All raster images in `src/assets/images/` are **WebP**, capped at 1600px on the
long edge (`scripts/optimize-images.mjs`). When you add a new photo, drop it in
that folder and run `npm run optimize:images` — it converts new files in place
and leaves existing `.webp` alone. Import them normally:

```js
import photo from '../../assets/images/my-photo.webp';
```

## Project structure

```
main/
├── index.html            # Vite entry HTML
├── public/               # static assets served at / (favicon, manifest, resume PDF)
├── src/
│   ├── index.jsx         # app bootstrap
│   ├── App.jsx           # routes
│   ├── components/       # one folder per component (+ .scss)
│   └── assets/           # images, icons, fonts, music
├── vite.config.js
└── eslint.config.js
```

## Routes

- `/` Home · `/about` · `/portfolio` · `/contact` (share a layout with navbar + music player)
- `/coding-projects`, `/film-projects`, `/tech-jar-test` (standalone)
