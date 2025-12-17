import { useEffect, useId, useState } from 'react'
import { exportResultsXlsx, checkPassword } from '../lib/api'

export type AdminData = {
  userId: string
  repeatCount: number
  dbPassword: string
}

export type AdminStepProps = {
  initial?: Partial<AdminData>
  onNext: (data: AdminData) => void
}

export function AdminStep({ initial, onNext }: AdminStepProps) {
  const userIdId = useId()
  const repeatId = useId()

  const [userId, setUserId] = useState(initial?.userId ?? '')
  const [repeatCount, setRepeatCount] = useState<number>(
    Number.isFinite(initial?.repeatCount as number) && (initial?.repeatCount as number)! > 0
      ? (initial!.repeatCount as number)
      : 1
  )
  const [dbPassword, setDbPassword] = useState(initial && 'dbPassword' in (initial as any) ? (initial as any).dbPassword ?? '' : '')
  const [touched, setTouched] = useState({ userId: false, repeat: false, dbPassword: false })
  const [exporting, setExporting] = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    // keep within sensible bounds
    if (repeatCount < 1) setRepeatCount(1)
    if (repeatCount > 1000) setRepeatCount(1000)
  }, [repeatCount])

  const userIdError = userId.trim() === '' ? 'Required' : undefined
  const repeatError = !Number.isFinite(repeatCount) || repeatCount < 1 ? 'Must be ≥ 1' : undefined
  const dbPasswordError = dbPassword.trim() === '' ? 'Required' : undefined
  const canNext = !userIdError && !repeatError && !dbPasswordError
  const canExport = dbPassword.trim() !== '' && !exporting
  const canVerify = dbPassword.trim() !== '' && !verifying

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ userId: true, repeat: true, dbPassword: true })
    if (!canNext) return
    onNext({ userId: userId.trim(), repeatCount: Math.floor(repeatCount), dbPassword })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="space-y-1">
        <label htmlFor={userIdId} className="block text-sm font-medium text-gray-800">
          User ID
        </label>
        <input
          id={userIdId}
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, userId: true }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          placeholder="Enter user identifier"
        />
        {touched.userId && userIdError && (
          <p className="text-sm text-red-600">{userIdError}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor={repeatId} className="block text-sm font-medium text-gray-800">
          Repeated form request count
        </label>
        <input
          id={repeatId}
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={Number.isFinite(repeatCount) ? repeatCount : ''}
          onChange={(e) => setRepeatCount(parseInt(e.target.value || '1', 10))}
          onBlur={() => setTouched((t) => ({ ...t, repeat: true }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          placeholder="e.g., 1"
        />
        {touched.repeat && repeatError && (
          <p className="text-sm text-red-600">{repeatError}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor={`${repeatId}-pw`} className="block text-sm font-medium text-gray-800">
          Database Password
        </label>
        <input
          id={`${repeatId}-pw`}
          type="password"
          autoComplete="current-password"
          value={dbPassword}
          onChange={(e) => setDbPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, dbPassword: true }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          placeholder="Enter DB password"
        />
        {touched.dbPassword && dbPasswordError && (
          <p className="text-sm text-red-600">{dbPasswordError}</p>
        )}
        <p className="text-xs text-gray-500">Note: This will be sent to the API over HTTPS. Avoid using privileged credentials.</p>
      </div>

      <div className="pt-2 flex justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              if (!dbPassword || verifying) return
              const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ||
                'https://lab-form-server-863768606140.us-central1.run.app'
              try {
                setVerifying(true)
                const ok = await checkPassword(apiBase, dbPassword)
                if (ok) {
                  alert('비밀번호가 확인되었습니다.')
                } else {
                  alert('비밀번호가 올바르지 않습니다.')
                }
              } catch (e: any) {
                alert(e?.message || '비밀번호 확인 중 오류가 발생했습니다.')
              } finally {
                setVerifying(false)
              }
            }}
            disabled={!canVerify}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-gray-800 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {verifying ? '확인 중…' : '비밀번호 확인'}
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!dbPassword || exporting) return
              const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ||
                'https://lab-form-server-863768606140.us-central1.run.app'
              try {
                setExporting(true)
                await exportResultsXlsx(apiBase, dbPassword)
              } catch (e: any) {
                alert(e?.message || 'Failed to download export')
              } finally {
                setExporting(false)
              }
            }}
            disabled={!canExport}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-gray-800 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {exporting ? 'Downloading…' : 'Download XLSX'}
          </button>
        </div>

        <button
          type="submit"
          disabled={!canNext}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Next
        </button>
      </div>
    </form>
  )
}
