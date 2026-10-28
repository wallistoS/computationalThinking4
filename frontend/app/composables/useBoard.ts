import {
  type BoardObject,
  type BoardObjectType,
  type Corner,
  type Rect,
  type Style,
  CircleObject,
  NoteObject,
  TextObject,
} from '~/models/board-object'

// Central board state: every object lives here and is only changed through the functions below.
const objects = ref<BoardObject[]>([
  new NoteObject('note-1', 120, 120, 192, 192, 'Hello, board!'),
  new TextObject('text-1', 360, 120, 192, 72, 'Ein Textfeld'),
  new CircleObject('circle-1', 600, 120, 144, 144, 'Idee'),
])
const selectedId = ref<string | null>(null)
const selected = computed(() => objects.value.find((object) => object.id === selectedId.value))
let clipboard: BoardObject | null = null

function find(id: string) {
  return objects.value.find((object) => object.id === id)!
}

function select(id: string | null) {
  selectedId.value = id
}

function addObject(type: BoardObjectType, centerX: number, centerY: number, color?: string) {
  const object = createObject(type, centerX, centerY, color)
  objects.value.push(object)
  return object.id
}

function moveObject(id: string, x: number, y: number) {
  find(id).moveTo(x, y)
}

function resizeObject(id: string, start: Rect, corner: Corner, dx: number, dy: number) {
  find(id).resize(start, corner, dx, dy)
}

function setText(id: string, text: string) {
  ;(find(id) as NoteObject | TextObject | CircleObject).text = text
}

function growToFit(id: string, size: number) {
  find(id).growToFit(size)
}

function setStyle(id: string, style: Partial<Style>) {
  Object.assign(find(id), style)
}

function deleteObject(id: string) {
  objects.value = objects.value.filter((object) => object.id !== id)
  if (selectedId.value === id) selectedId.value = null
}

// Places a copy one grid step below and to the right of the original and selects it.
function placeCopy(original: BoardObject) {
  const copy = original.clone(crypto.randomUUID())
  copy.moveTo(original.x + GRID_SIZE, original.y + GRID_SIZE)
  objects.value.push(copy)
  selectedId.value = copy.id
}

function duplicateObject(id: string) {
  placeCopy(find(id))
}

function copyObject(id: string) {
  clipboard = find(id).clone(id)
}

// Each paste lands one step further, so repeated pastes don't stack.
function pasteObject() {
  if (!clipboard) return
  placeCopy(clipboard)
  clipboard.moveTo(clipboard.x + GRID_SIZE, clipboard.y + GRID_SIZE)
}

export function useBoard() {
  return {
    objects: readonly(objects),
    selectedId: readonly(selectedId),
    selected,
    select,
    addObject,
    moveObject,
    resizeObject,
    setText,
    growToFit,
    setStyle,
    deleteObject,
    duplicateObject,
    copyObject,
    pasteObject,
  }
}
