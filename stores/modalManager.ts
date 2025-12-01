import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ModalConfig } from '~/types/modal.type'

export const useModalManager = defineStore('modalManager', () => {
  const showModal = ref(false)

  const modalConfig = ref<ModalConfig>({} as ModalConfig)
  
  const setModalConfig = (config: ModalConfig) => {
    modalConfig.value = config
  }

  const openModal = (modalConfig: ModalConfig) => {
    setModalConfig(modalConfig)
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
  }

  return {
    showModal,
    openModal,
    closeModal,
    modalConfig
  }
})