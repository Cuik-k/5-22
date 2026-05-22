import React, { useState } from 'react'
import { Note } from '../../../../shared/types'

interface Props {
  notes: Note[]
  onSelect: (id: string) => void
  onContextMenu: (e: React.MouseEvent, note: Note) => void
  onReorder: (orderedIds: string[]) => void
}

function stripContent(content: string): string {
  try {
    const blocks = JSON.parse(content)
    if (Array.isArray(blocks)) {
      return blocks.map((b: any) => b.type === 'image' ? '[图片]' : (b.text || '')).join(' ').substring(0, 50)
    }
  } catch {}
  return content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 50)
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  if (hrs < 24) return `${hrs}小时前`
  return `${days}天前`
}

export default function NoteList({ notes, onSelect, onContextMenu, onReorder }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  if (notes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-12">
        暂无便签，点击上方按钮创建
      </div>
    )
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const reordered = [...notes]
      const [moved] = reordered.splice(dragIndex, 1)
      reordered.splice(dragOverIndex, 0, moved)
      onReorder(reordered.map(n => n.id))
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
      {notes.map((note, index) => (
        <div
          key={note.id}
          draggable
          className={`flex items-start gap-2.5 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group ${
            dragIndex === index ? 'opacity-50' : ''
          } ${dragOverIndex === index ? 'border-t-2 border-blue-400' : ''}`}
          onClick={() => onSelect(note.id)}
          onContextMenu={e => onContextMenu(e, note)}
          onDragStart={() => handleDragStart(index)}
          onDragOver={e => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
        >
          <span
            className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
            style={{ backgroundColor: note.color }}
          />
          <div className="flex-1 min-w-0 pointer-events-none">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-medium text-gray-800 truncate">
                {note.title || '无标题'}
              </span>
              {note.is_checklist && (
                <span className="text-[10px] px-1 py-0.5 bg-blue-100 text-blue-600 rounded">清单</span>
              )}
              {note.pinned && (
                <span className="text-[10px]">📌</span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">
              {stripContent(note.content) || '空内容'}
            </p>
          </div>
          <span className="text-[10px] text-gray-400 flex-shrink-0 mt-1 pointer-events-none">
            {timeAgo(note.updated_at)}
          </span>
        </div>
      ))}
    </div>
  )
}
