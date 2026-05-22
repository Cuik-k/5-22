export interface Note {
  id: string
  title: string
  content: string       // HTML from TipTap
  color: string
  font_size: string
  opacity: number
  border_radius: string
  shadow: string        // 'none' | 'small' | 'medium' | 'large'
  x: number
  y: number
  width: number
  height: number
  pinned: boolean
  is_checklist: boolean
  created_at: string
  updated_at: string
}

export interface NoteCreateInput {
  title?: string
  content?: string
  color?: string
  font_size?: string
  opacity?: number
  border_radius?: string
  shadow?: string
  x?: number
  y?: number
  width?: number
  height?: number
  pinned?: boolean
  is_checklist?: boolean
}

export interface NoteUpdateInput {
  title?: string
  content?: string
  color?: string
  font_size?: string
  opacity?: number
  border_radius?: string
  shadow?: string
  x?: number
  y?: number
  width?: number
  height?: number
  pinned?: boolean
  is_checklist?: boolean
}

export const NOTE_DEFAULTS: Required<NoteCreateInput> = {
  title: '',
  content: '',
  color: '#FFE066',
  font_size: '14px',
  opacity: 0.92,
  border_radius: '8px',
  shadow: 'medium',
  x: 200,
  y: 200,
  width: 300,
  height: 340,
  pinned: false,
  is_checklist: false
}

export interface AppSettings {
  launchOnStartup: boolean
  restoreNotesOnStart: boolean
  hideToTrayOnClose: boolean
  shortcuts: ShortcutConfig
}

export interface ShortcutConfig {
  newNote: string
  toggleAllNotes: string
  openControlPanel: string
  searchNotes: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  launchOnStartup: false,
  restoreNotesOnStart: true,
  hideToTrayOnClose: true,
  shortcuts: {
    newNote: 'Ctrl+Shift+N',
    toggleAllNotes: 'Ctrl+Shift+H',
    openControlPanel: 'Ctrl+Shift+P',
    searchNotes: 'Ctrl+Shift+F'
  }
}

// IPC channel names
export const IPC_CHANNELS = {
  NOTES_GET_ALL: 'notes:get-all',
  NOTES_GET_BY_ID: 'notes:get-by-id',
  NOTES_CREATE: 'notes:create',
  NOTES_UPDATE: 'notes:update',
  NOTES_DELETE: 'notes:delete',
  NOTES_SEARCH: 'notes:search',
  NOTES_EXPORT_ALL: 'notes:export-all',
  NOTES_IMPORT: 'notes:import',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  WINDOW_OPEN_NOTE: 'window:open-note',
  WINDOW_CLOSE_NOTE: 'window:close-note',
  WINDOW_TOGGLE_ALL: 'window:toggle-all',
  WINDOW_OPEN_PANEL: 'window:open-panel',
  WINDOW_OPEN_SETTINGS: 'window:open-settings',
  NOTE_SET_PINNED: 'note:set-pinned',
  NOTE_DELETE: 'note:delete',
  NOTE_EXPORT_TXT: 'note:export-txt'
} as const

export interface ElectronAPI {
  getAllNotes: () => Promise<Note[]>
  getNoteById: (id: string) => Promise<Note | undefined>
  createNote: (input?: NoteCreateInput) => Promise<Note>
  updateNote: (id: string, input: NoteUpdateInput) => Promise<Note>
  deleteNote: (id: string) => Promise<void>
  searchNotes: (query: string) => Promise<Note[]>
  exportAllNotes: (format: 'html' | 'json') => Promise<string>
  importNotes: (data: string) => Promise<number>
  getSettings: () => Promise<AppSettings>
  setSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>
  openNote: (id: string) => Promise<void>
  closeNote: (id: string) => Promise<void>
  openControlPanel: () => Promise<void>
  openSettings: () => Promise<void>
  setPinned: (id: string, pinned: boolean) => Promise<void>
  exportNoteAsTxt: (id: string) => Promise<void>
}
