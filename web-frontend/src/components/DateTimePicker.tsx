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

const OPEN_HOUR = 8
const CLOSE_HOUR = 22 // exclusive (22:00)

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

const overlapsDisabled = (startHour: number, endHour: number, disabledRanges: Props['disabledRanges']) => {
  if (!disabledRanges || disabledRanges.length === 0) return false
  return disabledRanges.some((r) => startHour < r.endHour && endHour > r.startHour)
}

const clampToBusinessHours = (startHour: number, endHour: number) => {
  const s = Math.max(OPEN_HOUR, Math.min(CLOSE_HOUR - 1, startHour))
  const e = Math.max(s + 1, Math.min(CLOSE_HOUR, endHour))
  return { startHour: s, endHour: e }
}

const DateTimePicker = ({ selectedDate, onDateChange, startTime, endTime, onTimeChange, disabled, disabledRanges }: Props) => {
  const selected = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map((x) => Number(x))
    if (!y || !m || !d) return new Date()
    return new Date(y, m - 1, d)
  }, [selectedDate])

  const [viewYear, setViewYear] = useState(selected.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected.getMonth()) // 0-based

  const [rangeAnchorHour, setRangeAnchorHour] = useState<number | null>(null)

  const selectedKey = selectedDate
  const selectedIsValid = selectedKey && selectedKey.length === 10

  const { startHour, endHour } = clampToBusinessHours(parseHour(startTime), parseHour(endTime))

  const calendar = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const startOffset = first.getDay()
    const cells: Array<{ day: number; inMonth: boolean }> = []

    for (let i = 0; i < startOffset; i++) cells.push({ day: 0, inMonth: false })
    for (let day = 1; day <= daysInMonth; day++) cells.push({ day, inMonth: true })
    while (cells.length % 7 !== 0) cells.push({ day: 0, inMonth: false })
    return { daysInMonth, cells }
  }, [viewMonth, viewYear])

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

  const hours = useMemo(() => Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i), [])

  const resetSelection = () => {
    setRangeAnchorHour(null)
    const defaultStart = Math.min(Math.max(OPEN_HOUR, 9), CLOSE_HOUR - 1)
    onTimeChange(`${pad2(defaultStart)}:00`, `${pad2(defaultStart + 1)}:00`)
  }

  const pickHour = (hour: number) => {
    if (disabled || !selectedIsValid) return
    if (overlapsDisabled(hour, hour + 1, disabledRanges)) return

    if (rangeAnchorHour === null) {
      onTimeChange(`${pad2(hour)}:00`, `${pad2(hour + 1)}:00`)
      setRangeAnchorHour(hour)
      return
    }

    const nextStart = Math.min(rangeAnchorHour, hour)
    const nextEnd = Math.max(rangeAnchorHour, hour) + 1
    if (overlapsDisabled(nextStart, nextEnd, disabledRanges)) return

    onTimeChange(`${pad2(nextStart)}:00`, `${pad2(nextEnd)}:00`)
    setRangeAnchorHour(null)
  }

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
            const color = weekday === 0 ? 'text-red-500' : weekday === 6 ? 'text-blue-600' : isSelected ? 'text-white' : 'text-slate-900'
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">시간 선택</p>
            <p className="mt-1 text-sm text-slate-600">
              {selectedIsValid ? (
                <>
                  선택 날짜 <span className="font-semibold text-slate-900">{selectedKey}</span> ·{' '}
                  <span className="font-semibold text-slate-900">
                    {pad2(startHour)}:00 ~ {pad2(endHour)}:00
                  </span>
                </>
              ) : (
                '날짜를 선택하세요'
              )}
            </p>
            {rangeAnchorHour !== null && selectedIsValid && (
              <p className="mt-1 text-xs font-semibold text-slate-500">끝 시간을 선택하세요. (1시간 단위)</p>
            )}
          </div>
          <button type="button" onClick={resetSelection} className="text-sm text-slate-500 underline disabled:opacity-50" disabled={disabled}>
            선택 해제
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
          {hours.map((h) => {
            const slotDisabled = disabled || !selectedIsValid || overlapsDisabled(h, h + 1, disabledRanges)
            const slotSelected = selectedIsValid && h >= startHour && h < endHour
            const slotAnchor = rangeAnchorHour === h
            const label = `${pad2(h)}:00 ~ ${pad2(h + 1)}:00`

            const cls = slotDisabled
              ? 'cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200'
              : slotSelected
                ? 'bg-indigo-600 text-white ring-indigo-500'
                : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'

            return (
              <button
                key={h}
                type="button"
                onClick={() => pickHour(h)}
                disabled={slotDisabled}
                className={`rounded-xl px-3 py-3 text-sm font-semibold ring-1 transition ${cls} ${slotAnchor ? 'ring-2 ring-indigo-400' : ''}`}
                aria-label={label}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-slate-200 ring-1 ring-slate-300" />
            <span className="text-slate-600">예약 있음(선택 불가)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-white ring-1 ring-slate-300" />
            <span className="text-slate-600">예약 가능</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-indigo-600 ring-1 ring-indigo-600" />
            <span className="text-slate-600">선택됨</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DateTimePicker
