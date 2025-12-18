import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'

type LocationState = {
  from?: string
}

const SignupPage = () => {
  const { signup } = useAppState()
  const nav = useNavigate()
  const location = useLocation()

  const from = (location.state as LocationState | null)?.from
  const defaultTarget = useMemo(() => (from ? from : '/'), [from])

  const [userId, setUserId] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isComposingName, setIsComposingName] = useState(false)

  const [idPlaceholder, setIdPlaceholder] = useState('학번 입니다.')

  const sanitizeName = (value: string) => value.replace(/[^A-Za-z가-힣\s]/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    const trimmedUserId = userId.trim()
    const trimmedName = name.trim()

    if (!trimmedUserId || !trimmedName || !password || !passwordConfirm) {
      setMessage('모든 항목을 입력하세요.')
      return
    }
    if (!/^\d+$/.test(trimmedUserId)) {
      setMessage('아이디(학번)는 숫자만 입력할 수 있습니다.')
      return
    }
    if (!/^[A-Za-z가-힣\s]+$/.test(trimmedName)) {
      setMessage('실명은 한글/영문만 입력할 수 있습니다. (숫자 불가)')
      return
    }
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(password)) {
      setMessage('비밀번호에는 한글을 사용할 수 없습니다.')
      return
    }
    if (password !== passwordConfirm) {
      setMessage('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    const result = await signup({ userId: trimmedUserId, name: trimmedName, password })
    setLoading(false)
    if (!result.ok) {
      setMessage(result.error)
      return
    }

    nav(defaultTarget, { replace: true })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">회원가입</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">단국대 강의실 예약관리 시스템</h1>
        <p className="mt-2 text-slate-600">회원가입 후 로그인 상태로 전환됩니다.</p>
      </div>

      <div className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-indigo-200/30 ring-1 ring-slate-100">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              아이디
              <input
                value={userId}
                inputMode="numeric"
                autoComplete="username"
                onChange={(e) => setUserId(e.target.value.replace(/\D/g, ''))}
                placeholder={idPlaceholder}
                onFocus={() => setIdPlaceholder('')}
                onBlur={() => setIdPlaceholder(userId.trim() ? '' : '학번 입니다.')}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              실명
              <input
                value={name}
                autoComplete="name"
                onCompositionStart={() => setIsComposingName(true)}
                onCompositionEnd={(e) => {
                  setIsComposingName(false)
                  setName(sanitizeName(e.currentTarget.value))
                }}
                onChange={(e) => {
                  const value = e.target.value
                  setName(isComposingName ? value : sanitizeName(value))
                }}
                placeholder="예: 홍길동"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              비밀번호
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              비밀번호 확인
              <input
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                type="password"
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
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignupPage
