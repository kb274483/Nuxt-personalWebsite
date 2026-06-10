<template>
  <section 
    ref="canvasContainer" 
    class="flex h-full w-full items-center justify-center bg-white dark:bg-zinc-900"
  >
    <div
      class="whiteboard-dot-bg pointer-events-none absolute top-10 inset-0 z-0"
      aria-hidden="true"
    />
    <canvas
      ref="canvasRef"
      class="absolute top-10 inset-0 z-10 block h-full w-full touch-none cursor-crosshair"
      aria-label="Whiteboard"
      @pointerdown="handlePointerDown"
      @pointerup="handlePointerUp"
      @pointermove="handlePointerMove"
      @pointercancel="handlePointerCancel"
      @pointerleave="handlePointerCancel"
    />
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

type Point = {
  x:number
  y:number
}

type Stroke = {
  id: string
  points: Point[]
  color: string
  width: number
}

const canvasContainer = useTemplateRef<HTMLElement>('canvasContainer')
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
const strokes = ref<Stroke[]>([])
const activeStroke = ref<Stroke | null >(null)

const penColor = '#e1df5b'
const penWidth = 4

let resizeObserver: ResizeObserver | null = null
let canvasContext: CanvasRenderingContext2D | null = null
let activePointerId: number | null = null

// 轉換成 Canvas 中的座標
const getCanvasPoint = (event:PointerEvent): Point =>{
  const canvas = canvasRef.value
  if(!canvas) return {x:0, y:0}

  const rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

const resizeCanvas = () => {
  const canvas = canvasRef.value
  const container = canvasContainer.value

  if(!canvas || !container) return

  const containerRect = container.getBoundingClientRect()
  const devicePixelRatio = window.devicePixelRatio || 1
  
  canvas.width = Math.round(containerRect.width * devicePixelRatio)
  canvas.height = Math.round(containerRect.height * devicePixelRatio)
  canvas.style.width = `${containerRect.width}px` 
  canvas.style.height = `${containerRect.height}px`
  
  canvasContext = canvas.getContext('2d')

  if(!canvasContext) return

  canvasContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0,)
  redraw()
}

const drawStroke = (ctx:CanvasRenderingContext2D, stroke:Stroke) => {
  if (stroke.points.length < 2) return

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = stroke.color
  ctx.lineWidth = stroke.width

  ctx.beginPath()
  ctx.moveTo(stroke.points[0]!.x , stroke.points[0]!.y)

  for (const point of stroke.points.slice(1)){
    ctx.lineTo(point.x, point.y)
  }

  ctx.stroke()
  ctx.restore()
}

const redraw = ()=>{
  const canvas = canvasRef.value
  if(!canvas || !canvasContext) return

  const canvasRect = canvas.getBoundingClientRect()
  canvasContext.clearRect(0,0,canvasRect.width,canvasRect.height)

  for(const stroke of strokes.value){
    drawStroke(canvasContext, stroke)
  }

  if(activeStroke.value) {
    drawStroke(canvasContext, activeStroke.value)
  }
}

const handlePointerDown = (event: PointerEvent)=>{
  const canvas = canvasRef.value
  if(!canvas || activePointerId !== null) return

  activePointerId = event.pointerId
  canvas.setPointerCapture(event.pointerId)

  activeStroke.value = {
    id: crypto.randomUUID(),
    points: [getCanvasPoint(event)],
    color: penColor,
    width: penWidth
  }

  redraw()
}

const handlePointerMove = (event: PointerEvent) => {
  if (event.pointerId !== activePointerId || !activeStroke.value) {
    return
  }
  activeStroke.value.points.push(getCanvasPoint(event))
  redraw()
}

const commitActiveStroke = () => {
  if (!activeStroke.value) {
    return
  }

  if (activeStroke.value.points.length > 1) {
    strokes.value.push(activeStroke.value)
  }

  activeStroke.value = null
  redraw()
}

const handlePointerUp = (event: PointerEvent) => {
  if (event.pointerId !== activePointerId) {
    return
  }

  canvasRef.value?.releasePointerCapture(event.pointerId)
  activePointerId = null
  commitActiveStroke()
}

const handlePointerCancel = (event: PointerEvent) => {
  if (event.pointerId !== activePointerId) {
    return
  }

  canvasRef.value?.releasePointerCapture(event.pointerId)
  activePointerId = null
  activeStroke.value = null
  redraw()
}

onMounted(()=>{
  resizeCanvas()

  if(canvasContainer.value){
    resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvasContainer.value)
  }
})

onBeforeUnmount(()=>{
  resizeObserver?.disconnect()
  resizeObserver = null
})

</script>

<style scoped>
.whiteboard-dot-bg {
  background-color: #f8fafc;
  background-image: radial-gradient(
    circle,
    rgba(15, 23, 42, 0.22) 1px,
    transparent 1px
  );
  background-position: 0 0;
  background-size: 16px 16px;
}

:global(.dark .whiteboard-dot-bg) {
  background-color: #18181b;
  background-image: radial-gradient(
    circle,
    rgba(244, 244, 245, 0.22) 1px,
    transparent 1px
  );
}
</style>