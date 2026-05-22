import React, { useState, useCallback } from 'react'
import { useNoteStore } from '../../stores/useNoteStore'
import { NOTE_COLORS } from '../../../../shared/types'

export default function NoteToolbar() {
  const note = useNoteStore(s => s.note)
  const updateNote = useNoteStore(s => s.updateNote)
  const setPinned = useNoteStore(s => s.setPinned)
  const deleteNote = useNoteStore(s => s.deleteNote)
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(note?.title || '')
  const [showAppearance, setShowAppearance] = useState(false)

  const handleTitleClick = useCallback(() => {
    setTitle(note?.title || '')
    setEditingTitle(true)
  }, [note?.title])

  const handleTitleSubmit = useCallback(() => {
    const trimmed = title.trim()
    updateNote({ title: trimmed })
    setTitle(trimmed)
    setEditingTitle(false)
  }, [title, updateNote])

  const handleDelete = () => {
    if (window.confirm('确定删除这张便签？')) {
      deleteNote()
    }
  }

  if (!note) return null

  const shadowOptions = [
    { value: 'none', label: '无' },
    { value: 'small', label: '小' },
    { value: 'medium', label: '中' },
    { value: 'large', label: '大' }
  ]

  return (
    <div className="drag-region flex items-center justify-between px-3 py-1.5 bg-black/5 rounded-t-lg cursor-move relative">
      <div className="flex items-center gap-2 no-drag">
        <span className="text-gray-400 text-xs">⠿</span>
        {editingTitle ? (
          <input
            autoFocus
            className="text-sm font-medium bg-white/90 rounded px-2 py-0.5 outline-none border border-blue-300 max-w-[200px] shadow-sm"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={e => { if (e.key === 'Enter') handleTitleSubmit(); if (e.key === 'Escape') setEditingTitle(false) }}
            placeholder="输入标题..."
          />
        ) : (
          <button
            className="text-sm font-medium text-gray-700 hover:text-blue-500 hover:bg-white/40 rounded px-2 py-0.5 transition-colors cursor-text max-w-[200px] truncate text-left"
            onClick={handleTitleClick}
            title="点击编辑标题"
          >
            {note.title || '未命名'}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 no-drag">
        {/* Appearance button */}
        <button
          className={`w-6 h-6 flex items-center justify-center rounded text-xs transition-colors ${showAppearance ? 'bg-gray-100 text-blue-500' : 'text-gray-400 hover:bg-black/5'}`}
          onClick={() => setShowAppearance(!showAppearance)}
          title="外观"
        >🎨</button>

        {/* Pin button */}
        <button
          className={`w-6 h-6 flex items-center justify-center rounded text-xs transition-colors ${note.pinned ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-black/5'}`}
          onClick={() => setPinned(!note.pinned)}
          title={note.pinned ? '取消置顶' : '置顶'}
        >📌</button>

        {/* Delete */}
        <button
          className="w-6 h-6 flex items-center justify-center rounded text-xs text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors"
          onClick={handleDelete}
          title="删除"
        >✕</button>
      </div>

      {/* Appearance popup */}
      {showAppearance && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowAppearance(false)} />
          <div className="absolute right-2 top-8 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-64 no-drag">
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1.5 block">背景颜色</label>
              <div className="flex flex-wrap gap-1.5">
                {NOTE_COLORS.map(c => (
                  <button
                    key={c}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c, borderColor: note.color === c ? '#3B82F6' : 'transparent' }}
                    onClick={() => updateNote({ color: c })}
                  />
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">不透明度: {Math.round(note.opacity * 100)}%</label>
              <input
                type="range" min="0.2" max="1" step="0.05" value={note.opacity}
                onChange={e => updateNote({ opacity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">字号: {note.font_size}</label>
              <div className="flex gap-1">
                {['12px', '14px', '16px', '18px', '20px'].map(size => (
                  <button key={size}
                    className={`px-2 py-0.5 text-xs rounded ${note.font_size === size ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => updateNote({ font_size: size })}
                  >{size}</button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">圆角</label>
              <div className="flex gap-1">
                {['4px', '8px', '12px', '16px', '20px'].map(r => (
                  <button key={r}
                    className={`px-2 py-0.5 text-xs rounded ${note.border_radius === r ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => updateNote({ border_radius: r })}
                  >{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">阴影</label>
              <div className="flex gap-1">
                {shadowOptions.map(s => (
                  <button key={s.value}
                    className={`px-2 py-0.5 text-xs rounded ${note.shadow === s.value ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => updateNote({ shadow: s.value })}
                  >{s.label}</button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
