<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import Color from '@tiptap/extension-color'
import ImageExtension from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { FontSize, TextStyle } from '@tiptap/extension-text-style'
import UnderlineExtension from '@tiptap/extension-underline'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Paperclip,
  Redo2,
  Send,
  Trash2,
  Type,
  Underline,
  Undo2,
  X,
} from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, useTemplateRef } from 'vue'
import {
  ALLOWED_ATTACHMENT_TYPES,
  ALLOWED_INLINE_IMAGE_TYPES,
  CONTACT_MAIL_LIMITS,
  formatFileSize,
} from '~/utils/contactMail'

type MailStatus = 'idle' | 'sending' | 'sent' | 'error'

type InlineImage = {
  id: string
  file: File
  objectUrl: string
}

const editor = shallowRef<Editor | null>(null)
const attachmentInputRef = useTemplateRef<HTMLInputElement>('attachmentInput')
const inlineImageInputRef = useTemplateRef<HTMLInputElement>('inlineImageInput')

const senderEmail = shallowRef('')
const subject = shallowRef('')
const status = shallowRef<MailStatus>('idle')
const errorMessage = shallowRef('')
const successMessage = shallowRef('')
const selectedColor = shallowRef('#111827')
const selectedFontSize = shallowRef('16px')
const editorText = shallowRef('')

const attachments = ref<File[]>([])
const inlineImages = ref<InlineImage[]>([])
const toolbarState = reactive({
  bold: false,
  italic: false,
  underline: false,
  bulletList: false,
  orderedList: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
})

const isSending = computed(() => status.value === 'sending')
const totalUploadSize = computed(() => {
  const attachmentBytes = attachments.value.reduce((total, file) => total + file.size, 0)
  const inlineBytes = inlineImages.value.reduce((total, image) => total + image.file.size, 0)

  return attachmentBytes + inlineBytes
})

const totalUploadLabel = computed(() => formatFileSize(totalUploadSize.value))
const canSend = computed(() => {
  return !isSending.value && senderEmail.value.trim().length > 0 && editorText.value.length > 0
})

const setError = (message: string) => {
  status.value = 'error'
  errorMessage.value = message
  successMessage.value = ''
}

const clearMessages = () => {
  if (status.value !== 'sending') {
    status.value = 'idle'
  }
  errorMessage.value = ''
  successMessage.value = ''
}

const updateToolbarState = () => {
  if (!editor.value) return

  toolbarState.bold = editor.value.isActive('bold')
  toolbarState.italic = editor.value.isActive('italic')
  toolbarState.underline = editor.value.isActive('underline')
  toolbarState.bulletList = editor.value.isActive('bulletList')
  toolbarState.orderedList = editor.value.isActive('orderedList')
  toolbarState.alignLeft = editor.value.isActive({ textAlign: 'left' })
  toolbarState.alignCenter = editor.value.isActive({ textAlign: 'center' })
  toolbarState.alignRight = editor.value.isActive({ textAlign: 'right' })
}

const syncEditorText = () => {
  editorText.value = editor.value?.getText().trim() ?? ''
}

const createEditor = () => {
  editor.value = new Editor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      TextStyle,
      FontSize,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ImageExtension.configure({
        allowBase64: false,
        inline: false,
      }),
      Placeholder.configure({
        placeholder: 'Write your message...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'mail-editor-content',
        'aria-label': 'Message body',
      },
    },
    onCreate: () => {
      syncEditorText()
      updateToolbarState()
    },
    onSelectionUpdate: updateToolbarState,
    onTransaction: updateToolbarState,
    onUpdate: () => {
      syncEditorText()
      clearMessages()
    },
  })
}

const runEditorCommand = (command: () => void) => {
  if (!editor.value || isSending.value) return

  command()
  updateToolbarState()
}

const applyFontSize = () => {
  runEditorCommand(() => {
    editor.value?.chain().focus().setFontSize(selectedFontSize.value).run()
  })
}

const applyColor = () => {
  runEditorCommand(() => {
    editor.value?.chain().focus().setColor(selectedColor.value).run()
  })
}

const openAttachmentPicker = () => {
  if (isSending.value) return
  attachmentInputRef.value?.click()
}

const openInlineImagePicker = () => {
  if (isSending.value) return
  inlineImageInputRef.value?.click()
}

const validateFileSet = (incomingFiles: File[], currentFiles: File[], allowedTypes: Set<string>) => {
  if (currentFiles.length + incomingFiles.length > CONTACT_MAIL_LIMITS.maxFiles) {
    return `You can attach up to ${CONTACT_MAIL_LIMITS.maxFiles} files.`
  }

  const nextTotalSize = totalUploadSize.value + incomingFiles.reduce((total, file) => total + file.size, 0)
  if (nextTotalSize > CONTACT_MAIL_LIMITS.maxTotalBytes) {
    return `Total files must stay under ${formatFileSize(CONTACT_MAIL_LIMITS.maxTotalBytes)}.`
  }

  const invalidFile = incomingFiles.find((file) => !allowedTypes.has(file.type))
  if (invalidFile) {
    return `${invalidFile.name} is not a supported file type.`
  }

  return ''
}

const handleAttachmentChange = (event: Event) => {
  clearMessages()

  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''

  if (files.length === 0) return

  const error = validateFileSet(files, attachments.value, ALLOWED_ATTACHMENT_TYPES)
  if (error) {
    setError(error)
    return
  }

  attachments.value = [...attachments.value, ...files]
}

const handleInlineImageChange = (event: Event) => {
  clearMessages()

  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''

  if (files.length === 0) return

  const error = validateFileSet(files, inlineImages.value.map((image) => image.file), ALLOWED_INLINE_IMAGE_TYPES)
  if (error) {
    setError(error)
    return
  }

  const nextImages = files.map((file) => ({
    id: crypto.randomUUID(),
    file,
    objectUrl: URL.createObjectURL(file),
  }))

  inlineImages.value = [...inlineImages.value, ...nextImages]

  nextImages.forEach((image) => {
    editor.value?.chain().focus().setImage({
      src: image.objectUrl,
      alt: image.file.name,
      title: image.file.name,
    }).run()
  })
}

const removeAttachment = (index: number) => {
  attachments.value = attachments.value.filter((_, itemIndex) => itemIndex !== index)
  clearMessages()
}

const removeInlineImage = (id: string) => {
  const target = inlineImages.value.find((image) => image.id === id)
  if (!target) return

  URL.revokeObjectURL(target.objectUrl)
  inlineImages.value = inlineImages.value.filter((image) => image.id !== id)

  if (editor.value) {
    const document = new DOMParser().parseFromString(editor.value.getHTML(), 'text/html')
    document.querySelectorAll(`img[src="${target.objectUrl}"]`).forEach((image) => image.remove())
    editor.value.commands.setContent(document.body.innerHTML)
    syncEditorText()
  }

  clearMessages()
}

const getBodyText = () => {
  syncEditorText()

  return editorText.value
}

const getEmailHtml = () => {
  let html = editor.value?.getHTML() ?? ''

  inlineImages.value.forEach((image) => {
    html = html.replaceAll(image.objectUrl, `cid:${image.id}`)
  })

  return html
}

const validateForm = () => {
  const email = senderEmail.value.trim()
  const bodyText = getBodyText()

  if (!CONTACT_MAIL_LIMITS.emailPattern.test(email)) {
    return 'Please enter a valid email address.'
  }

  if (subject.value.length > CONTACT_MAIL_LIMITS.maxSubjectLength) {
    return `Subject must be under ${CONTACT_MAIL_LIMITS.maxSubjectLength} characters.`
  }

  if (bodyText.length === 0) {
    return 'Please write a message before sending.'
  }

  if (bodyText.length > CONTACT_MAIL_LIMITS.maxBodyTextLength) {
    return `Message must be under ${CONTACT_MAIL_LIMITS.maxBodyTextLength} characters.`
  }

  if (totalUploadSize.value > CONTACT_MAIL_LIMITS.maxTotalBytes) {
    return `Total files must stay under ${formatFileSize(CONTACT_MAIL_LIMITS.maxTotalBytes)}.`
  }

  return ''
}

const clearDraft = () => {
  senderEmail.value = ''
  subject.value = ''
  selectedColor.value = '#111827'
  selectedFontSize.value = '16px'
  editorText.value = ''
  attachments.value = []
  inlineImages.value.forEach((image) => URL.revokeObjectURL(image.objectUrl))
  inlineImages.value = []
  editor.value?.commands.clearContent()
  updateToolbarState()
}

const resetForm = () => {
  clearDraft()
  clearMessages()
}

const sendMail = async () => {
  clearMessages()

  const validationError = validateForm()
  if (validationError) {
    setError(validationError)
    return
  }

  status.value = 'sending'

  try {
    const formData = new FormData()
    formData.append('senderEmail', senderEmail.value.trim())
    formData.append('subject', subject.value.trim())
    formData.append('bodyHtml', getEmailHtml())
    formData.append('bodyText', getBodyText())

    attachments.value.forEach((file) => {
      formData.append('attachments', file, file.name)
    })

    inlineImages.value.forEach((image) => {
      formData.append('inlineImageIds', image.id)
      formData.append('inlineImages', image.file, image.file.name)
    })

    await $fetch('/api/contact', {
      method: 'POST',
      body: formData,
    })

    clearDraft()
    status.value = 'sent'
    successMessage.value = 'Message sent.'
    errorMessage.value = ''
  } catch (error) {
    const fetchError = error as {
      data?: { statusMessage?: string }
      statusMessage?: string
      message?: string
    }
    const message = fetchError.data?.statusMessage
      || fetchError.statusMessage
      || fetchError.message
      || 'Unable to send this message.'
    setError(message)
  }
}

onMounted(createEditor)

onBeforeUnmount(() => {
  inlineImages.value.forEach((image) => URL.revokeObjectURL(image.objectUrl))
  editor.value?.destroy()
})
</script>

<template>
  <section class="flex h-full min-h-0 flex-col bg-white text-gray-900 dark:bg-zinc-950 dark:text-gray-100">
    <header class="flex h-11 shrink-0 items-center justify-between border-b-2 border-black bg-gray-100 px-4 dark:border-white dark:bg-zinc-900">
      <h2 class="text-sm font-black uppercase tracking-wide text-gray-900 dark:text-gray-100">
        New Message
      </h2>
      <p
        class="text-xs font-bold"
        :class="{
          'text-gray-500 dark:text-gray-400': status === 'idle',
          'text-blue-600 dark:text-blue-300': status === 'sending',
          'text-green-600 dark:text-green-300': status === 'sent',
          'text-red-600 dark:text-red-300': status === 'error',
        }"
        aria-live="polite"
      >
        {{ status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent' : status === 'error' ? 'Needs attention' : 'Draft' }}
      </p>
    </header>

    <div class="flex shrink-0 items-center gap-3 border-b border-gray-200 px-4 py-2 text-sm dark:border-zinc-800">
      <span class="w-14 shrink-0 text-gray-500 dark:text-gray-400">To</span>
      <span class="font-semibold text-gray-800 dark:text-gray-100">Roy</span>
      <span class="rounded border border-gray-300 px-2 py-0.5 text-xs font-bold uppercase text-gray-500 dark:border-zinc-700 dark:text-gray-400">
        Locked
      </span>
    </div>

    <label class="flex shrink-0 items-center gap-3 border-b border-gray-200 px-4 py-2 text-sm dark:border-zinc-800">
      <span class="w-14 shrink-0 text-gray-500 dark:text-gray-400">From</span>
      <input
        v-model.trim="senderEmail"
        :disabled="isSending"
        class="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-gray-400 disabled:opacity-60"
        type="email"
        autocomplete="email"
        placeholder="your@email.com"
        @input="clearMessages"
      >
    </label>

    <label class="flex shrink-0 items-center gap-3 border-b border-gray-200 px-4 py-2 text-sm dark:border-zinc-800">
      <span class="w-14 shrink-0 text-gray-500 dark:text-gray-400">Subject</span>
      <input
        v-model.trim="subject"
        :disabled="isSending"
        :maxlength="CONTACT_MAIL_LIMITS.maxSubjectLength"
        class="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-gray-400 disabled:opacity-60"
        type="text"
        placeholder="Subject"
        @input="clearMessages"
      >
    </label>

    <div class="min-h-0 flex-1 overflow-auto px-4 py-3">
      <EditorContent
        v-if="editor"
        :editor="editor"
        class="mail-editor min-h-full"
      />
      <div
        v-else
        class="flex h-full items-center justify-center text-sm font-bold text-gray-400"
      >
        Loading editor...
      </div>
    </div>

    <div
      v-if="attachments.length > 0 || inlineImages.length > 0"
      class="shrink-0 border-t border-gray-200 px-4 py-2 dark:border-zinc-800"
    >
      <div class="mb-2 flex items-center justify-between text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
        <span>Files</span>
        <span>{{ totalUploadLabel }} / {{ formatFileSize(CONTACT_MAIL_LIMITS.maxTotalBytes) }}</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(file, index) in attachments"
          :key="`${file.name}-${file.size}-${index}`"
          class="flex max-w-full items-center gap-2 border-2 border-black bg-gray-50 px-2 py-1 text-xs font-bold text-gray-800 shadow-[2px_2px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-gray-100 dark:shadow-[2px_2px_0px_#fff]"
        >
          <Paperclip class="h-3.5 w-3.5 shrink-0" />
          <span class="max-w-40 truncate">{{ file.name }}</span>
          <span class="shrink-0 text-gray-500">{{ formatFileSize(file.size) }}</span>
          <button
            type="button"
            class="shrink-0 p-0.5 hover:bg-red-100 dark:hover:bg-red-950"
            :disabled="isSending"
            :aria-label="`Remove ${file.name}`"
            @click="removeAttachment(index)"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>

        <div
          v-for="image in inlineImages"
          :key="image.id"
          class="flex max-w-full items-center gap-2 border-2 border-black bg-blue-50 px-2 py-1 text-xs font-bold text-gray-800 shadow-[2px_2px_0px_#000] dark:border-white dark:bg-blue-950/40 dark:text-gray-100 dark:shadow-[2px_2px_0px_#fff]"
        >
          <img
            :src="image.objectUrl"
            :alt="image.file.name"
            class="h-7 w-7 shrink-0 border border-black object-cover dark:border-white"
          >
          <span class="max-w-40 truncate">{{ image.file.name }}</span>
          <span class="shrink-0 text-gray-500">{{ formatFileSize(image.file.size) }}</span>
          <button
            type="button"
            class="shrink-0 p-0.5 hover:bg-red-100 dark:hover:bg-red-950"
            :disabled="isSending"
            :aria-label="`Remove inline image ${image.file.name}`"
            @click="removeInlineImage(image.id)"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>

    <footer class="shrink-0 border-t-2 border-black bg-gray-50 p-3 dark:border-white dark:bg-zinc-900">
      <div class="mb-3 flex gap-1 overflow-x-auto rounded border-2 border-black bg-white p-1 dark:border-white dark:bg-zinc-950">
        <button type="button" class="mail-tool-button" :disabled="isSending" aria-label="Undo" @click="runEditorCommand(() => editor?.chain().focus().undo().run())">
          <Undo2 class="h-4 w-4" />
        </button>
        <button type="button" class="mail-tool-button" :disabled="isSending" aria-label="Redo" @click="runEditorCommand(() => editor?.chain().focus().redo().run())">
          <Redo2 class="h-4 w-4" />
        </button>

        <div class="mx-1 h-8 w-px shrink-0 bg-gray-200 dark:bg-zinc-700" />

        <label class="mail-select-label" aria-label="Font size">
          <Type class="h-4 w-4" />
          <select
            v-model="selectedFontSize"
            :disabled="isSending"
            class="bg-transparent text-xs font-bold outline-none"
            @change="applyFontSize"
          >
            <option value="13px">Small</option>
            <option value="16px">Normal</option>
            <option value="20px">Large</option>
            <option value="26px">Huge</option>
          </select>
        </label>

        <button type="button" class="mail-tool-button" :class="{ 'mail-tool-button-active': toolbarState.bold }" :disabled="isSending" aria-label="Bold" @click="runEditorCommand(() => editor?.chain().focus().toggleBold().run())">
          <Bold class="h-4 w-4" />
        </button>
        <button type="button" class="mail-tool-button" :class="{ 'mail-tool-button-active': toolbarState.italic }" :disabled="isSending" aria-label="Italic" @click="runEditorCommand(() => editor?.chain().focus().toggleItalic().run())">
          <Italic class="h-4 w-4" />
        </button>
        <button type="button" class="mail-tool-button" :class="{ 'mail-tool-button-active': toolbarState.underline }" :disabled="isSending" aria-label="Underline" @click="runEditorCommand(() => editor?.chain().focus().toggleUnderline().run())">
          <Underline class="h-4 w-4" />
        </button>

        <label class="mail-color-button" aria-label="Text color">
          <span class="h-4 w-4 border border-black dark:border-white" :style="{ backgroundColor: selectedColor }" />
          <input
            v-model="selectedColor"
            :disabled="isSending"
            class="sr-only"
            type="color"
            @input="applyColor"
          >
        </label>

        <div class="mx-1 h-8 w-px shrink-0 bg-gray-200 dark:bg-zinc-700" />

        <button type="button" class="mail-tool-button" :class="{ 'mail-tool-button-active': toolbarState.alignLeft }" :disabled="isSending" aria-label="Align left" @click="runEditorCommand(() => editor?.chain().focus().setTextAlign('left').run())">
          <AlignLeft class="h-4 w-4" />
        </button>
        <button type="button" class="mail-tool-button" :class="{ 'mail-tool-button-active': toolbarState.alignCenter }" :disabled="isSending" aria-label="Align center" @click="runEditorCommand(() => editor?.chain().focus().setTextAlign('center').run())">
          <AlignCenter class="h-4 w-4" />
        </button>
        <button type="button" class="mail-tool-button" :class="{ 'mail-tool-button-active': toolbarState.alignRight }" :disabled="isSending" aria-label="Align right" @click="runEditorCommand(() => editor?.chain().focus().setTextAlign('right').run())">
          <AlignRight class="h-4 w-4" />
        </button>
        <button type="button" class="mail-tool-button" :class="{ 'mail-tool-button-active': toolbarState.bulletList }" :disabled="isSending" aria-label="Bullet list" @click="runEditorCommand(() => editor?.chain().focus().toggleBulletList().run())">
          <List class="h-4 w-4" />
        </button>
        <button type="button" class="mail-tool-button" :class="{ 'mail-tool-button-active': toolbarState.orderedList }" :disabled="isSending" aria-label="Numbered list" @click="runEditorCommand(() => editor?.chain().focus().toggleOrderedList().run())">
          <ListOrdered class="h-4 w-4" />
        </button>

        <div class="mx-1 h-8 w-px shrink-0 bg-gray-200 dark:bg-zinc-700" />

        <button type="button" class="mail-tool-button" :disabled="isSending" aria-label="Attach file" @click="openAttachmentPicker">
          <Paperclip class="h-4 w-4" />
        </button>
        <button type="button" class="mail-tool-button" :disabled="isSending" aria-label="Insert image" @click="openInlineImagePicker">
          <ImageIcon class="h-4 w-4" />
        </button>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="min-h-5 text-sm font-bold" :class="errorMessage ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'" aria-live="polite">
          {{ errorMessage || successMessage }}
        </p>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex h-10 items-center gap-2 border-2 border-black bg-red-100 px-3 text-sm font-black uppercase text-black shadow-[3px_3px_0px_#000] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white dark:bg-red-950 dark:text-white dark:shadow-[3px_3px_0px_#fff]"
            :disabled="isSending"
            aria-label="Discard draft"
            @click="resetForm"
          >
            <Trash2 class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="flex h-10 items-center gap-2 border-2 border-black bg-blue-600 px-4 text-sm font-black uppercase text-white shadow-[3px_3px_0px_#000] transition hover:bg-blue-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white dark:shadow-[3px_3px_0px_#fff]"
            :disabled="!canSend"
            @click="sendMail"
          >
            <Send class="h-4 w-4" />
            Send
          </button>
        </div>
      </div>
    </footer>

    <input
      ref="attachmentInput"
      class="hidden"
      type="file"
      multiple
      :accept="Array.from(ALLOWED_ATTACHMENT_TYPES).join(',')"
      @change="handleAttachmentChange"
    >
    <input
      ref="inlineImageInput"
      class="hidden"
      type="file"
      multiple
      :accept="Array.from(ALLOWED_INLINE_IMAGE_TYPES).join(',')"
      @change="handleInlineImageChange"
    >
  </section>
</template>

<style scoped>
.mail-tool-button,
.mail-color-button,
.mail-select-label {
  display: inline-flex;
  height: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border: 2px solid transparent;
  padding: 0 0.5rem;
  color: currentColor;
}

.mail-tool-button:hover,
.mail-color-button:hover,
.mail-select-label:hover,
.mail-tool-button-active {
  border-color: #000;
  background: #fef08a;
}

.dark .mail-tool-button:hover,
.dark .mail-color-button:hover,
.dark .mail-select-label:hover,
.dark .mail-tool-button-active {
  border-color: #fff;
  background: #3f3f46;
}

.mail-tool-button:disabled,
.mail-color-button:has(input:disabled),
.mail-select-label:has(select:disabled) {
  cursor: not-allowed;
  opacity: 0.5;
}

.mail-editor :deep(.ProseMirror) {
  min-height: 100%;
  outline: none;
  font-size: 1rem;
  line-height: 1.7;
}

.mail-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #9ca3af;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.mail-editor :deep(.ProseMirror ul),
.mail-editor :deep(.ProseMirror ol) {
  padding-left: 1.5rem;
}

.mail-editor :deep(.ProseMirror ul) {
  list-style: disc;
}

.mail-editor :deep(.ProseMirror ol) {
  list-style: decimal;
}

.mail-editor :deep(.ProseMirror img) {
  display: block;
  max-width: min(100%, 28rem);
  max-height: 18rem;
  border: 2px solid #000;
  object-fit: contain;
}

.dark .mail-editor :deep(.ProseMirror img) {
  border-color: #fff;
}
</style>
