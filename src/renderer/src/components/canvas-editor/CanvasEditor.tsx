import React, { useState, useRef, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { TextBlock } from '../../../../shared/types'

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#78716c'
]
const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32']
const FONTS = [
  { label: '微软雅黑', value: '"Microsoft YaHei", sans-serif' },
  { label: '宋体', value: 'SimSun, serif' },
  { label: '楷体', value: 'KaiTi, serif' },
  { label: '黑体', value: 'SimHei, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
]

interface Props { blocks: TextBlock[]; onChange: (b: TextBlock[]) => void; defaultFontSize: string }

export default function CanvasEditor({ blocks, onChange, defaultFontSize }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [editingBlock, setEditingBlock] = useState<TextBlock | null>(null)
  const editingRef = useRef<TextBlock | null>(null)
  const blocksRef = useRef<TextBlock[]>(blocks)
  blocksRef.current = blocks
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [dragInfo, setDragInfo] = useState<any>(null)
  const [isAligned, setIsAligned] = useState(false)
  const [alignPositions, setAlignPositions] = useState<{id:string;x:number;y:number}[]>([])

  const makeBlock = useCallback((type:'text'|'checklist', x:number, y:number): TextBlock => ({
    id: uuidv4(), type, text: '', x, y,
    fontSize: defaultFontSize, fontFamily: FONTS[0].value,
    color: '#000000', bold: false, italic: false,
    underline: false, underlineColor: '#ef4444', checked: false
  }), [defaultFontSize])

  const saveAndClose = useCallback(() => {
    const eb = editingRef.current
    if (!eb) return
    const cur = blocksRef.current
    if (eb.text.trim()) {
      // Upsert: replace if exists, add if new
      const idx = cur.findIndex(b => b.id === eb.id)
      if (idx >= 0) onChange(cur.map(b => b.id === eb.id ? eb : b))
      else onChange([...cur, eb])
    } else {
      onChange(cur.filter(b => b.id !== eb.id))
    }
    setEditingBlock(null)
    editingRef.current = null
  }, [onChange])

  const handleCanvasDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-block]')) return
    // If editing, first click outside just saves and closes
    if (editingRef.current) {
      saveAndClose()
      return
    }
    if (e.button !== 0) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const b = makeBlock('text', e.clientX - rect.left, e.clientY - rect.top)
    onChange([...blocksRef.current, b])
    setEditingBlock(b)
    editingRef.current = b
  }, [onChange, saveAndClose, makeBlock])

  const handleCanvasRightClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-block]')) return
    e.preventDefault()
    if (editingRef.current) {
      saveAndClose()
      return
    }
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const b = makeBlock('checklist', e.clientX - rect.left, e.clientY - rect.top)
    onChange([...blocksRef.current, b])
    setEditingBlock(b)
    editingRef.current = b
  }, [onChange, saveAndClose, makeBlock])

  const handleBlockDown = useCallback((e: React.MouseEvent, block: TextBlock) => {
    if (e.button !== 0) return
    e.stopPropagation()
    if (editingRef.current && editingRef.current.id === block.id) return
    setDragInfo({ id: block.id, sx: e.clientX, sy: e.clientY, bx: block.x, by: block.y })
  }, [])

  const handleCanvasMove = useCallback((e: React.MouseEvent) => {
    if (!dragInfo) return
    const dx = e.clientX - dragInfo.sx; const dy = e.clientY - dragInfo.sy
    onChange(blocksRef.current.map(b => b.id === dragInfo.id ? { ...b, x: Math.max(0, dragInfo.bx + dx), y: Math.max(0, dragInfo.by + dy) } : b))
  }, [dragInfo, onChange])

  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragOver(false), [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (!files.length) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const maxW = 300; const scale = Math.min(1, maxW / img.width)
          const b: TextBlock = {
            id: uuidv4(), type: 'image', text: '', x, y,
            fontSize: '14px', fontFamily: FONTS[0].value,
            color: '#000000', bold: false, italic: false,
            underline: false, underlineColor: '#000000', checked: false,
            src: reader.result as string,
            blockWidth: Math.round(img.width * scale),
            blockHeight: Math.round(img.height * scale)
          }
          onChange([...blocksRef.current, b])
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    })
  }, [onChange])

  const handleResize = useCallback((id: string, w: number, h: number) => {
    onChange(blocksRef.current.map(b => b.id === id ? { ...b, blockWidth: w, blockHeight: h } : b))
  }, [onChange])

  const handleCanvasUp = useCallback(() => setDragInfo(null), [])
  const handleBlockRight = useCallback((e: React.MouseEvent, block: TextBlock) => {
    e.preventDefault(); e.stopPropagation()
    if (block.type === 'image') {
      onChange(blocksRef.current.filter(b => b.id !== block.id))
      return
    }
    if (editingRef.current && editingRef.current.id !== block.id) saveAndClose()
    setEditingBlock(block)
    editingRef.current = block
  }, [saveAndClose, onChange])

  const updateEditingBlock = useCallback((u: Partial<TextBlock>) => {
    setEditingBlock(prev => {
      const next = prev ? { ...prev, ...u } : null
      editingRef.current = next
      return next
    })
  }, [])

  const alignToggle = useCallback(() => {
    if (isAligned) {
      onChange(blocks.map(b => { const o = alignPositions.find(p => p.id === b.id); return o ? { ...b, x: o.x, y: o.y } : b }))
    } else {
      setAlignPositions(blocks.map(b => ({ id: b.id, x: b.x, y: b.y })))
      onChange(blocks.map((b, i) => ({ ...b, x: 4, y: i * 22 })))
    }
    setIsAligned(!isAligned)
  }, [isAligned, blocks, alignPositions, onChange])

  return (
    <div className="h-full flex flex-col">
      <div ref={canvasRef} className="flex-1 relative overflow-hidden"
        onMouseDown={handleCanvasDown} onContextMenu={handleCanvasRightClick}
        onMouseMove={handleCanvasMove} onMouseUp={handleCanvasUp} onMouseLeave={handleCanvasUp}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        style={{ cursor: dragInfo ? 'grabbing' : 'default', outline: dragOver ? '2px dashed #3b82f6' : 'none', outlineOffset: '-4px' }}
      >
        {blocks.map(b => (
          <Block key={b.id} block={b}
            isHovered={hoverId === b.id} isDragging={dragInfo?.id === b.id}
            onMouseDown={e => handleBlockDown(e, b)}
            onContextMenu={e => handleBlockRight(e, b)}
            onHover={h => setHoverId(h ? b.id : null)}
            onCheckToggle={() => onChange(blocksRef.current.map(x => x.id === b.id ? { ...x, checked: !x.checked } : x))}
            onResize={handleResize}
          />
        ))}
        {blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
            点击创建文本 · 右键创建清单
          </div>
        )}
      </div>

      {/* Edit overlay — rendered OUTSIDE canvas to avoid event conflicts */}
      {editingBlock && (
        <EditOverlay
          block={editingBlock}
          onChange={updateEditingBlock}
          onFinish={saveAndClose}
          onDelete={() => {
            onChange(blocks.filter(b => b.id !== editingBlock.id))
            setEditingBlock(null)
            editingRef.current = null
          }}
        />
      )}

      <div className="flex items-center px-3 py-1.5 bg-black/5 rounded-b-lg no-drag">
        <button className={`px-2 py-1 text-xs rounded transition-colors ${isAligned ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-black/5'}`}
          onClick={alignToggle}>{isAligned ? '⇋ 恢复' : '≡ 左对齐'}</button>
      </div>
    </div>
  )
}

// ============ Edit Overlay ============

function EditOverlay({ block, onChange, onFinish, onDelete }: {
  block: TextBlock; onChange: (u: Partial<TextBlock>) => void; onFinish: () => void; onDelete: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const fsNum = parseInt(block.fontSize) || 14

  useEffect(() => {
    if (inputRef.current) { inputRef.current.focus(); inputRef.current.select() }
  }, [])

  return (
    <div className="absolute z-30 pointer-events-none" style={{ left: block.x, top: block.y + 28 }}>
      <div className="bg-white/95 rounded-xl shadow-2xl border border-gray-300 p-3 min-w-[200px] max-w-[320px] pointer-events-auto"
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onFinish(); } if (e.key === 'Escape') onFinish() }}
        tabIndex={-1}>
        {/* Input */}
        <div className="flex items-center gap-1.5 mb-2">
          {block.type === 'checklist' && (
            <input type="checkbox" className="w-4 h-4 accent-blue-500 flex-shrink-0"
              checked={block.checked} onChange={() => onChange({ checked: !block.checked })} />
          )}
          <input ref={inputRef}
            className="flex-1 bg-white border border-blue-400 rounded px-2 py-1.5 text-sm outline-none"
            style={{
              fontSize: block.fontSize, fontFamily: block.fontFamily,
              color: block.color, fontWeight: block.bold ? 700 : 400,
              fontStyle: block.italic ? 'italic' : 'normal',
              textDecoration: block.underline ? 'underline' : 'none',
              textDecorationColor: block.underlineColor
            }}
            value={block.text} onChange={e => onChange({ text: e.target.value })}
            placeholder={block.type === 'checklist' ? '清单项...' : '输入文字...'} autoFocus
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 flex-wrap">
          <TBtn on={block.bold} title="加粗" onClick={() => onChange({ bold: !block.bold })}><b>B</b></TBtn>
          <TBtn on={block.italic} title="斜体" onClick={() => onChange({ italic: !block.italic })}><i>I</i></TBtn>
          <TBtn on={block.underline} title="下划线" onClick={() => onChange({ underline: !block.underline })}><u>U</u></TBtn>

          <span className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Font */}
          <select className="text-[11px] border border-gray-200 rounded px-1 py-0.5 outline-none"
            value={block.fontFamily} onChange={e => onChange({ fontFamily: e.target.value })}>
            {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          {/* Size */}
          <select className="text-[11px] border border-gray-200 rounded px-1 py-0.5 outline-none"
            value={String(fsNum)} onChange={e => onChange({ fontSize: e.target.value + 'px' })}>
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

        </div>

        {/* Colors row 1: text color */}
        <div className="flex items-center gap-1 mt-1.5">
          <span className="text-[10px] text-gray-400 w-8">文字</span>
          <div className="flex gap-0.5">
            {TEXT_COLORS.map(c => (
              <button key={c} className="w-4 h-4 rounded-full border hover:scale-125 transition-transform"
                style={{ backgroundColor: c, borderColor: block.color === c ? '#3b82f6' : '#ccc', borderWidth: block.color === c ? '2px' : '1px' }}
                onClick={() => onChange({ color: c })}
              />
            ))}
          </div>
        </div>

        {/* Colors row 2: underline color */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[10px] text-gray-400 w-8">下线</span>
          <div className="flex gap-0.5">
            {['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'].map(c => (
              <button key={'u' + c} className="w-4 h-4 rounded-full border hover:scale-125 transition-transform"
                style={{ backgroundColor: c, borderColor: block.underlineColor === c ? '#3b82f6' : '#ccc', borderWidth: block.underlineColor === c ? '2px' : '1px' }}
                onClick={() => onChange({ underlineColor: c })}
              />
            ))}
          </div>

          {!block.text.trim() && (
            <button className="ml-auto px-2 py-1 text-xs text-red-400 hover:text-red-600 rounded"
              onClick={onDelete}>✕</button>
          )}
        </div>
      </div>
    </div>
  )
}

function TBtn({ on, title, onClick, children }: { on: boolean; title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`w-7 h-6 flex items-center justify-center rounded text-xs ${on ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
      onClick={onClick} title={title}>{children}</button>
  )
}

// ============ Display Block ============

function Block({ block, isHovered, isDragging, onMouseDown, onContextMenu, onHover, onCheckToggle, onResize }: {
  block: TextBlock; isHovered: boolean; isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void; onContextMenu: (e: React.MouseEvent) => void
  onHover: (h: boolean) => void; onCheckToggle: () => void
  onResize?: (id: string, w: number, h: number) => void
}) {
  // Image block
  if (block.type === 'image' && block.src) {
    const w = block.blockWidth || 200; const h = block.blockHeight || 150
    return (
      <div data-block className="absolute group"
        style={{ left: block.x, top: block.y, zIndex: isDragging ? 50 : 10, opacity: isDragging ? 0.8 : 1 }}
        onMouseDown={onMouseDown} onContextMenu={onContextMenu}
        onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}
      >
        <div className="relative" style={{ width: w, height: h }}>
          <img src={block.src} alt=""
            className="w-full h-full object-contain rounded"
            style={{ backgroundColor: isHovered ? 'rgba(251,191,36,0.15)' : 'transparent' }}
            draggable={false}
          />
          {/* Resize handle */}
          {isHovered && onResize && (
            <ResizeHandle blockId={block.id} onResize={onResize} />
          )}
        </div>
      </div>
    )
  }

  // Text / Checklist block
  return (
    <div data-block className="absolute group"
      style={{ left: block.x, top: block.y, zIndex: isDragging ? 50 : 10, opacity: isDragging ? 0.8 : 1 }}
      onMouseDown={onMouseDown} onContextMenu={onContextMenu}
      onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}
    >
      <div className="flex items-center gap-1 px-1 py-0.5 rounded select-none"
        style={{
          fontSize: block.fontSize, fontFamily: block.fontFamily,
          color: block.color, fontWeight: block.bold ? 700 : 400,
          fontStyle: block.italic ? 'italic' : 'normal',
          textDecoration: block.underline ? 'underline' : 'none',
          textDecorationColor: block.underlineColor, textDecorationThickness: '1.5px',
          backgroundColor: isHovered ? 'rgba(251,191,36,0.25)' : 'transparent',
          cursor: isDragging ? 'grabbing' : (isHovered ? 'grab' : 'text'),
          borderRadius: '3px', maxWidth: '100%', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          opacity: block.type === 'checklist' && block.checked ? 0.45 : 1
        }}
      >
        {block.type === 'checklist' && (
          <input type="checkbox" className="w-3.5 h-3.5 accent-blue-500 flex-shrink-0 self-center"
            checked={block.checked} onChange={onCheckToggle} />
        )}
        <span>{block.text || (isHovered ? '...' : '')}</span>
      </div>
    </div>
  )
}

function ResizeHandle({ blockId, onResize }: { blockId: string; onResize: (id: string, w: number, h: number) => void }) {
  const startRef = useRef({ sx: 0, sy: 0, sw: 0, sh: 0 })

  const handleDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault()
    const el = (e.target as HTMLElement).closest('[data-block]')?.querySelector('img')
    if (!el) return
    startRef.current = { sx: e.clientX, sy: e.clientY, sw: el.clientWidth, sh: el.clientHeight }
    const onMove = (ev: MouseEvent) => {
      const dw = startRef.current.sw + (ev.clientX - startRef.current.sx)
      const dh = startRef.current.sh + (ev.clientY - startRef.current.sy)
      onResize(blockId, Math.max(40, Math.round(dw)), Math.max(30, Math.round(dh)))
    }
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [blockId, onResize])

  return (
    <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
      style={{ borderRight: '2px solid rgba(59,130,246,0.6)', borderBottom: '2px solid rgba(59,130,246,0.6)' }}
      onMouseDown={handleDown}
    />
  )
}
