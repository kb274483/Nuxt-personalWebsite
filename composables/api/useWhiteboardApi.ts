import type { 
  Stroke, 
  WhiteboardElementRow, 
  StrokeCancelPayload, 
  StrokeProgressPayload 
} from "~/types/whiteboard.type";
import type { RealtimeChannel } from "@supabase/supabase-js";

type SubscribeHandles = {
  onInsert: (stroke:Stroke) => void
  onStrokeProgress: (payload:StrokeProgressPayload) => void
  onStrokeCancel: (payload:StrokeCancelPayload) => void
  onSubscribed?: () => void
}

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
  const toStroke = (row: WhiteboardElementRow) => row.payload

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

  const subscribeWhiteboard = (handler: SubscribeHandles)=>{
    let channel: RealtimeChannel | null =null

    channel = $supabase
      .channel('whiteboard:main')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLE_NAME,
          filter: 'type=eq.stroke',
        },
        payload => {
          const row = payload.new as WhiteboardElementRow
          handler.onInsert(toStroke(row))
        },
      )
      .on('broadcast', { event: 'stroke-progress' }, payload => {
        handler.onStrokeProgress(payload.payload as StrokeProgressPayload)
      })
      .on('broadcast', { event: 'stroke-cancel' }, payload => {
        handler.onStrokeCancel(payload.payload as StrokeCancelPayload)
      })
      .subscribe((status)=>{
        if(status === 'SUBSCRIBED') handler.onSubscribed?.()
      })
    
    return {
      unsubscribe: () => {
        void $supabase.removeChannel(channel)
      },
      broadcastStrokeProgress: (payload: StrokeProgressPayload) => {
        void channel.send({
          type: 'broadcast',
          event: 'stroke-progress',
          payload,
        })
      },
      broadcastStrokeCancel: (payload: StrokeCancelPayload) => {
        void channel.send({
          type: 'broadcast',
          event: 'stroke-cancel',
          payload,
        })
      },
    }
  }

  return {
    fetchStokes,
    saveStroke,
    subscribeWhiteboard
  }
}