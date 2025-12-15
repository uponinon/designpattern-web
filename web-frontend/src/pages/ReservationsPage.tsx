import { useEffect, useMemo, useState } from 'react'
import { useAppState } from '../state/AppState'
import type { ReservationStatus } from '../types'

const ReservationsPage = () => {
  const { user, items, reservations, rentItem, cancelReservation, returnReservation } = useAppState()
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id ?? '')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10))
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedItemId && items.length > 0) {
      setSelectedItemId(items[0].id)
    }
  }, [items, selectedItemId])

  const myReservations = useMemo(
    () => reservations.filter((r) => r.userId === user?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reservations, user?.id],
  )

  const handleRent = async () => {
    setMessage(null)
    const item = items.find((i) => i.id === selectedItemId)
    if (!item) {
      setMessage('품목을 선택하세요.')
      return
    }
    if (startDate > endDate) {
      setMessage('시작일이 종료일보다 늦을 수 없습니다.')
      return
    }
    const result = await rentItem({
      itemId: item.id,
      itemName: item.name,
      startDate,
      endDate,
    })
    setMessage(result.ok ? '대여가 생성되었습니다.' : result.error ?? '실패했습니다.')
  }

  const handleAction = async (id: string, action: 'cancel' | 'return') => {
    setMessage(null)
    const result = action === 'cancel' ? await cancelReservation(id) : await returnReservation(id)
    setMessage(result.ok ? '처리되었습니다.' : result.error ?? '실패했습니다.')
  }

  const statusBadge = (status: ReservationStatus) => {
    if (status === 'active') return 'bg-emerald-50 text-emerald-700'
    if (status === 'cancelled') return 'bg-amber-50 text-amber-700'
    return 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">내 예약/대여</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">예약 취소 · 물품 반납</h2>
          <p className="mt-1 text-slate-600">
            Swing 기능: 내 예약 조회, 강의실 예약 취소, 물품 대여/반납 흐름을 더미 데이터로 재현합니다.
          </p>
        </div>
        {message && <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">{message}</div>}
      </header>

      <section className="rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">물품 대여</p>
            <h3 className="text-lg font-semibold text-slate-900">재고 확인 후 대여 생성</h3>
          </div>
          <div className="text-xs text-slate-500">재고 부족 시 에러 메시지로 안내합니다.</div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {items.map((item) => {
              const activeCount = reservations.filter((r) => r.type === 'item' && r.resourceId === item.id && r.status === 'active').length
              const remain = Math.max(item.stock - activeCount, 0)
              return (
                <option key={item.id} value={item.id}>
                  {item.name} · 잔여 {remain}/{item.stock}
                </option>
              )
            })}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleRent}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5"
          >
            대여 생성
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">내 예약/대여</p>
            <h3 className="text-lg font-semibold text-slate-900">{user?.name}님의 목록</h3>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {myReservations.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  [{r.type === 'lecture' ? '강의실' : '물품'}] {r.resourceName}
                </p>
                <p className="text-xs text-slate-600">
                  {r.date} {r.startTime} ~ {r.endTime} · {r.userName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(r.status)}`}>{r.status}</span>
                {r.status === 'active' && r.type === 'lecture' && (
                  <button
                    onClick={() => handleAction(r.id, 'cancel')}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  >
                    예약 취소
                  </button>
                )}
                {r.status === 'active' && r.type === 'item' && (
                  <button
                    onClick={() => handleAction(r.id, 'return')}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  >
                    반납 처리
                  </button>
                )}
              </div>
            </div>
          ))}
          {myReservations.length === 0 && <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">예약/대여 내역이 없습니다.</div>}
        </div>
      </section>
    </div>
  )
}

export default ReservationsPage
