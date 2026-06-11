<template>
  <section 
    ref="canvasContainer" 
    class="relative flex h-full w-full items-center justify-center bg-white dark:bg-zinc-900"
  >
    <div
      class="whiteboard-dot-bg pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
    <canvas
      ref="canvasRef"
      class="absolute inset-0 z-10 block h-full w-full touch-none "
      :class="{ activeTool === 'pan' ? 'cursor-grab' : 'cursor-crosshair' }"
      aria-label="Whiteboard"
      @contextmenu.prevent
      @wheel.prevent="handleWheel"
      @pointerdown="handlePointerDown"
      @pointerup="handlePointerUp"
      @pointermove="handlePointerMove"
      @pointercancel="handlePointerCancel"
      @pointerleave="handlePointerCancel"
    />

    <div class="absolute z-20 bottom-0 w-full flex justify-center">
      <div class="bg-gray-900/10 dark:bg-slate-200/10 p-4 rounded-md flex gap-4">
        <button
          type="button"
          aria-label="Pencil tool"
          @click="activeTool = 'pencil'"
          :class="getToolButtonClass('pencil')"
        >
          <Pencil class="h-8 w-8" />
        </button>

        <button
          type="button"
          aria-label="Eraser tool"
          @click="activeTool = 'eraser'"
          :class="getToolButtonClass('eraser')"
        >
          <Eraser class="h-8 w-8" />
        </button>

        <button
          type="button"
          aria-label="Pan tool"
          @click="activeTool = 'pan'"
          :class="getToolButtonClass('pan')"
        >
          <Hand class="h-8 w-8" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Eraser, Hand, Pencil } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

type ToolType = 'pencil' | 'eraser' | 'pan'
type DrawMode = 'pencil' | 'eraser' 

type Point = {
  x:number
  y:number
}

type Stroke = {
  id: string
  mode: DrawMode
  points: Point[]
  color: string
  width: number
}

type Viewport = {
  x:number
  y:number
  scale:number
}

const viewport = ref<Viewport>({
  x:0,
  y:0,
  scale:1,
})

const canvasContainer = useTemplateRef<HTMLElement>('canvasContainer')
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
const strokes = ref<Stroke[]>([])
const activeStroke = ref<Stroke | null >(null)
const activeTool = ref<ToolType>('pencil')

const penColor = '#e1df5b'
const penWidth = 4
const eraserWidth = 16

let resizeObserver: ResizeObserver | null = null
let canvasContext: CanvasRenderingContext2D | null = null
let activePointerId: number | null = null

const isPanning = ref(false)
let lastPanPoint: Point | null = null

// 轉換成 Canvas 中的座標
const getCanvasPoint = (event:PointerEvent): Point =>{
  const canvas = canvasRef.value
  if(!canvas) return {x:0, y:0}

  const canvasRect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - canvasRect.left,
    y: event.clientY - canvasRect.top
  }
}

const screenToWorld = (point: Point): Point=>{
  return {
    x: viewport.value.x + point.x / viewport.value.scale,
    y: viewport.value.y + point.y / viewport.value.scale,
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
  canvasContext.save()
  canvasContext.setTransform(1, 0, 0, 1, 0, 0)
  canvasContext.clearRect(0,0,canvas.width, canvas.height)

  const devicePixelRatio = window.devicePixelRatio || 1
  const dprScale = devicePixelRatio * viewport.value.scale
  canvasContext.setTransform(
    dprScale,
    0,
    0,
    dprScale,
    -viewport.value.x * dprScale,
    -viewport.value.y * dprScale,
  )

  for(const stroke of strokes.value){
    drawStroke(canvasContext, stroke)
  }

  if(activeStroke.value) {
    drawStroke(canvasContext, activeStroke.value)
  }

  canvasContext.restore()
}

const handlePointerDown = (event: PointerEvent)=>{
  const canvas = canvasRef.value
  if(!canvas || activePointerId !== null) return

  activePointerId = event.pointerId
  canvas.setPointerCapture(event.pointerId)

  if(event.button === 1 || event.button === 2){
    isPanning.value = true
    lastPanPoint = getCanvasPoint(event)
    return
  }

  activeStroke.value = {
    id: crypto.randomUUID(),
    mode: 'pencil',
    points: [screenToWorld(getCanvasPoint(event))],
    color: penColor,
    width: penWidth
  }

  redraw()
}

const handlePointerMove = (event: PointerEvent) => {
  if (event.pointerId !== activePointerId ) {
    return
  }

  if (isPanning.value && lastPanPoint){
    const nextPoint = getCanvasPoint(event)
    const dx = nextPoint.x - lastPanPoint.x
    const dy = nextPoint.y - lastPanPoint.y

    viewport.value.x -= dx / viewport.value.scale
    viewport.value.y -= dy / viewport.value.scale

    lastPanPoint = nextPoint
    redraw()
    return
  }

  if(!activeStroke.value) return
  activeStroke.value.points.push(screenToWorld(getCanvasPoint(event)))
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

  isPanning.value = false
  lastPanPoint = null
  canvasRef.value?.releasePointerCapture(event.pointerId)
  activePointerId = null
  commitActiveStroke()
}

const handlePointerCancel = (event: PointerEvent) => {
  if (event.pointerId !== activePointerId) {
    return
  }

  isPanning.value = false
  lastPanPoint = null
  canvasRef.value?.releasePointerCapture(event.pointerId)
  activePointerId = null
  activeStroke.value = null
  redraw()
}

const clamp = (value:number, min:number, max:number)=>{
  return Math.min(Math.max(value, min), max)
}

const zoomAt = (point:Point, factor:number)=>{
  const beforeZoom = screenToWorld(point)
  viewport.value.scale = clamp(viewport.value.scale * factor, 0.1, 8)
  const afterZoom = screenToWorld(point)

  viewport.value.x += beforeZoom.x - afterZoom.x
  viewport.value.y += beforeZoom.y - afterZoom.y

  redraw()
}

const handleWheel = (event:WheelEvent)=>{
  const canvas = canvasRef.value
  if(!canvas) return

  const canvasRect = canvas.getBoundingClientRect()
  const sceenPoint = {
    x: event.clientX - canvasRect.left,
    y: event.clientY - canvasRect.top,
  }

  const factor = event.deltaY < 0 ? 1.1 : 0.9
  zoomAt(sceenPoint, factor)
}

const getToolButtonClass = (tool: ToolType) => {
  const baseClass = 'flex h-10 w-10 items-center justify-center border-2 border-black transition-all ease-in active:translate-x-[1px] active:translate-y-[1px] dark:border-white'
  const activeClass = 'bg-[#FFD93D] text-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]'
  const inactiveClass = 'bg-white text-black hover:bg-zinc-100 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'

  return `${baseClass} ${activeTool.value === tool ? activeClass : inactiveClass}`
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
    rgba(15, 23, 42, 0.22) .5px,
    transparent 1px
  );
  background-position: 0 0;
  background-size: 16px 16px;
}

:global(.dark .whiteboard-dot-bg) {
  background-color: #18181b;
  background-image: radial-gradient(
    circle,
    rgba(244, 244, 245, 0.22) .5px,
    transparent 1px
  );
}
</style>