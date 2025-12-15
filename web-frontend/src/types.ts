export type Role = 'student' | 'admin'

export type User = {
  id: string
  name: string
  role: Role
}

export type RoomSize = 'small' | 'medium' | 'large'
export type RoomFeature = 'basic' | 'projector' | 'recording'

export type LectureRoom = {
  id: string
  name: string
  deposit: number
  size: RoomSize
  feature: RoomFeature
  available: boolean
}

export type RentableItem = {
  id: string
  name: string
  deposit: number
  rentalPeriodDays: number
  stock: number
}

export type ReservationType = 'lecture' | 'item'
export type ReservationStatus = 'active' | 'cancelled' | 'returned'

export type Reservation = {
  id: string
  type: ReservationType
  resourceId: string
  resourceName: string
  userId: string
  userName: string
  date: string // ISO date (yyyy-MM-dd) for lecture reservations
  startTime: string // HH:mm
  endTime: string // HH:mm
  status: ReservationStatus
  createdAt: string
  notes?: string
}

export type ApiResult<T> = {
  data: T
  error?: string
}
