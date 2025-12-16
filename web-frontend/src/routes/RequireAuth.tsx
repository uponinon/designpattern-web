import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppState()
  const nav = useNavigate()
  const location = useLocation()
  const alerted = useRef(false)

  useEffect(() => {
    if (user) return
    if (alerted.current) return
    alerted.current = true
    window.alert('로그인이 필요합니다.')
    nav('/login', { replace: true, state: { from: location.pathname } })
  }, [location.pathname, nav, user])

  if (!user) return null
  return children
}

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppState()
  const nav = useNavigate()
  const location = useLocation()
  const alerted = useRef(false)

  useEffect(() => {
    if (!user) {
      if (alerted.current) return
      alerted.current = true
      window.alert('로그인이 필요합니다.')
      nav('/login', { replace: true, state: { from: location.pathname } })
      return
    }
    if (user.role !== 'admin') {
      if (alerted.current) return
      alerted.current = true
      window.alert('관리자 권한이 필요합니다.')
      nav('/', { replace: true })
    }
  }, [location.pathname, nav, user])

  if (!user || user.role !== 'admin') return null
  return children
}

