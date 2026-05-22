import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const HoverHighlight = Extension.create({
  name: 'hoverHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('hoverHighlight'),

        props: {
          handleDOMEvents: {
            mousemove(view, event) {
              const target = event.target as HTMLElement

              if (!target.closest('.ProseMirror')) return false

              // Remove previous highlights
              view.dom.querySelectorAll('.hover-highlight').forEach(el => {
                el.classList.remove('hover-highlight')
              })

              // Find the text node under cursor
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
              if (!pos) return false

              const resolved = view.state.doc.resolve(pos.pos)
              const node = resolved.parent
              if (!node || !node.isText) return false

              // Find word boundaries
              const text = node.text || ''
              const offset = pos.pos - resolved.start()
              const start = text.lastIndexOf(' ', offset - 1) + 1
              const end = text.indexOf(' ', offset)
              const wordEnd = end === -1 ? text.length : end

              if (start < wordEnd) {
                const from = resolved.start() + start
                const to = resolved.start() + wordEnd

                const dom = view.domAtPos(from)
                if (dom.node && dom.node.parentElement) {
                  const textNode = dom.node
                  const span = document.createElement('span')
                  span.className = 'hover-highlight'
                  textNode.parentElement.insertBefore(span, textNode)
                  span.appendChild(textNode)
                }
              }

              return false
            }
          }
        }
      })
    ]
  }
})
