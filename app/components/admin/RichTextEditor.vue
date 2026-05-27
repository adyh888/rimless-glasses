<template>
  <ClientOnly>
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <div v-if="editor" class="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50">
        <button type="button" v-for="btn in toolbarButtons" :key="btn.action"
          class="p-1.5 rounded text-sm hover:bg-gray-200 transition-colors"
          :class="btn.isActive?.() ? 'bg-gray-200 text-primary' : 'text-secondary'"
          @click="btn.command"
          :title="btn.title"
        >
          <span v-html="btn.icon" />
        </button>
        <span class="w-px h-5 bg-gray-200 mx-1" />
        <button type="button" @click="uploadImageInput?.click()" title="上传图片"
          class="p-1.5 rounded text-sm text-secondary hover:bg-gray-200 transition-colors"
        >
          <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </button>
        <button type="button" @click="uploadVideoInput?.click()" title="上传视频"
          class="p-1.5 rounded text-sm text-secondary hover:bg-gray-200 transition-colors"
        >
          <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        </button>
        <button type="button" @click="showLibrary = true" title="从素材库选择"
          class="p-1.5 rounded text-sm text-secondary hover:bg-gray-200 transition-colors"
        >
          <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
        </button>
      </div>
      <div v-if="editor" class="prose-content p-4 min-h-[200px] max-h-[500px] overflow-y-auto">
        <EditorContent :editor="editor" />
      </div>
    </div>
    <input ref="uploadImageInput" type="file" accept="image/*" class="hidden" @change="onImageFileSelect" />
    <input ref="uploadVideoInput" type="file" accept="video/mp4,video/webm,video/quicktime" class="hidden" @change="onVideoFileSelect" />
    <p v-if="uploading" class="text-xs text-secondary mt-2">上传中...</p>
    <MediaLibrary v-model="showLibrary" multiple @select="onLibrarySelect" />
    <template #fallback>
      <div class="border border-gray-200 rounded-lg p-4 min-h-[200px] bg-gray-50 text-secondary text-sm">
        编辑器加载中...
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Node, mergeAttributes } from '@tiptap/core'

const VideoNode = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
    }
  },
  parseHTML() {
    return [{ tag: 'video' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, {
      controls: true,
      playsinline: true,
      preload: 'metadata',
      style: 'max-width:100%;border-radius:0.5rem;margin:1.5rem 0;',
    })]
  },
})

const props = defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits(['update:modelValue'])
const { authHeaders } = useAuth()

const uploadImageInput = ref<HTMLInputElement>()
const uploadVideoInput = ref<HTMLInputElement>()
const uploading = ref(false)
const showLibrary = ref(false)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image,
    VideoNode,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: props.placeholder || '请输入内容...' }),
  ],
  immediatelyRender: false,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

async function uploadFile(file: File): Promise<string | null> {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await $fetch<any>('/api/upload', {
      method: 'POST',
      body: formData,
      headers: authHeaders(),
    })
    return res.url
  } catch (e: any) {
    alert(e?.data?.statusMessage || '上传失败')
    return null
  } finally {
    uploading.value = false
  }
}

async function onImageFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !editor.value) return
  const url = await uploadFile(file)
  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run()
  }
  if (uploadImageInput.value) uploadImageInput.value.value = ''
}

async function onVideoFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !editor.value) return
  const url = await uploadFile(file)
  if (url) {
    editor.value.chain().focus().insertContent({
      type: 'video',
      attrs: { src: url },
    }).run()
  }
  if (uploadVideoInput.value) uploadVideoInput.value.value = ''
}

function onLibrarySelect(urls: string[]) {
  if (!editor.value || !urls.length) return
  for (const url of urls) {
    if (isVideoUrl(url)) {
      editor.value.chain().focus().insertContent({ type: 'video', attrs: { src: url } }).run()
    } else {
      editor.value.chain().focus().setImage({ src: url }).run()
    }
  }
}

const toolbarButtons = computed(() => {
  if (!editor.value) return []
  const e = editor.value
  return [
    { title: '粗体', icon: '<b>B</b>', command: () => e.chain().focus().toggleBold().run(), isActive: () => e.isActive('bold'), action: 'bold' },
    { title: '斜体', icon: '<i>I</i>', command: () => e.chain().focus().toggleItalic().run(), isActive: () => e.isActive('italic'), action: 'italic' },
    { title: '标题2', icon: 'H2', command: () => e.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => e.isActive('heading', { level: 2 }), action: 'h2' },
    { title: '标题3', icon: 'H3', command: () => e.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => e.isActive('heading', { level: 3 }), action: 'h3' },
    { title: '无序列表', icon: '&bull;', command: () => e.chain().focus().toggleBulletList().run(), isActive: () => e.isActive('bulletList'), action: 'ul' },
    { title: '有序列表', icon: '1.', command: () => e.chain().focus().toggleOrderedList().run(), isActive: () => e.isActive('orderedList'), action: 'ol' },
    { title: '引用', icon: '&ldquo;', command: () => e.chain().focus().toggleBlockquote().run(), isActive: () => e.isActive('blockquote'), action: 'quote' },
    { title: '链接', icon: '&#128279;', command: () => {
      const url = prompt('请输入链接地址：')
      if (url) e.chain().focus().setLink({ href: url }).run()
    }, isActive: () => e.isActive('link'), action: 'link' },
    { title: '图片URL', icon: '&#128247;', command: () => {
      const url = prompt('请输入图片地址：')
      if (url) e.chain().focus().setImage({ src: url }).run()
    }, action: 'image' },
    { title: '视频URL', icon: '&#9654;', command: () => {
      const url = prompt('请输入视频地址：')
      if (url) e.chain().focus().insertContent({ type: 'video', attrs: { src: url } }).run()
    }, action: 'video-url' },
  ]
})
</script>

<style>
.tiptap {
  outline: none;
}
.tiptap p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
.tiptap video {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}
</style>
