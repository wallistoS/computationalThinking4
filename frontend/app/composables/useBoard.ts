import type { BoardObject, ObjectTemplate, Rect, StyleChanges, TextObject } from '~/types/canvas-object'

const TEXT_DEFAULTS = { text: '', fontSize: FONT_SIZES.M, bold: false }

// Starting attributes of a new object, per variant. Only variants with text get text attributes.
const DEFAULTS: Record<BoardObject['type'], Rect & Partial<TextObject>> = {
  'sticky-note': { x: 0, y: 0, width: GRID_SIZE * 8, height: GRID_SIZE * 8, ...TEXT_DEFAULTS },
  'text': { x: 0, y: 0, width: GRID_SIZE * 10, height: GRID_SIZE * 3, ...TEXT_DEFAULTS },
  'circle': { x: 0, y: 0, width: GRID_SIZE * 6, height: GRID_SIZE * 6 },
}

const API = 'http://localhost:3001'
const PATCH_DELAY = 300

type Changes = Partial<Rect> & StyleChanges & { text?: string }

// Changes waiting for their PATCH, per object. Shared by every useBoard() call,
// so a delete from one caller can cancel a drag from another.
const pending = new Map<string, { changes: Changes; timer: ReturnType<typeof setTimeout> }>()

function send(method: string, path: string, body?: object) {
  $fetch(`${API}${path}`, { method: method as 'POST', body }).catch(error => console.error(method, path, error))
}

// Collects changes and sends one PATCH once the object has been quiet for PATCH_DELAY.
function queuePatch(id: string, changes: Changes) {
  const entry = pending.get(id)
  if (entry) clearTimeout(entry.timer)
  const merged = { ...entry?.changes, ...changes }
  const timer = setTimeout(() => {
    pending.delete(id)
    send('PATCH', `/objects/${id}`, merged)
  }, PATCH_DELAY)
  pending.set(id, { changes: merged, timer })
}

function cancelPatch(id: string) {
  clearTimeout(pending.get(id)?.timer)
  pending.delete(id)
}

// The board state is the single source of truth for which objects exist and what they look like.
// Components only read it; every change goes through one of the functions below.
// Each function changes the local state first and then tells the backend.
export function useBoard() {
  const objects = useState<BoardObject[]>('objects', () => [])
  const loaded = useState('boardLoaded', () => false)

  // Only the first useBoard() call loads the board, and only in the browser.
  if (import.meta.client && !loaded.value) {
    loaded.value = true
    $fetch<BoardObject[]>(`${API}/objects`)
      .then((list) => { objects.value = list })
      .catch(error => console.error('GET /objects', error))
  }

  function insert(object: BoardObject) {
    objects.value = [...objects.value, object]
    send('POST', '/objects', object)
    return object.id
  }

  function addObject(template: ObjectTemplate, centerX: number, centerY: number) {
    const defaults = DEFAULTS[template.type]
    const id = crypto.randomUUID()
    const x = snapToGrid(centerX - defaults.width / 2)
    const y = snapToGrid(centerY - defaults.height / 2)
    return insert({ ...defaults, ...template, id, x, y } as BoardObject)
  }

  // Works for every variant: the copy keeps all attributes except the id.
  function addCopy(source: BoardObject) {
    return insert({ ...source, id: crypto.randomUUID() })
  }

  function removeObject(id: string) {
    objects.value = objects.value.filter(object => object.id !== id)
    cancelPatch(id)
    send('DELETE', `/objects/${id}`)
  }

  function updateObject(id: string, changes: Changes) {
    objects.value = objects.value.map(object => (object.id === id ? ({ ...object, ...changes } as BoardObject) : object))
    queuePatch(id, changes)
  }

  function moveObject(id: string, x: number, y: number) {
    updateObject(id, { x, y })
  }

  function resizeObject(id: string, rect: Rect) {
    updateObject(id, rect)
  }

  function updateText(id: string, text: string) {
    updateObject(id, { text })
  }

  function updateStyle(id: string, changes: StyleChanges) {
    updateObject(id, changes)
  }

  return { objects: readonly(objects), addObject, addCopy, removeObject, moveObject, resizeObject, updateText, updateStyle }
}
