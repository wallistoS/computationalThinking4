import type { BoardObject } from '~/models/board-object'

interface Shortcut {
  key: string
  meta?: boolean
  run: (object: BoardObject) => void
}

// Keyboard shortcuts: each row binds a key to an action on the selected object.
export function useShortcuts() {
  const board = useBoard()

  // Actions only use the base (id, x, y), so they work for every variant.
  const SHORTCUTS: Shortcut[] = [
    { key: 'ArrowLeft', run: (o) => board.moveObject(o.id, o.x - GRID_SIZE, o.y) },
    { key: 'ArrowRight', run: (o) => board.moveObject(o.id, o.x + GRID_SIZE, o.y) },
    { key: 'ArrowUp', run: (o) => board.moveObject(o.id, o.x, o.y - GRID_SIZE) },
    { key: 'ArrowDown', run: (o) => board.moveObject(o.id, o.x, o.y + GRID_SIZE) },
    { key: 'c', meta: true, run: (o) => board.copyObject(o.id) },
    { key: 'x', meta: true, run: (o) => (board.copyObject(o.id), board.deleteObject(o.id)) },
    { key: 'd', meta: true, run: (o) => board.duplicateObject(o.id) },
    { key: 'Backspace', run: (o) => board.deleteObject(o.id) },
    { key: 'Escape', run: () => board.select(null) },
  ]

  function onKeyDown(event: KeyboardEvent) {
    if ((event.target as HTMLElement).closest('textarea, input')) return
    const meta = event.metaKey || event.ctrlKey
    // Pasting needs no selection.
    if (meta && event.key === 'v') {
      event.preventDefault()
      board.pasteObject()
      return
    }
    const object = board.selected.value
    const shortcut = SHORTCUTS.find((s) => s.key === event.key && !!s.meta === meta)
    if (!object || !shortcut) return
    event.preventDefault()
    shortcut.run(object)
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
}
