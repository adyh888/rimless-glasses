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
      </div>
      <div v-if="editor" class="prose-content p-4 min-h-[200px] max-h-[500px] overflow-y-auto">
        <EditorContent :editor="editor" />
      </div>
    </div>
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

const props = defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image,
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
    { title: '图片', icon: '&#128247;', command: () => {
      const url = prompt('请输入图片地址：')
      if (url) e.chain().focus().setImage({ src: url }).run()
    }, action: 'image' },
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
</style>
