import { ref, watch, type Ref } from 'vue'
import { useGravityManager } from '~/stores/gravityManager'
import { animate, cubicBezier } from 'animejs'

export const usePhysicsCalc = (targetRef: Ref<HTMLElement | null>) => {
  const gravityManager = useGravityManager()
  
  // Delta 偏移量
  const x = ref(0)
  const y = ref(0)
  
  // 速度與狀態
  const speed = { x: 0, y: 0 }
  let isDragging = false
  let aFrameId: number | null = null
  let initRect: DOMRect | null = null
  let lastPos = { x: 0, y: 0 } // 拖曳座標

  // 物理狀態相關係數
  const gravity = 0.98
  const bounce = 0.6
  const friction = 0.9

  // 拖曳相關 function
  const startDrag = (pageX: number, pageY: number) => {
    isDragging = true
    // 重置速度
    speed.x = 0
    speed.y = 0
    // 初始化拖曳起點
    lastPos = { x: pageX, y: pageY }
    if (!initRect && targetRef.value) {
      initRect = targetRef.value.getBoundingClientRect()
    }
  }

  const moveDrag = (pageX: number, pageY: number) => {
    if (!isDragging) return

    // 計算滑鼠位移 (防止 NaN)
    const vx = (pageX - lastPos.x) || 0
    const vy = (pageY - lastPos.y) || 0
    
    // 更新偏移量
    x.value += vx
    y.value += vy
    // 記錄速度
    speed.x = vx
    speed.y = vy
    
    lastPos = { x: pageX, y: pageY }
  }

  const endDrag = () => {
    isDragging = false
  }

  const physicsLoop = () => {
    if (!gravityManager.isGravityEnabled) return

    if (!isDragging && targetRef.value && initRect) {
      // 重力作用
      speed.y += gravity
      
      // 計算下一個位置
      let nextX = x.value + speed.x
      let nextY = y.value + speed.y
      
      // 計算絕對位置 
      const currentAbsX = initRect.left + nextX
      const currentAbsY = initRect.top + nextY
      const width = initRect.width
      const height = initRect.height

      // 邊界定義
      const floor = window.innerHeight - height - 100
      const rightWall = window.innerWidth - width - 10
      const leftWall = 10
      
      // 地板碰撞
      if (currentAbsY > floor) {
        const overshoot = currentAbsY - floor
        nextY -= overshoot
        speed.y *= -bounce
        speed.x *= friction
        if (Math.abs(speed.y) < gravity) speed.y = 0
      }

      // 左右牆壁碰撞
      if (currentAbsX > rightWall) {
        const overshoot = currentAbsX - rightWall
        nextX -= overshoot
        speed.x *= -bounce
      } else if (currentAbsX < leftWall) {
        const overshoot = leftWall - currentAbsX
        nextX += overshoot
        speed.x *= -bounce
      }

      // 貓貓碰撞
      const itemRadius = width / 2 || 24
      for (const [catId, catPos] of gravityManager.catPosition) {
        const dx = (currentAbsX + width / 2) - catPos.x
        const dy = (currentAbsY + height / 2) - catPos.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = itemRadius + catPos.radius + 1

        if (distance < minDistance) {
          const pushX = dx / distance
          const pushY = dy / distance
          const overlap = minDistance - distance
          
          nextX += pushX * overlap
          nextY += pushY * overlap
          
          const bounceFactor = 3
          speed.x += pushX * bounceFactor
          speed.y += pushY * bounceFactor
        }
      }

      x.value = nextX
      y.value = nextY
    }

    aFrameId = requestAnimationFrame(physicsLoop)
  }

  const startPhysics = () => {
    if (!targetRef.value) return
    initRect = targetRef.value.getBoundingClientRect()
    
    // 初始隨機速度
    speed.x = (Math.random() - 0.5) * 10
    speed.y = -5
    
    physicsLoop()
  }

  const stopPhysics = () => {
    if (aFrameId) cancelAnimationFrame(aFrameId)
    isDragging = false
    
    // 如果有偏移，執行動畫歸位
    if (x.value !== 0 || y.value !== 0) {
      const targets = { x: x.value, y: y.value }
      
      animate(targets, {
        x: 0,
        y: 0,
        duration: 500,
        easing: cubicBezier(0.25, 1, 0.5, 1) as any,
        update: () => {
          x.value = targets.x
          y.value = targets.y
        },
        complete: () => {
          // 動畫結束後確保歸零
          x.value = 0
          y.value = 0
        }
      })
    } else {
      x.value = 0
      y.value = 0
    }
  }

  watch(() => gravityManager.isGravityEnabled, (enabled) => {
    if (enabled) {
      startPhysics()
    } else {
      stopPhysics()
    }
  }, { immediate: true })

  return {
    x,
    y,
    startDrag,
    moveDrag,
    endDrag
  }
}
