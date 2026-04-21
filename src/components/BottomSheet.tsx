import { useRef, useEffect, memo } from 'react'
import { TRIP_DAYS } from '../data/tripData'

export type SheetState = 'hidden' | 'peek' | 'full'

const PEEK_PX = 240  // px visible from top of sheet in peek state

interface Props {
  state: SheetState
  onStateChange: (s: SheetState) => void
  selectedDay: number | null
  onDaySelect: (d: number) => void
  accentColor: string
  children: React.ReactNode  // DayDetail content
}

export default memo(function BottomSheet({
  state, onStateChange, selectedDay, onDaySelect, accentColor, children,
}: Props) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const g = useRef({
    active: false,
    startX: 0, startY: 0,
    startTranslateY: 0,
    dir: null as 'h' | 'v' | null,
    lastY: 0, lastT: 0, vy: 0,  // velocity tracking
  })

  const snapY = (s: SheetState) => {
    if (s === 'hidden') return window.innerHeight
    if (s === 'peek')   return window.innerHeight - PEEK_PX
    return 0
  }

  const applyY = (y: number, animated: boolean) => {
    const el = sheetRef.current
    if (!el) return
    el.style.transition = animated ? 'transform 0.36s cubic-bezier(0.32,0.72,0,1)' : 'none'
    el.style.transform = `translateY(${y}px)`
  }

  // Snap to state whenever state prop changes
  useEffect(() => { applyY(snapY(state), true) }, [state])

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    g.current = {
      active: true,
      startX: t.clientX, startY: t.clientY,
      startTranslateY: snapY(state),
      dir: null,
      lastY: t.clientY, lastT: Date.now(), vy: 0,
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!g.current.active) return
    const t = e.touches[0]
    const dx = t.clientX - g.current.startX
    const dy = t.clientY - g.current.startY

    if (!g.current.dir && (Math.abs(dx) > 7 || Math.abs(dy) > 7)) {
      g.current.dir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
    }
    if (g.current.dir !== 'v') return

    // Velocity tracking (px/ms)
    const now = Date.now()
    const dt = now - g.current.lastT
    if (dt > 0) g.current.vy = (t.clientY - g.current.lastY) / dt
    g.current.lastY = t.clientY
    g.current.lastT = now

    // Move sheet (no going above 0)
    applyY(Math.max(0, g.current.startTranslateY + dy), false)
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!g.current.active) return
    g.current.active = false

    const t = e.changedTouches[0]
    const dx = t.clientX - g.current.startX
    const dy = t.clientY - g.current.startY

    // Horizontal swipe → navigate days
    if (g.current.dir === 'h') {
      if (dx > 60 && selectedDay && selectedDay > 1) onDaySelect(selectedDay - 1)
      else if (dx < -60 && selectedDay && selectedDay < TRIP_DAYS.length) onDaySelect(selectedDay + 1)
      return
    }

    // Vertical: snap based on velocity + position
    const vy = g.current.vy
    let next: SheetState

    if (vy > 0.6) {
      // Fast downward flick
      next = state === 'full' ? 'peek' : 'hidden'
    } else if (vy < -0.6) {
      // Fast upward flick
      next = 'full'
    } else {
      // Threshold snap
      const finalY = snapY(state) + dy
      const h = window.innerHeight
      if (finalY < h * 0.3)       next = 'full'
      else if (finalY > h * 0.72) next = 'hidden'
      else                         next = 'peek'
    }

    applyY(snapY(next), true)
    onStateChange(next)
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
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        willChange: 'transform',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.7)',
      }}
    >
      {/* ── Drag handle + day nav (gesture zone) ── */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ flexShrink: 0, touchAction: 'none' }}
      >
        {/* Pill */}
        <div style={{ paddingTop: 10, paddingBottom: 8, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }} />
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
        }}>
          {TRIP_DAYS.map(d => (
            <button
              key={d.day}
              onClick={() => onDaySelect(d.day)}
              style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: d.day === selectedDay ? d.color : 'transparent',
                border: `1.5px solid ${d.day === selectedDay ? d.color : d.color + '55'}`,
                color: d.day === selectedDay ? 'white' : d.color,
                fontSize: 9, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >{d.day}</button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          overflowY: state === 'full' ? 'auto' : 'hidden',
          WebkitOverflowScrolling: 'touch',
          padding: '12px 16px 40px',
        }}
      >
        {currentDay && (
          <div key={selectedDay} className="fade-up">
            {children}
          </div>
        )}
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
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: enabled ? `${color}18` : 'transparent',
        border: `1px solid ${enabled ? color + '55' : 'var(--border)'}`,
        color: enabled ? color : 'var(--text-dim)',
        fontSize: 18, lineHeight: 1, cursor: enabled ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}
    >{dir === 'prev' ? '‹' : '›'}</button>
  )
}
