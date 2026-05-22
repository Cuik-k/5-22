import React, { useEffect, useCallback } from 'react'
import NoteEditor from '../components/note-editor/NoteEditor'
import NoteToolbar from '../components/note-editor/NoteToolbar'
import NoteStatusBar from '../components/note-editor/NoteStatusBar'
import { useNoteStore } from '../stores/useNoteStore'
import { useAutoSave } from '../hooks/useAutoSave'

interface Props {
  noteId: string
}

export default function NoteWindow({ noteId }: Props) {
  const note = useNoteStore(s => s.note)
  const loadNote = useNoteStore(s => s.loadNote)
  const updateNote = useNoteStore(s => s.updateNote)

  useAutoSave(500)

  useEffect(() => {
    loadNote(noteId)
  }, [noteId, loadNote])

  const handleContentUpdate = useCallback((content: string) => {
    updateNote({ content })
  }, [updateNote])

  const handleToggleChecklist = useCallback(() => {
    if (!note) return
    updateNote({ is_checklist: !note.is_checklist })
  }, [note, updateNote])

  const handleInsertCheckbox = useCallback(() => {
    const editorEl = document.querySelector('.ProseMirror') as any
    if (editorEl?.__tiptapEditor) {
      editorEl.__tiptapEditor.commands.toggleTaskItem()
    }
  }, [])

  if (!note) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-400">便签不存在</p>
      </div>
    )
  }

  const shadowClass = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-xl'
  }[note.shadow] || 'shadow-md'

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden relative ${shadowClass}`}
      style={{
        backgroundColor: note.color,
        opacity: note.opacity,
        borderRadius: note.border_radius
      }}
    >
      <NoteToolbar />
      <div className="flex-1 overflow-hidden">
        <NoteEditor noteId={noteId} onUpdate={handleContentUpdate} />
      </div>
      <NoteStatusBar
        onToggleChecklist={handleToggleChecklist}
        onInsertCheckbox={handleInsertCheckbox}
      />
      {/* Resize grip */}
      <div
        className="absolute bottom-1 right-1 w-3 h-3 cursor-se-resize opacity-30 hover:opacity-100 no-drag"
        style={{
          borderRight: '3px solid rgba(0,0,0,0.3)',
          borderBottom: '3px solid rgba(0,0,0,0.3)'
        }}
      />
    </div>
  )
}
