import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const HoverHighlight = Extension.create({
  name: 'hoverHighlight',

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('hoverHighlight')

    return [
      new Plugin({
        key: pluginKey,

        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, oldSet) {
            // Keep decorations through transactions unless we're replacing them
            const meta = tr.getMeta(pluginKey)
            if (meta === 'reset') return DecorationSet.empty
            if (meta) return meta
            return oldSet.map(tr.mapping, tr.doc)
          }
        },

        props: {
          decorations(state) {
            return pluginKey.getState(state)
          },

          handleDOMEvents: {
            mousemove(view, event) {
              const target = event.target as HTMLElement
              if (!target.closest('.ProseMirror')) return false

              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
              if (!pos) {
                view.dispatch(view.state.tr.setMeta(pluginKey, 'reset'))
                return false
              }

              const resolved = view.state.doc.resolve(pos.pos)
              const node = resolved.parent
              if (!node || !node.isText) {
                view.dispatch(view.state.tr.setMeta(pluginKey, 'reset'))
                return false
              }

              const text = node.text || ''
              const offset = pos.pos - resolved.start()
              const start = text.lastIndexOf(' ', offset - 1) + 1
              const end = text.indexOf(' ', offset)
              const wordEnd = end === -1 ? text.length : end

              if (start < wordEnd) {
                const from = resolved.start() + start
                const to = resolved.start() + wordEnd

                const deco = Decoration.inline(from, to, {
                  nodeName: 'span',
                  class: 'hover-highlight'
                })

                const set = DecorationSet.create(view.state.doc, [deco])
                view.dispatch(view.state.tr.setMeta(pluginKey, set))
              } else {
                view.dispatch(view.state.tr.setMeta(pluginKey, 'reset'))
              }

              return false
            },

            mouseleave() {
              // Don't reset on mouseleave - let the next mousemove handle it
              return false
            }
          }
        }
      })
    ]
  }
})
