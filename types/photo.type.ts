export interface Photo {
  id: string;
  file_path: string;
  file_ext?: string | null;
  title?: string | null;
  description?: string | null;
  shoot_date?: string | null;
  country?: string | null;
  city?: string | null;
  location?: string | null;
  lat?: number | null;
  lng?: number | null;
  tags?: string[] | null;
  exif?: Record<string, any> | null;
  featured?: boolean | null;
  created_at?: string;
  updated_at?: string;

  src: string;       // 完整圖片網址
  thumbnail: string; // 縮圖網址
}

// 緩存結構
export interface PhotoCache {
  timestamp: number;
  data: Photo[];
}
