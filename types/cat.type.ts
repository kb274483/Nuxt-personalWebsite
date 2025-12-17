
export const ANIMATIONS = {
  IDLE:  { row: 0, frames: 6, speed: 20 }, // 坐著晃尾巴
  WALK:  { row: 1, frames: 6, speed: 16 },  // 走路
  SLEEP: { row: 2, frames: 6, speed: 36 }, // 趴著 / 睡覺
  JUMP:  { row: 3, frames: 6, speed: 6 },  // 跳躍
  ROLL:  { row: 4, frames: 6, speed: 20 },  // 翻滾
  ATTACK: { row: 5, frames: 6, speed: 12 },  // 攻擊
  RUN:   { row: 1, frames: 6, speed: 4 },
}
export type AnimConfig = (typeof ANIMATIONS)[keyof typeof ANIMATIONS]

export type CatState = {
  id: number
  name: string
  showName: boolean
  x: number
  y: number
  targetX: number
  targetY: number
  currentAnim: AnimConfig
  frameIndex: number
  tickCount: number
  direction: 1 | -1
  isInteracting: boolean
  idleTimer: number
  sleepTimer: number
  waitTimer: number
  sprite: HTMLImageElement
  clickCount: number
  scale: number        // 當前縮放比例
  targetScale: number  // 目標縮放比例
  isEvolving: boolean  // 是否正在進化動畫中
  evolutionTimer: number // 進化動畫計時器
  originalScale: number // 原始縮放比例
}

export const cats: CatState[] = []
