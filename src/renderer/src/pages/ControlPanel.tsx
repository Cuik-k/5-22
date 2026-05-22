import React, { useEffect, useState } from 'react'
import { Note } from '../../../shared/types'
function extractText(content: string): string {
  try {
    const blocks = JSON.parse(content)
    if (Array.isArray(blocks)) return blocks.map((b: any) => b.text || '').join(' ')
  } catch {}
  return content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
}

import SearchBar from '../components/control-panel/SearchBar'
import NoteList from '../components/control-panel/NoteList'

export default function ControlPanel() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    const result = searchQuery
      ? await window.electronAPI.searchNotes(searchQuery)
      : await window.electronAPI.getAllNotes()
    setNotes(result)
  }

  useEffect(() => {
    const timer = setTimeout(loadNotes, 150)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleNewNote = async () => {
    await window.electronAPI.createNote()
    loadNotes()
  }

  const handleSelect = async (id: string) => {
    await window.electronAPI.openNote(id)
  }

  const handleExportAll = async () => {
    await window.electronAPI.exportAllNotes('html')
  }

  const handleOpenSettings = async () => {
    await window.electronAPI.openSettings()
  }

  const handleContextMenu = (e: React.MouseEvent, note: Note) => {
    e.preventDefault()
    const menu = document.createElement('div')
    menu.className = 'fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[140px]'
    menu.style.left = `${e.clientX}px`
    menu.style.top = `${e.clientY}px`

    const items = [
      { label: '打开', action: () => handleSelect(note.id) },
      { label: note.pinned ? '取消置顶' : '置顶', action: async () => {
        await window.electronAPI.setPinned(note.id, !note.pinned)
        loadNotes()
      }},
      { label: '复制内容', action: () => {
        const text = extractText(note.content)
        navigator.clipboard.writeText(text)
      }},
      { label: '导出为 TXT', action: () => window.electronAPI.exportNoteAsTxt(note.id) },
      { label: '删除', action: async () => {
        if (window.confirm('确定删除？')) {
          await window.electronAPI.deleteNote(note.id)
          loadNotes()
        }
      }}
    ]

    items.forEach(item => {
      const el = document.createElement('button')
      el.className = 'w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors'
      el.textContent = item.label
      el.onclick = () => { item.action(); menu.remove() }
      menu.appendChild(el)
    })

    document.body.appendChild(menu)
    const close = (ev: MouseEvent) => {
      if (!menu.contains(ev.target as Node)) {
        menu.remove()
        document.removeEventListener('click', close)
      }
    }
    setTimeout(() => document.addEventListener('click', close), 0)
  }

  return (
    <div className="h-screen flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200 select-none">
      <div className="drag-region flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h1 className="text-sm font-semibold text-gray-700">便签</h1>
        <button
          className="no-drag px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
          onClick={handleNewNote}
        >
          + 新建便签
        </button>
      </div>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <NoteList notes={notes} onSelect={handleSelect} onContextMenu={handleContextMenu} onReorder={async (ids) => {
        await window.electronAPI.reorderNotes(ids)
        loadNotes()
      }} />
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
        <span>共 {notes.length} 张便签</span>
        <div className="flex gap-3">
          <button onClick={handleExportAll} className="hover:text-gray-600 transition-colors">导出全部</button>
          <button onClick={handleOpenSettings} className="hover:text-gray-600 transition-colors">设置</button>
        </div>
      </div>
    </div>
  )
}
