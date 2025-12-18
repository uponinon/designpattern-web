type KVKey = 'users' | 'rooms' | 'items' | 'reservations'

type KVRecord = {
  key: KVKey
  value: unknown
}

const DB_NAME = 'dku-room-booker'
const STORE_NAME = 'kv'
const DB_VERSION = 1

const hasIndexedDB = () => typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB'))
  })
}

const txRequest = <T>(request: IDBRequest<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

const withStore = async <T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const db = await openDB()
  try {
    const tx = db.transaction(STORE_NAME, mode)
    const store = tx.objectStore(STORE_NAME)
    const result = await txRequest(fn(store))
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'))
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction error'))
    })
    return result
  } finally {
    db.close()
  }
}

const localFallback = {
  get: (key: KVKey) => {
    try {
      const raw = localStorage.getItem(`${DB_NAME}:${key}`)
      return raw ? (JSON.parse(raw) as unknown) : null
    } catch {
      return null
    }
  },
  set: (key: KVKey, value: unknown) => {
    localStorage.setItem(`${DB_NAME}:${key}`, JSON.stringify(value))
  },
}

export const kv = {
  async get<T>(key: KVKey): Promise<T | null> {
    if (!hasIndexedDB()) return localFallback.get(key) as T | null
    const row = await withStore<KVRecord | undefined>('readonly', (store) => store.get(key) as any)
    return (row?.value as T) ?? null
  },

  async set(key: KVKey, value: unknown): Promise<void> {
    if (!hasIndexedDB()) return localFallback.set(key, value)
    await withStore('readwrite', (store) => store.put({ key, value } satisfies KVRecord))
  },
}

