// Start-screen farm picture: sun, birds, clouds, hills, house, field and swaying wheat.
// Drawn with SVG in layers that move a little at different speeds (works offline).
import type { CSSProperties, ReactNode } from 'react'

// Wheat stalks: x position and stalk height.
const STALKS: [number, number][] = [
  [12, 42], [36, 54], [60, 40], [86, 56], [112, 44], [138, 50],
  [266, 48], [292, 58], [318, 42], [344, 54], [370, 44], [394, 52],
]

function Stalk({ x, h, i }: { x: number; h: number; i: number }) {
  // Grains on both sides, every 7 units, from the top down.
  const grains: ReactNode[] = []
  for (let y = h + 4; y >= 11; y -= 7) {
    grains.push(
      <ellipse key={`l${y}`} cx={-3.4} cy={-y} rx={2.6} ry={5.6} transform={`rotate(-28 -3.4 ${-y})`} />,
      <ellipse key={`r${y}`} cx={3.4} cy={-y} rx={2.6} ry={5.6} transform={`rotate(28 3.4 ${-y})`} />,
    )
  }
  return (
    <g transform={`translate(${x} 204)`}>
      <g className="stalk" style={{ '--i': i } as CSSProperties}>
        <path d={`M0 0Q2 ${-Math.round(h * 0.55)} 0 ${-h}`} />
        <ellipse cx={0} cy={-(h + 8)} rx={2.4} ry={6} />
        {grains}
      </g>
    </g>
  )
}

function Layer({ depth, children }: { depth: number; children: ReactNode }) {
  return (
    <div className="layer" style={{ '--d': depth } as CSSProperties}>
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice">
        {children}
      </svg>
    </div>
  )
}

const CLOUD = (
  <>
    <circle cx="0" cy="0" r="13" />
    <circle cx="15" cy="-7" r="16" />
    <circle cx="33" cy="0" r="12" />
    <rect x="0" y="-2" width="33" height="14" rx="7" />
  </>
)

const RAYS = Array.from({ length: 10 }, (_, k) => {
  const a = (k * Math.PI) / 5
  const p = (r: number) => `${(318 + r * Math.cos(a)).toFixed(1)} ${(56 + r * Math.sin(a)).toFixed(1)}`
  return <path key={k} d={`M${p(31)}L${p(41)}`} />
})

export default function FarmScene() {
  return (
    <div className="scene-wrap" aria-hidden="true">
      <div className="scene-tilt">
        <div className="scene">
          <Layer depth={2}>
            <g className="sun">
              <g className="rays">{RAYS}</g>
              <circle cx="318" cy="56" r="24" />
            </g>
            <g className="bird b1">
              <g className="flap">
                <path d="M0 0q5-6 10 0q5-6 10 0" />
              </g>
            </g>
            <g className="bird b2">
              <g className="flap">
                <path d="M0 0q5-6 10 0q5-6 10 0" />
              </g>
            </g>
          </Layer>
          <Layer depth={4}>
            <g className="cloud c1">{CLOUD}</g>
            <g className="cloud c2">{CLOUD}</g>
            <g className="cloud c3">{CLOUD}</g>
          </Layer>
          <Layer depth={7}>
            <path className="hill-far" d="M-20 128Q50 92 130 116T270 106T420 98V220H-20Z" />
            <g className="house">
              <rect x="210" y="104" width="26" height="18" />
              <path className="roof" d="M206 106L223 92L240 106Z" />
              <rect className="door" x="219" y="112" width="7" height="10" />
            </g>
            <g className="tree">
              <rect x="252" y="106" width="4" height="14" />
              <circle cx="254" cy="100" r="10" />
            </g>
            <path className="hill-mid" d="M-20 150Q90 118 200 140T420 128V220H-20Z" />
          </Layer>
          <Layer depth={10}>
            <path className="soil-field" d="M-20 168Q200 140 420 162V220H-20Z" />
            <path className="furrows" d="M-20 178Q200 152 420 172M-20 188Q200 164 420 182M-20 198Q200 176 420 192" />
          </Layer>
          <Layer depth={15}>
            {STALKS.map(([x, h], i) => (
              <Stalk key={x} x={x} h={h} i={i} />
            ))}
          </Layer>
        </div>
      </div>
    </div>
  )
}
