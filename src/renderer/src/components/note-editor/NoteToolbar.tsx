import React, { useState } from 'react'
import { useNoteStore } from '../../stores/useNoteStore'

export default function NoteToolbar() {
  const note = useNoteStore(s => s.note)
  const updateNote = useNoteStore(s => s.updateNote)
  const setPinned = useNoteStore(s => s.setPinned)
  const deleteNote = useNoteStore(s => s.deleteNote)
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(note?.title || '')

  const handleTitleDoubleClick = () => {
    setTitle(note?.title || '')
    setEditingTitle(true)
  }

  const handleTitleSubmit = () => {
    updateNote({ title })
    setEditingTitle(false)
  }

  const handleDelete = () => {
    if (window.confirm('确定删除这张便签？')) {
      deleteNote()
    }
  }

  if (!note) return null

  return (
    <div className="drag-region flex items-center justify-between px-3 py-1.5 bg-black/5 rounded-t-lg cursor-move">
      <div className="flex items-center gap-2 no-drag">
        <span className="text-gray-400 text-xs cursor-grab">⠿</span>
        {editingTitle ? (
          <input
            autoFocus
            className="text-sm font-medium bg-white/80 rounded px-2 py-0.5 outline-none border border-blue-300 max-w-[180px]"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={e => { if (e.key === 'Enter') handleTitleSubmit() }}
          />
        ) : (
          <span
            className="text-sm font-medium text-gray-700 cursor-text select-text"
            onDoubleClick={handleTitleDoubleClick}
          >
            {note.title || '便签'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 no-drag">
        <button
          className={`w-6 h-6 flex items-center justify-center rounded text-xs ${note.pinned ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-black/5'}`}
          onClick={() => setPinned(!note.pinned)}
          title={note.pinned ? '取消置顶' : '置顶'}
        >
          📌
        </button>
        <button
          className="w-6 h-6 flex items-center justify-center rounded text-xs text-gray-400 hover:bg-red-100 hover:text-red-500"
          onClick={handleDelete}
          title="删除"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
