import { Code, FileUser, Image, Plane, Settings, Mail } from 'lucide-vue-next'
import type { AppItem, AppItemPosition } from '~/types/appItem.type'

type DesktopAppItem = AppItem & AppItemPosition

const DEFAULT_DESKTOP_ICON_SIZE = 48

export const createDefaultDesktopApps = (): DesktopAppItem[] => [
  { id: 'resume', name: 'Resume', icon: FileUser, disabled_delete: true, x: 10, y: 50, width: DEFAULT_DESKTOP_ICON_SIZE, height: DEFAULT_DESKTOP_ICON_SIZE, zIndex: 1 },
  { id: 'browser', name: 'Code Works', icon: Code, disabled_delete: true, x: 10, y: 150, width: DEFAULT_DESKTOP_ICON_SIZE, height: DEFAULT_DESKTOP_ICON_SIZE, zIndex: 1 },
  { id: 'photos', name: 'Gallery', icon: Image, disabled_delete: true, x: 10, y: 250, width: DEFAULT_DESKTOP_ICON_SIZE, height: DEFAULT_DESKTOP_ICON_SIZE, zIndex: 1 },
  { id: 'settings', name: 'Settings', icon: Settings, disabled_delete: true, x: 10, y: 350, width: DEFAULT_DESKTOP_ICON_SIZE, height: DEFAULT_DESKTOP_ICON_SIZE, zIndex: 1 },
  { id: 'travel', name: 'Travel Path', icon: Plane, disabled_delete: true, x: 10, y: 450, width: DEFAULT_DESKTOP_ICON_SIZE, height: DEFAULT_DESKTOP_ICON_SIZE, zIndex: 1 },
  { id: 'mail', name: 'MailBox', icon: Mail, disabled_delete: true, x: 10, y: 550, width: DEFAULT_DESKTOP_ICON_SIZE, height: DEFAULT_DESKTOP_ICON_SIZE, zIndex: 1 },
]
