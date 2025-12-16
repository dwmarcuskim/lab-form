export type SubmissionPayload = {
  admin: { userId: string; repeatCount: number; dbPassword: string } | null
  answers: { id: string; value: number }[]
}

export async function createSubmission(baseUrl: string, payload: SubmissionPayload): Promise<{ id: string }> {
  if (!payload.admin) throw new Error('Admin step is required')
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/submissions`, {
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
