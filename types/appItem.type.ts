import type { Component } from "vue"

export type AppItem = {
  id: string,
  name: string,
  icon: Component,
  disabled_delete?: boolean,
  component?: string,
  app_type?: 'app' | 'file',
  content?: string,
  editStatus?: boolean,
}

export type AppItemPosition = {
  x: number,
  y: number,
  width?: number,
  height?: number,
  zIndex?: number,
}