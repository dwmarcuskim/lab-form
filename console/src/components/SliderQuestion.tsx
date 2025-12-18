import { useId } from 'react'
import { FaceMood } from './FaceMood'

export type SliderQuestionProps = {
  label: string
  min?: number
  max?: number
  step?: number | 'any'
  value: number
  onChange: (value: number) => void
}

export function SliderQuestion({
  label,
  min = 1,
  max = 10,
  step = 'any',
  value,
  onChange,
}: SliderQuestionProps) {
  const id = useId()
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const leftPct = `${t * 100}%`
  return (
    <div className="space-y-3">
      <label htmlFor={id} className="text-sm sm:text-base font-medium text-gray-800">
        {label}
      </label>
      <div className="flex flex-col items-start">
        {/* Horizontal padding should be on a parent wrapper so faces and track share the same width */}
        <div className="w-full px-4 sm:px-6">
          {/* Reserve vertical space above the track; align face bottom near track center */}
          <div className="relative w-full pt-16">
          {/* Static indicator faces at the extremes (low/high) */}
          <div
            className="pointer-events-none absolute top-16 select-none opacity-50"
            style={{ left: '0%', transform: 'translateX(-50%) translateY(-100%)' }}
            aria-hidden
          >
            <FaceMood value={min} min={min} max={max} size={40} />
          </div>
          <div
            className="pointer-events-none absolute top-16 select-none opacity-50"
            style={{ left: '100%', transform: 'translateX(-50%) translateY(-100%)' }}
            aria-hidden
          >
            <FaceMood value={max} min={min} max={max} size={40} />
          </div>
          {/* Additional equally spaced static indicator faces (25%, 50%, 75%) */}
          <div
            className="pointer-events-none absolute top-16 select-none opacity-50"
            style={{ left: '25%', transform: 'translateX(-50%) translateY(-100%)' }}
            aria-hidden
          >
            <FaceMood value={min + (max - min) * 0.25} min={min} max={max} size={40} />
          </div>
          <div
            className="pointer-events-none absolute top-16 select-none opacity-50"
            style={{ left: '50%', transform: 'translateX(-50%) translateY(-100%)' }}
            aria-hidden
          >
            <FaceMood value={min + (max - min) * 0.5} min={min} max={max} size={40} />
          </div>
          <div
            className="pointer-events-none absolute top-16 select-none opacity-50"
            style={{ left: '75%', transform: 'translateX(-50%) translateY(-100%)' }}
            aria-hidden
          >
            <FaceMood value={min + (max - min) * 0.75} min={min} max={max} size={40} />
          </div>
          <div
            className="pointer-events-none absolute top-16 select-none"
            style={{ left: leftPct, transform: 'translateX(-50%) translateY(-100%)' }}
          >
            <FaceMood value={value} min={min} max={max} size={56} />
          </div>
          {/* Slider input (track now respects the container padding) */}
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full appearance-none accent-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          </div>
        </div>
      </div>
    </div>
  )
}
