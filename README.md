# Abhinav Ranjan Sulabh

Personal portfolio showcasing software engineering experience, selected projects, and technical skills.

[Visit the portfolio](https://letsbegincode.github.io/)

## Stack

Semantic HTML, responsive CSS, and vanilla JavaScript. No build step or package installation is required. The site is hosted on GitHub Pages.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Portfolio content, navigation, and page metadata |
| `styles.css` | Typography, colors, layouts, and responsive styles |
| `script.js` | Navigation, scroll reveals, pointer highlights, and ASCII/photo portrait |
| `assets/ars-logo.svg`, `assets/ars-logo.png` | Custom ARS monogram in vector and transparent PNG formats |
| `myImage.jpeg` | Profile photograph |
| `favicon.svg`, `favicon.ico` | Browser icons |
| `apple-touch-icon.png` | Home-screen icon for Apple devices |
| `general/Abhinav_Ranjan_Sulabh_Resume.pdf` | Current resume linked from the portfolio |
| `.nojekyll` | Serves the site without Jekyll processing |

## Local preview

From the repository root, run:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open [localhost:8000](http://localhost:8000). Stop the server with `Ctrl+C`.

## Maintenance

- Update experience, project descriptions, and skills in `index.html` alongside resume changes.
- Replace the PDF at its existing path so resume links continue to work.
- Keep project links pointed at their actual repositories and qualify evaluation metrics with their context.
- Review mobile layouts, keyboard navigation, project links, and the resume link after changes.
- Update the SVG and raster icons together when changing the monogram or colors.

## Motion

The site includes staggered entrances, scroll reveals, card highlights, and an ASCII portrait with a photo toggle. Pointer tilt and hover motion run on devices with a fine pointer. Reduced-motion preferences disable animations and show the photograph by default; content and navigation also work without JavaScript.

GitHub Pages should serve the root of the configured publishing branch. Changes go live after they are pushed and the Pages deployment completes.
