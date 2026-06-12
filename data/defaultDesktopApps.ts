import { Code, FileUser, Image, Plane, Settings, Mail, PaintbrushVertical } from 'lucide-vue-next'
import type { AppItem, AppItemPosition } from '~/types/appItem.type'

type DesktopAppItem = AppItem & AppItemPosition

const DEFAULT_DESKTOP_ICON_SIZE = 48
const DESKTOP_START_Y = 50
const DESKTOP_GAP_Y = 100
const DESKTOP_X = 10

const MOBILE_POSITION_OVERRIDES: Record<string, Partial<AppItemPosition>> = {
  mail: { x: 110 , y: 50 },
  whiteboard: { x: 110 , y: 150 },
}

const APP_DEFINITIONS = [
  { id: 'resume', name: 'Resume', icon: FileUser },
  { id: 'browser', name: 'Code Works', icon: Code },
  { id: 'photos', name: 'Gallery', icon: Image },
  { id: 'settings', name: 'Settings', icon: Settings },
  { id: 'travel', name: 'Travel Path', icon: Plane },
  { id: 'mail', name: 'MailBox', icon: Mail },
  { id: 'whiteboard', name: 'Whiteboard', icon: PaintbrushVertical}
] as const

export const createDefaultDesktopApps = (isMobile = false): DesktopAppItem[] => 
  APP_DEFINITIONS.map((app, index) => ({
    ...app,
    disabled_delete: true,
    x: DESKTOP_X,
    y: DESKTOP_START_Y + index * DESKTOP_GAP_Y,
    width: DEFAULT_DESKTOP_ICON_SIZE,
    height: DEFAULT_DESKTOP_ICON_SIZE,
    zIndex: 1,
    ...(isMobile ? MOBILE_POSITION_OVERRIDES[app.id] : undefined),
  }))
