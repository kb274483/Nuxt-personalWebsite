<template>
  <div
    class="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-3"
    aria-label="WhiteBoard Tool Bar"
  >
    <div
      class="toolbar pointer-events-auto max-w-full rounded-md bg-gray-900/10 p-4 dark:bg-slate-200/10 gap-4"
      @pointerdown.stop
      @pointermove.stop
      @pointerup.stop
      @click.stop
    >
      <div class="toolbar-buttons">
        <button
          type="button"
          aria-label="Pencil tool"
          :class="getToolButtonClass('pencil')"
          @click="emit('update:activeTool', 'pencil')"
        >
          <Pencil class="h-8 w-8" />
        </button>

        <button
          type="button"
          aria-label="Eraser tool"
          :class="getToolButtonClass('eraser')"
          @click="emit('update:activeTool', 'eraser')"
        >
          <Eraser class="h-8 w-8" />
        </button>

        <button
          type="button"
          aria-label="Pan tool"
          :class="getToolButtonClass('pan')"
          @click="emit('update:activeTool', 'pan')"
        >
          <Hand class="h-8 w-8" />
        </button>
      </div>

      <div class="divide h-8 w-0.5 bg-black dark:bg-white" aria-hidden="true" />

      <div class="flex items-center gap-1" aria-label="Pen colors">
        <button
          v-for="color in penColors"
          :key="color"
          type="button"
          class="h-8 w-8 border-2 border-black transition-none active:translate-x-[1px] active:translate-y-[1px] dark:border-white"
          :class="penColor === color ? 'ring-2 ring-black ring-offset-2 dark:ring-white dark:ring-offset-zinc-900' : ''"
          :style="{ backgroundColor: color }"
          :aria-label="`Set pen color ${color}`"
          @click="emit('update:penColor', color)"
        />
      </div>

      <label class="flex items-center gap-2 text-xs font-black uppercase text-black dark:text-white">
        <span>Pen</span>
        <input
          :value="penWidth"
          type="range"
          min="2"
          max="20"
          step="1"
          class="w-24 accent-[#FFD93D]"
          @input="emit('update:penWidth', Number(($event.target as HTMLInputElement).value))"
        >
        <span class="w-6 text-center">{{ penWidth }}</span>
      </label>

      <div class="divide h-8 w-0.5 bg-black dark:bg-white" aria-hidden="true" />

      <label class="flex items-center gap-2 text-xs font-black uppercase text-black dark:text-white">
        <span>Eraser</span>
        <input
          :value="eraserWidth"
          type="range"
          min="8"
          max="48"
          step="1"
          class="w-24 accent-[#FFD93D]"
          @input="emit('update:eraserWidth', Number(($event.target as HTMLInputElement).value))"
        >
        <span class="w-6 text-center">{{ eraserWidth }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eraser, Hand, Pencil } from 'lucide-vue-next'
import type { ToolType } from '~/types/whiteboard.type'

type Props = {
  activeTool: ToolType
  penColor: string
  penWidth: number
  eraserWidth: number
  penColors: string[]
}

type Emits = {
  'update:activeTool': [tool: ToolType]
  'update:penColor': [color: string]
  'update:penWidth': [width: number]
  'update:eraserWidth': [width: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const getToolButtonClass = (tool: ToolType) => {
  const baseClass = 'flex h-10 w-10 items-center justify-center border-2 border-black transition-all ease-in active:translate-x-[1px] active:translate-y-[1px] dark:border-white'
  const activeClass = 'bg-[#FFD93D] text-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]'
  const inactiveClass = 'bg-white text-black hover:bg-zinc-100 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'

  return `${baseClass} ${props.activeTool === tool ? activeClass : inactiveClass}`
}
</script>

<style scoped>
.toolbar {
  display: grid;
}

.toolbar-buttons {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.divide {
  display: none;
}

@container whiteboard (min-width: 860px) {
  .divide {
    display: block;
    width: 0.5px;
    height: 2rem;
  }

  .toolbar {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .toolbar-buttons{
    justify-content: end;
  }
}
</style>