<template>
  <canvas 
    ref="canvasRef" 
    class="absolute inset-0 w-full h-full pointer-events-none"
    style="z-index: 0;" 
  ></canvas>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, onBeforeUnmount, computed } from 'vue'
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

// 基礎縮放比例
const BASE_SCALE = computed(() => isMobile.value ? 0.25 : 0.5)
const GIANT_SCALE_MULTIPLIER = 5 // 巨大化倍率

const WALK_SPEED = 1     
const RUN_SPEED = 2     

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
  waitTimer: 0, 
  sprite,
  clickCount: 0,
  // 新增屬性
  scale: BASE_SCALE.value,
  targetScale: BASE_SCALE.value,
  originalScale: BASE_SCALE.value,
  isEvolving: false,
  evolutionTimer: 0
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
  
  const groundY = canvas.height - 50 

  SPRITE_SRC.forEach((src, index) => {
    const img = new Image()
    img.src = src.src
    img.onload = () => {
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

// 更新貓貓動作與狀態
const updateAnima = (cat: CatState, dt: number) => {
  // 處理縮放動畫 (Lerp)
  // 讓 scale 慢慢接近 targetScale
  const scaleSpeed = 0.1 * dt
  const diff = cat.targetScale - cat.scale
  if (Math.abs(diff) > 0.01) {
    cat.scale += diff * scaleSpeed
  } else {
    cat.scale = cat.targetScale
  }

  // 如果正在進化中，不進行移動邏輯
  if (cat.isEvolving) {
    // 進化閃爍邏輯由 drawCat 處理
    return
  }

  if (cat.isInteracting) { 
    if (cat.currentAnim === ANIMATIONS.SLEEP) {
      if (Date.now() - cat.sleepTimer > 5000) {
        wakeUp(cat)
      }
    }
    
    const isRollEnd = cat.currentAnim === ANIMATIONS.ROLL
    const isAttack = cat.currentAnim === ANIMATIONS.ATTACK

    if (isRollEnd || isAttack) {
      if (cat.waitTimer === 0) {
        cat.waitTimer = Date.now()
      } 
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

    cat.x += Math.cos(angle) * speed * dt
    cat.y += Math.sin(angle) * speed * dt

    // 限制貓咪移動範圍
    if(canvasRef.value) {
      // 根據當前大小計算邊界，避免穿幫
      const catW = FRAME_WIDTH * cat.scale / 2
      const maxX = canvasRef.value.width - catW
      const minX = catW
      // 腳底的極限
      const maxY = canvasRef.value.height
      const minY = canvasRef.value.height - 200
      
      cat.x = Math.max(minX, Math.min(cat.x, maxX))
      cat.y = Math.max(minY, Math.min(cat.y, maxY))
    }
    cat.direction = deltaX > 0 ? 1 : -1

    if (cat.currentAnim !== anima) {
      cat.currentAnim = anima
      cat.frameIndex = 0
      cat.tickCount = 0 
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

const advanceFrame = (cat: CatState, dt: number) => {
  cat.tickCount += dt
  if (cat.tickCount > cat.currentAnim.speed) {
    cat.tickCount = 0
    cat.frameIndex = (cat.frameIndex + 1) % cat.currentAnim.frames
  }
}

const drawNameBubble = (cat: CatState) => {
  if (!ctx || !cat.showName) return
  const text = `I'm : ${cat.name}`
  const fontSize = 14
  const padding = 8
  
  ctx.font = `bold ${fontSize}px sans-serif`
  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  
  const bubbleWidth = textWidth + (padding * 2)
  const bubbleHeight = fontSize + padding + 4
  const radius = 6
  
  // 計算位置：根據當前 scale 動態調整高度
  const catHeight = FRAME_HEIGHT * cat.scale
  const x = cat.x
  // 氣泡顯示在貓頭頂 (y 是腳底，所以減去高度)
  const y = cat.y - catHeight - bubbleHeight - 10

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

  // 三角形箭頭
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

const drawCat = (cat: CatState, timestamp: number) => {
  if (!ctx || !cat.sprite || !canvasRef.value) return

  const sx = cat.frameIndex * FRAME_WIDTH
  const sy = cat.currentAnim.row * FRAME_HEIGHT

  // 繪製參數
  const dWidth = FRAME_WIDTH * cat.scale
  const dHeight = FRAME_HEIGHT * cat.scale

  ctx.save()
  
  // 修正：將原點移動到貓的「腳下位置 (x, y)」
  ctx.translate(cat.x, cat.y)

  // 處理方向
  if (cat.direction === -1) ctx.scale(-1, 1)

  // 繪製貓咪
  const drawX = -dWidth / 2
  const drawY = -dHeight 

  // --- 進化特效 ---
  if (cat.isEvolving) {
    // 震動效果
    const shake = Math.sin(timestamp / 20) * 5
    ctx.translate(shake, 0)

    // 繪製原始貓咪
    ctx.drawImage(
      cat.sprite,
      sx, sy, FRAME_WIDTH, FRAME_HEIGHT,
      drawX, drawY, dWidth, dHeight
    )

    // 疊加白色閃爍
    // 利用 source-atop 只在貓咪不透明區域繪製白色
    ctx.globalCompositeOperation = 'source-atop'
    
    // 閃爍頻率
    const flashIntensity = (Math.sin(timestamp / 50) + 1) / 2 // 0 ~ 1
    ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`
    
    ctx.fillRect(drawX, drawY, dWidth, dHeight)
    
  } else {
    // 正常繪製
    ctx.drawImage(
      cat.sprite,
      sx, sy, FRAME_WIDTH, FRAME_HEIGHT,
      drawX, drawY, dWidth, dHeight
    )
  }

  ctx.restore()
  drawNameBubble(cat)
}

let lastTime = 0
const catLoop = (timestamp: number) => {
  if (!ctx || !canvasRef.value) return
  
  if (!lastTime) lastTime = timestamp
  const deltaTime = (timestamp - lastTime) / 16.67
  lastTime = timestamp

  const safeDelta = Math.min(deltaTime, 5) 

  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  for (const cat of cats) {
    updateAnima(cat, safeDelta)
    drawCat(cat, timestamp)
  }

  animationFrameId = requestAnimationFrame(catLoop)
}

const startSleep = (cat: CatState) => {
  if(cat.isEvolving) return
  cat.isInteracting = true
  cat.currentAnim = ANIMATIONS.SLEEP
  cat.sleepTimer = Date.now()
}

const wakeUp = (cat: CatState) => {
  if(cat.isEvolving) return
  cat.isInteracting = false
  cat.currentAnim = ANIMATIONS.IDLE
  cat.idleTimer = Date.now()
  cat.waitTimer = 0 
}

const playWithCat = (cat: CatState) => {
  if(cat.isEvolving) return 
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
    const hitRadius = 70 * (cat.scale / cat.originalScale)
    
    // cat.y 是腳底，中心點大約在 y - height/2
    const centerY = cat.y - (FRAME_HEIGHT * cat.scale / 2)
    
    const dist = Math.hypot(clientX - cat.x, clientY - centerY)
    
    if (dist < hitRadius && dist < minDist) {
      minDist = dist
      hitCat = cat
    }
  }

  if (hitCat) {
    e.preventDefault()
    e.stopPropagation()

    // 如果正在進化，點擊無效
    if (hitCat.isEvolving) return

    if (hitCat.currentAnim === ANIMATIONS.SLEEP) {
      wakeUp(hitCat)
    } else {
      playWithCat(hitCat)
    }
    
    hitCat.clickCount++
    
    // 進化彩蛋
    if(hitCat.clickCount >= 5){
      hitCat.clickCount = 0
      triggerEvolution(hitCat)
    }
  } else {
    // 移動邏輯 (點擊地板)
    const target = e.target as HTMLElement
    if(target.classList.contains('bg-cover')){
      let nearest: CatState | null = null
      let nearestDist = Infinity
  
      for (const cat of cats) {
        if(cat.isEvolving) continue // 進化中的貓不動

        const centerY = cat.y - (FRAME_HEIGHT * cat.scale / 2)
        const d = Math.hypot(clientX - cat.x, clientY - centerY)
        if (d < nearestDist) {
          nearestDist = d
          nearest = cat
        }
      }
  
      if (nearest) {
        if (nearest.isInteracting) wakeUp(nearest)
        if (canvasRef.value) {
          const halfW = FRAME_WIDTH * nearest.scale / 2
          const minX = halfW
          const maxX = canvasRef.value.width - halfW
          // 移動目標保持在同一水平面上
          nearest.targetX = Math.max(minX, Math.min(clientX, maxX))
        } else {
          nearest.targetX = clientX
        }
      }
    }
  }
}

// 觸發進化
const triggerEvolution = (cat: CatState) => {
  cat.isEvolving = true
  cat.isInteracting = true // 鎖定狀態
  
  // 播放進化前搖 (閃爍) - 2秒
  setTimeout(() => {
    // 瞬間變大 / 開始變大
    cat.isEvolving = false // 停止閃爍
    cat.targetScale = cat.originalScale * GIANT_SCALE_MULTIPLIER
    
    // 維持巨大化一段時間後變回來
    setTimeout(() => {
      cat.targetScale = cat.originalScale
      wakeUp(cat) // 解除鎖定，變回原樣
    }, 8000)
    
  }, 2000)
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