import { useRef, useCallback, type ReactNode, type CSSProperties } from 'react'
import './BorderGlow.css'

interface BorderGlowProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  edgeSensitivity?: number
  glowColor?: string
  backgroundColor?: string
  borderRadius?: number
  glowRadius?: number
  glowIntensity?: number
  coneSpread?: number
  colors?: string[]
  fillOpacity?: number
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%']
const GRADIENT_KEYS = ['--gradient-one','--gradient-two','--gradient-three','--gradient-four','--gradient-five','--gradient-six','--gradient-seven']
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1]

function parseHSL(s: string) {
  const m = s.match(/(\d+)\s+(\d+)%?\s+(\d+)%?/)
  return m ? { h: +m[1], s: +m[2], l: +m[3] } : { h: 40, s: 80, l: 70 }
}

function buildGlowVars(glowColor: string, intensity: number): Record<string, string> {
  const { h, s, l } = parseHSL(glowColor)
  const base = `${h}deg ${s}% ${l}%`
  const opacities = [100, 60, 50, 40, 30, 20, 10]
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10']
  const vars: Record<string, string> = {}
  for (let i = 0; i < opacities.length; i++) {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`
  }
  return vars
}

function buildGradientVars(colors: string[]): Record<string, string> {
  const vars: Record<string, string> = {}
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)]
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`
  }
  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`
  return vars
}

export default function BorderGlow({
  children,
  className = '',
  style,
  edgeSensitivity = 30,
  glowColor = '40 80 70',
  backgroundColor = '#0D0D0D',
  borderRadius = 17,
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  colors = ['#D4AF37', '#F5C842', '#AA8500'],
  fillOpacity = 0.4,
}: BorderGlowProps) {
  const ref = useRef<HTMLDivElement>(null)

  const getCenter = useCallback((el: HTMLElement) => {
    const { width, height } = el.getBoundingClientRect()
    return [width / 2, height / 2]
  }, [])

  const getEdgeProximity = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = getCenter(el)
    const dx = x - cx, dy = y - cy
    const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity
    const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1)
  }, [getCenter])

  const getCursorAngle = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = getCenter(el)
    const dx = x - cx, dy = y - cy
    if (dx === 0 && dy === 0) return 0
    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90
    if (deg < 0) deg += 360
    return deg
  }, [getCenter])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const card = ref.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--edge-proximity', `${(getEdgeProximity(card, x, y) * 100).toFixed(3)}`)
    card.style.setProperty('--cursor-angle', `${getCursorAngle(card, x, y).toFixed(3)}deg`)
  }, [getEdgeProximity, getCursorAngle])

  const handlePointerLeave = useCallback(() => {
    const card = ref.current
    if (!card) return
    card.style.setProperty('--edge-proximity', '0')
  }, [])

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`border-glow-card ${className}`}
      style={{
        '--card-bg': backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        '--cone-spread': coneSpread,
        '--fill-opacity': fillOpacity,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
        ...style,
      } as CSSProperties}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">
        {children}
      </div>
    </div>
  )
}
