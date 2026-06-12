<template>
  <section 
    ref="canvasContainer" 
    class="canvas-container relative flex h-full w-full items-center justify-center bg-white dark:bg-zinc-900"
    @pointerdown.stop
    @pointermove.stop
    @pointerup.stop
    @click.stop
    @mousedown.stop
    @mouseup.stop
  >
    <div
      class="whiteboard-dot-bg pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
    <canvas
      ref="canvasRef"
      class="absolute inset-0 z-10 block h-full w-full touch-none "
      :class="activeTool === 'pan' ? 'cursor-grab' : 'cursor-crosshair'"
      aria-label="Whiteboard"
      @contextmenu.prevent
      @wheel.prevent="handleWheel"
      @pointerdown="handlePointerDown"
      @pointerup="handlePointerUp"
      @pointermove="handlePointerMove"
      @pointercancel="handlePointerCancel"
      @pointerleave="handlePointerCancel"
    />

    <WhiteboardToolBar 
      v-model:active-tool="activeTool"
      v-model:eraser-width="eraserWidth"
      v-model:pen-color="penColor"
      v-model:pen-width="penWidth"
      :pen-colors="pencilColors"
    />
  </section>
</template>

<script setup lang="ts">
import WhiteboardToolBar from '../whiteboard/WhiteboardToolBar.vue';
import { useWhiteboardApi } from '~/composables/api/useWhiteboardApi'
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import type { Viewport, Stroke, ToolType, Point, DrawMode } from '~/types/whiteboard.type'

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

const penColor = ref<string>('#c1c1c1')
const penWidth = ref<number>(12)
const eraserWidth = ref<number>(20)
const pencilColors = [
  '#c1c1c1',
  '#333333',
  '#2563eb', // blue
  '#dc2626', // red
  '#16a34a', // green
  '#ca8a04', // yellow
  '#9333ea', // purple
  '#ea580c', // orange
]

let resizeObserver: ResizeObserver | null = null
let canvasContext: CanvasRenderingContext2D | null = null
let activePointerId: number | null = null

const isPanning = ref<boolean>(false)
let lastPanPoint: Point | null = null

const { fetchStokes, saveStroke, subscribeWhiteboard } = useWhiteboardApi()
let realtimeWhiteboard: ReturnType<typeof subscribeWhiteboard> | null = null
const clientId = crypto.randomUUID()
const previewStrokes = new Map<string,Stroke>()

// Supabase 即時廣播節流
const BROADCAST_DEBOUNCE_MS = 40
let lastBroadcastAt = 0
let pendingBroadcastTimer: number| null = null

const broadcastStroke = ( force = false)=>{
  if( !activeStroke.value ) return

  const now = Date.now()
  const elapsed = now - lastBroadcastAt

  const send = () => {
    if( !activeStroke.value ) return
    lastBroadcastAt = Date.now()

    realtimeWhiteboard?.broadcastStrokeProgress({
      clientId,
      stroke: activeStroke.value,
    })
  }

  // 強制更新或是已超過節流時間時
  if( force || elapsed >= BROADCAST_DEBOUNCE_MS){
    if(pendingBroadcastTimer){
      window.clearTimeout(pendingBroadcastTimer)
      pendingBroadcastTimer = null
    }
    send()
    return
  }

  if (!pendingBroadcastTimer) {
    pendingBroadcastTimer = window.setTimeout(() => {
      pendingBroadcastTimer = null
      send()
    }, BROADCAST_DEBOUNCE_MS - elapsed)
  }
}

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

  ctx.globalCompositeOperation = stroke.mode === 'eraser' ? 'destination-out' : 'source-over'
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
  for(const stroke of previewStrokes.values()){
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

  const isPan = activeTool.value === 'pan' || event.button === 1 || event.button === 2
  if(isPan){
    isPanning.value = true
    lastPanPoint = getCanvasPoint(event)
    return
  }

  const mode:DrawMode = activeTool.value === 'eraser' ? 'eraser' : 'pencil'
  activeStroke.value = {
    id: crypto.randomUUID(),
    mode,
    points: [screenToWorld(getCanvasPoint(event))],
    color: penColor.value,
    width: mode === 'pencil' ? penWidth.value : eraserWidth.value
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

  broadcastStroke()
  redraw()
}

const commitActiveStroke = async () => {
  if (!activeStroke.value) {
    return
  }

  broadcastStroke(true)
  const stroke = activeStroke.value
  activeStroke.value = null

  if (stroke.points.length > 1) {
    strokes.value.push(stroke)
    redraw()

    try{
      await saveStroke(stroke)
    } catch (error){
      strokes.value = strokes.value.filter(item => item.id !== stroke.id)
      redraw()
      console.log(error)
    }
    return
  }
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

  const strokeId = activeStroke.value?.id
  if(strokeId){
    realtimeWhiteboard?.broadcastStrokeCancel({
      clientId,
      strokeId,
    })
  }

  if (pendingBroadcastTimer) {
    window.clearTimeout(pendingBroadcastTimer)
    pendingBroadcastTimer = null
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

// 即時廣播斷線時的處理
const mergeStrokes = (updateStrokes: Stroke[]) => {
  const existStrokeId = new Set(strokes.value.map(value => value.id))
  const newStrokes = updateStrokes.filter(value => !existStrokeId.has(value.id))

  if( newStrokes.length === 0) return

  for(const stroke of newStrokes){
    previewStrokes.delete(stroke.id)
  }

  strokes.value.push(...newStrokes)
  redraw()
}

const refreshStrokes = async () => {
  try{
    const lastestStrokes = await fetchStokes()
    mergeStrokes(lastestStrokes)
  }catch(err){
    console.log(err,"failed to fetch stroke")
  }
}

const initSubscribeWhiteboard = ()=>{
  realtimeWhiteboard = subscribeWhiteboard({
    onInsert:(stroke)=>{
      if(strokes.value.some(item => item.id === stroke.id)){
        previewStrokes.delete(stroke.id)
        redraw()
        return
      }

      previewStrokes.delete(stroke.id)
      strokes.value.push(stroke)
      redraw()
    },
    onStrokeProgress: ({ stroke }) => {
      if (strokes.value.some(item => item.id === stroke.id)) {
        return
      }

      previewStrokes.set(stroke.id, stroke)
      redraw()
    },
    onStrokeCancel: ({ strokeId }) => {
      previewStrokes.delete(strokeId)
      redraw()
    },
    onSubscribed: () => {
      void refreshStrokes()
    },
  })
}

onMounted( async ()=>{
  await refreshStrokes()
  initSubscribeWhiteboard()
  resizeCanvas()
  if(canvasContainer.value){
    resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvasContainer.value)
  }
})

onBeforeUnmount(()=>{
  if (pendingBroadcastTimer) {
    window.clearTimeout(pendingBroadcastTimer)
    pendingBroadcastTimer = null
  }
  realtimeWhiteboard?.unsubscribe()
  realtimeWhiteboard = null
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

/* 根據容器寬度調整 */
.canvas-container{
  container-type: inline-size;
  container-name: whiteboard;
}
</style>