export type AppItem = {
  id: string,
  name: string,
  icon: unknown,
  disabled_delete?: boolean
}

export type AppItemPosition = {
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number,
}