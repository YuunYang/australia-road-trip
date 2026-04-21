import { useRef, useEffect, memo, useCallback } from 'react'
import { TRIP_DAYS } from '../data/tripData'

export type SheetState = 'hidden' | 'peek' | 'full'

const PEEK_PX = 240   // visible height from top of sheet in peek state
const H_THRESHOLD = 50 // px — horizontal swipe trigger

interface Props {
  state: SheetState
  onStateChange: (s: SheetState) => void
  selectedDay: number | null
  onDaySelect: (d: number) => void
  accentColor: string
  children: React.ReactNode
}

export default memo(function BottomSheet({
  state, onStateChange, selectedDay, onDaySelect, accentColor, children,
}: Props) {
  const sheetRef   = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const rafRef     = useRef<number | null>(null)
  const pendingY   = useRef<number | null>(null)

  // gesture state lives in a ref so touch handlers don't cause re-renders
  const g = useRef({
    active: false,
    kind: 'handle' as 'handle' | 'content',
    startX: 0, startY: 0,
    startTranslateY: 0,
    dir: null as 'h' | 'v' | null,
    lastY: 0, lastT: 0, vy: 0,
    contentScrollTop: 0,
  })

  const snapY = useCallback((s: SheetState) => {
    if (s === 'hidden') return window.innerHeight
    if (s === 'peek')   return window.innerHeight - PEEK_PX
    return 0
  }, [])

  // Schedule transform via rAF to coalesce multiple touchmove events into 1 frame.
  const flushTransform = useCallback((animated: boolean) => {
    const el = sheetRef.current
    if (!el || pendingY.current == null) return
    el.style.transition = animated ? 'transform 0.36s cubic-bezier(0.32,0.72,0,1)' : 'none'
    el.style.transform  = `translate3d(0, ${pendingY.current}px, 0)`
    pendingY.current = null
  }, [])

  const applyY = useCallback((y: number, animated: boolean) => {
    pendingY.current = y
    if (animated) {
      // animations can be applied immediately — no need to schedule
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      flushTransform(true)
      return
    }
    if (rafRef.current != null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      flushTransform(false)
    })
  }, [flushTransform])

  // Snap to state whenever state prop changes
  useEffect(() => { applyY(snapY(state), true) }, [state, applyY, snapY])

  // Reset scroll on day change so new day starts at top
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 })
  }, [selectedDay])

  // ── Handle-zone gestures (drag + swipe) ───────────────────────────
  const startHandle = (t: React.Touch) => {
    g.current = {
      active: true, kind: 'handle',
      startX: t.clientX, startY: t.clientY,
      startTranslateY: snapY(state),
      dir: null,
      lastY: t.clientY, lastT: performance.now(), vy: 0,
      contentScrollTop: 0,
    }
  }

  const onHandleTouchStart = (e: React.TouchEvent) => startHandle(e.touches[0])

  const onHandleTouchMove = (e: React.TouchEvent) => {
    if (!g.current.active || g.current.kind !== 'handle') return
    const t = e.touches[0]
    const dx = t.clientX - g.current.startX
    const dy = t.clientY - g.current.startY

    if (!g.current.dir && (Math.abs(dx) > 7 || Math.abs(dy) > 7)) {
      g.current.dir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
    }
    if (g.current.dir !== 'v') return

    const now = performance.now()
    const dt = now - g.current.lastT
    if (dt > 0) g.current.vy = (t.clientY - g.current.lastY) / dt
    g.current.lastY = t.clientY; g.current.lastT = now

    applyY(Math.max(0, g.current.startTranslateY + dy), false)
  }

  const onHandleTouchEnd = (e: React.TouchEvent) => {
    if (!g.current.active || g.current.kind !== 'handle') return
    g.current.active = false
    const t = e.changedTouches[0]
    const dx = t.clientX - g.current.startX
    const dy = t.clientY - g.current.startY

    if (g.current.dir === 'h') {
      if (dx > H_THRESHOLD && selectedDay && selectedDay > 1)                   onDaySelect(selectedDay - 1)
      else if (dx < -H_THRESHOLD && selectedDay && selectedDay < TRIP_DAYS.length) onDaySelect(selectedDay + 1)
      return
    }
    if (g.current.dir !== 'v') return

    const vy = g.current.vy
    let next: SheetState

    if (vy > 0.6)      next = state === 'full' ? 'peek' : 'hidden'
    else if (vy < -0.6) next = 'full'
    else {
      const finalY = snapY(state) + dy
      const h = window.innerHeight
      if (finalY < h * 0.3)       next = 'full'
      else if (finalY > h * 0.72) next = 'hidden'
      else                         next = 'peek'
    }

    if (next === state) applyY(snapY(state), true) // snap back in-place
    else onStateChange(next)                        // parent state change triggers snap via effect
  }

  // ── Content-zone gestures (horizontal swipe nav + pull-down-to-collapse) ──
  const onContentTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    g.current = {
      active: true, kind: 'content',
      startX: t.clientX, startY: t.clientY,
      startTranslateY: snapY(state),
      dir: null,
      lastY: t.clientY, lastT: performance.now(), vy: 0,
      contentScrollTop: contentRef.current?.scrollTop ?? 0,
    }
  }

  const onContentTouchMove = (e: React.TouchEvent) => {
    if (!g.current.active || g.current.kind !== 'content') return
    const t = e.touches[0]
    const dx = t.clientX - g.current.startX
    const dy = t.clientY - g.current.startY

    if (!g.current.dir && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      g.current.dir = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'h' : 'v'
    }

    // If user drags down while content is at top and we're in full mode,
    // start collapsing the sheet instead of rubber-banding.
    if (g.current.dir === 'v' && state === 'full' && g.current.contentScrollTop <= 0 && dy > 0) {
      const now = performance.now()
      const dt = now - g.current.lastT
      if (dt > 0) g.current.vy = (t.clientY - g.current.lastY) / dt
      g.current.lastY = t.clientY; g.current.lastT = now
      applyY(Math.max(0, dy), false)
    }
  }

  const onContentTouchEnd = (e: React.TouchEvent) => {
    if (!g.current.active || g.current.kind !== 'content') return
    g.current.active = false
    const t = e.changedTouches[0]
    const dx = t.clientX - g.current.startX
    const dy = t.clientY - g.current.startY

    if (g.current.dir === 'h' && Math.abs(dx) > H_THRESHOLD) {
      if (dx > 0 && selectedDay && selectedDay > 1)                         onDaySelect(selectedDay - 1)
      else if (dx < 0 && selectedDay && selectedDay < TRIP_DAYS.length)     onDaySelect(selectedDay + 1)
      return
    }

    // Finish pull-down collapse
    if (state === 'full' && g.current.contentScrollTop <= 0 && dy > 0) {
      const vy = g.current.vy
      let next: SheetState = 'full'
      if (vy > 0.6 || dy > 200) next = 'peek'
      if (next === state) applyY(snapY(state), true)
      else onStateChange(next)
    }
  }

  const currentDay = selectedDay ? TRIP_DAYS[selectedDay - 1] : null

  return (
    <div
      ref={sheetRef}
      style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        height: '100dvh',
        background: 'var(--bg-panel)',
        borderRadius: '18px 18px 0 0',
        borderTop: `1px solid ${accentColor}55`,
        zIndex: 2000,  // must beat Leaflet's control/pane z-indexes (up to 1000)
        display: 'flex',
        flexDirection: 'column',
        willChange: 'transform',
        transform: 'translate3d(0,100%,0)',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.7)',
        contain: 'layout paint style',
        // When hidden, let taps go to the map
        pointerEvents: state === 'hidden' ? 'none' : 'auto',
      }}
    >
      {/* ── Drag handle + day nav (primary gesture zone) ── */}
      <div
        onTouchStart={onHandleTouchStart}
        onTouchMove={onHandleTouchMove}
        onTouchEnd={onHandleTouchEnd}
        style={{ flexShrink: 0, touchAction: 'none' }}
      >
        {/* Pill */}
        <div style={{ paddingTop: 10, paddingBottom: 8, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.22)' }} />
        </div>

        {/* Day navigation row */}
        <div style={{ padding: '0 14px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <NavArrow
            dir="prev"
            enabled={!!selectedDay && selectedDay > 1}
            color={accentColor}
            onClick={() => selectedDay && selectedDay > 1 && onDaySelect(selectedDay - 1)}
          />

          {currentDay ? (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: accentColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                  {currentDay.day}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16, fontWeight: 600,
                  color: 'var(--sand)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {currentDay.title}
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', paddingLeft: 30 }}>
                {currentDay.dateLabel} · {currentDay.driveHours}h · {currentDay.driveKm}km
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--text-dim)' }}>
              点击地图标记查看行程
            </div>
          )}

          <NavArrow
            dir="next"
            enabled={!!selectedDay && selectedDay < TRIP_DAYS.length}
            color={accentColor}
            onClick={() => selectedDay && selectedDay < TRIP_DAYS.length && onDaySelect(selectedDay + 1)}
          />
        </div>

        {/* Mini day dots */}
        <div style={{
          display: 'flex', gap: 5,
          overflowX: 'auto', padding: '4px 14px 12px',
          scrollbarWidth: 'none',
          borderBottom: '1px solid var(--border)',
          WebkitOverflowScrolling: 'touch',
        }}>
          {TRIP_DAYS.map(d => {
            const selected = d.day === selectedDay
            return (
              <button
                key={d.day}
                onClick={() => onDaySelect(d.day)}
                style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: selected ? d.color : 'transparent',
                  border: `1.5px solid ${selected ? d.color : d.color + '55'}`,
                  color: selected ? 'white' : d.color,
                  fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0, lineHeight: 1,
                }}
              >{d.day}</button>
            )
          })}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div
        ref={contentRef}
        onTouchStart={onContentTouchStart}
        onTouchMove={onContentTouchMove}
        onTouchEnd={onContentTouchEnd}
        style={{
          flex: 1,
          overflowY: state === 'full' ? 'auto' : 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          padding: '12px 16px 40px',
          // Allow vertical scroll via browser, horizontal swipe intercepted by JS
          touchAction: state === 'full' ? 'pan-y' : 'none',
        }}
      >
        {currentDay && children}
      </div>
    </div>
  )
})

function NavArrow({ dir, enabled, color, onClick }: {
  dir: 'prev' | 'next'; enabled: boolean; color: string; onClick: () => void
}) {
  return (
    <button
      onClick={enabled ? onClick : undefined}
      style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: enabled ? `${color}18` : 'transparent',
        border: `1px solid ${enabled ? color + '55' : 'var(--border)'}`,
        color: enabled ? color : 'var(--text-dim)',
        fontSize: 20, lineHeight: 1, cursor: enabled ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 0,
      }}
    >{dir === 'prev' ? '‹' : '›'}</button>
  )
}
