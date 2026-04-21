import { useState, useCallback, useRef, memo } from 'react'
import MapView from './components/MapView'
import DayCard from './components/DayCard'
import DayDetail from './components/DayDetail'
import BottomSheet, { SheetState } from './components/BottomSheet'
import { TRIP_DAYS } from './data/tripData'
import { useWindowSize } from './hooks/useWindowSize'

export default function App() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [sheetState, setSheetState] = useState<SheetState>('hidden')
  const detailRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useWindowSize()

  const handleDaySelect = useCallback((day: number) => {
    setSelectedDay(day)
    // Only open to peek if the sheet was hidden — if user is in 'full' reading
    // details, navigating to another day should keep them in 'full'.
    setSheetState(prev => (prev === 'hidden' ? 'peek' : prev))
    detailRef.current?.scrollTo({ top: 0 })
  }, [])

  const handleSheetStateChange = useCallback((s: SheetState) => {
    setSheetState(s)
    if (s === 'hidden') setSelectedDay(null)
  }, [])

  const currentDay = selectedDay ? TRIP_DAYS[selectedDay - 1] : null
  const totalKm = TRIP_DAYS.reduce((s, d) => s + d.driveKm, 0)

  return isMobile
    ? <MobileLayout
        selectedDay={selectedDay}
        sheetState={sheetState}
        currentDay={currentDay}
        onDaySelect={handleDaySelect}
        onSheetStateChange={handleSheetStateChange}
      />
    : <DesktopLayout
        selectedDay={selectedDay}
        currentDay={currentDay}
        totalKm={totalKm}
        detailRef={detailRef}
        onDaySelect={handleDaySelect}
        onClose={() => { setSelectedDay(null); setSheetState('hidden') }}
      />
}

// ─── Mobile ──────────────────────────────────────────────────────────

function MobileLayout({ selectedDay, sheetState, currentDay, onDaySelect, onSheetStateChange }: {
  selectedDay: number | null
  sheetState: SheetState
  currentDay: typeof TRIP_DAYS[0] | null
  onDaySelect: (d: number) => void
  onSheetStateChange: (s: SheetState) => void
}) {
  return (
    <div style={{ position: 'relative', height: '100dvh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Full-screen map */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <MapView selectedDay={selectedDay} onDaySelect={onDaySelect} />
      </div>

      {/* Map hint when nothing selected */}
      {!selectedDay && (
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(11,21,32,0.88)', border: '1px solid var(--border-warm)',
          borderRadius: 20, padding: '8px 18px',
          backdropFilter: 'blur(10px)', zIndex: 1500, whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 11, color: 'var(--sand)', fontFamily: 'var(--font-display)' }}>
            点击地图标记或路线查看行程
          </div>
        </div>
      )}

      {/* Bottom sheet — always rendered, position driven by state */}
      <BottomSheet
        state={sheetState}
        onStateChange={onSheetStateChange}
        selectedDay={selectedDay}
        onDaySelect={onDaySelect}
        accentColor={currentDay?.color ?? 'var(--gold)'}
      >
        {currentDay && <DayDetail day={currentDay} />}
      </BottomSheet>
    </div>
  )
}

// ─── Desktop ──────────────────────────────────────────────────────────

function DesktopLayout({ selectedDay, currentDay, totalKm, detailRef, onDaySelect, onClose }: {
  selectedDay: number | null
  currentDay: typeof TRIP_DAYS[0] | null
  totalKm: number
  detailRef: React.RefObject<HTMLDivElement | null>
  onDaySelect: (d: number) => void
  onClose: () => void
}) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <DesktopSidebar selectedDay={selectedDay} totalKm={totalKm} onDaySelect={onDaySelect} />
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView selectedDay={selectedDay} onDaySelect={onDaySelect} />
        {!selectedDay && (
          <div style={{
            position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(11,21,32,0.88)', border: '1px solid var(--border-warm)',
            borderRadius: 10, padding: '10px 22px', textAlign: 'center',
            backdropFilter: 'blur(12px)', pointerEvents: 'none', zIndex: 999, whiteSpace: 'nowrap',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--sand)' }}>
              悉尼 · 南海岸 · 威尔逊海角 · 墨尔本
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4, letterSpacing: '0.08em' }}>
              SELECT A DAY TO EXPLORE THE ROUTE
            </div>
          </div>
        )}
      </div>
      {currentDay && (
        <div style={{
          width: 340, flexShrink: 0,
          borderLeft: '1px solid var(--border-warm)',
          background: 'var(--bg-panel)',
          display: 'flex', flexDirection: 'column',
          zIndex: 10, animation: 'slideRight 0.3s ease',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Day {currentDay.day} · 行程详情
            </div>
            <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-dim)', fontSize: 11, cursor: 'pointer', padding: '3px 9px', letterSpacing: '0.05em' }}>
              ESC ✕
            </button>
          </div>
          <div ref={detailRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            <DayDetail day={currentDay} />
          </div>
        </div>
      )}
    </div>
  )
}

const DesktopSidebar = memo(function DesktopSidebar({ selectedDay, totalKm, onDaySelect }: {
  selectedDay: number | null; totalKm: number; onDaySelect: (d: number) => void
}) {
  return (
    <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-warm)', background: 'var(--bg-panel)', zIndex: 10 }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(160deg, #162438 0%, #0b1520 60%, #0e1a18 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,98,45,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8, fontWeight: 500 }}>Australia Road Trip · 2026</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--sand)', lineHeight: 1.2, marginBottom: 4 }}>悉尼 → 墨尔本</div>
        <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--sand-dim)' }}>南海岸 · 威尔逊海角 · 大洋路</div>
        <div style={{ display: 'flex', gap: 0, marginTop: 16, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {[{ val: '10', unit: '天', label: '自驾行程' }, { val: `${totalKm}`, unit: 'km', label: '总里程' }, { val: '1', unit: '日', label: 'Day 4 攀岩' }].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '9px 8px', textAlign: 'center', background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--gold)', lineHeight: 1 }}>{s.val}<span style={{ fontSize: 11, fontFamily: 'var(--font-body)', color: 'var(--sand-dim)', marginLeft: 2 }}>{s.unit}</span></div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 3, letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-dim)' }}>
          <span style={{ color: 'var(--ocean)', fontSize: 11 }}>✈</span>
          <span>TR14 SIN→SYD · 5/22 落地</span>
          <span style={{ color: 'var(--border-warm)' }}>·</span>
          <span>TR59 MEL→SIN · 6/1 离港</span>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 4, paddingLeft: 2 }}>
          行程日历 — 点击查看详情
        </div>
        {TRIP_DAYS.map(day => (
          <DayCard key={day.day} day={day} isSelected={selectedDay === day.day} onClick={() => onDaySelect(day.day)} />
        ))}
        <div style={{ height: 8 }} />
      </div>
    </div>
  )
})
