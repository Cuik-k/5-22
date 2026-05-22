import { BrowserWindow, screen } from 'electron'
import path from 'path'
import { Note } from '../shared/types'

const noteWindows = new Map<string, BrowserWindow>()
let controlPanelWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null

const PRELOAD_PATH = path.join(__dirname, '../preload/index.js')
const ICON_PATH = path.join(__dirname, '../../resources/tray-icon.png')

function getRendererUrl(hash: string): string {
  const devUrl = process.env.ELECTRON_RENDERER_URL
  if (devUrl) {
    return `${devUrl}#${hash}`
  }
  const filePath = path.join(__dirname, '../renderer/index.html')
  return `file://${filePath}#${hash}`
}

function createBaseWindow(opts: { width: number; height: number; x?: number; y?: number; frame?: boolean; alwaysOnTop?: boolean; resizable?: boolean }): BrowserWindow {
  return new BrowserWindow({
    width: opts.width,
    height: opts.height,
    x: opts.x,
    y: opts.y,
    frame: opts.frame ?? false,
    transparent: true,
    alwaysOnTop: opts.alwaysOnTop ?? false,
    resizable: opts.resizable ?? true,
    skipTaskbar: true,
    icon: ICON_PATH,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false
    }
  })
}

export function createNoteWindow(note: Note): BrowserWindow {
  const win = createBaseWindow({
    width: note.width,
    height: note.height,
    x: note.x,
    y: note.y,
    alwaysOnTop: note.pinned
  })

  win.loadURL(getRendererUrl(`/note/${note.id}`))
  win.on('moved', () => handleNoteMoved(note.id, win))
  win.on('resize', () => handleNoteResized(note.id, win))

  noteWindows.set(note.id, win)
  return win
}

function handleNoteMoved(id: string, win: BrowserWindow) {
  const [x, y] = win.getPosition()
  win.webContents.send('note:position-changed', { x, y })
}

function handleNoteResized(id: string, win: BrowserWindow) {
  const [width, height] = win.getSize()
  win.webContents.send('note:size-changed', { width, height })
}

export function showNoteWindow(id: string): void {
  const win = noteWindows.get(id)
  if (win && !win.isDestroyed()) {
    win.show()
    win.focus()
  }
}

export function closeNoteWindow(id: string): void {
  const win = noteWindows.get(id)
  if (win && !win.isDestroyed()) {
    win.close()
    noteWindows.delete(id)
  }
}

export function isNoteWindowOpen(id: string): boolean {
  const win = noteWindows.get(id)
  return win !== undefined && !win.isDestroyed()
}

export function toggleAllNoteWindows(): void {
  const anyVisible = [...noteWindows.values()].some(w => !w.isDestroyed() && w.isVisible())
  for (const win of noteWindows.values()) {
    if (win.isDestroyed()) continue
    if (anyVisible) win.hide()
    else win.show()
  }
}

export function areNotesVisible(): boolean {
  return [...noteWindows.values()].some(w => !w.isDestroyed() && w.isVisible())
}

export function openControlPanel(): void {
  if (controlPanelWindow && !controlPanelWindow.isDestroyed()) {
    controlPanelWindow.show()
    controlPanelWindow.focus()
    return
  }

  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize
  controlPanelWindow = createBaseWindow({ width: 420, height: 520, x: Math.round((screenWidth - 420) / 2), y: 80, frame: false, resizable: false })

  controlPanelWindow.loadURL(getRendererUrl('/panel'))
  controlPanelWindow.on('blur', () => {
    controlPanelWindow?.close()
    controlPanelWindow = null
  })
  controlPanelWindow.on('closed', () => {
    controlPanelWindow = null
  })
}

export function openSettings(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show()
    settingsWindow.focus()
    return
  }

  settingsWindow = createBaseWindow({ width: 500, height: 560, frame: true, resizable: false })
  settingsWindow.loadURL(getRendererUrl('/settings'))
  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

export function setNotePinned(id: string, pinned: boolean): void {
  const win = noteWindows.get(id)
  if (win && !win.isDestroyed()) {
    win.setAlwaysOnTop(pinned)
  }
}

export function closeAllNoteWindows(): void {
  for (const [id, win] of noteWindows) {
    if (!win.isDestroyed()) win.close()
  }
  noteWindows.clear()
}
