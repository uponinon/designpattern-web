import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ReservationsPage from './pages/ReservationsPage'
import RoomsPage from './pages/RoomsPage'
import { useAppState } from './state/AppState'

const App = () => {
  const { ready } = useAppState()

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-600">
        데이터를 불러오는 중입니다...
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
