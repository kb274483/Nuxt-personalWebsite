import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ModalConfig } from '~/types/modal.type'

export const useModalManager = defineStore('modalManager', () => {
  const showModal = ref(false)

  const openModal = (modalConfig: ModalConfig) => {
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
  }

  return {
    showModal,
    openModal,
    closeModal
  }
})