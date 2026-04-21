import { memo } from 'react'
import { Day } from '../data/tripData'

interface Props {
  day: Day
  isSelected: boolean
  onClick: () => void
}

export default memo(function DayCard({ day, isSelected, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        border: `1px solid ${isSelected ? day.color + '55' : 'var(--border)'}`,
        background: isSelected
          ? `linear-gradient(105deg, ${day.color}14 0%, transparent 100%)`
          : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
      }}
      onMouseLeave={e => {
        if (!isSelected) e.currentTarget.style.background = 'transparent'
      }}
    >
      {/* Active indicator bar */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 2,
          background: `linear-gradient(to bottom, ${day.color}, ${day.color}44)`,
          borderRadius: '2px 0 0 2px',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Day number */}
        <div style={{
          width: 26, height: 26,
          borderRadius: '50%',
          background: isSelected ? day.color : 'transparent',
          border: `1px solid ${isSelected ? day.color : day.color + '55'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 12, fontWeight: 600,
          color: isSelected ? 'white' : day.color,
          flexShrink: 0,
          transition: 'all 0.22s ease',
        }}>
          {day.day}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14, fontWeight: isSelected ? 600 : 400,
            color: isSelected ? 'var(--sand)' : 'var(--text-primary)',
            transition: 'color 0.22s',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}>
            {day.title}
          </div>
          <div style={{
            fontSize: 10, color: 'var(--text-dim)',
            marginTop: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {day.dateLabel}
          </div>
        </div>

        {/* km pill */}
        <div style={{
          fontSize: 9,
          letterSpacing: '0.05em',
          color: isSelected ? day.color : 'var(--text-dim)',
          flexShrink: 0,
          transition: 'color 0.22s',
        }}>
          {day.driveKm}km
        </div>
      </div>
    </div>
  )
})
