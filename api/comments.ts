export const config = { runtime: 'edge' }

// These env vars are set automatically when you connect a Vercel KV /
// Upstash Redis store to the project.
const KV_URL   = process.env.KV_REST_API_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN

interface CommentEntry {
  id: string
  day: number
  name: string
  message: string
  ts: number
}

async function kvCmd<T = unknown>(command: (string | number)[]): Promise<T> {
  if (!KV_URL || !KV_TOKEN) throw new Error('KV_NOT_CONFIGURED')
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(command),
  })
  if (!res.ok) throw new Error(`KV ${res.status}: ${await res.text()}`)
  const j = await res.json() as { result: T }
  return j.result
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  })
}

function sanitize(s: unknown, max: number): string {
  // Strip control chars but keep newlines and tabs so multi-line messages survive.
  const stripCtrl = (c: string) => {
    const code = c.charCodeAt(0)
    if (code === 9 || code === 10 || code === 13) return c
    if (code < 32 || code === 127) return ''
    return c
  }
  return Array.from(String(s ?? '')).map(stripCtrl).join('').trim().slice(0, max)
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)

  try {
    if (req.method === 'GET') {
      const dayParam = url.searchParams.get('day')
      const day = Number(dayParam)
      if (!dayParam || !Number.isInteger(day) || day < 1 || day > 99) {
        return json({ error: 'invalid day' }, { status: 400 })
      }
      const raw = await kvCmd<string[]>(['LRANGE', `comments:day:${day}`, 0, -1])
      const items: CommentEntry[] = (raw ?? []).map(s => {
        try { return JSON.parse(s) as CommentEntry } catch { return null }
      }).filter((x): x is CommentEntry => !!x)
      return json(items)
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => null) as { day?: unknown; name?: unknown; message?: unknown } | null
      if (!body) return json({ error: 'invalid body' }, { status: 400 })
      const day = Number(body.day)
      const name    = sanitize(body.name, 40)
      const message = sanitize(body.message, 500)
      if (!Number.isInteger(day) || day < 1 || day > 99) return json({ error: 'invalid day' }, { status: 400 })
      if (!name || !message) return json({ error: 'name and message required' }, { status: 400 })

      const entry: CommentEntry = {
        id: crypto.randomUUID(),
        day, name, message, ts: Date.now(),
      }
      await kvCmd(['RPUSH', `comments:day:${day}`, JSON.stringify(entry)])
      // Cap the list to the most recent 200 entries per day.
      await kvCmd(['LTRIM', `comments:day:${day}`, -200, -1])
      return json(entry, { status: 201 })
    }

    return json({ error: 'method not allowed' }, { status: 405 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    if (msg === 'KV_NOT_CONFIGURED') {
      return json({ error: 'storage not configured' }, { status: 503 })
    }
    return json({ error: msg }, { status: 500 })
  }
}
