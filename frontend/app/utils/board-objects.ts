import { type BoardObject, type BoardObjectType, CircleObject, NoteObject, TextObject } from '~/models/board-object'

const SIZES: Record<BoardObjectType, { width: number; height: number }> = {
  note: { width: 192, height: 192 },
  text: { width: 192, height: 72 },
  circle: { width: 144, height: 144 },
}

const CLASSES = { note: NoteObject, text: TextObject, circle: CircleObject }

// Creates a new object centered on the given board position, optionally in a given color.
export function createObject(type: BoardObjectType, centerX: number, centerY: number, color?: string): BoardObject {
  const { width, height } = SIZES[type]
  const x = snapToGrid(centerX - width / 2)
  const y = snapToGrid(centerY - height / 2)
  const object = new CLASSES[type](crypto.randomUUID(), x, y, width, height)
  if (color && 'color' in object) object.color = color
  return object
}
