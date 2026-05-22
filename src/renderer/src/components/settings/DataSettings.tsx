import React from 'react'

export default function DataSettings() {
  const handleExport = async () => {
    await window.electronAPI.exportAllNotes('json')
  }

  const handleImport = async () => {
    const count = await window.electronAPI.importNotes('')
    if (count > 0) {
      alert(`成功导入 ${count} 张便签`)
    }
  }

  const handleClearAll = () => {
    if (window.confirm('确定要清空所有便签数据吗？此操作不可撤销。')) {
      window.electronAPI.getAllNotes().then(notes => {
        notes.forEach(n => window.electronAPI.deleteNote(n.id))
      })
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">数据</h3>
      <div className="space-y-2">
        <button
          className="w-full text-left px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={handleExport}
        >
          导出全部便签 (JSON)
        </button>
        <button
          className="w-full text-left px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={handleImport}
        >
          导入便签 (JSON)
        </button>
        <button
          className="w-full text-left px-3 py-2 text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          onClick={handleClearAll}
        >
          清空所有数据
        </button>
      </div>
    </div>
  )
}
