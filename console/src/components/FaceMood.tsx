// No React import needed with React 17+ JSX transform

export type FaceMoodProps = {
  value: number
  min?: number
  max?: number
  size?: number // px
  className?: string
}

// Utility: clamp 0..1
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

export function FaceMood({ value, min = 1, max = 10, size = 64, className }: FaceMoodProps) {
  const t = clamp01((value - min) / (max - min)) // 0 = sad, 1 = happy

  // Mouth curvature: -18 (deep frown) .. +18 (big smile)
  const k = (t - 0.5) * 36
  const mouthY = 60
  const mouthPath = `M 30 ${mouthY} Q 50 ${mouthY + k} 70 ${mouthY}`

  // Eye openness: low value more closed (2) to open (5)
  const eyeRy = 2 + t * 3

  // Eyebrows: angle from inward/down (sad) to relaxed/up (happy)
  const browTilt = (t - 0.5) * 10 // degrees

  // Tear: opacity and vertical position
  const tearOpacity = 1 - t
  const tearY = 48 + (1 - t) * 8

  // Face color interpolation (reddish -> yellow -> green)
  const r = Math.round(255 * (1 - t))
  const g = Math.round(200 * t + 200 * (1 - Math.abs(t - 0.5) * 2)) // keep warm mid
  const b = Math.round(64 + 32 * t)
  const faceFill = `rgb(${r}, ${g}, ${b})`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Face */}
      <circle cx="50" cy="50" r="45" fill={faceFill} filter="url(#softShadow)" />

      {/* Eyes */}
      <ellipse cx="35" cy="40" rx={5} ry={eyeRy} fill="#111827" />
      <ellipse cx="65" cy="40" rx={5} ry={eyeRy} fill="#111827" />

      {/* Eyebrows */}
      <g stroke="#111827" strokeWidth={3} strokeLinecap="round">
        <line
          x1="28"
          y1="30"
          x2="42"
          y2="30"
          transform={`rotate(${-browTilt} 35 30)`}
        />
        <line
          x1="58"
          y1="30"
          x2="72"
          y2="30"
          transform={`rotate(${browTilt} 65 30)`}
        />
      </g>

      {/* Mouth */}
      <path d={mouthPath} fill="none" stroke="#111827" strokeWidth={4} strokeLinecap="round" />

      {/* Tear on left eye for low values */}
      <g style={{ opacity: tearOpacity, transition: 'opacity 120ms linear' }}>
        <path d={`M33 ${tearY} C 33 52, 36 52, 36 ${tearY} C 36 ${tearY - 4}, 33 ${tearY - 4}, 33 ${tearY} Z`} fill="#60a5fa" />
      </g>
    </svg>
  )
}
