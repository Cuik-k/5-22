import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import { Note, NoteCreateInput, NoteUpdateInput, NOTE_DEFAULTS, randomNoteColor } from '../shared/types'
import { v4 as uuidv4 } from 'uuid'

let db: Database.Database

export function initDatabase(): void {
  const dbPath = path.join(app.getPath('userData'), 'notes.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id            TEXT PRIMARY KEY,
      title         TEXT DEFAULT '',
      content       TEXT DEFAULT '',
      color         TEXT DEFAULT '#FFE066',
      font_size     TEXT DEFAULT '14px',
      opacity       REAL DEFAULT 0.92,
      border_radius TEXT DEFAULT '8px',
      shadow        TEXT DEFAULT 'medium',
      x             REAL DEFAULT 200,
      y             REAL DEFAULT 200,
      width         REAL DEFAULT 300,
      height        REAL DEFAULT 340,
      pinned        INTEGER DEFAULT 0,
      is_checklist  INTEGER DEFAULT 0,
      sort_order    INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now'))
    )
  `)
  // Migration: add sort_order if upgrading from older version
  try { db.exec('ALTER TABLE notes ADD COLUMN sort_order INTEGER DEFAULT 0') } catch(e) {}
}

export function getAllNotes(): Note[] {
  const rows = db.prepare('SELECT * FROM notes ORDER BY sort_order ASC, updated_at DESC').all() as any[]
  return rows.map(rowToNote)
}

export function reorderNotes(orderedIds: string[]): void {
  const stmt = db.prepare('UPDATE notes SET sort_order = ? WHERE id = ?')
  const tx = db.transaction(() => {
    orderedIds.forEach((id, index) => {
      stmt.run(index, id)
    })
  })
  tx()
}

export function getNoteById(id: string): Note | undefined {
  const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as any
  return row ? rowToNote(row) : undefined
}

export function createNote(input?: NoteCreateInput): Note {
  const defaults = input ? { ...NOTE_DEFAULTS, ...input } : NOTE_DEFAULTS
  const noteColor = defaults.color || randomNoteColor()
  const note: Note = {
    id: uuidv4(),
    title: defaults.title!,
    content: defaults.content!,
    color: noteColor,
    font_size: defaults.font_size!,
    opacity: defaults.opacity!,
    border_radius: defaults.border_radius!,
    shadow: defaults.shadow!,
    x: defaults.x!,
    y: defaults.y!,
    width: defaults.width!,
    height: defaults.height!,
    pinned: defaults.pinned!,
    is_checklist: defaults.is_checklist!,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  db.prepare(`
    INSERT INTO notes (id, title, content, color, font_size, opacity, border_radius, shadow, x, y, width, height, pinned, is_checklist, created_at, updated_at)
    VALUES (@id, @title, @content, @color, @font_size, @opacity, @border_radius, @shadow, @x, @y, @width, @height, @pinned, @is_checklist, @created_at, @updated_at)
  `).run({ ...note, pinned: note.pinned ? 1 : 0, is_checklist: note.is_checklist ? 1 : 0 })

  return note
}

export function updateNote(id: string, input: NoteUpdateInput): Note {
  const existing = getNoteById(id)
  if (!existing) throw new Error(`Note not found: ${id}`)

  const updated = {
    ...existing,
    ...input,
    updated_at: new Date().toISOString()
  }

  db.prepare(`
    UPDATE notes SET title=@title, content=@content, color=@color, font_size=@font_size, opacity=@opacity, border_radius=@border_radius, shadow=@shadow, x=@x, y=@y, width=@width, height=@height, pinned=@pinned, is_checklist=@is_checklist, updated_at=@updated_at
    WHERE id=@id
  `).run({ ...updated, pinned: updated.pinned ? 1 : 0, is_checklist: updated.is_checklist ? 1 : 0 })

  return updated
}

export function deleteNote(id: string): void {
  db.prepare('DELETE FROM notes WHERE id = ?').run(id)
}

export function searchNotes(query: string): Note[] {
  const rows = db.prepare(
    'SELECT * FROM notes WHERE title LIKE @q OR content LIKE @q ORDER BY updated_at DESC'
  ).all({ q: `%${query}%` }) as any[]
  return rows.map(rowToNote)
}

function rowToNote(row: any): Note {
  return {
    ...row,
    pinned: row.pinned === 1,
    is_checklist: row.is_checklist === 1
  }
}
