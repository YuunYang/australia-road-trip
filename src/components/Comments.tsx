import { useEffect, useRef, useState, useCallback, memo } from 'react'

interface CommentEntry {
  id: string
  day: number
  name: string
  message: string
  ts: number
}

interface Props {
  day: number
  accent: string
}

type LoadState = 'loading' | 'ok' | 'offline' | 'error'

// Remember the name locally so returning users don't have to retype it.
const NAME_KEY = 'roadtrip.commentName'

export default memo(function Comments({ day, accent }: Props) {
  const [list, setList]       = useState<CommentEntry[]>([])
  const [status, setStatus]   = useState<LoadState>('loading')
  const [name, setName]       = useState(() => localStorage.getItem(NAME_KEY) ?? '')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const reqIdRef = useRef(0)

  const load = useCallback(async (d: number) => {
    const reqId = ++reqIdRef.current
    setStatus('loading'); setError(null)
    try {
      const res = await fetch(`/api/comments?day=${d}`, { cache: 'no-store' })
      if (reqId !== reqIdRef.current) return  // stale
      if (res.status === 503) { setStatus('offline'); setList([]); return }
      const ct = res.headers.get('content-type') ?? ''
      if (!ct.includes('application/json')) {
        // Likely the vite dev SPA fallback returning index.html — API not running.
        setStatus('offline'); setList([])
        return
      }
      if (!res.ok) throw new Error(`${res.status}`)
      const data = (await res.json()) as CommentEntry[]
      if (reqId !== reqIdRef.current) return
      setList(Array.isArray(data) ? data : [])
      setStatus('ok')
    } catch (e: unknown) {
      if (reqId !== reqIdRef.current) return
      setStatus('error')
      setError(e instanceof Error ? e.message : 'load failed')
    }
  }, [])

  useEffect(() => { load(day) }, [day, load])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedMsg  = message.trim()
    if (!trimmedName || !trimmedMsg || sending) return

    setSending(true); setError(null)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ day, name: trimmedName, message: trimmedMsg }),
      })
      if (res.status === 503) { setStatus('offline'); setError('留言服务未配置'); return }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `${res.status}`)
      }
      const saved = (await res.json()) as CommentEntry
      setList(prev => [...prev, saved])
      setMessage('')
      localStorage.setItem(NAME_KEY, trimmedName)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '提交失败')
    } finally {
      setSending(false)
    }
  }

  const canSubmit = name.trim().length > 0 && message.trim().length > 0 && !sending && status !== 'offline'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* ── Existing comments ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {status === 'loading' && (
          <div style={{ fontSize: 11, color: 'var(--text-dim)', padding: '4px 0' }}>加载中…</div>
        )}
        {status === 'offline' && (
          <div style={{ fontSize: 11, color: 'var(--sand-dim)', lineHeight: 1.6 }}>
            留言功能需部署到 Vercel 并连接 KV / Upstash Redis Store 后启用。
            <br />本地调试请用 <code style={{ fontFamily: 'monospace' }}>vercel dev</code>。
          </div>
        )}
        {status === 'error' && (
          <div style={{ fontSize: 11, color: '#e07040' }}>加载失败: {error ?? 'unknown'}</div>
        )}
        {status === 'ok' && list.length === 0 && (
          <div style={{ fontSize: 11, color: 'var(--text-dim)', padding: '4px 0' }}>
            还没有留言。来写第一条吧 ✨
          </div>
        )}
        {list.map(c => (
          <div key={c.id} style={{
            padding: '9px 11px',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            borderLeft: `2px solid ${accent}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--sand)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%',
              }}>{c.name}</span>
              <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                {formatTs(c.ts)}
              </span>
            </div>
            <div style={{
              fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.55,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>{c.message}</div>
          </div>
        ))}
      </div>

      {/* ── Compose form ── */}
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="昵称"
          maxLength={40}
          disabled={status === 'offline'}
          style={inputStyle}
        />
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={`留言给 Day ${day}…`}
          rows={3}
          maxLength={500}
          disabled={status === 'offline'}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 64, lineHeight: 1.5 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
            {error ? <span style={{ color: '#e07040' }}>{error}</span> : `${message.length}/500`}
          </span>
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              padding: '7px 16px', borderRadius: 8,
              background: canSubmit ? accent : 'rgba(255,255,255,0.05)',
              color: canSubmit ? 'white' : 'var(--text-dim)',
              border: `1px solid ${canSubmit ? accent : 'var(--border)'}`,
              fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
              cursor: canSubmit ? 'pointer' : 'default',
              transition: 'opacity 0.18s',
              opacity: sending ? 0.6 : 1,
            }}
          >{sending ? '发送中…' : '发送'}</button>
        </div>
      </form>
    </div>
  )
})

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  background: 'rgba(0,0,0,0.28)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  outline: 'none',
}

function formatTs(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diffMin = Math.floor((now.getTime() - ts) / 60000)
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}小时前`
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
