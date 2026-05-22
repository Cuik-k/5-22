import React, { useEffect, useState } from 'react'
import { AppSettings } from '../../../../shared/types'

export default function GeneralSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    window.electronAPI.getSettings().then(setSettings)
  }, [])

  const update = async (partial: Partial<AppSettings>) => {
    const updated = await window.electronAPI.setSettings(partial)
    setSettings(updated)
  }

  if (!settings) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">通用</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">开机自启</span>
          <Toggle checked={settings.launchOnStartup} onChange={v => update({ launchOnStartup: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">启动时恢复所有便签</span>
          <Toggle checked={settings.restoreNotesOnStart} onChange={v => update({ restoreNotesOnStart: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">关闭窗口时隐藏到托盘</span>
          <Toggle checked={settings.hideToTrayOnClose} onChange={v => update({ hideToTrayOnClose: v })} />
        </div>
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}
      onClick={() => onChange(!checked)}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}
