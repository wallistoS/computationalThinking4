import { GRID_SIZE, snapToGrid } from '~/utils/grid'

export type BoardObjectType = 'note' | 'text' | 'circle'
export type Corner = 'nw' | 'ne' | 'sw' | 'se'
export type Editor = 'color' | 'fontSize' | 'bold'
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}
export interface Style {
  color: string
  fontSize: number
  bold: boolean
}

export const NOTE_COLORS = ['#fef08a', '#fbcfe8', '#bbf7d0']
export const CIRCLE_COLORS = ['#bae6fd', '#ddd6fe', '#fed7aa']

const MIN_SIZE = GRID_SIZE * 3

// Base class: everything on the board has a position and a size and can move and resize.
export abstract class BoardObject {
  abstract readonly type: BoardObjectType
  // Which editors the context bar shows for this variant.
  abstract readonly editors: Editor[]
  readonly keepSquare: boolean = false
  fontSize = 18
  bold = false
  // Whether the object gets an outline while selected.
  border = true

  constructor(
    readonly id: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}

  rect(): Rect {
    return { x: this.x, y: this.y, width: this.width, height: this.height }
  }

  moveTo(x: number, y: number) {
    this.x = snapToGrid(x)
    this.y = snapToGrid(y)
  }

  // Resizing from a north or west corner moves the object so the opposite corner stays put.
  resize(start: Rect, corner: Corner, dx: number, dy: number) {
    let width = Math.max(MIN_SIZE, snapToGrid(start.width + (corner.endsWith('e') ? dx : -dx)))
    let height = Math.max(MIN_SIZE, snapToGrid(start.height + (corner.startsWith('s') ? dy : -dy)))
    if (this.keepSquare) width = height = Math.max(width, height)
    this.width = width
    this.height = height
    this.x = corner.endsWith('w') ? start.x + start.width - width : start.x
    this.y = corner.startsWith('n') ? start.y + start.height - height : start.y
  }

  // Grows the object when its content needs more height than it has.
  growToFit(contentHeight: number) {
    if (contentHeight > this.height) this.height = contentHeight
  }

  // Copies the object with all its fields, keeping its variant.
  clone(id: string): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, { id })
  }
}

export class NoteObject extends BoardObject {
  readonly type = 'note'
  readonly editors: Editor[] = ['color', 'fontSize', 'bold']
  readonly palette = NOTE_COLORS
  border = false
  color = NOTE_COLORS[0]!

  constructor(id: string, x: number, y: number, width: number, height: number, public text = '') {
    super(id, x, y, width, height)
  }
}

export class TextObject extends BoardObject {
  readonly type = 'text'
  readonly editors: Editor[] = ['fontSize', 'bold']

  constructor(id: string, x: number, y: number, width: number, height: number, public text = '') {
    super(id, x, y, width, height)
  }
}

export class CircleObject extends BoardObject {
  readonly type = 'circle'
  readonly keepSquare = true
  readonly editors: Editor[] = ['color', 'fontSize', 'bold']
  readonly palette = CIRCLE_COLORS
  color = CIRCLE_COLORS[0]!

  constructor(id: string, x: number, y: number, width: number, height: number, public text = '') {
    super(id, x, y, width, height)
  }

  // A circle grows in both directions so it stays round.
  growToFit(contentSize: number) {
    if (contentSize > this.height) this.width = this.height = contentSize
  }
}
