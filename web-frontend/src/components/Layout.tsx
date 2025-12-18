import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'

const Layout = () => {
  const { user, logout } = useAppState()
  const location = useLocation()
  const nav = useNavigate()

  const navItems = [
    { to: '/', label: '홈' },
    { to: '/notices', label: '공지사항' },
    { to: '/rooms', label: '강의실예약' },
    { to: '/reservations', label: '나의 예약현황' },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: '관리자' }] : []),
  ]

  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              DK
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Dankook Univ.</div>
              <div className="text-lg font-semibold text-slate-900">Room Booker</div>
            </div>
          </Link>
          <nav className="flex gap-1 rounded-full bg-slate-100 px-2 py-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [
                    'px-4 py-2 text-sm font-medium rounded-full transition-all',
                    isActive
                      ? 'bg-white shadow text-indigo-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            {user ? (
              <>
                <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 md:block">
                  {user.name} ({user.role})
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    nav('/', { replace: true })
                  }}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-slate-500">
          <span>단국대 강의실 예약관리 시스템</span>
          <span>Frontend: React + Vite + Tailwind</span>
        </div>
      </footer>
    </div>
  )
}

export default Layout
