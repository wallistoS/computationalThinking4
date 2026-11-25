import { fileURLToPath } from 'node:url'

// The backend treats objects as plain JSON; it only relies on every object having an id.
export type BoardObject = { id: string } & Record<string, unknown>
export type Board = { id: string; name: string }

// tsx does not read .env by itself, so load it here (the file sits next to src/).
try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)))
} catch {
  // No .env file: the variables must already be set in the environment.
}

const KEY = process.env.SUPABASE_SECRET_KEY ?? ''
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

async function request(table: string, query: string, init: RequestInit = {}) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/${table}${query}`
  const response = await fetch(url, { ...init, headers: { ...HEADERS, Prefer: 'return=representation' } })
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`)
  return response.json()
}

const byId = (id: string) => `?id=eq.${encodeURIComponent(id)}`

// ---- Boards ----

export async function listBoards(): Promise<Board[]> {
  return request('boards', '?select=id,name&order=created_at')
}

export async function insertBoard(name: string): Promise<Board> {
  const [board] = await request('boards', '?select=id,name', { method: 'POST', body: JSON.stringify({ name }) })
  return board
}

export async function renameBoard(id: string, name: string): Promise<Board | undefined> {
  const [board] = await request('boards', `${byId(id)}&select=id,name`, { method: 'PATCH', body: JSON.stringify({ name }) })
  return board
}

// Deleting a board also deletes its objects (the database cascades).
export async function deleteBoard(id: string) {
  return (await request('boards', byId(id), { method: 'DELETE' })).length > 0
}

// ---- Objects ----

// Only these fields can be written by clients; id, board_id and created_at are set by the backend.
// The frontend says fontSize, the table says font_size. The integer columns need whole numbers.
const FIELDS = ['type', 'x', 'y', 'width', 'height', 'text', 'fontSize', 'bold', 'color']
const INTEGERS = ['x', 'y', 'width', 'height', 'fontSize']

function toRow(object: Record<string, unknown>) {
  const row: Record<string, unknown> = {}
  for (const key of FIELDS) {
    if (!(key in object)) continue
    const value = object[key]
    row[key === 'fontSize' ? 'font_size' : key] = INTEGERS.includes(key) && typeof value === 'number' ? Math.round(value) : value
  }
  return row
}

// Columns that are empty (a circle has no text) are left out, like in the old JSON file.
function toObject(row: Record<string, unknown>): BoardObject {
  const { font_size, created_at, board_id, ...rest } = row
  const object = { ...rest, fontSize: font_size } as Record<string, unknown>
  for (const key of Object.keys(object)) if (object[key] === null || object[key] === undefined) delete object[key]
  return object as BoardObject
}

export async function listObjects(boardId: string): Promise<BoardObject[]> {
  const rows: Record<string, unknown>[] = await request('objects', `?board_id=eq.${encodeURIComponent(boardId)}&order=created_at`)
  return rows.map(toObject)
}

export async function objectExists(id: string) {
  return (await request('objects', `${byId(id)}&select=id`)).length > 0
}

export async function insertObject(boardId: string, object: BoardObject) {
  const body = { ...toRow(object), id: object.id, board_id: boardId }
  const [row] = await request('objects', '', { method: 'POST', body: JSON.stringify(body) })
  return toObject(row)
}

export async function updateObject(id: string, changes: Record<string, unknown>) {
  const row = toRow(changes)
  // Nothing allowed to change: just return the object as it is.
  const init = Object.keys(row).length ? { method: 'PATCH', body: JSON.stringify(row) } : {}
  const [result] = await request('objects', byId(id), init)
  return result ? toObject(result) : undefined
}

export async function deleteObject(id: string) {
  return (await request('objects', byId(id), { method: 'DELETE' })).length > 0
}
