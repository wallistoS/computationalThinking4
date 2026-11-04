import { Hono } from 'hono'
import type { Context } from 'hono'
import { cors } from 'hono/cors'
import { deleteObject, insertObject, listObjects, updateObject } from './storage'

export const app = new Hono()

// The frontend runs on another port, so the browser only lets it call us if we allow its origin.
app.use('*', cors({ origin: 'http://localhost:3000', allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'] }))

// Returns the parsed body if it is a plain JSON object, otherwise undefined.
async function readBody(c: Context) {
  try {
    const body = await c.req.json()
    return typeof body === 'object' && body !== null && !Array.isArray(body) ? (body as Record<string, unknown>) : undefined
  } catch {
    return undefined
  }
}

app.get('/objects', c => c.json(listObjects(), 200))

app.post('/objects', async (c) => {
  const body = await readBody(c)
  if (!body || typeof body.id !== 'string' || body.id.trim() === '') return c.json({ error: 'id missing' }, 400)
  const object = insertObject({ ...body, id: body.id })
  if (!object) return c.json({ error: 'id already exists' }, 409)
  return c.json(object, 201)
})

app.patch('/objects/:id', async (c) => {
  const body = await readBody(c)
  if (!body) return c.json({ error: 'invalid body' }, 400)
  const object = updateObject(c.req.param('id'), body)
  if (!object) return c.json({ error: 'not found' }, 404)
  return c.json(object, 200)
})

app.delete('/objects/:id', (c) => {
  if (!deleteObject(c.req.param('id'))) return c.json({ error: 'not found' }, 404)
  return c.body(null, 204)
})
