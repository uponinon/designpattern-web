import type { ApiResult, LectureRoom, RentableItem, Reservation, User } from '../types'

const delay = (ms = 180) => new Promise((res) => setTimeout(res, ms))

const users: User[] = [
  { id: 's12345', name: '김학생', role: 'student' },
  { id: 'a00001', name: '관리자', role: 'admin' },
]

let rooms: LectureRoom[] = [
  { id: 'r-101', name: 'A동 101', deposit: 50000, size: 'small', feature: 'projector', available: true },
  { id: 'r-201', name: 'B동 201', deposit: 70000, size: 'medium', feature: 'recording', available: true },
  { id: 'r-301', name: 'C동 301', deposit: 90000, size: 'large', feature: 'projector', available: true },
  { id: 'r-302', name: 'C동 302', deposit: 80000, size: 'medium', feature: 'basic', available: false },
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
    resourceName: 'B동 201',
    userId: 's12345',
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
    userId: 's12345',
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

export const fakeApi = {
  async listUsers() {
    await delay()
    return clone(users)
  },
  async listRooms() {
    await delay()
    return clone(rooms)
  },
  async listItems() {
    await delay()
    return clone(items)
  },
  async listReservations() {
    await delay()
    return clone(reservations)
  },
  async login(userId: string) {
    await delay()
    const user = users.find((u) => u.id === userId)
    if (!user) return { data: null, error: '사용자를 찾을 수 없습니다.' }
    return { data: structuredClone(user) }
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
    const conflict = reservations.find(
      (r) =>
        r.type === 'lecture' &&
        r.resourceId === params.roomId &&
        r.date === params.date &&
        r.status === 'active' &&
        overlaps(r.startTime, r.endTime, params.startTime, params.endTime),
    )
    if (conflict) {
      return { data: null, error: '해당 시간에 이미 예약이 있습니다.' }
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
    const item = items.find((i) => i.id === params.itemId)
    if (!item) return { data: null, error: '대여 품목을 찾을 수 없습니다.' }

    const activeCount = reservations.filter(
      (r) => r.type === 'item' && r.resourceId === params.itemId && r.status === 'active',
    ).length
    if (activeCount >= item.stock) {
      return { data: null, error: '재고가 없습니다.' }
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
    return { data: structuredClone(res) }
  },

  async returnReservation(reservationId: string) {
    await delay()
    const found = reservations.find((r) => r.id === reservationId)
    if (!found) return { data: null, error: '예약을 찾을 수 없습니다.' }
    found.status = 'returned'
    return { data: structuredClone(found) }
  },

  async cancelReservation(reservationId: string) {
    await delay()
    const found = reservations.find((r) => r.id === reservationId)
    if (!found) return { data: null, error: '예약을 찾을 수 없습니다.' }
    found.status = 'cancelled'
    return { data: structuredClone(found) }
  },

  // =========================
  // Resource management (admin)
  // =========================
  async addRoom(room: Omit<LectureRoom, 'id'>) {
    await delay()
    const exists = rooms.some((r) => r.name === room.name)
    if (exists) return { data: null, error: '이미 존재하는 강의실입니다.' }
    const newRoom = { ...room, id: `r-${rooms.length + 1}` }
    rooms.push(newRoom)
    return { data: structuredClone(newRoom) }
  },

  async updateRoom(id: string, patch: Partial<LectureRoom>) {
    await delay()
    const target = rooms.find((r) => r.id === id)
    if (!target) return { data: null, error: '강의실을 찾을 수 없습니다.' }
    Object.assign(target, patch)
    return { data: structuredClone(target) }
  },

  async deleteRoom(id: string) {
    await delay()
    rooms = rooms.filter((r) => r.id !== id)
    reservations = reservations.filter((r) => !(r.type === 'lecture' && r.resourceId === id))
    return { data: true }
  },

  async addItem(item: Omit<RentableItem, 'id'>) {
    await delay()
    const exists = items.some((r) => r.name === item.name)
    if (exists) return { data: null, error: '이미 존재하는 품목입니다.' }
    const newItem = { ...item, id: `i-${items.length + 1}` }
    items.push(newItem)
    return { data: structuredClone(newItem) }
  },

  async updateItem(id: string, patch: Partial<RentableItem>) {
    await delay()
    const target = items.find((r) => r.id === id)
    if (!target) return { data: null, error: '품목을 찾을 수 없습니다.' }
    Object.assign(target, patch)
    return { data: structuredClone(target) }
  },

  async deleteItem(id: string) {
    await delay()
    items = items.filter((i) => i.id !== id)
    reservations = reservations.filter((r) => !(r.type === 'item' && r.resourceId === id))
    return { data: true }
  },
}
