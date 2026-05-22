import React from 'react'
import { useNoteStore } from '../../stores/useNoteStore'
import { NOTE_COLORS } from '../../../../shared/types'

interface Props {
  isChecklist: boolean
  onToggleChecklist: () => void
  onInsertCheckbox: () => void
}

export default function NoteStatusBar({ isChecklist, onToggleChecklist, onInsertCheckbox }: Props) {
  const note = useNoteStore(s => s.note)
  const updateNote = useNoteStore(s => s.updateNote)
  const [showAppearance, setShowAppearance] = React.useState(false)

  if (!note) return null

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-b-lg no-drag">
      <button
        className="w-7 h-7 flex items-center justify-center rounded text-sm hover:bg-black/10"
        title="外观"
        onClick={() => setShowAppearance(!showAppearance)}
      >
        🎨
      </button>

      <button
        className={`w-7 h-7 flex items-center justify-center rounded text-sm transition-colors ${isChecklist ? 'bg-blue-100 text-blue-600' : 'hover:bg-black/10 text-gray-500'}`}
        title={isChecklist ? '退出清单模式' : '清单模式'}
        onClick={onToggleChecklist}
      >
        ☑
      </button>

      <button
        className="w-7 h-7 flex items-center justify-center rounded text-sm text-gray-500 hover:bg-black/10 transition-colors"
        title="插入复选框"
        onClick={onInsertCheckbox}
      >
        ⊠
      </button>

      <div className="flex-1" />

      <span className="text-xs text-gray-400">
        {note.updated_at ? new Date(note.updated_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : ''}
      </span>

      {showAppearance && (
        <AppearancePanel onClose={() => setShowAppearance(false)} />
      )}
    </div>
  )
}

function AppearancePanel({ onClose }: { onClose: () => void }) {
  const note = useNoteStore(s => s.note)
  const updateNote = useNoteStore(s => s.updateNote)
  if (!note) return null

  const colors = NOTE_COLORS
  const shadowOptions = [
    { value: 'none', label: '无' },
    { value: 'small', label: '小' },
    { value: 'medium', label: '中' },
    { value: 'large', label: '大' }
  ]

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-10 left-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-64">
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1.5 block">背景颜色</label>
          <div className="flex flex-wrap gap-1.5">
            {colors.map(c => (
              <button
                key={c}
                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: note.color === c ? '#3B82F6' : 'transparent'
                }}
                onClick={() => updateNote({ color: c })}
              />
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">
            不透明度: {Math.round(note.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={note.opacity}
            onChange={e => updateNote({ opacity: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">
            字号: {note.font_size}
          </label>
          <div className="flex gap-1">
            {['12px', '14px', '16px', '18px', '20px'].map(size => (
              <button
                key={size}
                className={`px-2 py-0.5 text-xs rounded ${note.font_size === size ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => updateNote({ font_size: size })}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">圆角</label>
          <div className="flex gap-1">
            {['4px', '8px', '12px', '16px', '20px'].map(r => (
              <button
                key={r}
                className={`px-2 py-0.5 text-xs rounded ${note.border_radius === r ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => updateNote({ border_radius: r })}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">阴影</label>
          <div className="flex gap-1">
            {shadowOptions.map(s => (
              <button
                key={s.value}
                className={`px-2 py-0.5 text-xs rounded ${note.shadow === s.value ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => updateNote({ shadow: s.value })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
