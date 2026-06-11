import { error } from "three";
import type { Stroke, WhiteboardElementRow } from "~/types/whiteboard.type";

const TABLE_NAME = 'whiteboard_elements'

const computeStrokeBounds = (stroke:Stroke)=>{
  const xArr = stroke.points.map(point => point.x)
  const yArr = stroke.points.map(point => point.y)
  const padding = stroke.width / 2

  return{
    min_x: Math.min(...xArr) - padding,
    min_y: Math.min(...yArr) - padding,
    max_x: Math.max(...xArr) + padding,
    max_y: Math.max(...yArr) + padding,
  }
}

export const useWhiteboardApi = ()=>{
  const { $supabase } = useNuxtApp()

  const fetchStokes = async ()=>{
    const { data, error } = await $supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('type', 'stroke')
      .order('created_at', { ascending: true })
      
    if(error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch whiteboard elements',
        data: error
      })
    }
  
    return (data as WhiteboardElementRow[]).map(row => row.payload)
  }

  const saveStroke = async (stroke: Stroke) => {
    const bounds = computeStrokeBounds(stroke)

    const { error } = await $supabase
      .from(TABLE_NAME)
      .insert({
        id: stroke.id,
        type: 'stroke',
        payload: stroke,
        ...bounds,
      })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to save whiteboard stroke',
        data: error,
      })
    }
  }

  return {
    fetchStokes,
    saveStroke
  }
}