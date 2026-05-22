import React, { useEffect, useState } from 'react'
import { AppSettings, DEFAULT_SETTINGS } from '../../../shared/types'

interface ShortcutRow {
  label: string
  key: keyof AppSettings['shortcuts']
}

const rows: ShortcutRow[] = [
  { label: '新建便签', key: 'newNote' },
  { label: '显示/隐藏所有便签', key: 'toggleAllNotes' },
  { label: '打开控制面板', key: 'openControlPanel' },
  { label: '搜索便签', key: 'searchNotes' }
]

export default function ShortcutSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [recording, setRecording] = useState<string | null>(null)

  useEffect(() => {
    window.electronAPI.getSettings().then(setSettings)
  }, [])

  useEffect(() => {
    if (!recording) return
    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      const parts: string[] = []
      if (e.ctrlKey) parts.push('Ctrl')
      if (e.shiftKey) parts.push('Shift')
      if (e.altKey) parts.push('Alt')
      if (!['Control', 'Shift', 'Alt'].includes(e.key)) {
        parts.push(e.key.toUpperCase())
        const accelerator = parts.join('+')
        const updatedShortcuts = { ...settings!.shortcuts, [recording]: accelerator }
        window.electronAPI.setSettings({ shortcuts: updatedShortcuts }).then(setSettings)
        setRecording(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [recording, settings])

  const handleReset = async () => {
    const updated = await window.electronAPI.setSettings({ shortcuts: DEFAULT_SETTINGS.shortcuts })
    setSettings(updated)
  }

  if (!settings) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">快捷键</h3>
      <div className="space-y-2">
        {rows.map(row => (
          <div key={row.key} className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-600">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                {settings.shortcuts[row.key]}
              </span>
              <button
                className={`text-xs px-2 py-1 rounded ${recording === row.key ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                onClick={() => setRecording(row.key)}
              >
                {recording === row.key ? '按下按键...' : '改'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline" onClick={handleReset}>
        重置为默认
      </button>
    </div>
  )
}
