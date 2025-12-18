import { Link } from 'react-router-dom'

const notices = [
  { title: '2025-1학기 강의실 예약 운영 안내', date: '2025.03.02' },
  { title: '시험 기간(중간/기말) 예약 제한 안내', date: '2025.04.10' },
  { title: '시설 점검(프로젝터/음향) 일정 공지', date: '2025.05.01' },
  { title: '야간 이용 시 안전 수칙 안내', date: '2025.05.15' },
]

const quickTiles = [
  { title: '강의실예약', desc: '강의실 예약', to: '/rooms' },
  { title: '나의 예약현황', desc: '예약/대여 조회', to: '/reservations' },
  { title: '공지사항', desc: '공지 목록', to: '/notices' },
]

const LandingPage = () => {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-900 text-white shadow-2xl shadow-indigo-300/30 ring-1 ring-white/10">
        <div className="grid gap-8 p-8 md:grid-cols-5 md:p-10">
          <div className="md:col-span-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-200">단국대학교</p>
            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              강의실 예약관리 시스템
              <span className="ml-2 align-middle text-base font-semibold text-indigo-200">beta</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-indigo-100/90">
              강의실 예약과 물품 대여를 한 곳에서 관리할 수 있도록 구성했습니다. 날짜 선택 후 시간표에서 1시간 단위로 예약 가능 시간을
              확인하고, 예약/대여 내역은 “나의 예약현황”에서 관리합니다.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/rooms"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-900 shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5"
              >
                강의실 예약하기
              </Link>
              <Link
                to="/reservations"
                className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/15"
              >
                나의 예약현황
              </Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔊</span>
                  <h2 className="text-lg font-semibold">공지사항</h2>
                </div>
                <Link
                  to="/notices"
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20 hover:bg-white/15"
                  aria-label="공지사항 더보기"
                  title="공지사항 더보기"
                >
                  +
                </Link>
              </div>

              <div className="mt-4 divide-y divide-white/10">
                {notices.map((n) => (
                  <div key={n.title} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white/95">{n.title}</p>
                    </div>
                    <div className="shrink-0 text-xs font-semibold text-indigo-200">{n.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 px-8 py-6 ring-1 ring-white/10 md:px-10">
          <div className="grid gap-4 md:grid-cols-3">
            {quickTiles.map((tile) => (
              <Link
                key={tile.title}
                to={tile.to}
                className="group rounded-2xl bg-white px-6 py-6 text-slate-900 shadow-xl shadow-indigo-950/10 ring-1 ring-white/30 transition hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-bold">{tile.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{tile.desc}</p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 group-hover:bg-indigo-100">
                    이동
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white/90 p-6 shadow ring-1 ring-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">가이드</h3>
          <p className="mt-2 text-sm text-slate-600">예약은 1시간 단위로 진행되며, 이미 예약된 시간은 선택할 수 없습니다.</p>
          <ul className="mt-3 space-y-1 text-sm text-slate-600">
            <li>운영 시간: 08:00 ~ 22:00</li>
            <li>예약 단위: 1시간</li>
            <li>중복 예약: 동일 강의실/일자 기준 불가</li>
            <li>보증금: 시설별 상이(예약 정보에서 확인)</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-white/90 p-6 shadow ring-1 ring-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">FAQ</h3>
          <div className="mt-2 space-y-3 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900">Q. 예약 취소/반납은 어디서 하나요?</p>
              <p className="mt-1">A. 상단 메뉴의 “나의 예약현황”에서 취소/반납 버튼으로 처리할 수 있습니다.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Q. 같은 시간에 여러 명이 예약할 수 있나요?</p>
              <p className="mt-1">A. 동일 강의실·동일 날짜 기준으로 겹치는 시간대는 예약할 수 없습니다.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Q. 물품 대여 기간은 어떻게 정해지나요?</p>
              <p className="mt-1">A. 품목별 대여 가능 기간/재고를 기준으로 대여가 가능합니다.</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white/90 p-6 shadow ring-1 ring-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">문의</h3>
          <p className="mt-2 text-sm text-slate-600">이용 문의 및 시설 관련 요청은 아래 채널로 접수할 수 있습니다.</p>
          <div className="mt-3 space-y-1 text-sm text-slate-600">
            <p>시설관리팀: 031-000-0000</p>
            <p>이메일: facility@dku.example</p>
            <p>운영 시간: 평일 09:00 ~ 18:00</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
