export type SubmissionRequest = {
  password: string
  username: string
  repeated: number
  score: number
}

export async function createSubmission(baseUrl: string, payload: SubmissionRequest): Promise<{ id: string }> {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Save failed: ${res.status} ${text}`)
  }
  return res.json()
}
