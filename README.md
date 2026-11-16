# CHIBIKI STUDIO — Pixel Editor v0.1

A touch-first browser pixel editor prototype built with vanilla JavaScript and Canvas 2D.

## Run
Open `index.html` in a modern browser, or serve this folder from a local/static web server. ES modules may be blocked when opening as `file://` in some browsers.

## Included in v0.1
- Responsive desktop and phone layout
- Pixel pencil, eraser, bucket fill, eyedropper, line and rectangle
- Brush size, zoom controls, pixel grid and checkerboard transparency
- Multiple layers: add, duplicate, delete, toggle visibility, switch active layer
- Starter palette, custom color picker, shade generation, image palette extraction
- Canvas presets and custom dimensions (8–256 px)
- PNG export and `.chibiki` JSON project export/import
- Local autosave in browser storage
- Undo/redo and keyboard shortcuts

## Architecture decisions
The editor is separated into `PixelDocument`, `PixelRenderer`, and `EditorController`.
The document model owns pixel data and project serialization; the renderer only displays it; the controller translates pointer input into editing operations.

This separation is intentional. Future modules should extend the document format without coupling the game runtime to the editor UI.

## Planned format evolution
Version 1 stores:
- canvas dimensions
- ordered layers and RGBA pixel buffers
- palette
- project name

Future compatible additions should be namespaced and versioned:
- `character.parts[]` — independently editable body parts
- `character.connectors[]` — named attachment points in part-local pixel coordinates
- `character.hitboxes[]` — collision geometry, separate from artwork
- `animation.clips[]` — frame data and timing
- `metadata` — tags, source universe, authoring notes

Do not treat visual layer bounds as physics hitboxes. Do not bake connector coordinates into the renderer. Keep both as explicit document data so a future custom game engine can consume them without depending on this editor.

## Current prototype limitations
This is a first functional foundation, not yet a production editor. Selection/move/copy, onion skin, animation timeline, character-part rigging, connector editing, hitbox editing, palette quantization, project thumbnails and robust mobile pinch/pan are not implemented yet. The current undo model snapshots document states and should be replaced with compact command history before supporting large canvases or long sessions.
