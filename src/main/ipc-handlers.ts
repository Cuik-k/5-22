import { ipcMain, dialog } from 'electron'
import { IPC_CHANNELS, NoteCreateInput, NoteUpdateInput } from '../shared/types'
import { getAllNotes, getNoteById, createNote, updateNote, deleteNote, searchNotes } from './database'
import { getSettings, setSettings } from './settings-store'
import { createNoteWindow, showNoteWindow, closeNoteWindow, isNoteWindowOpen, openControlPanel, openSettings, setNotePinned } from './window-manager'
import fs from 'fs'

export function registerIpcHandlers(): void {
  // Notes CRUD
  ipcMain.handle(IPC_CHANNELS.NOTES_GET_ALL, () => getAllNotes())
  ipcMain.handle(IPC_CHANNELS.NOTES_GET_BY_ID, (_e, id: string) => getNoteById(id))
  ipcMain.handle(IPC_CHANNELS.NOTES_CREATE, (_e, input?: NoteCreateInput) => {
    const note = createNote(input)
    createNoteWindow(note)
    return note
  })
  ipcMain.handle(IPC_CHANNELS.NOTES_UPDATE, (_e, id: string, input: NoteUpdateInput) => {
    return updateNote(id, input)
  })
  ipcMain.handle(IPC_CHANNELS.NOTES_DELETE, (_e, id: string) => {
    deleteNote(id)
    closeNoteWindow(id)
  })
  ipcMain.handle(IPC_CHANNELS.NOTES_SEARCH, (_e, query: string) => searchNotes(query))

  // Export all notes
  ipcMain.handle(IPC_CHANNELS.NOTES_EXPORT_ALL, async (_e, format: 'html' | 'json') => {
    const notes = getAllNotes()
    if (format === 'json') {
      const result = await dialog.showSaveDialog({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        defaultPath: `notes-export-${Date.now()}.json`
      })
      if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, JSON.stringify(notes, null, 2), 'utf-8')
      }
    } else {
      const html = buildExportHtml(notes)
      const result = await dialog.showSaveDialog({
        filters: [{ name: 'HTML', extensions: ['html'] }],
        defaultPath: `notes-export-${Date.now()}.html`
      })
      if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, html, 'utf-8')
      }
    }
  })

  // Import notes from JSON
  ipcMain.handle(IPC_CHANNELS.NOTES_IMPORT, async (_e) => {
    const result = await dialog.showOpenDialog({
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return 0
    const data = fs.readFileSync(result.filePaths[0], 'utf-8')
    const notes = JSON.parse(data)
    if (!Array.isArray(notes)) throw new Error('Invalid import format: expected array')
    let count = 0
    for (const note of notes) {
      createNote({
        title: note.title,
        content: note.content,
        color: note.color,
        font_size: note.font_size,
        opacity: note.opacity,
        border_radius: note.border_radius,
        shadow: note.shadow,
        width: note.width,
        height: note.height,
        pinned: note.pinned,
        is_checklist: note.is_checklist
      })
      count++
    }
    return count
  })

  // Export single note as TXT
  ipcMain.handle(IPC_CHANNELS.NOTE_EXPORT_TXT, async (_e, id: string) => {
    const note = getNoteById(id)
    if (!note) return
    const plainText = note.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
    const result = await dialog.showSaveDialog({
      filters: [{ name: 'Text', extensions: ['txt'] }],
      defaultPath: `${note.title || 'untitled'}.txt`
    })
    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, plainText, 'utf-8')
    }
  })

  // Settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => getSettings())
  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, (_e, partial) => setSettings(partial))

  // Window controls
  ipcMain.handle(IPC_CHANNELS.WINDOW_OPEN_NOTE, (_e, id: string) => {
    if (isNoteWindowOpen(id)) {
      showNoteWindow(id)
    } else {
      const note = getNoteById(id)
      if (note) createNoteWindow(note)
    }
  })
  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE_NOTE, (_e, id: string) => closeNoteWindow(id))
  ipcMain.handle(IPC_CHANNELS.WINDOW_OPEN_PANEL, () => openControlPanel())
  ipcMain.handle(IPC_CHANNELS.WINDOW_OPEN_SETTINGS, () => openSettings())

  // Pin
  ipcMain.handle(IPC_CHANNELS.NOTE_SET_PINNED, (_e, id: string, pinned: boolean) => {
    setNotePinned(id, pinned)
    updateNote(id, { pinned })
  })
}

function buildExportHtml(notes: Array<{ title: string; content: string; color: string; updated_at: string }>): string {
  const items = notes.map(n => `
    <div style="background:${n.color};padding:16px;margin:8px 0;border-radius:8px">
      <h3>${n.title || '无标题'}</h3>
      <div>${n.content}</div>
      <small>${n.updated_at}</small>
    </div>
  `).join('\n')
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>便签导出</title></head><body>${items}</body></html>`
}
