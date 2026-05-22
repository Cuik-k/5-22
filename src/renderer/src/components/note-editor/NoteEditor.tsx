import React, { useEffect, useCallback } from 'react'
import { useEditor, EditorContent, BubbleMenu, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExtension from '@tiptap/extension-underline'
import TextStyleExtension from '@tiptap/extension-text-style'
import ColorExtension from '@tiptap/extension-color'
import TaskListExtension from '@tiptap/extension-task-list'
import TaskItemExtension from '@tiptap/extension-task-item'
import PlaceholderExtension from '@tiptap/extension-placeholder'
import { HoverHighlight } from './extensions/HoverHighlight'
import { DragMoveText } from './extensions/DragMoveText'
import { useNoteStore } from '../../stores/useNoteStore'

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#cccccc',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#78716c', '#ffffff'
]

interface Props {
  noteId: string
  onUpdate: (content: string) => void
  onEditorReady?: (editor: Editor) => void
}

export default function NoteEditor({ noteId, onUpdate, onEditorReady }: Props) {
  const note = useNoteStore(s => s.note)
  const isLoading = useNoteStore(s => s.isLoading)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }
      }),
      UnderlineExtension,
      TextStyleExtension,
      ColorExtension,
      TaskListExtension,
      TaskItemExtension.configure({ nested: true }),
      PlaceholderExtension.configure({ placeholder: '输入内容...' }),
      HoverHighlight,
      DragMoveText
    ],
    content: note?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none'
      }
    },
    onUpdate: ({ editor: ed }) => {
      onUpdate(ed.getHTML())
    }
  })

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  useEffect(() => {
    if (note && editor && !editor.isDestroyed) {
      const currentContent = editor.getHTML()
      if (currentContent !== note.content) {
        editor.commands.setContent(note.content)
      }
    }
  }, [note?.id, note?.content, editor])

  const setTextColor = useCallback((color: string) => {
    if (!editor || editor.isDestroyed) return
    editor.chain().focus().setColor(color).run()
  }, [editor])

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-gray-400">加载中...</div>
  }

  return (
    <div style={{ fontSize: note?.font_size || '14px' }} className="h-full relative">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150, placement: 'top' }}
          className="flex items-center gap-0.5 bg-white rounded-lg shadow-xl border border-gray-200 px-1.5 py-1 select-none"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`w-8 h-7 flex items-center justify-center rounded text-sm font-bold hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-100 text-blue-600' : 'text-gray-600'}`}
            title="加粗"
          >B</button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`w-8 h-7 flex items-center justify-center rounded text-sm italic hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-100 text-blue-600' : 'text-gray-600'}`}
            title="斜体"
          >I</button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`w-8 h-7 flex items-center justify-center rounded text-sm underline hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-100 text-blue-600' : 'text-gray-600'}`}
            title="下划线"
          >U</button>
          <span className="w-px h-4 bg-gray-200 mx-0.5" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`w-8 h-7 flex items-center justify-center rounded text-xs hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-blue-600' : 'text-gray-600'}`}
            title="标题"
          >H</button>
          {/* Text color picker */}
          <div className="relative group">
            <button className="w-8 h-7 flex items-center justify-center rounded text-sm hover:bg-gray-100 text-gray-600" title="文字颜色">
              <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000' }} />
            </button>
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-2 hidden group-hover:flex flex-wrap gap-1 w-36 z-50">
              {TEXT_COLORS.map(c => (
                <button
                  key={c}
                  className="w-5 h-5 rounded-full border hover:scale-110 transition-transform"
                  style={{ backgroundColor: c, borderColor: c === '#ffffff' ? '#ddd' : c }}
                  onClick={() => setTextColor(c)}
                />
              ))}
            </div>
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} className="h-full" />
    </div>
  )
}
