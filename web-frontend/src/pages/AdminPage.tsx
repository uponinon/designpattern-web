import { useState } from 'react'
import { useAppState } from '../state/AppState'

const AdminPage = () => {
  const { rooms, items, reservations, addRoom, addItem, updateRoom, deleteRoom, deleteItem, cancelReservation, returnReservation } =
    useAppState()
  const [roomName, setRoomName] = useState('')
  const [roomDeposit, setRoomDeposit] = useState(50000)
  const [roomSize, setRoomSize] = useState<'small' | 'medium' | 'large'>('small')
  const [roomFeature, setRoomFeature] = useState<'basic' | 'projector' | 'recording'>('basic')

  const [itemName, setItemName] = useState('')
  const [itemDeposit, setItemDeposit] = useState(30000)
  const [itemPeriod, setItemPeriod] = useState(3)
  const [itemStock, setItemStock] = useState(1)

  const [message, setMessage] = useState<string | null>(null)

  const handleReservationAction = async (id: string, action: 'cancel' | 'return') => {
    setMessage(null)
    const confirmed = window.confirm(action === 'cancel' ? '해당 예약을 강제 취소할까요?' : '해당 대여를 강제 반납 처리할까요?')
    if (!confirmed) return

    const result = action === 'cancel' ? await cancelReservation(id) : await returnReservation(id)
    setMessage(result.ok ? '처리되었습니다.' : result.error ?? '실패했습니다.')
  }

  const handleAddRoom = async () => {
    setMessage(null)
    const result = await addRoom({
      name: roomName,
      deposit: roomDeposit,
      size: roomSize,
      feature: roomFeature,
      available: true,
    })
    setMessage(result.ok ? '강의실이 추가되었습니다.' : result.error ?? '추가 실패')
    if (result.ok) {
      setRoomName('')
    }
  }

  const handleAddItem = async () => {
    setMessage(null)
    const result = await addItem({
      name: itemName,
      deposit: itemDeposit,
      rentalPeriodDays: itemPeriod,
      stock: itemStock,
    })
    setMessage(result.ok ? '물품이 추가되었습니다.' : result.error ?? '추가 실패')
    if (result.ok) setItemName('')
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">관리자</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">강의실/물품 CRUD + 예약 현황</h2>
          <p className="mt-1 text-slate-600">
            강의실·물품 등록/수정/삭제 및 전체 예약 리스트를 관리합니다.
          </p>
        </div>
        {message && <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">{message}</div>}
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">강의실 추가</h3>
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="강의실 이름"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-slate-700">
              보증금
              <input
                type="number"
                value={roomDeposit}
                onChange={(e) => setRoomDeposit(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <label className="text-sm text-slate-700">
              크기
              <select
                value={roomSize}
                onChange={(e) => setRoomSize(e.target.value as typeof roomSize)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="small">소형</option>
                <option value="medium">중형</option>
                <option value="large">대형</option>
              </select>
            </label>
            <label className="text-sm text-slate-700">
              설비
              <select
                value={roomFeature}
                onChange={(e) => setRoomFeature(e.target.value as typeof roomFeature)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="basic">기본</option>
                <option value="projector">프로젝터</option>
                <option value="recording">자동 녹화</option>
              </select>
            </label>
          </div>
          <button
            onClick={handleAddRoom}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5"
          >
            강의실 등록
          </button>
        </div>

        <div className="space-y-3 rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">물품 추가</h3>
          <input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="물품 이름"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-slate-700">
              보증금
              <input
                type="number"
                value={itemDeposit}
                onChange={(e) => setItemDeposit(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <label className="text-sm text-slate-700">
              기간(일)
              <input
                type="number"
                value={itemPeriod}
                onChange={(e) => setItemPeriod(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <label className="text-sm text-slate-700">
              재고
              <input
                type="number"
                value={itemStock}
                onChange={(e) => setItemStock(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </div>
          <button
            onClick={handleAddItem}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5"
          >
            물품 등록
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100">
          <h3 className="text-sm font-semibold uppercase text-slate-500">강의실 목록</h3>
          <div className="space-y-2">
            {rooms.map((room) => (
              <div key={room.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{room.name}</p>
                  <p className="text-xs text-slate-600">
                    보증금 {room.deposit.toLocaleString()}원 · {room.size} · {room.feature}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={room.available}
                      onChange={(e) => updateRoom(room.id, { available: e.target.checked })}
                    />
                    활성화
                  </label>
                  <button
                    onClick={() => deleteRoom(room.id)}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
            {rooms.length === 0 && <div className="rounded-lg border border-dashed p-4 text-sm text-slate-500">등록된 강의실이 없습니다.</div>}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100">
          <h3 className="text-sm font-semibold uppercase text-slate-500">물품 목록</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-600">
                    보증금 {item.deposit.toLocaleString()}원 · 기간 {item.rentalPeriodDays}일 · 재고 {item.stock}
                  </p>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                >
                  삭제
                </button>
              </div>
            ))}
            {items.length === 0 && <div className="rounded-lg border border-dashed p-4 text-sm text-slate-500">등록된 물품이 없습니다.</div>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">예약 현황</p>
            <h3 className="text-lg font-semibold text-slate-900">전체 예약 리스트</h3>
          </div>
        </div>
        <div className="mt-3 grid gap-2">
          {reservations.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  [{r.type === 'lecture' ? '강의실' : '물품'}] {r.resourceName} · {r.userName}
                </p>
                <p className="text-xs text-slate-600">
                  {r.date} {r.startTime}~{r.endTime}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {r.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleReservationAction(r.id, 'cancel')}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100 hover:bg-rose-50"
                    >
                      강제 취소
                    </button>
                    {r.type === 'item' && (
                      <button
                        onClick={() => handleReservationAction(r.id, 'return')}
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                      >
                        강제 반납
                      </button>
                    )}
                  </>
                )}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    r.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : r.status === 'cancelled'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </div>
          ))}
          {reservations.length === 0 && <div className="rounded-lg border border-dashed p-4 text-sm text-slate-500">예약 내역이 없습니다.</div>}
        </div>
      </section>
    </div>
  )
}

export default AdminPage
