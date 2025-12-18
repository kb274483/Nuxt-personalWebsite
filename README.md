# 因為我熱愛攝影與旅遊同時也是一位前端工程師，這是讓你們更加了解我的網站！

歡迎來到我的個人網站專案！這不僅僅是一個靜態的作品集，
而是一個模擬桌面作業系統的互動式體驗。
在這裡你可以像操作電腦一樣，瀏覽我的履歷、攝影作品（不定期新增）以及程式開發經歷。

這個網站模擬了一個桌機的桌面環境（並盡力的符合行動裝置），包含以下功能：
(在桌機中打開 Apps 請像使用電腦般雙擊項目開啟，行動裝置則輕點直接開啟並強制全螢幕模式)
- **桌面環境模擬**
  - **視窗管理系統**：支援視窗的開啟、關閉、拖曳管理。
  - **右鍵選單(Context Menu)**：檔案右鍵選單（新增、刪除、Rename）。
  - **自訂樣式**：客製化的桌布，深淺色主題。
  - **檔案系統**：檔案管理。
  - **桌面寵物**：陪伴我許久的三隻貓貓。

- **內建應用程式**
  - **Resume**：我的個人履歷。
  - **Code Works**：程式開發作品集展示。
  - **Gallery**：攝影作品集。
  - **Settings**：系統設定 (如顯示設定)。
  - **Text Editor**：簡單的文字編輯器。
  - **Travel Path**：透過滾輪或點擊的方式看見我過往的旅行足跡。
  - **Easter egg**：無用但可能有點有趣的小東西。

## 技術棧 (Tech Stack)
- **Core**: [Nuxt 4](https://nuxt.com) (Vue 3)
- **State Management**: [Pinia](https://pinia.vuejs.org/) (視窗、Modal 與桌面物件管理)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Backend / Database**: [Supabase](https://supabase.com/) (用於儲存與讀取攝影作品資料)
- **Icons**: [Lucide Vue Next](https://lucide.dev/)
- **Utilities**: [VueUse](https://vueuse.org/)
- **Anime.js**: [AnimeJS](https://animejs.com/)

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
