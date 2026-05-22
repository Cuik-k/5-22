import { Tray, Menu, nativeImage, MenuItemConstructorOptions } from 'electron'
import path from 'path'
import { getAllNotes } from './database'
import { toggleAllNoteWindows } from './window-manager'

let tray: Tray | null = null

export function createTray(
  callbacks: {
    onNewNote: () => void
    onOpenPanel: () => void
    onExportAll: () => void
    onOpenSettings: () => void
    onQuit: () => void
  }
): void {
  const iconPath = path.join(__dirname, '../../resources/tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  tray = new Tray(icon)
  tray.setToolTip('Desktop Sticky Notes')

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
