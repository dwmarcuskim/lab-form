import { useState } from 'react'
import { SliderQuestion } from './SliderQuestion'

export type Question = {
  id: string
  label: string
  min?: number
  max?: number
  step?: number | 'any'
  initialValue?: number
}

export type FormValues = { id: string; value: number }[]

export type FormProps = {
  questions: Question[]
  onSubmit: (values: FormValues) => void
}

export function Form({ questions, onSubmit }: FormProps) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const entries = questions.map((q) => {
      const min = q.min ?? 1
      const max = q.max ?? 10
      const initial = q.initialValue ?? (min + (max - min) / 2)
      return [q.id, initial] as const
    })
    return Object.fromEntries(entries)
  })

  function updateValue(id: string, value: number) {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const list: FormValues = questions.map((q) => ({ id: q.id, value: values[q.id] }))
    onSubmit(list)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {questions.map((q) => (
        <div key={q.id} className="space-y-2">
          <SliderQuestion
            label={q.label}
            value={values[q.id]}
            onChange={(v) => updateValue(q.id, v)}
            min={q.min}
            max={q.max}
            step={q.step ?? 'any'}
          />
          {/* Min/Max labels under the slider */}
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>전혀 잘할 수 없다</span>
            <span>매우 잘할 수 있다.</span>
          </div>
        </div>
      ))}

      <div className="pt-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Submit
        </button>
      </div>
    </form>
  )
}
