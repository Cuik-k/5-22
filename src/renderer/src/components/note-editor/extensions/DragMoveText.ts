import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const DragMoveText = Extension.create({
  name: 'dragMoveText',

  addProseMirrorPlugins() {
    let dragStartPos: { from: number; to: number } | null = null
    let dragElement: HTMLElement | null = null

    return [
      new Plugin({
        key: new PluginKey('dragMoveText'),

        props: {
          handleDOMEvents: {
            mousedown(view, event) {
              // Find highlighted decoration range
              const hoverPluginKey = new PluginKey('hoverHighlight')
              const hoverState = hoverPluginKey.getState(view.state) as any

              if (!hoverState || !hoverState.find) {
                return false
              }

              const decorations = hoverState.find()
              if (!decorations || decorations.length === 0) {
                return false
              }

              // Check if the click is on the highlighted element
              const target = event.target as HTMLElement
              if (!target.closest('.hover-highlight')) {
                // Allow the click if not on highlight (for normal editing)
                return false
              }

              const deco = decorations[0]
              const from = deco.from
              const to = deco.to
              if (from === undefined || to === undefined) return false

              const draggedText = view.state.doc.textBetween(from, to)

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

                // Reset highlight
                const hoverPluginKey = new PluginKey('hoverHighlight')
                view.dispatch(view.state.tr.setMeta(hoverPluginKey, 'reset'))

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
