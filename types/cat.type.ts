export const ANIMATIONS = {
  IDLE:  { row: 0, frames: 6, speed: 24 }, // 坐著晃尾巴
  WALK:  { row: 1, frames: 6, speed: 20 },  // 走路
  SLEEP: { row: 2, frames: 6, speed: 40 }, // 趴著 / 睡覺
  JUMP:  { row: 3, frames: 6, speed: 16 },  // 跳躍
  ROLL:  { row: 4, frames: 6, speed: 24 },  // 翻滾
  ATTACK: { row: 5, frames: 6, speed: 12 },  // 攻擊
  RUN:   { row: 1, frames: 6, speed: 10 },
}
export type AnimConfig = (typeof ANIMATIONS)[keyof typeof ANIMATIONS]

export type CatState = {
  id: number
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
  sprite: HTMLImageElement
}

export const cats: CatState[] = []
