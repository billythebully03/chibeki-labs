# CHIBIKI STUDIO — Pixel Editor v0.2

A touch-first pixel editor prototype built with vanilla JavaScript and Canvas 2D. No build step or React dependency is required.

## Run
Open `index.html` through a static web server (recommended) or deploy the folder to GitHub Pages / Vercel. ES modules may be blocked when opening as `file://` in some browsers.

## Included
- Redesigned mobile-first interface inspired by the supplied concept: edge-docked symmetric tool and zoom rails, compact top bar, bottom layer strip and recent-color palette.
- Pixel pencil, eraser, bucket fill, eyedropper, line and rectangle.
- Brush size, zoom buttons and vertical zoom slider, pixel grid and checkerboard transparency.
- Multiple layers: add, duplicate, delete, toggle visibility, switch active layer.
- Starter palette, custom color picker, shade generation, image palette extraction.
- Canvas presets and custom dimensions (8–256 px).
- PNG export and `.chib` project export/import.
- Rename project from the title; local autosave in browser storage.
- Undo/redo and keyboard shortcuts.
- Fixed viewport behavior and suppression of page selection, context menus, browser pinch gestures and overscroll where supported.

## Project format
`.chib` is a JSON-based project container in this prototype. It stores canvas dimensions, ordered layers and RGBA pixel buffers, palette, and project name. Future additions can be versioned without coupling the editor to the game engine.

## Not included yet
No animation assistant or animation timeline is implemented. The bottom play control is currently a clearly marked placeholder. Character-part rigging, connectors, hitbox editing, selection/move/copy, onion skin, project thumbnails, and robust multi-touch canvas navigation remain future work.

## Architecture
`PixelDocument`, `PixelRenderer`, and `EditorController` remain separate. The document owns pixel data and serialization; the renderer displays it; the controller translates pointer input into editing operations.
