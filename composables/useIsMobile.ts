import { ref, onMounted, onUnmounted } from 'vue'

export function useIsMobile() {
  const isMobile = ref<boolean>(false)

  const checkMobile = () => {
    if (typeof window === 'undefined') return
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    const isMobileDevice = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isSmallWidth = window.innerWidth < 768

    isMobile.value = isMobileDevice || isSmallWidth
  }

  checkMobile()
  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  return {
    isMobile
  }
}
