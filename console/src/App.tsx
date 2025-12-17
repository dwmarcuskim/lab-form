import { useState } from 'react'
import { Form, type Question } from './components/Form'
import { AdminStep, type AdminData } from './components/AdminStep'
import { saveSubmission } from './lib/storage'
import { createSubmission, type SubmissionRequest } from './lib/api'
import { type Submission as LocalSubmission } from './lib/storage'

function App() {
  const [step, setStep] = useState<'admin' | 'form'>('admin')
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const questions: Question[] = [
    {
      id: 'id1',
      label: '빈백 던지기를 얼마나 잘할 수 있다고 생각하나요?',
      min: 0,
      max: 10,
      step: 'any',
      initialValue: 5,
    }
  ]

  async function handleFormSubmit(values: { id: string; value: number }[]) {
    const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ||
      'https://lab-form-server-863768606140.us-central1.run.app'
    if (!admin) {
      alert('Admin step is required')
      return
    }
    // Compute score: average of provided answer values (or 0 if none)
    const score = values.length > 0
      ? values.reduce((sum, v) => sum + Number(v.value || 0), 0) / values.length
      : 0
    const serverPayload: SubmissionRequest = {
      username: admin.userId,
      password: (admin as any).dbPassword,
      repeated: admin.repeatCount,
      score,
    }
    try {
      const res = await createSubmission(apiBase, serverPayload)
      console.log('Saved to Cloud SQL. id=', res.id)
      alert('Saved to Cloud SQL!')
    } catch (err) {
      console.warn('Falling back to localStorage due to error:', err)
      const localEntry: Omit<LocalSubmission, 'id' | 'timestamp'> = {
        username: admin.userId,
        repeated: admin.repeatCount,
        score,
      }
      const saved = saveSubmission(localEntry)
      console.log('Saved locally:', saved)
      alert(`Saved locally (offline fallback).\n\nUser: ${admin.userId}\nRepeated: ${admin.repeatCount}\nScore: ${score.toFixed(2)}`)
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold mb-6">Feedback Form</h1>
        {step === 'admin' && (
          <AdminStep
            initial={admin ?? undefined}
            onNext={(data) => {
              setAdmin(data)
              setStep('form')
            }}
          />
        )}

        {step === 'form' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                For user <span className="font-medium">{admin?.userId}</span> · repeat{' '}
                <span className="font-medium">{admin?.repeatCount}</span>
              </p>
              <button
                type="button"
                onClick={() => setStep('admin')}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-1.5 text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Back
              </button>
            </div>
            <Form questions={questions} onSubmit={handleFormSubmit} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
