export const CONTACT_MAIL_LIMITS = {
  maxFiles: 5,
  maxTotalBytes: 15 * 1024 * 1024,
  maxSubjectLength: 120,
  maxBodyTextLength: 5000,
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const

export const ALLOWED_INLINE_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

export const ALLOWED_ATTACHMENT_TYPES = new Set([
  ...ALLOWED_INLINE_IMAGE_TYPES,
  'application/pdf',
  'text/plain',
  'text/csv',
])

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
