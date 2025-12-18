import type { ApiResult, LectureRoom, RentableItem, Reservation, Role, User } from '../types'
import { kv } from './idbKV'

const delay = (ms = 180) => new Promise((res) => setTimeout(res, ms))

type UserRecord = User & { password: string }

const LEGACY_USERS_STORAGE_KEY = 'dku-room-booker:users'
const RESERVED_ADMIN_IDS = new Set(['99999999', '9999'])

const defaultUsers: UserRecord[] = [
  // Swing 로그인 규칙(예시):
  // - 마스터 관리자: 99999999 / 99999999
  // - 추가 관리자: 9999 / 9999
  { id: '99999999', name: '관리자', role: 'admin', password: '99999999' },
  { id: '9999', name: '관리자', role: 'admin', password: '9999' },
  // 일반 사용자(예시): 학번/비밀번호 동일
  { id: '20250001', name: '김학생', role: 'student', password: '20250001' },
]

let rooms: LectureRoom[] = [
  { id: 'r-101', name: '인문관 101', deposit: 50000, size: 'small', feature: 'projector', available: true },
  { id: 'r-201', name: '자연관 201', deposit: 70000, size: 'medium', feature: 'recording', available: true },
  { id: 'r-301', name: '공학관 301', deposit: 90000, size: 'large', feature: 'projector', available: true },
  { id: 'r-302', name: '공학관 302', deposit: 80000, size: 'medium', feature: 'basic', available: false },
]

let items: RentableItem[] = [
  { id: 'i-mic', name: '무선 마이크 세트', deposit: 30000, rentalPeriodDays: 3, stock: 3 },
  { id: 'i-cam', name: '캠코더', deposit: 50000, rentalPeriodDays: 2, stock: 2 },
  { id: 'i-proj', name: '휴대용 프로젝터', deposit: 40000, rentalPeriodDays: 4, stock: 1 },
]

let reservations: Reservation[] = [
  {
    id: 'res-1',
    type: 'lecture',
    resourceId: 'r-201',
    resourceName: '자연관 201',
    userId: '20250001',
    userName: '김학생',
    date: new Date().toISOString().slice(0, 10),
    startTime: '10:00',
    endTime: '12:00',
    status: 'active',
    createdAt: new Date().toISOString(),
    notes: '자료조사 세미나',
  },
  {
    id: 'res-2',
    type: 'item',
    resourceId: 'i-mic',
    resourceName: '무선 마이크 세트',
    userId: '20250001',
    userName: '김학생',
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '18:00',
    status: 'active',
    createdAt: new Date().toISOString(),
    notes: '동아리 발표',
  },
]

const clone = <T>(data: T): ApiResult<T> => ({ data: structuredClone(data) })

const overlaps = (startA: string, endA: string, startB: string, endB: string) => {
  return startA < endB && endA > startB
}

let loaded = false
let users: UserRecord[] = []

const tryReadLegacyUsers = (): UserRecord[] | null => {
  try {
    const raw = localStorage.getItem(LEGACY_USERS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    return parsed as UserRecord[]
  } catch {
    return null
  }
}

const ensureLoaded = async () => {
  if (loaded) return

  const [usersFromIdb, roomsFromIdb, itemsFromIdb, reservationsFromIdb] = await Promise.all([
    kv.get<UserRecord[]>('users'),
    kv.get<LectureRoom[]>('rooms'),
    kv.get<RentableItem[]>('items'),
    kv.get<Reservation[]>('reservations'),
  ])

  if (usersFromIdb && Array.isArray(usersFromIdb) && usersFromIdb.length > 0) {
    users = usersFromIdb
  } else {
    const legacy = tryReadLegacyUsers()
    users = legacy && legacy.length > 0 ? legacy : structuredClone(defaultUsers)
    await kv.set('users', users)
  }

  if (roomsFromIdb && Array.isArray(roomsFromIdb) && roomsFromIdb.length > 0) {
    rooms = roomsFromIdb
  } else {
    await kv.set('rooms', rooms)
  }

  if (itemsFromIdb && Array.isArray(itemsFromIdb) && itemsFromIdb.length > 0) {
    items = itemsFromIdb
  } else {
    await kv.set('items', items)
  }

  if (reservationsFromIdb && Array.isArray(reservationsFromIdb)) {
    reservations = reservationsFromIdb
  } else {
    await kv.set('reservations', reservations)
  }

  loaded = true
}

const persistRooms = async () => kv.set('rooms', rooms)
const persistItems = async () => kv.set('items', items)
const persistReservations = async () => kv.set('reservations', reservations)
const persistUsers = async () => kv.set('users', users)

export const fakeApi = {
  async listUsers() {
    await delay()
    await ensureLoaded()
    const safeUsers: User[] = users.map(({ password: _pw, ...u }) => u)
    return clone(safeUsers)
  },
  async listRooms() {
    await delay()
    await ensureLoaded()
    return clone(rooms)
  },
  async listItems() {
    await delay()
    await ensureLoaded()
    return clone(items)
  },
  async listReservations() {
    await delay()
    await ensureLoaded()
    return clone(reservations)
  },
  async login(userId: string, password: string) {
    await delay()
    await ensureLoaded()
    const user = users.find((u) => u.id === userId)
    if (!user) return { data: null as any, error: '사용자를 찾을 수 없습니다.' }
    if (user.password !== password) return { data: null as any, error: '비밀번호가 올바르지 않습니다.' }
    const { password: _pw, ...safeUser } = user
    return { data: structuredClone(safeUser) }
  },
  async register(params: { userId: string; name: string; password: string; role?: Role }) {
    await delay()
    await ensureLoaded()
    const id = params.userId.trim()
    const name = params.name.trim()
    const password = params.password
    if (!id || !name || !password) return { data: null as any, error: '필수 값을 입력하세요.' }
    if (!/^\d+$/.test(id)) return { data: null as any, error: '학번(아이디)은 숫자만 입력할 수 있습니다.' }
    if (!/^[A-Za-z가-힣\s]+$/.test(name))
      return { data: null as any, error: '실명은 한글/영문만 입력할 수 있습니다. (숫자 불가)' }
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(password)) return { data: null as any, error: '비밀번호에는 한글을 사용할 수 없습니다.' }
    if (RESERVED_ADMIN_IDS.has(id)) return { data: null as any, error: '해당 학번(아이디)은 사용할 수 없습니다.' }

    const exists = users.some((u) => u.id === id)
    if (exists) return { data: null as any, error: '이미 사용 중인 학번(아이디)입니다.' }

    if (params.role && params.role !== 'student') {
      return { data: null as any, error: '관리자 계정은 회원가입으로 생성할 수 없습니다.' }
    }
    const role: Role = 'student'
    const record: UserRecord = { id, name, role, password }
    users = [...users, record]
    await persistUsers()

    const { password: _pw, ...safeUser } = record
    return { data: structuredClone(safeUser) }
  },

  // =========================
  // Lecture room
  // =========================
  async createLectureReservation(params: {
    userId: string
    userName: string
    roomId: string
    roomName: string
    date: string
    startTime: string
    endTime: string
    notes?: string
  }) {
    await delay()
    await ensureLoaded()
    const conflict = reservations.find(
      (r) =>
        r.type === 'lecture' &&
        r.resourceId === params.roomId &&
        r.date === params.date &&
        r.status === 'active' &&
        overlaps(r.startTime, r.endTime, params.startTime, params.endTime),
    )
    if (conflict) {
      return { data: null as any, error: '해당 시간에 이미 예약이 있습니다.' }
    }
    const res: Reservation = {
      id: `res-${crypto.randomUUID?.() ?? Date.now()}`,
      type: 'lecture',
      resourceId: params.roomId,
      resourceName: params.roomName,
      userId: params.userId,
      userName: params.userName,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      status: 'active',
      createdAt: new Date().toISOString(),
      notes: params.notes,
    }
    reservations.unshift(res)
    await persistReservations()
    return { data: structuredClone(res) }
  },

  // =========================
  // Items
  // =========================
  async rentItem(params: {
    userId: string
    userName: string
    itemId: string
    itemName: string
    startDate: string
    endDate: string
    notes?: string
  }) {
    await delay()
    await ensureLoaded()
    const item = items.find((i) => i.id === params.itemId)
    if (!item) return { data: null as any, error: '대여 품목을 찾을 수 없습니다.' }

    const activeCount = reservations.filter(
      (r) => r.type === 'item' && r.resourceId === params.itemId && r.status === 'active',
    ).length
    if (activeCount >= item.stock) {
      return { data: null as any, error: '재고가 없습니다.' }
    }

    const res: Reservation = {
      id: `res-${crypto.randomUUID?.() ?? Date.now()}`,
      type: 'item',
      resourceId: params.itemId,
      resourceName: params.itemName,
      userId: params.userId,
      userName: params.userName,
      date: params.startDate,
      startTime: params.startDate,
      endTime: params.endDate,
      status: 'active',
      createdAt: new Date().toISOString(),
      notes: params.notes,
    }
    reservations.unshift(res)
    await persistReservations()
    return { data: structuredClone(res) }
  },

  async returnReservation(reservationId: string) {
    await delay()
    await ensureLoaded()
    const found = reservations.find((r) => r.id === reservationId)
    if (!found) return { data: null as any, error: '예약을 찾을 수 없습니다.' }
    found.status = 'returned'
    await persistReservations()
    return { data: structuredClone(found) }
  },

  async cancelReservation(reservationId: string) {
    await delay()
    await ensureLoaded()
    const found = reservations.find((r) => r.id === reservationId)
    if (!found) return { data: null as any, error: '예약을 찾을 수 없습니다.' }
    found.status = 'cancelled'
    await persistReservations()
    return { data: structuredClone(found) }
  },

  // =========================
  // Resource management (admin)
  // =========================
  async addRoom(room: Omit<LectureRoom, 'id'>) {
    await delay()
    await ensureLoaded()
    const exists = rooms.some((r) => r.name === room.name)
    if (exists) return { data: null as any, error: '이미 존재하는 강의실입니다.' }
    const newRoom = { ...room, id: `r-${rooms.length + 1}` }
    rooms.push(newRoom)
    await persistRooms()
    return { data: structuredClone(newRoom) }
  },

  async updateRoom(id: string, patch: Partial<LectureRoom>) {
    await delay()
    await ensureLoaded()
    const target = rooms.find((r) => r.id === id)
    if (!target) return { data: null as any, error: '강의실을 찾을 수 없습니다.' }
    Object.assign(target, patch)
    await persistRooms()
    return { data: structuredClone(target) }
  },

  async deleteRoom(id: string) {
    await delay()
    await ensureLoaded()
    rooms = rooms.filter((r) => r.id !== id)
    reservations = reservations.filter((r) => !(r.type === 'lecture' && r.resourceId === id))
    await Promise.all([persistRooms(), persistReservations()])
    return { data: true }
  },

  async addItem(item: Omit<RentableItem, 'id'>) {
    await delay()
    await ensureLoaded()
    const exists = items.some((r) => r.name === item.name)
    if (exists) return { data: null as any, error: '이미 존재하는 품목입니다.' }
    const newItem = { ...item, id: `i-${items.length + 1}` }
    items.push(newItem)
    await persistItems()
    return { data: structuredClone(newItem) }
  },

  async updateItem(id: string, patch: Partial<RentableItem>) {
    await delay()
    await ensureLoaded()
    const target = items.find((r) => r.id === id)
    if (!target) return { data: null as any, error: '품목을 찾을 수 없습니다.' }
    Object.assign(target, patch)
    await persistItems()
    return { data: structuredClone(target) }
  },

  async deleteItem(id: string) {
    await delay()
    await ensureLoaded()
    items = items.filter((i) => i.id !== id)
    reservations = reservations.filter((r) => !(r.type === 'item' && r.resourceId === id))
    await Promise.all([persistItems(), persistReservations()])
    return { data: true }
  },
}
