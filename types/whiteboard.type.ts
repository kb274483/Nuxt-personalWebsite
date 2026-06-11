export type ToolType = 'pencil' | 'eraser' | 'pan'
export type DrawMode = 'pencil' | 'eraser' 

export type Point = {
  x:number
  y:number
}

export type Stroke = {
  id: string
  mode: DrawMode
  points: Point[]
  color: string
  width: number
}

export type Viewport = {
  x:number
  y:number
  scale:number
}