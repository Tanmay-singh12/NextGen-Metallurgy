# Metallum 2026

## Getting started
```bash
npm install
npm run dev       # local dev server
npm run build     # production build -> dist/
npm run preview   # preview the production build locally
```

## Where things live
- `src/components/<Section>/` — one folder per page section (`Section.jsx` + `Section.css`). Edit here to change that section's markup or styling.
- `src/data/` — the content arrays (events, schedule, speakers, gallery, team, sponsors). Edit here to change wording/dates/people without touching any component code.
- `src/pages/Home.jsx` — assembles all the sections in order and owns the couple of bits of state shared across them (mobile nav open/close, the "jump to section" scroll helper, the lightbox).
- `src/styles/variables.css` — the Google Fonts import.
- `src/styles/global.css` — small utility classes shared by several sections (buttons, section headings, the scroll-reveal animation, the `.wrap` container).
- `src/App.jsx` / `src/main.jsx` — app entry point, kept minimal.

## Note on the hero image
`Hero.jsx` references `/assets/metallum-sculpture.png`. That image file wasn't part of the
project files handed over for this reorganisation, so it couldn't be copied into `public/`.
Place the original image at `public/assets/metallum-sculpture.png` (or move it into
`public/images/hero/` and update the `src` in `src/components/Hero/Hero.jsx` accordingly).

## Note on index.html
The original `index.html` only contained the `<div id="root">` / script tag fragment,
without `<!DOCTYPE html>`, `<head>`, charset or a viewport meta tag. A standard HTML5
shell was added around that same fragment so the site has proper charset/viewport
handling for deployment — no visual or behavioral change, just the missing boilerplate.
