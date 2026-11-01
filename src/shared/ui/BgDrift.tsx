// Calm background: faint wheat grains and leaves drift slowly upward behind the page.
// Drawn with SVG, so nothing is downloaded. Hidden when printing or if the phone asks for less motion.
import type { CSSProperties, ReactElement } from 'react'

const GRAIN = (
  <svg viewBox="0 0 20 32">
    <path d="M10 31V12" stroke="#a8792a" strokeWidth="1.6" fill="none" />
    <ellipse cx="10" cy="9" rx="4.5" ry="8" fill="#d9a43c" />
  </svg>
)
const SEED = (
  <svg viewBox="0 0 12 12">
    <circle cx="6" cy="6" r="5" fill="#e3b24c" />
  </svg>
)
const LEAF = (
  <svg viewBox="0 0 30 30">
    <path d="M4 26C4 12 14 4 27 3C26 16 18 26 4 26Z" fill="#7fae4f" />
    <path d="M5 25L22 8" stroke="#5d8a35" strokeWidth="1.4" />
  </svg>
)

// left %, size px, duration s, delay s, sideways drift px, picture
const ITEMS: [number, number, number, number, number, ReactElement][] = [
  [4, 22, 34, -2, 40, GRAIN],
  [14, 16, 41, -20, -30, SEED],
  [24, 26, 38, -11, 50, LEAF],
  [36, 14, 45, -30, 30, SEED],
  [47, 20, 36, -6, -40, GRAIN],
  [58, 28, 43, -24, 40, LEAF],
  [68, 15, 39, -15, -25, SEED],
  [78, 22, 47, -36, 35, GRAIN],
  [88, 26, 40, -9, -45, LEAF],
  [95, 14, 44, -28, 20, SEED],
]

export default function BgDrift() {
  return (
    <div className="bg-drift" aria-hidden="true">
      {ITEMS.map(([left, size, duration, delay, dx, pic], i) => (
        <span
          key={i}
          style={
            {
              left: `${left}%`,
              width: size,
              height: size,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              '--dx': `${dx}px`,
            } as CSSProperties
          }
        >
          <i style={{ animationDelay: `${-0.7 * i}s` }}>{pic}</i>
        </span>
      ))}
    </div>
  )
}
