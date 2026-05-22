import { Tray, Menu, nativeImage, MenuItemConstructorOptions } from 'electron'
import path from 'path'
import fs from 'fs'
import { getAllNotes } from './database'
import { toggleAllNoteWindows } from './window-manager'

let tray: Tray | null = null

function createTrayIcon(): Electron.NativeImage {
  // Try loading from resources first
  const iconPath = path.join(__dirname, '../../resources/tray-icon.png')
  if (fs.existsSync(iconPath)) {
    const stats = fs.statSync(iconPath)
    if (stats.size > 100) { // real icon, not placeholder
      return nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    }
  }

  // Fallback: generate a simple sticky-note icon programmatically
  // 16x16 sticky note with folded corner, using inline SVG to data URL
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <rect x="2" y="2" width="24" height="24" rx="2" fill="#FFE066" stroke="#D4A017" stroke-width="1.5"/>
    <path d="M20 2l6 6H22a2 2 0 01-2-2V2z" fill="#F5C842" stroke="#D4A017" stroke-width="1.5"/>
    <line x1="6" y1="10" x2="18" y2="10" stroke="#D4A017" stroke-width="1" stroke-linecap="round"/>
    <line x1="6" y1="14" x2="18" y2="14" stroke="#D4A017" stroke-width="1" stroke-linecap="round"/>
    <line x1="6" y1="18" x2="14" y2="18" stroke="#D4A017" stroke-width="1" stroke-linecap="round"/>
  </svg>`
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  return nativeImage.createFromDataURL(dataUrl).resize({ width: 16, height: 16 })
}

export function createTray(
  callbacks: {
    onNewNote: () => void
    onOpenPanel: () => void
    onExportAll: () => void
    onOpenSettings: () => void
    onQuit: () => void
  }
): void {
  const icon = createTrayIcon()
  tray = new Tray(icon)
  tray.setToolTip('NoteMm')

  tray.on('right-click', () => {
    tray?.popUpContextMenu(buildMenu(callbacks))
  })
  tray.on('click', () => {
    tray?.popUpContextMenu(buildMenu(callbacks))
  })
}

function buildMenu(callbacks: {
  onNewNote: () => void
  onOpenPanel: () => void
  onExportAll: () => void
  onOpenSettings: () => void
  onQuit: () => void
}): Menu {
  const noteCount = getAllNotes().length

  const template: MenuItemConstructorOptions[] = [
    { label: '新建便签', click: callbacks.onNewNote },
    { label: '显示/隐藏所有便签', click: () => toggleAllNoteWindows() },
    { label: '打开控制面板', click: callbacks.onOpenPanel },
    { type: 'separator' },
    { label: '导出全部便签', click: callbacks.onExportAll },
    { label: '设置', click: callbacks.onOpenSettings },
    { type: 'separator' },
    { label: `共 ${noteCount} 张便签`, enabled: false },
    { type: 'separator' },
    { label: '退出', click: callbacks.onQuit }
  ]

  return Menu.buildFromTemplate(template)
}

export function updateTrayMenu(callbacks: {
  onNewNote: () => void
  onOpenPanel: () => void
  onExportAll: () => void
  onOpenSettings: () => void
  onQuit: () => void
}): void {
  if (tray && !tray.isDestroyed()) {
    tray.setContextMenu(buildMenu(callbacks))
  }
}
