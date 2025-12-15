import { NavLink, Outlet } from 'react-router-dom'
import { useAppState } from '../state/AppState'

const navItems = [
  { to: '/', label: '대시보드' },
  { to: '/rooms', label: '강의실' },
  { to: '/reservations', label: '예약' },
  { to: '/admin', label: '관리' },
]

const Layout = () => {
  const { user, users, switchUser } = useAppState()

  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              CR
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Campus</div>
              <div className="text-lg font-semibold text-slate-900">Room Booker</div>
            </div>
          </div>
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
            <span className="hidden font-medium text-slate-500 md:block">사용자</span>
            <select
              value={user?.id ?? ''}
              onChange={(e) => switchUser(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-slate-500">
          <span>강의실 예약 시스템 · 웹 포트폴리오</span>
          <span>Frontend: React + Vite + Tailwind</span>
        </div>
      </footer>
    </div>
  )
}

export default Layout
