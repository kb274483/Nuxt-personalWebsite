# 🚀 個人網站效能優化紀錄

> **優化期間：** 2026 年 4 月 7 日 ～ 4 月 8 日
> **Commit 範圍：** `5a44513` → `ef8db36`
> **測試工具：** Lighthouse、Chrome DevTools Performance（CPU 4x 降速）

---

## 📋 TL;DR

幫個人網站做了一次效能體檢，主要動手的方向是「圖片格式優化」、「元件 Lazy Loading」和「字體載入策略」。桌機版 Lighthouse Performance 從 **99 → 100** 拿下滿分，SEO 也從 **92 → 100**。傳輸體積更從 **783 kB 縮到 527 kB**，少了快三分之一。

---

## 🔍 Lighthouse 優化前後對比

### 桌機版（Desktop）

📸 *[截圖：優化前桌機 — 99 分]*
📸 *[截圖：優化後桌機 — 100 分]*

| 指標 | 優化前 | 優化後 | 變化 |
|---|---|---|---|
| **Performance** | 99 | **100** | +1 🎉 |
| **SEO** | 92 | **100** | +8 ✅ |
| Accessibility | 100 | 100 | 持平 |
| Best Practices | 100 | 100 | 持平 |
| FCP（首次內容渲染） | 0.7 s | **0.4 s** | -43% 🔥 |
| LCP（最大內容渲染） | 0.7 s | 0.8 s | 微幅增加 |
| TBT（總封鎖時間） | 0 ms | 0 ms | 持平 |
| Speed Index | 0.8 s | **0.5 s** | 改善 |
| CLS（版面偏移） | 0 | 0 | 持平 |

> 💡 桌機的基準分數已經很高（99），FCP 從 0.7s 降到 0.4s 是這次最明顯的進步。LCP 微幅從 0.7s 增加到 0.8s，但不影響最終滿分。

---

### 手機版（Mobile）

📸 *[截圖：優化前手機 — 93 分]*
📸 *[截圖：優化後手機 — 92 分]*

| 指標 | 優化前 | 優化後 | 變化 |
|---|---|---|---|
| **Performance** | 93 | 92 | -1 |
| **SEO** | 92 | **100** | +8 ✅ |
| Accessibility | 100 | 100 | 持平 |
| Best Practices | 100 | 100 | 持平 |
| FCP（首次內容渲染） | 2.5 s | **1.5 s** | -40% 🔥 |
| LCP（最大內容渲染） | 2.5 s | **1.5 s** | -40% 🔥 |
| TBT（總封鎖時間） | 100 ms | 320 ms | 增加（見備註） |
| Speed Index | 2.9 s | **1.5 s** | -48% 🔥 |
| TTI（可互動時間） | 7.0 s | **3.8 s** | -46% 🔥 |
| CLS（版面偏移） | 0 | 0 | 持平 |

> 💡 **備註：TBT 增加的真正原因**
> 手機 TBT 從 100ms 跳到 320ms，看起來像是退步，但從 Long Task 明細來看，原因其實是 **FCP 提前了**。
>
> TBT 的計算範圍是「FCP 到 TTI 之間」的長任務封鎖時間。優化前 FCP 是 2498ms，有一個 153ms 的長任務在 820ms 就跑完，因為早於 FCP 所以完全不計入 TBT。優化後 FCP 提前到 1531ms，原本在 FCP 之前就結束的 JS 執行現在落在窗口裡，兩個長任務（216ms、204ms）在 FCP 後的 1863ms / 2067ms 執行，合計貢獻了 320ms。
>
> **JS 本身並沒有變慢，只是 FCP 變快讓更多工作被計入統計。** 這是優化成功的附帶效果，不需要特別處理。

---

### Chrome DevTools Performance 追蹤（桌機）

📸 *[截圖：優化前 Performance 追蹤 — LCP 0.50s，vercel.app 783 kB，Google Fonts 外部請求可見]*
📸 *[截圖：優化後 Performance 追蹤 — LCP 0.43s，vercel.app 527 kB，Google Fonts 消失]*

| 指標 | 優化前 | 優化後 | 變化 |
|---|---|---|---|
| **FCP** | 442 ms | **431 ms** | 小幅改善 |
| **LCP** | 442 ms | **431 ms** | 小幅改善 |
| **FMP**（首次有意義渲染） | 669 ms | **618 ms** | 改善 |
| **Page Load** | 484 ms | **356 ms** | -26% 📈 |
| **Long Tasks（長任務）** | 3 個（306 ms） | **2 個（266 ms）** | 減少一個 |
| **傳輸體積（vercel.app）** | **783 kB** | **527 kB** | **-33% 🔥** |
| **Google Fonts 外部請求** | 有（26.2 kB） | **無** | 改用本地字體 |

這裡最值得注意的是**傳輸體積的縮減**。優化前可以清楚看到 Google Fonts 是一個獨立的第三方請求（26.2 kB），改用 `@nuxtjs/google-fonts` 後字體變成隨 Vercel bundle 一起部署，那個外部請求直接消失了。加上圖片格式改用 WebP / SVG，整體下載量少了 256 kB。

---

## 🛠️ 做了哪些改動？

### 1. 圖示從 PNG 換成 SVG

**Commit:** `60159ac`

SystemBar 上的社群連結圖示（GitHub、Notion、Instagram）原本是 PNG 格式，換成 SVG 之後：
- 檔案體積直接縮小到幾 KB
- 不管什麼解析度都清晰
- 對 Lighthouse 的「避免使用大型網路資源」這項有幫助

```
github-logo.png → github-logo.svg
instagram-logo.png → instagram-logo.svg
notion-logo.png → notion-logo.svg
```

---

### 2. 字體載入策略調整

**Commit:** `60159ac`

原本是手動在 `nuxt.config.ts` 裡貼 Google Fonts 的 `<link>` 標籤，而且用的是 `display=block`（字體載入前瀏覽器會等它，不顯示文字）。

改成用 `@nuxtjs/google-fonts` 模組，設定 `display=swap` + `preload: true`：
- `display=swap`：字體還沒載入時先用系統字體頂著，避免空白閃爍
- `preload: true`：提前告知瀏覽器要載入這個字體，讓它早點開始下載
- 字體隨 Vercel 一起部署，**消除 Google Fonts 第三方請求**

```ts
// nuxt.config.ts
["@nuxtjs/google-fonts", {
  families: { "Space Grotesk": [400, 500, 700, 900] },
  display: "swap",
  preload: true,
}]
```

---

### 3. App 元件改為 Lazy Loading

**Commit:** `b76c054`

原本 `pages/index.vue` 在頁面一載入的時候就把所有 App 元件（Resume、Photos、Travel 等等）全部打包進去了。

改成 `defineAsyncComponent` + 動態 `import()`，讓元件在使用者實際點開對應視窗時才載入：

```ts
// 改前
case 'Resume': return resolveComponent('AppsResume')

// 改後
case 'Resume': return defineAsyncComponent(() => import('~/components/apps/Resume.vue'))
```

這個改動讓初始 bundle 縮小，是 FCP 和 TTI 改善的主要原因之一。

---

### 4. 貓貓 Sprite 圖從 PNG 換成 WebP

**Commit:** `c12e460`

網站上有三隻走來走去的桌面貓（美眉、斑斑、Yahoo），她們的動畫 Sprite Sheet 原本是 PNG，換成 WebP 之後體積直接砍掉 **65%**：

```
cat_sprite_amei.png  (872 KB) → cat_sprite_amei.webp  (287 KB)
cat_sprite_ban.png   (922 KB) → cat_sprite_ban.webp   (304 KB)
cat_sprite_yahoo.png (918 KB) → cat_sprite_yahoo.webp (304 KB)
```

三張合計省下約 **1.8 MB**，是這次體積縮減最大的單一改動。

---

### 5. 貓貓 Sprite 加上 Preload

**Commits:** `1f7366b`, `ef8db36`

貓貓 Sprite 是在 JS 執行後才由 Canvas 動態載入的，瀏覽器不知道要提前準備。在 `nuxt.config.ts` 加上 `preload` hint，讓瀏覽器在解析 HTML 的第一時間就開始下載：

```ts
link: [
  { rel: "preload", as: "image", href: "/cat_sprite_ban.webp" },
  { rel: "preload", as: "image", href: "/cat_sprite_yahoo.webp" },
  { rel: "preload", as: "image", href: "/cat_sprite_amei.webp" },
]
```

> 注意：這個設定讓手機的 TBT 上升，是目前已知的副作用。

---

### 6. 補上 SEO Meta Description

**Commit:** `60159ac`

原本沒有 `<meta name="description">`，Lighthouse SEO 扣了不少分。補上之後桌機和手機的 SEO 都從 92 跳到 100。

```ts
meta: [
  { name: 'description', content: "Roy's Personal Website | developer portfolio, photography gallery, and travel map." }
]
```

---

## 📊 總結

這次優化的核心概念就三個字：**「少、快、對」**

- **少**：圖片格式換成更輕的（SVG、WebP），傳輸體積從 783 kB 縮到 527 kB
- **快**：字體消除外部請求、元件 Lazy Loading，讓瀏覽器初始需要處理的東西更少
- **對**：補上 SEO meta description，兩端 SEO 都拿滿分

目前唯一的未解問題是**手機端 TBT**（100ms → 320ms），後續可以考慮改用 IntersectionObserver 讓貓貓 Sprite 在進入視野時才載入，而不是頁面一開始就 preload 全部。

---

*📝 紀錄時間：2026-04-08*
