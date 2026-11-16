# CHIBIKI STUDIO — Pixel Editor v0.3

Touch-first pixel editor prototype built with vanilla JavaScript and Canvas 2D. No build step or React dependency is required.

## Run
Open `index.html` through a static web server (recommended), or deploy the folder to GitHub Pages / Vercel. ES modules may be blocked when opening as `file://` in some browsers.

## Included
- Reworked responsive workspace: fixed top bar, edge-docked tool and zoom rails, centered canvas, compact bottom layer and palette docks.
- Pixel pencil, eraser, bucket fill, eyedropper, line and rectangle.
- Brush size, zoom buttons and vertical zoom slider, pixel grid and checkerboard transparency.
- Layers: add, duplicate, delete, toggle visibility and switch active layer.
- Recent colors, custom color picker, shade generation and image palette extraction.
- Canvas presets and custom dimensions (8–256 px).
- Attach an image reference; adjust opacity, show/hide it or remove it. Reference is drawn beneath pixel layers and is excluded from PNG export.
- `.chib` project export/import includes the attached reference image.
- PNG export, project renaming, browser autosave, undo/redo and keyboard shortcuts.
- Fixed viewport behavior and suppression of accidental selection, context menus, page scrolling and browser pinch gestures where supported.

## Project format
`.chib` is a JSON-based project container in this prototype. It stores canvas dimensions, ordered layers and RGBA pixel buffers, palette, project name, and optional reference image data with opacity/visibility settings.

## Not included yet
No animation assistant or animation timeline. Character-part rigging, connectors, hitbox editing, selection/move/copy, onion skin, project thumbnails and robust multi-touch canvas navigation remain future work.

## Architecture
`PixelDocument`, `PixelRenderer`, and `EditorController` remain separate. The document owns pixel data and serialization; the renderer displays it; the controller translates pointer input into editing operations.
