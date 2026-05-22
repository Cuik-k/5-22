import { app, Menu, dialog } from 'electron'
import { initDatabase, getAllNotes, createNote } from './database'
import { registerIpcHandlers } from './ipc-handlers'
import { createNoteWindow, closeAllNoteWindows, openControlPanel, openSettings, toggleAllNoteWindows } from './window-manager'
import { createTray } from './tray'
import { registerShortcuts, unregisterAll } from './shortcuts'
import { getSettings } from './settings-store'
import fs from 'fs'

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
}

app.on('ready', () => {
  Menu.setApplicationMenu(null)

  initDatabase()
  registerIpcHandlers()

  // Restore notes from last session
  const settings = getSettings()
  if (settings.restoreNotesOnStart) {
    const notes = getAllNotes()
    for (const note of notes) {
      createNoteWindow(note)
    }
  }

  // Create tray
  const trayCallbacks = {
    onNewNote: () => {
      const note = createNote()
      createNoteWindow(note)
    },
    onOpenPanel: () => openControlPanel(),
    onExportAll: () => {
      const notes = getAllNotes()
      const buildExportHtml = (notes: Array<{ title: string; content: string; color: string; updated_at: string }>) => {
        const items = notes.map(n => `
          <div style="background:${n.color};padding:16px;margin:8px 0;border-radius:8px">
            <h3>${n.title || '无标题'}</h3>
            <div>${(n.content || '').replace(/<[^>]*>/g, '')}</div>
            <small>${n.updated_at}</small>
          </div>
        `).join('\n')
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>便签导出</title></head><body>${items}</body></html>`
      }
      dialog.showSaveDialog({
        filters: [{ name: 'HTML', extensions: ['html'] }],
        defaultPath: `notes-export-${Date.now()}.html`
      }).then((result: any) => {
        if (!result.canceled && result.filePath) {
          const html = buildExportHtml(notes)
          fs.writeFileSync(result.filePath, html, 'utf-8')
        }
      })
    },
    onOpenSettings: () => openSettings(),
    onQuit: () => {
      unregisterAll()
      closeAllNoteWindows()
      app.quit()
    }
  }
  createTray(trayCallbacks)

  // Register global shortcuts
  registerShortcuts({
    onNewNote: trayCallbacks.onNewNote,
    onToggleAll: () => toggleAllNoteWindows(),
    onOpenPanel: () => openControlPanel(),
    onSearch: () => openControlPanel()
  })
})

app.on('window-all-closed', () => {
  const settings = getSettings()
  if (!settings.hideToTrayOnClose) {
    unregisterAll()
    app.quit()
  }
})

app.on('will-quit', () => {
  unregisterAll()
})

app.on('second-instance', () => {
  openControlPanel()
})
