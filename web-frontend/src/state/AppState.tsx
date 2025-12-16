import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fakeApi } from '../services/fakeApi'
import type { LectureRoom, RentableItem, Reservation, User } from '../types'

const STORAGE_KEY = 'dku-room-booker:userId'

type ActionResult<T = void> =
  | { ok: true; data?: T }
  | {
      ok: false
      error: string
    }

type AppState = {
  ready: boolean
  user: User | null
  users: User[]
  rooms: LectureRoom[]
  items: RentableItem[]
  reservations: Reservation[]
  login: (params: { userId: string; password: string }) => Promise<ActionResult<User>>
  signup: (params: { userId: string; name: string; password: string }) => Promise<ActionResult<User>>
  logout: () => void
  switchUser: (userId: string) => Promise<ActionResult<User>>
  refreshAll: () => Promise<void>
  createLectureReservation: (params: {
    roomId: string
    roomName: string
    date: string
    startTime: string
    endTime: string
    notes?: string
  }) => Promise<ActionResult<Reservation>>
  rentItem: (params: { itemId: string; itemName: string; startDate: string; endDate: string; notes?: string }) => Promise<ActionResult<Reservation>>
  cancelReservation: (id: string) => Promise<ActionResult<Reservation>>
  returnReservation: (id: string) => Promise<ActionResult<Reservation>>
  addRoom: (room: Omit<LectureRoom, 'id'>) => Promise<ActionResult<LectureRoom>>
  updateRoom: (id: string, patch: Partial<LectureRoom>) => Promise<ActionResult<LectureRoom>>
  deleteRoom: (id: string) => Promise<ActionResult<boolean>>
  addItem: (item: Omit<RentableItem, 'id'>) => Promise<ActionResult<RentableItem>>
  updateItem: (id: string, patch: Partial<RentableItem>) => Promise<ActionResult<RentableItem>>
  deleteItem: (id: string) => Promise<ActionResult<boolean>>
}

const AppStateContext = createContext<AppState | null>(null)

export const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [rooms, setRooms] = useState<LectureRoom[]>([])
  const [items, setItems] = useState<RentableItem[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])

  const refreshAll = async () => {
    const [userList, roomList, itemList, reservationList] = await Promise.all([
      fakeApi.listUsers(),
      fakeApi.listRooms(),
      fakeApi.listItems(),
      fakeApi.listReservations(),
    ])
    setUsers(userList.data)
    setRooms(roomList.data)
    setItems(itemList.data)
    setReservations(reservationList.data)

    const savedUserId = localStorage.getItem(STORAGE_KEY)
    if (savedUserId) {
      const u = userList.data.find((x) => x.id === savedUserId) ?? null
      setUser(u)
    } else {
      setUser(null)
    }
    setReady(true)
  }

  useEffect(() => {
    refreshAll()
  }, [])

  const guardUser = () => {
    if (!user) return { ok: false, error: '로그인이 필요합니다.' } satisfies ActionResult
    return { ok: true as const }
  }

  const actions = useMemo(() => {
    const login: AppState['login'] = async ({ userId, password }) => {
      const result = await fakeApi.login(userId, password)
      if (result.error || !result.data) return { ok: false, error: result.error ?? '로그인 실패' }
      setUser(result.data)
      localStorage.setItem(STORAGE_KEY, result.data.id)
      return { ok: true, data: result.data }
    }

    const signup: AppState['signup'] = async ({ userId, name, password }) => {
      const result = await fakeApi.register({ userId, name, password, role: 'student' })
      if (result.error || !result.data) return { ok: false, error: result.error ?? '회원가입 실패' }
      setUsers((prev) => [...prev, result.data!])
      setUser(result.data)
      localStorage.setItem(STORAGE_KEY, result.data.id)
      return { ok: true, data: result.data }
    }

    const logout: AppState['logout'] = () => {
      setUser(null)
      localStorage.removeItem(STORAGE_KEY)
    }

    const switchUser = async (userId: string): Promise<ActionResult<User>> => {
      const u = users.find((x) => x.id === userId)
      if (!u) return { ok: false, error: '사용자를 찾을 수 없습니다.' }
      setUser(u)
      localStorage.setItem(STORAGE_KEY, u.id)
      return { ok: true, data: u }
    }

    const createLectureReservation: AppState['createLectureReservation'] = async (params) => {
      const g = guardUser()
      if (!g.ok || !user) return g

      const result = await fakeApi.createLectureReservation({
        userId: user.id,
        userName: user.name,
        ...params,
      })
      if (result.error || !result.data) return { ok: false, error: result.error ?? '예약 생성 실패' }

      setReservations((prev) => [result.data!, ...prev])
      return { ok: true, data: result.data }
    }

    const rentItem: AppState['rentItem'] = async (params) => {
      const g = guardUser()
      if (!g.ok || !user) return g
      const result = await fakeApi.rentItem({
        userId: user.id,
        userName: user.name,
        ...params,
      })
      if (result.error || !result.data) return { ok: false, error: result.error ?? '대여 실패' }
      setReservations((prev) => [result.data!, ...prev])
      return { ok: true, data: result.data }
    }

    const cancelReservation = async (id: string): Promise<ActionResult<Reservation>> => {
      const result = await fakeApi.cancelReservation(id)
      if (result.error || !result.data) return { ok: false, error: result.error ?? '취소 실패' }
      setReservations((prev) => prev.map((r) => (r.id === id ? result.data! : r)))
      return { ok: true, data: result.data }
    }

    const returnReservation = async (id: string): Promise<ActionResult<Reservation>> => {
      const result = await fakeApi.returnReservation(id)
      if (result.error || !result.data) return { ok: false, error: result.error ?? '반납 실패' }
      setReservations((prev) => prev.map((r) => (r.id === id ? result.data! : r)))
      return { ok: true, data: result.data }
    }

    const addRoom: AppState['addRoom'] = async (room) => {
      const result = await fakeApi.addRoom(room)
      if (result.error || !result.data) return { ok: false, error: result.error ?? '추가 실패' }
      setRooms((prev) => [...prev, result.data!])
      return { ok: true, data: result.data }
    }

    const updateRoom: AppState['updateRoom'] = async (id, patch) => {
      const result = await fakeApi.updateRoom(id, patch)
      if (result.error || !result.data) return { ok: false, error: result.error ?? '수정 실패' }
      setRooms((prev) => prev.map((r) => (r.id === id ? result.data! : r)))
      return { ok: true, data: result.data }
    }

    const deleteRoom: AppState['deleteRoom'] = async (id) => {
      const result = await fakeApi.deleteRoom(id)
      setRooms((prev) => prev.filter((r) => r.id !== id))
      setReservations((prev) => prev.filter((r) => !(r.type === 'lecture' && r.resourceId === id)))
      return { ok: true, data: result.data }
    }

    const addItem: AppState['addItem'] = async (item) => {
      const result = await fakeApi.addItem(item)
      if (result.error || !result.data) return { ok: false, error: result.error ?? '추가 실패' }
      setItems((prev) => [...prev, result.data!])
      return { ok: true, data: result.data }
    }

    const updateItem: AppState['updateItem'] = async (id, patch) => {
      const result = await fakeApi.updateItem(id, patch)
      if (result.error || !result.data) return { ok: false, error: result.error ?? '수정 실패' }
      setItems((prev) => prev.map((r) => (r.id === id ? result.data! : r)))
      return { ok: true, data: result.data }
    }

    const deleteItem: AppState['deleteItem'] = async (id) => {
      const result = await fakeApi.deleteItem(id)
      setItems((prev) => prev.filter((r) => r.id !== id))
      setReservations((prev) => prev.filter((r) => !(r.type === 'item' && r.resourceId === id)))
      return { ok: true, data: result.data }
    }

    return {
      login,
      signup,
      logout,
      switchUser,
      createLectureReservation,
      rentItem,
      cancelReservation,
      returnReservation,
      addRoom,
      updateRoom,
      deleteRoom,
      addItem,
      updateItem,
      deleteItem,
    }
  }, [user, users])

  const value: AppState = {
    ready,
    user,
    users,
    rooms,
    items,
    reservations,
    login: actions.login,
    signup: actions.signup,
    logout: actions.logout,
    refreshAll,
    switchUser: (id) => actions.switchUser(id),
    createLectureReservation: actions.createLectureReservation,
    rentItem: actions.rentItem,
    cancelReservation: actions.cancelReservation,
    returnReservation: actions.returnReservation,
    addRoom: actions.addRoom,
    updateRoom: actions.updateRoom,
    deleteRoom: actions.deleteRoom,
    addItem: actions.addItem,
    updateItem: actions.updateItem,
    deleteItem: actions.deleteItem,
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export const useAppState = () => {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('AppStateProvider 하위에서만 사용할 수 있습니다.')
  return ctx
}
