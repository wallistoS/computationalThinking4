import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export type BoardObject = { id: string } & Record<string, unknown>

// The only place that knows where the board is stored. Routes go through the four functions below.
const FILE = fileURLToPath(new URL('../data/board.json', import.meta.url))

function read(): BoardObject[] {
  if (!existsSync(FILE)) write([])
  return JSON.parse(readFileSync(FILE, 'utf8'))
}

// Write to a temp file first, so a crash never leaves a half-written board.
function write(objects: BoardObject[]) {
  writeFileSync(`${FILE}.tmp`, JSON.stringify(objects, null, 2))
  renameSync(`${FILE}.tmp`, FILE)
}

export function listObjects() {
  return read()
}

export function insertObject(object: BoardObject) {
  const objects = read()
  if (objects.some(existing => existing.id === object.id)) return undefined
  write([...objects, object])
  return object
}

export function updateObject(id: string, changes: Record<string, unknown>) {
  const objects = read()
  const existing = objects.find(object => object.id === id)
  if (!existing) return undefined
  const updated = { ...existing, ...changes, id }
  write(objects.map(object => (object.id === id ? updated : object)))
  return updated
}

export function deleteObject(id: string) {
  const objects = read()
  if (!objects.some(object => object.id === id)) return false
  write(objects.filter(object => object.id !== id))
  return true
}
