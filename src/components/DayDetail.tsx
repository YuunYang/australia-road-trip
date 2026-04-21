import { memo } from 'react'
import { Day } from '../data/tripData'
import Comments from './Comments'

interface Props { day: Day }

export default memo(function DayDetail({ day }: Props) {
  const googleMapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(day.from.nameEn)}/${encodeURIComponent(day.to.nameEn)}/`

  return (
    <div className="fade-up" style={{ paddingBottom: 8 }}>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 14,
        position: 'relative',
        background: `linear-gradient(135deg, ${day.color}28 0%, ${day.color}08 50%, #0b1520 100%)`,
        border: `1px solid ${day.color}33`,
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute',
          top: -30, right: -30,
          width: 120, height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${day.color}22, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ padding: '18px 18px 14px', position: 'relative' }}>
          {/* Day label */}
          <div style={{
            fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: day.color, fontWeight: 500, marginBottom: 6,
          }}>
            Day {day.day} · {day.dateLabel}
          </div>

          {/* Title */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26, fontWeight: 600,
            color: 'var(--sand)',
            lineHeight: 1.15, marginBottom: 4,
          }}>
            {day.title}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 13, color: 'var(--sand-dim)',
            marginBottom: 14,
          }}>
            {day.subtitle}
          </div>

          {/* Route pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 8, padding: '8px 12px',
            fontSize: 11,
          }}>
            <span style={{ color: 'var(--sand)', fontWeight: 500 }}>{day.from.name}</span>
            <div style={{ flex: 1, height: 1, background: `${day.color}44`, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: day.color, fontSize: 10 }}>›</span>
            </div>
            <span style={{ color: 'var(--sand)', fontWeight: 500 }}>{day.to.name}</span>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex',
          borderTop: `1px solid ${day.color}22`,
          background: 'rgba(0,0,0,0.2)',
        }}>
          {[
            { label: '驾驶时长', val: `${day.driveHours}h` },
            { label: '行驶里程', val: `${day.driveKm} km` },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '9px 12px',
              borderRight: i === 0 ? `1px solid ${day.color}22` : 'none',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: day.color }}>{s.val}</div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Google Maps ── */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '10px',
          background: 'linear-gradient(90deg, #1a5fb4, #1a73e8)',
          borderRadius: 9, color: 'white',
          fontSize: 12, fontWeight: 500,
          textDecoration: 'none', marginBottom: 10,
          letterSpacing: '0.02em',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        在 Google Maps 中导航
      </a>

      {/* ── Highlights ── */}
      <Section title="今日亮点" accent={day.color}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {day.highlights.map((h, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '7px 0',
              borderBottom: i < day.highlights.length - 1 ? '1px solid var(--border)' : 'none',
              fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5,
            }}>
              <span style={{
                width: 4, height: 4, borderRadius: '50%',
                background: day.color, flexShrink: 0, marginTop: 6,
              }} />
              {h}
            </div>
          ))}
        </div>
      </Section>

      {/* ── Climbing ── */}
      {day.climbingInfo && (
        <Section title="🧗 攀岩详情" accent="#96CEB4">
          <div style={{
            fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.8,
            fontFamily: 'var(--font-body)',
          }}>{day.climbingInfo}</div>
        </Section>
      )}

      {/* ── Accommodation ── */}
      <Section title="住宿推荐" accent={day.color}>
        <div style={{ marginBottom: 10 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15, fontWeight: 600, color: 'var(--sand)', marginBottom: 3,
          }}>{day.accommodation.area}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
            {day.accommodation.description}
          </div>
          <a
            href={day.accommodation.airbnbUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 14px',
              background: 'linear-gradient(90deg, #d93025, #FF5A5F)',
              borderRadius: 8, color: 'white',
              fontSize: 11, fontWeight: 500,
              textDecoration: 'none', letterSpacing: '0.02em',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <AirbnbIcon />
            搜索 Airbnb 住宿
          </a>
        </div>
      </Section>

      {/* ── Comments ── */}
      <Section title="💬 留言板" accent={day.color}>
        <Comments day={day.day} accent={day.color} />
      </Section>

      {/* ── Charging ── */}
      <Section title="充电 / 加油" accent={day.color}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {day.charging.map((c, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10,
              padding: '7px 0',
              borderBottom: i < day.charging.length - 1 ? '1px solid var(--border)' : 'none',
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>
                {c.type === 'ev' ? '⚡' : '⛽'}
              </span>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>{c.address}</div>
                <div style={{ fontSize: 10, color: c.type === 'ev' ? 'var(--ocean)' : 'var(--gold)', marginTop: 2 }}>
                  {c.distance}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
})

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '12px 14px',
      marginBottom: 10,
    }}>
      <div style={{
        fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: accent, fontWeight: 500,
        marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 14, height: 1, background: accent, opacity: 0.6 }} />
        {title}
      </div>
      {children}
    </div>
  )
}

function AirbnbIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 32 32" fill="white">
      <path d="M16 1C8.8 1 3 6.8 3 14c0 5.6 3.4 10.4 8.2 12.6L16 31l4.8-4.4C25.6 24.4 29 19.6 29 14c0-7.2-5.8-13-13-13zm0 20c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z"/>
    </svg>
  )
}
