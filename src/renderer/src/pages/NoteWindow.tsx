import React, { useEffect, useCallback, useMemo } from 'react'
import type { TextBlock } from '../../../shared/types'
import NoteToolbar from '../components/note-editor/NoteToolbar'
import CanvasEditor from '../components/canvas-editor/CanvasEditor'
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

  const blocks = useMemo<TextBlock[]>(() => {
    if (!note?.content) return []
    try {
      return JSON.parse(note.content)
    } catch {
      return []
    }
  }, [note?.content])

  const handleBlocksChange = useCallback((newBlocks: TextBlock[]) => {
    updateNote({ content: JSON.stringify(newBlocks) })
  }, [updateNote])

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
        <CanvasEditor blocks={blocks} onChange={handleBlocksChange} defaultFontSize={note.font_size || '14px'} />
      </div>
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
