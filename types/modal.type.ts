export type ModalLabel = {
  label: string
}

export type ModalButton = {
  label: string
  action: () => void
}

export type ModalConfig = {
  title: ModalLabel
  message: ModalLabel
  button: ModalButton[]
}