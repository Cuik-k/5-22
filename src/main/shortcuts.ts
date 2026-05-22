import { globalShortcut } from 'electron'
import { getSettings } from './settings-store'

let registeredShortcuts: string[] = []

export function registerShortcuts(callbacks: {
  onNewNote: () => void
  onToggleAll: () => void
  onOpenPanel: () => void
  onSearch: () => void
}): void {
  unregisterAll()

  const { shortcuts } = getSettings()

  const pairs: [string, () => void][] = [
    [shortcuts.newNote, callbacks.onNewNote],
    [shortcuts.toggleAllNotes, callbacks.onToggleAll],
    [shortcuts.openControlPanel, callbacks.onOpenPanel],
    [shortcuts.searchNotes, callbacks.onSearch]
  ]

  for (const [accelerator, callback] of pairs) {
    try {
      globalShortcut.register(accelerator, callback)
      registeredShortcuts.push(accelerator)
    } catch {
      console.warn(`Failed to register shortcut: ${accelerator}`)
    }
  }
}

export function unregisterAll(): void {
  for (const accel of registeredShortcuts) {
    globalShortcut.unregister(accel)
  }
  registeredShortcuts = []
}
