import { Link } from 'react-router-dom'
import { useAppState } from '../state/AppState'

const HomePage = () => {
  const { user, rooms, items, reservations } = useAppState()

  const activeReservations = reservations.filter((r) => r.status === 'active')
  const lectureCount = activeReservations.filter((r) => r.type === 'lecture').length
  const itemCount = activeReservations.filter((r) => r.type === 'item').length

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-indigo-200/30 ring-1 ring-slate-100">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">대시보드</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
          단국대 예약관리 <span className="text-indigo-600">대시보드</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          강의실/물품 현황과 예약·대여 현황을 한 화면에서 확인하고, 필요한 메뉴로 빠르게 이동할 수 있습니다.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/admin/tools"
            className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5"
          >
            관리자 도구 열기
          </Link>
          <Link
            to="/reservations"
            className="rounded-full bg-white px-5 py-3 text-sm font-medium text-indigo-700 ring-1 ring-indigo-100 transition hover:bg-indigo-50"
          >
            예약/대여 현황 보기
          </Link>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
            현재 사용자: {user?.name ?? '로딩중'} ({user?.role ?? '-'})
          </span>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase text-slate-500">강의실</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{rooms.length}</p>
          <p className="text-sm text-slate-600">등록된 강의실</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase text-slate-500">물품</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{items.length}</p>
          <p className="text-sm text-slate-600">대여 가능한 품목</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase text-slate-500">강의실 예약</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{lectureCount}</p>
          <p className="text-sm text-slate-600">진행 중 예약</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase text-slate-500">물품 대여</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{itemCount}</p>
          <p className="text-sm text-slate-600">진행 중 대여</p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Link
          to="/admin/tools"
          className="group rounded-2xl bg-white/90 p-6 shadow ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">관리자 도구</h3>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 group-hover:bg-indigo-100">
              이동
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            강의실/물품 등록·삭제, 활성화 토글, 전체 예약 리스트 등을 관리합니다.
          </p>
        </Link>
        <Link
          to="/reservations"
          className="group rounded-2xl bg-white/90 p-6 shadow ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">예약·대여 현황</h3>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 group-hover:bg-indigo-100">
              이동
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">예약/대여 내역 조회 및 처리(취소/반납) 흐름을 제공합니다.</p>
        </Link>
        <Link
          to="/admin"
          className="group rounded-2xl bg-white/90 p-6 shadow ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">대시보드</h3>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 group-hover:bg-indigo-100">
              이동
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            리소스/예약 현황 요약을 확인합니다.
          </p>
        </Link>
      </section>
    </div>
  )
}

export default HomePage
