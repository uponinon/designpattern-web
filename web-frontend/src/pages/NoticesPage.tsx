import { Link, useParams } from 'react-router-dom'

type Notice = {
  id: string
  title: string
  date: string
  content: string
}

const notices: Notice[] = [
  {
    id: 'n-1',
    title: '2025-1학기 강의실 예약 운영 안내',
    date: '2025.03.02',
    content:
      '2025-1학기 강의실 예약은 1시간 단위로 운영됩니다. 동일 강의실/동일 날짜 기준으로 겹치는 시간은 예약할 수 없습니다. 사용 후에는 정리 정돈 및 퇴실 점검을 부탁드립니다.',
  },
  {
    id: 'n-2',
    title: '시험 기간(중간/기말) 예약 제한 안내',
    date: '2025.04.10',
    content:
      '중간/기말 시험 기간에는 조용한 학습 환경을 위해 일부 강의실의 예약 가능 시간이 조정될 수 있습니다. 정확한 제한 시간은 학사 공지와 함께 안내됩니다.',
  },
  {
    id: 'n-3',
    title: '시설 점검(프로젝터/음향) 일정 공지',
    date: '2025.05.01',
    content:
      '프로젝터/음향 장비 점검이 예정되어 있어 일부 강의실은 점검 시간 동안 예약이 제한될 수 있습니다. 점검 완료 후 즉시 정상 운영됩니다.',
  },
  {
    id: 'n-4',
    title: '야간 이용 시 안전 수칙 안내',
    date: '2025.05.15',
    content:
      '야간 이용 시 출입문 잠금, 전기/난방 확인, 분실물 점검을 꼭 진행해주세요. 긴급 상황 발생 시 즉시 경비실 또는 시설관리팀에 연락 바랍니다.',
  },
]

const NoticesPage = () => {
  const { id } = useParams()
  const selected = id ? notices.find((n) => n.id === id) : notices[0]

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">공지사항</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">공지 목록</h1>
          <p className="mt-2 text-slate-600">예약 운영 및 시설 이용 관련 안내를 제공합니다.</p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-5">
        <aside className="md:col-span-2 rounded-2xl bg-white/90 p-4 shadow ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">목록</h2>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{notices.length}건</span>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {notices.map((n) => (
              <Link
                key={n.id}
                to={`/notices/${n.id}`}
                className={`block py-3 transition ${selected?.id === n.id ? 'text-indigo-700' : 'text-slate-700 hover:text-slate-900'}`}
              >
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="mt-1 text-xs text-slate-500">{n.date}</p>
              </Link>
            ))}
          </div>
        </aside>

        <section className="md:col-span-3 rounded-2xl bg-white/90 p-6 shadow ring-1 ring-slate-100">
          {selected ? (
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selected.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">{selected.date}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">공지</span>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-100">
                {selected.content}
              </div>
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
                추후 “첨부파일/작성자/조회수/고정 공지” 등의 필드를 확장할 수 있습니다.
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-600">공지사항이 없습니다.</div>
          )}
        </section>
      </div>
    </div>
  )
}

export default NoticesPage
