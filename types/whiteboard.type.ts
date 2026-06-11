export type ToolType = 'pencil' | 'eraser' | 'pan'
export type DrawMode = 'pencil' | 'eraser'
export type WhiteboardElementType = 'stroke'

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

export type WhiteboardElementRow = {
  id: string
  type: WhiteboardElementType
  payload: Stroke
  min_x: number
  min_y: number
  max_x: number
  max_y: number
  created_at: string
}