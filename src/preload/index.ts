import { contextBridge, ipcRenderer } from 'electron'
import { ElectronAPI, IPC_CHANNELS } from '../shared/types'

const api: ElectronAPI = {
  getAllNotes: () => ipcRenderer.invoke(IPC_CHANNELS.NOTES_GET_ALL),
  getNoteById: (id) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_GET_BY_ID, id),
  createNote: (input?) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_CREATE, input),
  updateNote: (id, input) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_UPDATE, id, input),
  deleteNote: (id) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_DELETE, id),
  searchNotes: (query) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_SEARCH, query),
  exportAllNotes: (format) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_EXPORT_ALL, format),
  importNotes: (data) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_IMPORT, data),

  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
  setSettings: (settings) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings),

  openNote: (id) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_OPEN_NOTE, id),
  closeNote: (id) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE_NOTE, id),
  openControlPanel: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_OPEN_PANEL),
  openSettings: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_OPEN_SETTINGS),

  setPinned: (id, pinned) => ipcRenderer.invoke(IPC_CHANNELS.NOTE_SET_PINNED, id, pinned),
  exportNoteAsTxt: (id) => ipcRenderer.invoke(IPC_CHANNELS.NOTE_EXPORT_TXT, id)
}

contextBridge.exposeInMainWorld('electronAPI', api)
