import React from 'react'
import { Note } from '../../../shared/types'

interface Props {
  notes: Note[]
  onSelect: (id: string) => void
  onContextMenu: (e: React.MouseEvent, note: Note) => void
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 50)
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

export default function NoteList({ notes, onSelect, onContextMenu }: Props) {
  if (notes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-12">
        暂无便签，点击上方按钮创建
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
      {notes.map(note => (
        <div
          key={note.id}
          className="flex items-start gap-2.5 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group"
          onClick={() => onSelect(note.id)}
          onContextMenu={e => onContextMenu(e, note)}
        >
          <span
            className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
            style={{ backgroundColor: note.color }}
          />
          <div className="flex-1 min-w-0">
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
              {stripHtml(note.content) || '空内容'}
            </p>
          </div>
          <span className="text-[10px] text-gray-400 flex-shrink-0 mt-1">
            {timeAgo(note.updated_at)}
          </span>
        </div>
      ))}
    </div>
  )
}
