import type { Component } from "vue"

export type ModalLabel = {
  label: string
}

export type ModalButton = {
  label: string
  action: () => void
}

export type ModalConfig = {
  title: ModalLabel
  icon?: Component
  message: ModalLabel
  button: ModalButton[]
}