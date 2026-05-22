import { useEffect, useRef, useCallback } from 'react'
import { useNoteStore } from '../stores/useNoteStore'

export function useAutoSave(debounceMs = 500) {
  const isDirty = useNoteStore(s => s.isDirty)
  const saveNote = useNoteStore(s => s.saveNote)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveNote()
    }, debounceMs)
  }, [saveNote, debounceMs])

  useEffect(() => {
    if (isDirty) {
      scheduleSave()
    }
  }, [isDirty, scheduleSave])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      saveNote()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [saveNote])

  return { scheduleSave }
}
