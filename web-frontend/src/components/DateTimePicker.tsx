import { useMemo, useState } from 'react'

type Props = {
  selectedDate: string // yyyy-MM-dd
  onDateChange: (isoDate: string) => void
  startTime: string // HH:mm
  endTime: string // HH:mm
  onTimeChange: (startTime: string, endTime: string) => void
  disabled?: boolean
  disabledRanges?: Array<{ startHour: number; endHour: number }> // [start, end), hours in 0..24
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

const pad2 = (n: number) => String(n).padStart(2, '0')

const parseHour = (t: string) => {
  const h = Number(t.split(':')[0] ?? '0')
  return Number.isFinite(h) ? Math.max(0, Math.min(23, h)) : 0
}

const toISODate = (year: number, monthIndex: number, day: number) => {
  const m = pad2(monthIndex + 1)
  const d = pad2(day)
  return `${year}-${m}-${d}`
}

const clampHour = (h: number) => Math.max(0, Math.min(24, h))

const snapHour = (h: number) => Math.round(h)

const overlapsDisabled = (startHour: number, endHour: number, disabledRanges: Props['disabledRanges']) => {
  if (!disabledRanges || disabledRanges.length === 0) return false
  return disabledRanges.some((r) => startHour < r.endHour && endHour > r.startHour)
}

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
}

const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

const hourToAngle = (hour: number) => (hour / 24) * 360

const angleToHour = (angleDeg: number) => (angleDeg / 360) * 24

const DateTimePicker = ({ selectedDate, onDateChange, startTime, endTime, onTimeChange, disabled, disabledRanges }: Props) => {
  const selected = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map((x) => Number(x))
    if (!y || !m || !d) return new Date()
    return new Date(y, m - 1, d)
  }, [selectedDate])

  const [viewYear, setViewYear] = useState(selected.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected.getMonth()) // 0-based

  const [activeHandle, setActiveHandle] = useState<'start' | 'end'>('start')

  const startHour = parseHour(startTime)
  const endHour = parseHour(endTime)

  const calendar = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const startOffset = first.getDay()
    const cells: Array<{ day: number; inMonth: boolean }> = []

    // leading blanks
    for (let i = 0; i < startOffset; i++) cells.push({ day: 0, inMonth: false })
    for (let day = 1; day <= daysInMonth; day++) cells.push({ day, inMonth: true })

    // trailing to complete weeks
    while (cells.length % 7 !== 0) cells.push({ day: 0, inMonth: false })
    return { daysInMonth, cells }
  }, [viewMonth, viewYear])

  const selectedKey = selectedDate

  const prevMonth = () => {
    if (disabled) return
    const next = new Date(viewYear, viewMonth - 1, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  const nextMonth = () => {
    if (disabled) return
    const next = new Date(viewYear, viewMonth + 1, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  const selectDay = (day: number) => {
    if (disabled) return
    if (day < 1) return
    onDateChange(toISODate(viewYear, viewMonth, day))
  }

  const setHourFromAngle = (clientX: number, clientY: number, rect: DOMRect) => {
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = clientX - cx
    const dy = clientY - cy
    const raw = (Math.atan2(dy, dx) * 180) / Math.PI + 90
    const angle = (raw + 360) % 360
    const h = clampHour(snapHour(angleToHour(angle)))

    if (activeHandle === 'start') {
      const nextStart = h
      const nextEnd = Math.max(nextStart + 1, endHour)
      if (overlapsDisabled(nextStart, nextEnd, disabledRanges)) return
      onTimeChange(`${pad2(nextStart)}:00`, `${pad2(nextEnd)}:00`)
    } else {
      const nextEnd = Math.max(h, startHour + 1)
      if (overlapsDisabled(startHour, nextEnd, disabledRanges)) return
      onTimeChange(`${pad2(startHour)}:00`, `${pad2(nextEnd)}:00`)
    }
  }

  const dial = useMemo(() => {
    const s = clampHour(startHour)
    const e = clampHour(Math.max(endHour, s + 1))
    const startAngle = hourToAngle(s)
    const endAngle = hourToAngle(e)
    return { s, e, startAngle, endAngle }
  }, [endHour, startHour])

  const dialDisabledArcs = useMemo(() => {
    const ranges = disabledRanges ?? []
    return ranges
      .map((r) => ({
        startAngle: hourToAngle(clampHour(r.startHour)),
        endAngle: hourToAngle(clampHour(r.endHour)),
      }))
      .filter((r) => r.endAngle !== r.startAngle)
  }, [disabledRanges])

  const selectedIsValid = selectedKey && selectedKey.length === 10

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl bg-white/90 p-5 shadow ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-full px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            disabled={disabled}
            aria-label="이전 달"
          >
            ‹
          </button>
          <div className="text-lg font-bold text-slate-900">
            {viewYear}년 {viewMonth + 1}월
          </div>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-full px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            disabled={disabled}
            aria-label="다음 달"
          >
            ›
          </button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-2 text-center text-sm font-semibold">
          {WEEKDAYS.map((d, idx) => (
            <div key={d} className={idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-600' : 'text-slate-600'}>
              {d}
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-2">
          {calendar.cells.map((c, i) => {
            if (!c.inMonth) return <div key={i} className="h-10" />
            const iso = toISODate(viewYear, viewMonth, c.day)
            const isSelected = iso === selectedKey
            const weekday = (i % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6
            const color =
              weekday === 0 ? 'text-red-500' : weekday === 6 ? 'text-blue-600' : isSelected ? 'text-white' : 'text-slate-900'
            const bg = isSelected ? 'bg-blue-600 shadow' : 'hover:bg-slate-100'

            return (
              <button
                key={iso}
                type="button"
                onClick={() => selectDay(c.day)}
                className={`h-10 rounded-full text-sm font-semibold transition ${bg} ${color}`}
                disabled={disabled}
              >
                {c.day}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white/90 p-5 shadow ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">시간 선택</p>
            <p className="mt-1 text-sm text-slate-600">
              {selectedIsValid ? (
                <>
                  선택 날짜 <span className="font-semibold text-slate-900">{selectedKey}</span>
                </>
              ) : (
                '날짜를 선택하세요'
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveHandle('start')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${
                activeHandle === 'start' ? 'bg-indigo-600 text-white ring-indigo-500' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-100'
              }`}
            >
              시작
            </button>
            <button
              type="button"
              onClick={() => setActiveHandle('end')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${
                activeHandle === 'end' ? 'bg-indigo-600 text-white ring-indigo-500' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-100'
              }`}
            >
              종료
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center">
          <div className="relative h-[320px] w-[320px]">
            <svg
              viewBox="0 0 320 320"
              className={`h-full w-full ${!selectedIsValid ? 'opacity-60' : ''}`}
              onClick={(e) => {
                if (disabled || !selectedIsValid) return
                const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
                setHourFromAngle(e.clientX, e.clientY, rect)
              }}
              role="img"
              aria-label="시간 선택 다이얼"
            >
              {/* base ring */}
              <circle cx="160" cy="160" r="120" fill="#f1f5f9" />
              <circle cx="160" cy="160" r="120" fill="none" stroke="#e2e8f0" strokeWidth="18" />

              {/* disabled ranges */}
              {dialDisabledArcs.map((a, idx) => (
                <path
                  key={idx}
                  d={describeArc(160, 160, 120, a.startAngle, a.endAngle)}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="18"
                  strokeLinecap="butt"
                />
              ))}

              {/* selected range */}
              {selectedIsValid && (
                <path
                  d={describeArc(160, 160, 120, dial.startAngle, dial.endAngle)}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="18"
                  strokeLinecap="butt"
                />
              )}

              {/* ticks */}
              {Array.from({ length: 48 }).map((_, i) => {
                const angle = (i / 48) * 360
                const outer = polarToCartesian(160, 160, 142, angle)
                const inner = polarToCartesian(160, 160, i % 2 === 0 ? 132 : 136, angle)
                return <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#cbd5e1" strokeWidth={i % 2 === 0 ? 2 : 1} />
              })}

              {/* hour labels */}
              {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => {
                const pos = polarToCartesian(160, 160, 165, hourToAngle(h))
                const label = h === 0 ? '24' : String(h)
                return (
                  <text key={h} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="#475569" fontWeight="700">
                    {label}
                  </text>
                )
              })}

              {/* center */}
              <circle cx="160" cy="160" r="78" fill="#ffffff" />
              <text x="160" y="150" textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="#64748b" fontWeight="700">
                {selectedIsValid ? '시간을 선택하세요' : '날짜를 선택하세요'}
              </text>
              {selectedIsValid && (
                <text x="160" y="175" textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="#0f172a" fontWeight="800">
                  {pad2(dial.s)}:00 ~ {pad2(dial.e)}:00
                </text>
              )}
            </svg>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 backdrop-blur">
                클릭해서 {activeHandle === 'start' ? '시작' : '종료'} 시간을 선택
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-slate-300" />
            <span className="text-slate-600">예약불가(기예약)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-600" />
            <span className="text-slate-600">예약가능(선택)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DateTimePicker

