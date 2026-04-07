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
| `gravityManager` | Tracks cat positions/radii for physics interactions; `isGravityEnabled` toggles draggable logo behavior |

### Window System

- `Window.vue` is the draggable/resizable container using `@vueuse/core`'s `useDraggable`
- Each window renders a `component` string (e.g. `'Resume'`, `'Photos'`) via dynamic `<component :is="...">` in `pages/index.vue`
- Component resolution happens in the `getComponent()` switch in `pages/index.vue` — **adding a new app requires both an entry in `appsDefault` array AND a case in `getComponent()`**
- On mobile (`useIsMobile`), windows auto-maximize and are non-draggable
- `useBoundaryCheck.ts` prevents windows from being dragged off-screen
- `TOP_OFFSET = 48` is hardcoded in both `windowManager.ts` and `Window.vue` — tied to `SystemBar` height
- Window close uses `animejs` (`waapi`) for the exit animation before calling `store.closeWindow()`

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

- `localStorage` keys: `desktopItemPositions` (all icon positions) and `userCreatedFiles` (user text files with content)
- On mobile, stored positions are ignored and defaults are used

### Desktop Cat System (`components/DesktopCat.vue`)

Canvas-based sprite animation system with 3 cats rendered via `requestAnimationFrame`. Cats walk, run, sleep, and react to clicks. Clicking a cat 5 times triggers an "evolution" easter egg (giant scale). Cat positions are reported to `gravityManager` so other elements can react to them.

### Composables (`composables/`)

- `useWallpaper` — `createSharedComposable` wrapping VueUse `useLocalStorage`; shared wallpaper state + CSS style computed
- `useIsMobile` — Detects mobile via user-agent OR `window.innerWidth < 768`; controls window/item behavior differences
- `useBoundaryCheck` — Viewport boundary clamping for drag operations
- `usePhysicsCalc` — Physics spring/bounce helpers used in `SystemBar` for the draggable logo and theme button
- `api/usePhotoApi.ts` — Supabase photo data fetching

### SSR Safety

Use `import.meta.client` guards (not `typeof window !== 'undefined'`) whenever accessing browser APIs. The store `windowManager` uses this pattern extensively.

### Styling

- Tailwind CSS with `darkMode: 'class'`; neo-brutalism aesthetic (bold borders, yellow `#FFD93D` accents, hard shadows)
- Dark/light theme toggled via `document.startViewTransition` when available, falling back to instant toggle; persisted via VueUse `useDark`
- Global styles in `assets/css/main.css`

### External Services

Supabase is provided via `plugins/supabase.client.ts` and accessed in composables as `useNuxtApp().$supabase`. Required env vars:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
These are exposed via `nuxt.config.ts` `runtimeConfig.public` and accessed as `useRuntimeConfig().public.supabaseUrl` / `.supabaseKey`.
