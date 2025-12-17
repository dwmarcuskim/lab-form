// Simple localStorage-based persistence for submissions (client-side cache)

export type Submission = {
  id: string
  timestamp: string // ISO string
  username: string
  repeated: number
  score: number
}

const KEY = 'lab-form/submissions'

function safeParse<T>(text: string | null, fallback: T): T {
  if (!text) return fallback
  try {
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

export function loadSubmissions(): Submission[] {
  return safeParse<Submission[]>(localStorage.getItem(KEY), [])
}

export function saveSubmission(entry: Omit<Submission, 'id' | 'timestamp'>): Submission {
  const id = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const timestamp = new Date().toISOString()
  const full: Submission = { id, timestamp, ...entry }
  const current = loadSubmissions()
  current.push(full)
  localStorage.setItem(KEY, JSON.stringify(current))
  return full
}
