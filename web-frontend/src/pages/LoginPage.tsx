import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'

type LocationState = {
  from?: string
}

const LoginPage = () => {
  const { login } = useAppState()
  const nav = useNavigate()
  const location = useLocation()

  const from = (location.state as LocationState | null)?.from
  const defaultTarget = useMemo(() => (from ? from : '/'), [from])

  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!userId || !password) {
      setMessage('학번과 비밀번호를 입력하세요.')
      return
    }
    setLoading(true)
    const result = await login({ userId, password })
    setLoading(false)
    if (!result.ok) {
      setMessage(result.error)
      return
    }

    const target = result.data?.role === 'admin' ? '/admin' : defaultTarget
    nav(target, { replace: true })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">로그인</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">단국대 강의실 예약관리 시스템</h1>
          <p className="mt-2 text-slate-600">Swing 로그인 흐름을 기반으로, 학번/비밀번호로 로그인하도록 구성했습니다.</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-indigo-200/30 ring-1 ring-slate-100">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              학번
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value.trim())}
                placeholder="예: 20250001"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              비밀번호
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="예: 20250001"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </div>

          {message && <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-slate-600">계정이 없으신가요?</span>
            <Link
              to="/signup"
              state={{ from: defaultTarget }}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-50"
            >
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
