import { useState } from 'react'
import { Form, type Question } from './components/Form'
import { AdminStep, type AdminData } from './components/AdminStep'
import { saveSubmission } from './lib/storage'
import { createSubmission } from './lib/api'

function App() {
  const [step, setStep] = useState<'admin' | 'form'>('admin')
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const questions: Question[] = [
    {
      id: 'id1',
      label: '다린이는 얼마나 귀여운가요?',
      min: 1,
      max: 10,
      step: 'any',
      initialValue: 5,
    }
  ]

  async function handleFormSubmit(values: { id: string; value: number }[]) {
    const apiBase = import.meta.env.VITE_API_URL as string | undefined
    const payload = { admin, answers: values }
    try {
      if (!apiBase) throw new Error('VITE_API_URL is not set')
      const res = await createSubmission(apiBase, payload as any)
      console.log('Saved to Cloud SQL. id=', res.id)
      alert('Saved to Cloud SQL!')
    } catch (err) {
      console.warn('Falling back to localStorage due to error:', err)
      const saved = saveSubmission(payload as any)
      console.log('Saved locally:', saved)
      const summary = values.map((v) => `${v.id}: ${v.value.toFixed(2)}`).join('\n')
      alert(`Saved locally (offline fallback).\n\nAdmin\n- userId: ${admin?.userId}\n- repeatCount: ${admin?.repeatCount}\n\nSubmitted scores:\n${summary}`)
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
