import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600">
        404
      </div>
      <h2 className="text-2xl font-bold text-slate-900">페이지를 찾을 수 없습니다.</h2>
      <p className="text-slate-600">입력한 주소가 정확한지 확인해주세요.</p>
      <Link to="/" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:-translate-y-0.5">
        홈으로 돌아가기
      </Link>
    </div>
  )
}

export default NotFoundPage
