import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGravityManager = defineStore('gravityManager', () =>{
  const isGravityEnabled = ref<boolean>(false)

  const toggleGravity = () => {
    isGravityEnabled.value = !isGravityEnabled.value
  }

  // 紀錄貓貓的位置與半徑
  const catPosition = ref<Map<number,
    {x:number,y:number,radius:number}>>(new Map())

  const updateCatPosition = (id:number, pos:{x:number,y:number,radius:number}) => {
    catPosition.value.set(id, pos)
  }

  return {
    isGravityEnabled,
    catPosition,
    toggleGravity,
    updateCatPosition
  }
})