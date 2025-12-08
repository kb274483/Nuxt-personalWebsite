<template>
  <canvas 
    ref="canvasRef" 
    class="absolute inset-0 w-full h-full pointer-events-none"
    style="z-index: 0;" 
  ></canvas>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, onBeforeUnmount } from 'vue'
import { ANIMATIONS } from '~/types/cat.type'
import type { CatState, AnimConfig } from '~/types/cat.type'
import { useHead } from '#imports'
import { useIsMobile } from '~/composables/useIsMobile'

const { isMobile } = useIsMobile()

// 預載入貓貓圖片
useHead({
  link: [
    { rel: 'preload', as: 'image', href: '/cat_sprite_ban.png' },
    { rel: 'preload', as: 'image', href: '/cat_sprite_yahoo.png' },
    { rel: 'preload', as: 'image', href: '/cat_sprite_amei.png' }
  ]
})

const SPRITE_COLS = 6
const SPRITE_ROWS = 6
let FRAME_WIDTH = 128
let FRAME_HEIGHT = 128

const SCALE = isMobile.value ? 0.25 : 0.5      
const WALK_SPEED = 1     // 走路速度
const RUN_SPEED = 2     // 跑步速度

// canvas State
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
let ctx: CanvasRenderingContext2D | null = null
let animationFrameId: number | null = null

// 貓貓 State
const cats: CatState[] = []
const createCat = (
  id: number,
  name: string,
  x: number,
  y: number,
  sprite: HTMLImageElement,
  initAnimation: AnimConfig  
): CatState => ({
  id,
  name,
  showName: false,
  x,
  y,
  targetX: x,
  targetY: y,
  currentAnim: initAnimation,
  frameIndex: 0,
  tickCount: 0,
  direction: 1, 
  isInteracting: false,
  idleTimer: Date.now(),
  sleepTimer: 0,
  waitTimer: 0, // 初始化
  sprite,
})

const init = () => {
  const canvas = canvasRef.value as HTMLCanvasElement
  ctx = canvas.getContext('2d')
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  const SPRITE_SRC = [
    { name: 'A Ben', src: '/cat_sprite_ban.png' },
    { name: 'Yahoo', src: '/cat_sprite_yahoo.png' },
    { name: 'A Mei', src: '/cat_sprite_amei.png' },
  ]
  const groundY = canvas.height - 100
  SPRITE_SRC.forEach((src, index) => {
    const img = new Image()
    img.src = src.src
    img.onload = () => {
      // 所有貓共用同樣的 sprite 大小
      if (index === 0) {
        FRAME_WIDTH = img.width / SPRITE_COLS
        FRAME_HEIGHT = img.height / SPRITE_ROWS
      }

      const x = isMobile.value ? 50 + index * 100 : 150 + index * 180
      let cat: CatState
      cat = createCat(index + 1, src.name, x, groundY, img as HTMLImageElement, ANIMATIONS.IDLE)
      cats.push(cat)
      
      if (!animationFrameId) {
        requestAnimationFrame(catLoop)
      }
    }
  })

  window.addEventListener('mousemove', (e: MouseEvent) => handleMouseMove(e, cats[0]!))
  window.addEventListener('mousedown', handleInteraction)
  window.addEventListener('touchstart', handleInteraction)
}

const resizeCanvas = ()=>{
  if(!canvasRef.value) return

  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
}

// 更新貓貓動作
// 接收 dt (delta time) 參數修正速度
const updateAnima = (cat: CatState, dt: number) => {
  if (cat.isInteracting) { // 正在互動
    if (cat.currentAnim === ANIMATIONS.SLEEP) {
      if (Date.now() - cat.sleepTimer > 5000) {
        wakeUp(cat)
      }
    }
    
    // 判斷是否需要等待結束互動
    const isRollEnd = cat.currentAnim === ANIMATIONS.ROLL
    const isAttack = cat.currentAnim === ANIMATIONS.ATTACK

    if (isRollEnd || isAttack) {
      if (cat.waitTimer === 0) {
        cat.waitTimer = Date.now()
      } 
      // 等待超過 1000ms
      else if (Date.now() - cat.waitTimer > 1000) {
        wakeUp(cat)
        cat.showName = false
      }
    } else {
      cat.waitTimer = 0
    }

    advanceFrame(cat, dt)
    return
  }

  // 重置等待計時器 (保險起見)
  cat.waitTimer = 0

  const deltaX = cat.targetX - cat.x
  const deltaY = cat.targetY - cat.y
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  // 根據距離決定走路、跑、跳
  if (distance > 10) {
    const angle = Math.atan2(deltaY, deltaX)
    let speed = WALK_SPEED
    let anima = ANIMATIONS.WALK

    if (distance > 200) {
      speed = RUN_SPEED
      anima = ANIMATIONS.RUN
    }

    if (distance > 500) {
      speed = RUN_SPEED
      anima = ANIMATIONS.JUMP
    }

    // 使用 dt 修正移動速度
    cat.x += Math.cos(angle) * speed * dt
    cat.y += Math.sin(angle) * speed * dt

    // 限制貓咪移動範圍
    if(canvasRef.value) {
      const catWidth = FRAME_WIDTH * SCALE / 2
      const catHeight = FRAME_HEIGHT * SCALE / 2
      const maxX = canvasRef.value.width - catWidth
      const maxY = canvasRef.value.height - catHeight
      const minX = catWidth
      const minY = catHeight
      cat.x = Math.max(minX, Math.min(cat.x, maxX))
      cat.y = Math.max(minY, Math.min(cat.y, maxY))
    }
    cat.direction = deltaX > 0 ? 1 : -1

    if (cat.currentAnim !== anima) {
      cat.currentAnim = anima
      cat.frameIndex = 0
      cat.tickCount = 0 // 切換動作時重置 tick
    }

    cat.idleTimer = Date.now()
  } else {
    if (cat.currentAnim !== ANIMATIONS.IDLE) {
      cat.currentAnim = ANIMATIONS.IDLE
      cat.frameIndex = 0
    }

    if (Date.now() - cat.idleTimer > 6000) {
      startSleep(cat)
    }
  }

  advanceFrame(cat, dt)
}

// 更新幀數，使用 dt 讓動畫速度在不同螢幕更新率下一致
const advanceFrame = (cat: CatState, dt: number) => {
  cat.tickCount += dt
  if (cat.tickCount > cat.currentAnim.speed) {
    cat.tickCount = 0
    cat.frameIndex = (cat.frameIndex + 1) % cat.currentAnim.frames
  }
}

const drawNameBubble = (cat: CatState) => {
  if (!ctx || !cat.showName) return
  const text = `I'm :${cat.name}`
  const fontSize = 14
  const padding = 8
  
  // 設定字體以計算寬度
  ctx.font = `bold ${fontSize}px sans-serif`
  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  
  // 氣泡尺寸與位置
  const bubbleWidth = textWidth + (padding * 2)
  const bubbleHeight = fontSize + padding + 4
  const radius = 6
  
  // 計算位置
  const catHalfHeight = (FRAME_HEIGHT * SCALE) / 4
  const x = cat.x
  const y = cat.y - catHalfHeight - bubbleHeight

  ctx.save()
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetY = 2
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'

  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x - bubbleWidth / 2, y, bubbleWidth, bubbleHeight, radius)
  } else {
    ctx.rect(x - bubbleWidth / 2, y, bubbleWidth, bubbleHeight)
  }
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(x - 5, y + bubbleHeight)
  ctx.lineTo(x + 5, y + bubbleHeight)
  ctx.lineTo(x, y + bubbleHeight + 6)
  ctx.fill()

  ctx.shadowColor = 'transparent'
  ctx.fillStyle = '#333333'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y + bubbleHeight / 2)

  ctx.restore()
}

const drawCat = (cat: CatState) => {
  if (!ctx || !cat.sprite || !canvasRef.value) return

  const sx = cat.frameIndex * FRAME_WIDTH
  const sy = cat.currentAnim.row * FRAME_HEIGHT

  ctx.save()
  ctx.translate(cat.x, cat.y)

  if (cat.direction === -1) ctx.scale(-1, 1)

  ctx.drawImage(
    cat.sprite,
    sx, sy, FRAME_WIDTH, FRAME_HEIGHT,
    -FRAME_WIDTH * SCALE / 2,
    -FRAME_HEIGHT * SCALE / 2,
    FRAME_WIDTH * SCALE,
    FRAME_HEIGHT * SCALE
  )

  ctx.restore()
  drawNameBubble(cat)
}
let lastTime = 0
const catLoop = (timestamp: number) => {
  if (!ctx || !canvasRef.value) return
  
  // 計算 Delta Time
  if (!lastTime) lastTime = timestamp
  const deltaTime = (timestamp - lastTime) / 16.67
  lastTime = timestamp

  // 避免切換分頁後回來 delta 過大造成瞬間移動
  const safeDelta = Math.min(deltaTime, 5) 

  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  for (const cat of cats) {
    updateAnima(cat, safeDelta)
    drawCat(cat)
  }

  animationFrameId = requestAnimationFrame(catLoop)
}
// 貓貓互動相關 
const startSleep = (cat: CatState) => {
  cat.isInteracting = true
  cat.currentAnim = ANIMATIONS.SLEEP
  cat.sleepTimer = Date.now()
}

const wakeUp = (cat: CatState) => {
  cat.isInteracting = false
  cat.currentAnim = ANIMATIONS.IDLE
  cat.idleTimer = Date.now()
  cat.waitTimer = 0 // 喚醒時重置計時器
}

const playWithCat = (cat: CatState) => {
  const num = Math.floor(Math.random() * 3)
  if(num%2 === 0){
    cat.currentAnim = ANIMATIONS.ROLL
    cat.showName = true
  } else {
    cat.currentAnim = ANIMATIONS.ATTACK
  }
  cat.isInteracting = true
  cat.frameIndex = 0
}


// 滑鼠事件
const handleMouseMove = (e: MouseEvent, cat: CatState) => {
  // if (!cat.isInteracting) {}
}

const handleInteraction = (e: Event) => {
  // 避免右鍵觸發
  if(e instanceof MouseEvent && e.button !== 0) return


  let clientX, clientY = 0
  if (e instanceof MouseEvent) {
    clientX = e.clientX
    clientY = e.clientY
  } else if (e instanceof TouchEvent) {
    clientX = e.touches[0]!.clientX
    clientY = e.touches[0]!.clientY
  } else return

  let hitCat: CatState | null = null
  let minDist = Infinity

  for (const cat of cats) {
    const dist = Math.hypot(clientX - cat.x, clientY - cat.y)
    if (dist < 70 && dist < minDist) {
      minDist = dist
      hitCat = cat
    }
  }

  if (hitCat) {
    e.preventDefault()
    e.stopPropagation()

    if (hitCat.currentAnim === ANIMATIONS.SLEEP) {
      wakeUp(hitCat)
    } else {
      playWithCat(hitCat)
    }
  } else {
    const target = e.target as HTMLElement
    // 避免點擊桌面項目時觸發
    if(target.classList.contains('bg-cover')){
      let nearest: CatState | null = null
      let nearestDist = Infinity
  
      for (const cat of cats) {
        const d = Math.hypot(clientX - cat.x, clientY - cat.y)
        if (d < nearestDist) {
          nearestDist = d
          nearest = cat
        }
      }
  
      if (nearest) {
        if (nearest.isInteracting) wakeUp(nearest)
        if (canvasRef.value) {
          const halfW = FRAME_WIDTH * SCALE / 2
          const halfH = FRAME_HEIGHT * SCALE / 2
          
          // 計算可移動的邊界範圍
          const minX = halfW
          const maxX = canvasRef.value.width - halfW
          const minY = halfH
          const maxY = canvasRef.value.height - halfH
  
          // 將目標座標限制在範圍內
          nearest.targetX = Math.max(minX, Math.min(clientX, maxX))
          nearest.targetY = Math.max(minY, Math.min(clientY, maxY))
        } else {
          nearest.targetX = clientX
          nearest.targetY = clientY
        }
      }
    }
  }
}

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('mousemove', (e: MouseEvent) => handleMouseMove(e, cats[0]!))
  window.removeEventListener('mousedown', handleInteraction)
  window.removeEventListener('touchstart', handleInteraction)
  if(animationFrameId) cancelAnimationFrame(animationFrameId)
})

</script>