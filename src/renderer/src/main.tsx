import React from 'react'
import ReactDOM from 'react-dom/client'
import NoteWindow from './pages/NoteWindow'
import ControlPanel from './pages/ControlPanel'
import SettingsPage from './pages/SettingsPage'
import './styles/index.css'

function App() {
  const hash = window.location.hash

  if (hash.startsWith('#/note/')) {
    const noteId = hash.replace('#/note/', '')
    return <NoteWindow noteId={noteId} />
  } else if (hash.startsWith('#/panel')) {
    return <ControlPanel />
  } else if (hash.startsWith('#/settings')) {
    return <SettingsPage />
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <p className="text-gray-400">加载中...</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
