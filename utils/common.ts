export const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}