export const useBoundaryCheck = () => {
  const checkBoundary = (x: number, y: number, width: number, height: number) => {
    const maxX = window.innerWidth - width
    const maxY = window.innerHeight - height
    const minY = 48

    let newX = x
    if (newX < 0) newX = 0
    if (newX > maxX) newX = maxX

    let newY = y
    if (newY < minY) newY = minY
    if (newY > maxY) newY = maxY

    return { x: newX, y: newY }
  }

  return { checkBoundary }
}