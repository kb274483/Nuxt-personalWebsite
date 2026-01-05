export type WallpaperFit = 'cover' | 'contain' | 'stretch'
export type WallpaperPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'
export type WallpaperRepeat = 'no-repeat' | 'repeat'

export type WallpaperOptions = {
  fit: WallpaperFit
  position: WallpaperPosition
  repeat: WallpaperRepeat
}