import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const DragMoveText = Extension.create({
  name: 'dragMoveText',

  addProseMirrorPlugins() {
    let dragStartPos: { from: number; to: number } | null = null
    let dragElement: HTMLElement | null = null
    let draggedText = ''

    return [
      new Plugin({
        key: new PluginKey('dragMoveText'),

        props: {
          handleDOMEvents: {
            mousedown(view, event) {
              const highlighted = view.dom.querySelector('.hover-highlight')
              if (!highlighted || !(event.target as HTMLElement).closest('.hover-highlight')) return false

              let from = -1
              let to = -1
              view.dom.querySelectorAll('.hover-highlight').forEach(el => {
                const pos = view.posAtDOM(el, 0)
                if (pos > -1) {
                  from = pos
                  to = pos + (el.textContent || '').length
                  draggedText = el.textContent || ''
                }
              })

              if (from === -1) return false

              dragStartPos = { from, to }

              const onMouseMove = (e: MouseEvent) => {
                if (!dragElement) {
                  dragElement = document.createElement('div')
                  dragElement.className = 'fixed bg-yellow-200/80 px-2 py-1 rounded text-sm pointer-events-none z-50 shadow-lg'
                  dragElement.textContent = draggedText
                  document.body.appendChild(dragElement)
                }
                dragElement.style.left = `${e.clientX + 12}px`
                dragElement.style.top = `${e.clientY - 20}px`
              }

              const onMouseUp = (e: MouseEvent) => {
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)

                if (dragElement) {
                  dragElement.remove()
                  dragElement = null
                }

                if (dragStartPos) {
                  const dropPos = view.posAtCoords({ left: e.clientX, top: e.clientY })
                  if (dropPos && dropPos.pos !== dragStartPos.from) {
                    const { from, to } = dragStartPos
                    const text = view.state.doc.textBetween(from, to)
                    const tr = view.state.tr
                    tr.delete(from, to)
                    const insertPos = dropPos.pos > from ? dropPos.pos - (to - from) : dropPos.pos
                    tr.insertText(text, Math.max(0, insertPos))
                    view.dispatch(tr)
                  }
                }
                dragStartPos = null
              }

              document.addEventListener('mousemove', onMouseMove)
              document.addEventListener('mouseup', onMouseUp)

              event.preventDefault()
              return true
            }
          }
        }
      })
    ]
  }
})
