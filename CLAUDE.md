# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on http://0.0.0.0:5533
npm run build      # Build for production
npm run generate   # Static site generation
npm run preview    # Preview production build
```

## Architecture

This is a **desktop OS simulator** personal website built with Nuxt 4 / Vue 3. The entire app renders as a single page (`pages/index.vue`) that mimics a desktop environment.

### Core Layer: Pinia Stores (`stores/`)

All application state flows through these stores:

| Store | Responsibility |
|---|---|
| `windowManager` | Open/close/focus/minimize/maximize app windows; manages `WindowState[]` with position, size, zIndex |
| `desktopItemsManager` | Desktop icons (apps + user-created files); persists positions and user files to `localStorage` |
| `modalManager` | Global modal overlay (confirmations, alerts) |
| `photoManager` | Photography gallery data fetched from Supabase |
| `gravityManager` | Physics simulation for desktop pets (cats) |

### Window System

- `Window.vue` is the draggable/resizable container
- Each window renders a `component` string (e.g. `'Resume'`, `'Photos'`) via dynamic `<component :is="...">` in `pages/index.vue`
- On mobile, windows auto-maximize and are non-draggable
- `useBoundaryCheck.ts` prevents windows from being dragged off-screen

### Built-in Apps (`components/apps/`)

| App | Component | Notes |
|---|---|---|
| Resume | `Resume.vue` | Static CV |
| Code Works | `Browser.vue` | Project portfolio |
| Gallery | `Photos.vue` | Fetches from Supabase via `usePhotoApi.ts` |
| Settings | `Settings.vue` | Wallpaper/theme display settings |
| Text Editor | `TextEditor.vue` | Editable files persisted to `localStorage` |
| Travel Path | `Travel.vue` | Uses `globe.gl` + Three.js for 3D globe |

### Desktop Items

`AppItem` type (`types/appItem.type.ts`) represents both built-in apps (`app_type: 'app'`) and user-created text files (`app_type: 'file'`). Desktop icon positions persist in `localStorage` via `desktopItemsManager`.

### Composables (`composables/`)

- `useWallpaper` — `createSharedComposable` wrapping VueUse `useLocalStorage`; shared wallpaper state + CSS style computed
- `useIsMobile` — Detects mobile breakpoint; controls window/item behavior differences
- `useBoundaryCheck` — Viewport boundary clamping for drag operations
- `usePhysicsCalc` — Physics helpers for the cat gravity system
- `api/usePhotoApi.ts` — Supabase photo data fetching

### Styling

- Tailwind CSS with `darkMode: 'class'`
- Dark/light theme toggled via CSS class on `<html>`; persisted through Settings app
- Global styles in `assets/css/main.css`

### External Services

Supabase is configured via environment variables (required for the Gallery app):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
These are exposed via `nuxt.config.ts` `runtimeConfig.public` and accessed as `useRuntimeConfig().public.supabaseUrl` / `.supabaseKey`.
