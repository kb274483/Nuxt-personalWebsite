export interface AnimeMenuItem {
  name: string;
  icon: string; // 圖片路徑
  href?: string; // 連結
  alt?: string;
  bgColor?: string;
}

export type MenuDirection = 'up' | 'down' | 'left' | 'right';