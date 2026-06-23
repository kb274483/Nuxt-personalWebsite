type UseImageFallbackOptions = {
  fallbackSrc?: string
  onFallbackError?: () => void
}

type ApplyImageFallbackOptions = {
  onFallbackError?: () => void
}

const DEFAULT_FALLBACK_SRC = '/photo-thumb-placeholder.svg'
const FALLBACK_APPLIED = '1'

export const useImageFallback = (options: UseImageFallbackOptions = {}) => {
  const fallbackSrc = options.fallbackSrc ?? DEFAULT_FALLBACK_SRC

  const applyImageFallback = (
    event: Event,
    applyOptions: ApplyImageFallbackOptions = {},
  ) => {
    const img = event.target

    if (!(img instanceof HTMLImageElement)) return

    if (img.dataset.fallbackApplied === FALLBACK_APPLIED) {
      applyOptions.onFallbackError?.()
      options.onFallbackError?.()
      return
    }

    img.dataset.fallbackApplied = FALLBACK_APPLIED
    img.src = fallbackSrc
  }

  return {
    applyImageFallback,
  }
}
