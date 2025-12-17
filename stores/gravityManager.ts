import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGravityManager = defineStore('gravityManager', () =>{
  const isGravityEnabled = ref<boolean>(false)

  const toggleGravity = () => {
    isGravityEnabled.value = !isGravityEnabled.value
  }

  return {
    isGravityEnabled,
    toggleGravity
  }
})