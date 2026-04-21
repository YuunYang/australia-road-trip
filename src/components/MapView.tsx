import { useEffect, useRef, useCallback, memo } from 'react'
import L from 'leaflet'
import { TRIP_DAYS, FULL_ROUTE_COORDS } from '../data/tripData'

interface Props {
  selectedDay: number | null
  onDaySelect: (day: number) => void
}

const markerHtml = (color: string, num: number, active: boolean) => `
  <div style="
    width:${active ? 34 : 26}px;height:${active ? 34 : 26}px;
    background:${color};
    border:${active ? '3px solid #fff' : '2px solid rgba(255,255,255,0.5)'};
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:${active ? 12 : 10}px;font-weight:700;color:#fff;
    font-family:'Cormorant Garamond',serif;
    box-shadow:0 2px 8px rgba(0,0,0,0.5)${active ? `,0 0 0 5px ${color}33` : ''};
    cursor:pointer;
  ">${num}</div>`

// Stable stop list built once at module level — avoids recreating inside the component
const STOPS = TRIP_DAYS.map((day, i) => ({
  lat: day.from.lat, lng: day.from.lng,
  color: day.color, dayNum: day.day, idx: i,
}))

export default memo(function MapView({ selectedDay, onDaySelect }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<L.Map | null>(null)
  const markersRef    = useRef<L.Marker[]>([])
  const animRouteRef  = useRef<L.Polyline | null>(null)
  const prevDayRef    = useRef<number | null>(null)

  // ── Init map once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [-36.5, 149.0], zoom: 7,
      zoomControl: true, attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map)
    L.control.attribution({ prefix: '' })
      .addAttribution('© <a href="https://carto.com">CARTO</a> © <a href="https://openstreetmap.org">OSM</a>')
      .addTo(map)

    // Dim dashed full route
    L.polyline(FULL_ROUTE_COORDS, {
      color: 'rgba(255,255,255,0.15)', weight: 2, dashArray: '5 6',
    }).addTo(map)

    // Invisible fat polyline per day's segment — provides a click target
    TRIP_DAYS.forEach(day => {
      const { from, to } = day
      if (from.lat === to.lat && from.lng === to.lng) return  // stationary day, skip
      L.polyline([[from.lat, from.lng], [to.lat, to.lng]], {
        color: day.color, weight: 28, opacity: 0.001,
      }).addTo(map).on('click', () => onDaySelect(day.day))
    })

    // Markers
    STOPS.forEach(s => {
      const icon = L.divIcon({
        html: markerHtml(s.color, s.dayNum, false),
        iconSize: [26, 26], iconAnchor: [13, 13], className: '',
      })
      markersRef.current.push(
        L.marker([s.lat, s.lng], { icon }).addTo(map)
          .on('click', () => onDaySelect(s.dayNum))
      )
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = []
      prevDayRef.current = null
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // Only update the two markers that changed (prev active → inactive, new → active)
  const updateMarker = useCallback((dayNum: number, active: boolean) => {
    const idx = dayNum - 1
    const marker = markersRef.current[idx]
    const stop   = STOPS[idx]
    if (!marker || !stop) return
    const size = active ? 34 : 26
    marker.setIcon(L.divIcon({
      html: markerHtml(stop.color, stop.dayNum, active),
      iconSize: [size, size], iconAnchor: [size / 2, size / 2], className: '',
    }))
  }, [])

  // ── React to selectedDay changes ───────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (animRouteRef.current) { map.removeLayer(animRouteRef.current); animRouteRef.current = null }
    if (prevDayRef.current !== null) updateMarker(prevDayRef.current, false)

    if (selectedDay === null) {
      prevDayRef.current = null
      map.flyTo([-36.5, 149.0], 7, { duration: 0.9 })
      return
    }

    const day = TRIP_DAYS[selectedDay - 1]
    if (!day) return

    updateMarker(selectedDay, true)
    prevDayRef.current = selectedDay

    animRouteRef.current = L.polyline(
      [[day.from.lat, day.from.lng], [day.to.lat, day.to.lng]],
      { color: day.color, weight: 5, opacity: 0.85 }
    ).addTo(map)

    map.flyTo(day.mapCenter, day.mapZoom, { duration: 0.8 })
  }, [selectedDay, updateMarker])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16, zIndex: 999,
        background: 'rgba(11,21,32,0.88)',
        border: '1px solid var(--border-warm)',
        borderRadius: 10, padding: '10px 14px',
        backdropFilter: 'blur(8px)',
        fontSize: 10, color: 'var(--text-secondary)',
      }}>
        <div style={{ marginBottom: 5, fontWeight: 600, color: 'var(--sand)', fontSize: 11 }}>路线图例</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ width: 16, height: 0, borderTop: '2px dashed rgba(255,255,255,0.2)' }} />
          <span>完整路线</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 2, background: 'var(--ocean)', borderRadius: 1 }} />
          <span>当日路段</span>
        </div>
      </div>
    </div>
  )
})
