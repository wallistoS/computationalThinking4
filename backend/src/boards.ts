import { Hono } from 'hono'
import { deleteBoard, insertBoard, insertObject, listBoards, listObjects, objectExists, renameBoard } from './storage.js'

// REST routes for the boards, and for the objects that belong to one board.
export const boards = new Hono()

function validName(name: unknown) {
  return typeof name === 'string' && name.trim().length > 0
}

async function boardExists(id: string) {
  return (await listBoards()).some(board => board.id === id)
}

boards.get('/', async c => c.json(await listBoards()))

boards.post('/', async (c) => {
  const { name } = await c.req.json()
  if (!validName(name)) return c.json({ error: 'Board needs a name' }, 400)
  return c.json(await insertBoard(name.trim()), 201)
})

boards.patch('/:id', async (c) => {
  const { name } = await c.req.json()
  if (!validName(name)) return c.json({ error: 'Board needs a name' }, 400)
  const board = await renameBoard(c.req.param('id'), name.trim())
  if (!board) return c.json({ error: 'Board not found' }, 404)
  return c.json(board)
})

boards.delete('/:id', async (c) => {
  const all = await listBoards()
  if (!all.some(board => board.id === c.req.param('id'))) return c.json({ error: 'Board not found' }, 404)
  if (all.length === 1) return c.json({ error: 'The last board cannot be deleted' }, 409)
  await deleteBoard(c.req.param('id'))
  return c.body(null, 204)
})

boards.get('/:id/objects', async (c) => {
  if (!(await boardExists(c.req.param('id')))) return c.json({ error: 'Board not found' }, 404)
  return c.json(await listObjects(c.req.param('id')))
})

boards.post('/:id/objects', async (c) => {
  const object = await c.req.json()
  if (typeof object.id !== 'string') return c.json({ error: 'Object needs an id' }, 400)
  if (!(await boardExists(c.req.param('id')))) return c.json({ error: 'Board not found' }, 404)
  if (await objectExists(object.id)) return c.json({ error: 'An object with this id already exists' }, 409)
  return c.json(await insertObject(c.req.param('id'), object), 201)
})
