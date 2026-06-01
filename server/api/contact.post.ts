import {
  ALLOWED_ATTACHMENT_TYPES,
  ALLOWED_INLINE_IMAGE_TYPES,
  CONTACT_MAIL_LIMITS,
} from '~/utils/contactMail'

type MailPart = {
  name?: string
  filename?: string
  type?: string
  data: Buffer
}

type ResendAttachment = {
  filename: string
  content: string
  content_type?: string
  content_id?: string
}

const getFieldValue = (parts: MailPart[], name: string) => {
  const part = parts.find((item) => item.name === name && !item.filename)

  return part ? part.data.toString('utf8').trim() : ''
}

const getFieldValues = (parts: MailPart[], name: string) => {
  return parts
    .filter((item) => item.name === name && !item.filename)
    .map((item) => item.data.toString('utf8').trim())
}

const getFiles = (parts: MailPart[], name: string) => {
  return parts.filter((item) => item.name === name && item.filename)
}

const stripUnsafeEmailHtml = (html: string) => {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, '')
    .replace(/\ssrc\s*=\s*(['"])\s*data:[\s\S]*?\1/gi, '')
}

const escapeHtml = (value: string) => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

const validateFiles = (
  files: MailPart[],
  allowedTypes: Set<string>,
  label: string,
) => {
  if (files.length > CONTACT_MAIL_LIMITS.maxFiles) {
    throw createError({
      statusCode: 400,
      statusMessage: `You can upload up to ${CONTACT_MAIL_LIMITS.maxFiles} ${label}.`,
    })
  }

  const invalidFile = files.find((file) => !file.type || !allowedTypes.has(file.type))
  if (invalidFile) {
    throw createError({
      statusCode: 400,
      statusMessage: `${invalidFile.filename ?? 'A file'} is not supported.`,
    })
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const resendApiKey = config.resendApiKey
  const contactToEmail = config.contactToEmail
  const contactFromEmail = config.contactFromEmail

  if (!resendApiKey || !contactToEmail || !contactFromEmail) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Contact mail is not configured.',
    })
  }

  const parts = await readMultipartFormData(event) as MailPart[] | undefined
  if (!parts) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Expected multipart form data.',
    })
  }

  const senderEmail = getFieldValue(parts, 'senderEmail')
  const subject = getFieldValue(parts, 'subject')
  const bodyHtml = getFieldValue(parts, 'bodyHtml')
  const bodyText = getFieldValue(parts, 'bodyText')
  const attachments = getFiles(parts, 'attachments')
  const inlineImages = getFiles(parts, 'inlineImages')
  const inlineImageIds = getFieldValues(parts, 'inlineImageIds')

  if (!CONTACT_MAIL_LIMITS.emailPattern.test(senderEmail)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please enter a valid email address.',
    })
  }

  if (subject.length > CONTACT_MAIL_LIMITS.maxSubjectLength) {
    throw createError({
      statusCode: 400,
      statusMessage: `Subject must be under ${CONTACT_MAIL_LIMITS.maxSubjectLength} characters.`,
    })
  }

  if (!bodyText || bodyText.length > CONTACT_MAIL_LIMITS.maxBodyTextLength) {
    throw createError({
      statusCode: 400,
      statusMessage: `Message must be 1-${CONTACT_MAIL_LIMITS.maxBodyTextLength} characters.`,
    })
  }

  validateFiles(attachments, ALLOWED_ATTACHMENT_TYPES, 'attachments')
  validateFiles(inlineImages, ALLOWED_INLINE_IMAGE_TYPES, 'inline images')

  if (inlineImages.length !== inlineImageIds.length || inlineImageIds.some((id) => !id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Inline image metadata is invalid.',
    })
  }

  const totalBytes = [...attachments, ...inlineImages].reduce((total, file) => total + file.data.byteLength, 0)
  if (totalBytes > CONTACT_MAIL_LIMITS.maxTotalBytes) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Total file size is too large.',
    })
  }

  const resendAttachments: ResendAttachment[] = [
    ...attachments.map((file) => ({
      filename: file.filename ?? 'attachment',
      content: file.data.toString('base64'),
      content_type: file.type,
    })),
    ...inlineImages.map((file, index) => ({
      filename: file.filename ?? `inline-image-${index + 1}`,
      content: file.data.toString('base64'),
      content_type: file.type,
      content_id: inlineImageIds[index],
    })),
  ]

  const safeBodyHtml = stripUnsafeEmailHtml(bodyHtml)
  const safeSubject = subject || 'New message from Roy Space'
  const html = `
    <div>
      <p><strong>From:</strong> ${escapeHtml(senderEmail)}</p>
      <hr>
      ${safeBodyHtml}
    </div>
  `
  await $fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      from: contactFromEmail,
      to: [contactToEmail],
      subject: safeSubject,
      html,
      text: `From: ${senderEmail}\n\n${bodyText}`,
      reply_to: senderEmail,
      attachments: resendAttachments,
    },
  })
  return { ok: true }
})
