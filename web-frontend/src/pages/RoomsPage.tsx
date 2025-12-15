import { useMemo, useState } from 'react'
import { useAppState } from '../state/AppState'
import type { LectureRoom, Reservation } from '../types'

const todayISO = () => new Date().toISOString().slice(0, 10)

const RoomsPage = () => {
  const { rooms, reservations, createLectureReservation } = useAppState()
  const [search, setSearch] = useState('')
  const [size, setSize] = useState('all')
  const [feature, setFeature] = useState('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<LectureRoom | null>(null)
  const [date, setDate] = useState(todayISO())
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('11:00')
  const [message, setMessage] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      rooms.filter((r) => {
        if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
        if (size !== 'all' && r.size !== size) return false
        if (feature !== 'all' && r.feature !== feature) return false
        if (onlyAvailable && !r.available) return false
        return true
      }),
    [rooms, search, size, feature, onlyAvailable],
  )

  const roomReservations = (roomId: string): Reservation[] =>
    reservations
      .filter((r) => r.type === 'lecture' && r.resourceId === roomId && r.status === 'active')
      .sort((a, b) => a.date.localeCompare(b.date))

  const handleReserve = async () => {
    if (!selectedRoom) return
    if (end <= start) {
      setMessage('종료 시간이 시작 시간보다 늦어야 합니다.')
      return
    }
    setMessage(null)
    const result = await createLectureReservation({
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      date,
      startTime: start,
      endTime: end,
    })
    if (!result.ok) {
      setMessage(result.error)
    } else {
      setMessage('예약이 생성되었습니다.')
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">강의실 예약</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">목록, 필터, 중복 검증</h2>
          <p className="mt-1 text-slate-600">Swing 기능: 강의실 선택 → 날짜/시간 슬롯 선택 → 중복 체크 후 예약 생성.</p>
        </div>
        {message && <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">{message}</div>}
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1 space-y-3 rounded-2xl bg-white p-4 shadow ring-1 ring-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">필터</h3>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="강의실 이름"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">전체 크기</option>
            <option value="small">소형</option>
            <option value="medium">중형</option>
            <option value="large">대형</option>
          </select>
          <select
            value={feature}
            onChange={(e) => setFeature(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">전체 설비</option>
            <option value="basic">기본</option>
            <option value="projector">프로젝터</option>
            <option value="recording">자동 녹화</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
            사용 가능만 보기
          </label>
        </div>

        <div className="md:col-span-3 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {filtered.map((room) => (
              <div
                key={room.id}
                className={`rounded-xl border p-4 shadow-sm transition ${selectedRoom?.id === room.id ? 'border-indigo-400 shadow-indigo-100' : 'border-slate-200'}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{room.name}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${room.available ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {room.available ? '예약 가능' : '비활성'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  보증금 {room.deposit.toLocaleString()}원 · {room.size} · {room.feature}
                </p>
                <button
                  onClick={() => setSelectedRoom(room)}
                  className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow hover:-translate-y-0.5"
                >
                  예약하기
                </button>

                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700">예약 현황</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    {roomReservations(room.id)
                      .slice(0, 3)
                      .map((r) => (
                        <li key={r.id}>
                          {r.date} {r.startTime}~{r.endTime} · {r.userName}
                        </li>
                      ))}
                    {roomReservations(room.id).length === 0 && <li>예약 없음</li>}
                  </ul>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">조건에 맞는 강의실이 없습니다.</div>}
          </div>

          {selectedRoom && (
            <div className="rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">예약 폼</p>
                  <h4 className="text-xl font-bold text-slate-900">{selectedRoom.name}</h4>
                  <p className="text-sm text-slate-600">중복 검증 후 즉시 예약을 생성합니다.</p>
                </div>
                <button className="text-sm text-slate-500 underline" onClick={() => setSelectedRoom(null)}>
                  선택 해제
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <label className="text-sm text-slate-700">
                  날짜
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  시작
                  <input
                    type="time"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  종료
                  <input
                    type="time"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                <div className="flex items-end">
                  <button
                    onClick={handleReserve}
                    className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5"
                  >
                    예약 생성
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RoomsPage
