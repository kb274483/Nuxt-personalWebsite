<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class=" bg-white dark:bg-gray-600/50 dark:text-white rounded shadow-md p-4"
        :style="{
          width: 'clamp(200px, 50vw, 500px)',
        }"
      >
        <h2 class="text-lg font-bold mb-4 text-center border-b border-gray-300/30 dark:border-white/10 pb-2 mx-4">
          {{ props.modal.title.label }}
        </h2>
        <p class="p-4">{{ props.modal.message.label }}</p>
        <div class="flex justify-center items-center gap-2 mt-4 ">
          <button @click="button.action"
            v-for="button in props.modal.button" 
            :key="button.label" 
            class="px-4 py-2 rounded-md bg-gray-200/50 dark:bg-white/10 hover:bg-gray-200/10 dark:hover:bg-white/30 cursor-pointer"
          >{{ button.label }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import type { ModalConfig } from '~/types/modal.type'

  const props = defineProps<{
    modal: ModalConfig
  }>()


</script>