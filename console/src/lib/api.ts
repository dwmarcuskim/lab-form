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

// Verify DB password: POST { password } to /submit/verify, expects { ok: boolean }
export async function checkPassword(baseUrl: string, password: string): Promise<boolean> {
  const url = `${baseUrl.replace(/\/$/, '')}/submit/verify`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Verify failed: ${res.status} ${text}`)
  }
  const data = (await res.json().catch(() => ({ ok: false }))) as { ok?: boolean }
  return Boolean(data?.ok)
}

// Export results as XLSX by POSTing password to /submit/export.xlsx
export async function exportResultsXlsx(baseUrl: string, password: string): Promise<void> {
  const url = `${baseUrl.replace(/\/$/, '')}/submit/export.xlsx`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Export failed: ${res.status} ${text}`)
  }
  const blob = await res.blob()
  // Try to extract filename from Content-Disposition
  const disposition = res.headers.get('Content-Disposition') || res.headers.get('content-disposition')
  let filename = 'export.xlsx'
  if (disposition) {
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition)
    const picked = decodeURIComponent((match?.[1] || match?.[2] || '').trim())
    if (picked) filename = picked
  }
  const blobUrl = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}
