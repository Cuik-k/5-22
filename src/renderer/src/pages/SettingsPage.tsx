import React from 'react'
import GeneralSettings from '../components/settings/GeneralSettings'
import ShortcutSettings from '../components/settings/ShortcutSettings'
import DataSettings from '../components/settings/DataSettings'

export default function SettingsPage() {
  return (
    <div className="h-screen flex flex-col bg-white select-none">
      <div className="drag-region px-4 py-3 border-b border-gray-100">
        <h1 className="text-sm font-semibold text-gray-700">设置</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <GeneralSettings />
        <div className="border-t border-gray-100 pt-4">
          <ShortcutSettings />
        </div>
        <div className="border-t border-gray-100 pt-4">
          <DataSettings />
        </div>
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">关于</h3>
          <p className="text-sm text-gray-400">Desktop Sticky Notes v1.0.0</p>
        </div>
      </div>
    </div>
  )
}
