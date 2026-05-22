import { create } from 'zustand'
import { Note, NoteUpdateInput } from '../../../shared/types'

interface NoteState {
  note: Note | null
  isLoading: boolean
  isDirty: boolean
  loadNote: (id: string) => Promise<void>
  updateNote: (input: NoteUpdateInput) => Promise<void>
  saveNote: () => Promise<void>
  setPinned: (pinned: boolean) => Promise<void>
  deleteNote: () => Promise<void>
  setNote: (note: Note) => void
}

export const useNoteStore = create<NoteState>((set, get) => ({
  note: null,
  isLoading: true,
  isDirty: false,

  loadNote: async (id: string) => {
    set({ isLoading: true })
    const note = await window.electronAPI.getNoteById(id)
    if (note) set({ note, isLoading: false, isDirty: false })
    else set({ isLoading: false })
  },

  updateNote: async (input: NoteUpdateInput) => {
    const { note } = get()
    if (!note) return
    const updated = { ...note, ...input }
    set({ note: updated as Note, isDirty: true })
  },

  saveNote: async () => {
    const { note, isDirty } = get()
    if (!note || !isDirty) return
    await window.electronAPI.updateNote(note.id, {
      title: note.title,
      content: note.content,
      color: note.color,
      font_size: note.font_size,
      opacity: note.opacity,
      border_radius: note.border_radius,
      shadow: note.shadow
    })
    set({ isDirty: false })
  },

  setPinned: async (pinned: boolean) => {
    const { note } = get()
    if (!note) return
    set({ note: { ...note, pinned } })
    await window.electronAPI.setPinned(note.id, pinned)
  },

  deleteNote: async () => {
    const { note } = get()
    if (!note) return
    await window.electronAPI.deleteNote(note.id)
    window.close()
  },

  setNote: (note: Note) => set({ note })
}))
