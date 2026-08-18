import styles from './FireworksArt.module.css'

interface Burst {
  cx: number
  cy: number
  r: number
  rays: number
  color: string
  width: number
}

const BURSTS: Burst[] = [
  { cx: 128, cy: 104, r: 62, rays: 18, color: '#7EB6F0', width: 1.5 },
  { cx: 286, cy: 168, r: 42, rays: 14, color: '#FBBF6B', width: 1.3 },
  { cx: 222, cy: 54, r: 30, rays: 12, color: '#5FD3A8', width: 1.2 },
]

const SPARKS = [
  { cx: 62, cy: 196, r: 2.4 },
  { cx: 340, cy: 82, r: 2 },
  { cx: 178, cy: 214, r: 1.8 },
  { cx: 300, cy: 28, r: 1.6 },
  { cx: 92, cy: 26, r: 1.6 },
]

/** Decorative fireworks for the sign-in panel — drawn, so it stays crisp and weighs nothing. */
export const FireworksArt = () => (
  <svg className={styles.art} viewBox="0 0 380 250" aria-hidden="true" focusable="false">
    {BURSTS.map(({ cx, cy, r, rays, color, width }) => (
      <g key={`${cx}-${cy}`} stroke={color} strokeLinecap="round" className={styles.burst}>
        {Array.from({ length: rays }, (_, i) => {
          const angle = (i / rays) * Math.PI * 2
          const inner = r * 0.34
          return (
            <line
              key={i}
              x1={cx + Math.cos(angle) * inner}
              y1={cy + Math.sin(angle) * inner}
              x2={cx + Math.cos(angle) * r}
              y2={cy + Math.sin(angle) * r}
              strokeWidth={width}
            />
          )
        })}
        {Array.from({ length: rays }, (_, i) => {
          const angle = (i / rays) * Math.PI * 2
          return (
            <circle
              key={`tip-${i}`}
              cx={cx + Math.cos(angle) * (r + 5)}
              cy={cy + Math.sin(angle) * (r + 5)}
              r={1.7}
              fill={color}
              stroke="none"
            />
          )
        })}
      </g>
    ))}

    {SPARKS.map(({ cx, cy, r }) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#DCEAFB" className={styles.spark} />
    ))}
  </svg>
)
