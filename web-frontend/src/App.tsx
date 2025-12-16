import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import NoticesPage from './pages/NoticesPage'
import NotFoundPage from './pages/NotFoundPage'
import ReservationsPage from './pages/ReservationsPage'
import RoomsPage from './pages/RoomsPage'
import SignupPage from './pages/SignupPage'
import { RequireAdmin, RequireAuth } from './routes/RequireAuth'
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
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="/notices/:id" element={<NoticesPage />} />
        <Route
          path="/rooms"
          element={
            <RequireAuth>
              <RoomsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/reservations"
          element={
            <RequireAuth>
              <ReservationsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <HomePage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/tools"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
