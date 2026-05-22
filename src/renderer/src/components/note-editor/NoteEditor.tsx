import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
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

interface Props {
  noteId: string
  onUpdate: (content: string) => void
}

export default function NoteEditor({ noteId, onUpdate }: Props) {
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
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML())
    }
  })

  useEffect(() => {
    if (note && editor && !editor.isDestroyed) {
      const currentContent = editor.getHTML()
      if (currentContent !== note.content) {
        editor.commands.setContent(note.content)
      }
    }
  }, [note?.id, note?.content, editor])

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-gray-400">加载中...</div>
  }

  return (
    <div style={{ fontSize: note?.font_size || '14px' }} className="h-full">
      <EditorContent editor={editor} className="h-full" />
    </div>
  )
}
