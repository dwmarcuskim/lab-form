import { useEffect, useId, useState } from 'react'

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

  useEffect(() => {
    // keep within sensible bounds
    if (repeatCount < 1) setRepeatCount(1)
    if (repeatCount > 1000) setRepeatCount(1000)
  }, [repeatCount])

  const userIdError = userId.trim() === '' ? 'Required' : undefined
  const repeatError = !Number.isFinite(repeatCount) || repeatCount < 1 ? 'Must be ≥ 1' : undefined
  const dbPasswordError = dbPassword.trim() === '' ? 'Required' : undefined
  const canNext = !userIdError && !repeatError && !dbPasswordError

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

      <div className="pt-2 flex justify-end">
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
