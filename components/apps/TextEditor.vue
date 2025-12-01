<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <div class="bg-gray-100 dark:bg-gray-800 p-2 flex justify-end items-center text-sm">
      <span v-if="isUnsaved" class="text-gray-400 text-xs "
      >Use Cmd+S(Ctrl+S) to save</span>
    </div>

    <!-- 編輯區域 -->
    <textarea
      ref="textareaRef"
      v-model="content"
      class="flex-1 w-full h-full p-4 resize-none outline-none font-mono text-sm text-black dark:text-white bg-transparent"
      @keydown.meta.s.prevent="saveData"
      @keydown.ctrl.s.prevent="saveData"
      placeholder="Type something..."
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useDesktopItemsManager } from '~/stores/desktopItemsManager'

const props = defineProps<{
  fileId?: string
}>()

const desktopManager = useDesktopItemsManager()
const content = ref<string>('')
const fileName = ref<string>('undefined')
const isUnsaved = ref<boolean>(false)

watch(() => content.value, () => {
  isUnsaved.value = true
})

const saveData = () => {
  if(props.fileId){
    desktopManager.updateFileContent(props.fileId, content.value)
    isUnsaved.value = false
  }
}

onMounted(() => {
  if(props.fileId){
    const file = desktopManager.desktopItems.find(item => item.id === props.fileId)
    if(file){
      fileName.value = file.name
      content.value = file.content || ''
    }
  }
})

</script>