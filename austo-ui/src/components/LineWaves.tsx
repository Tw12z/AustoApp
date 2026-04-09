import { useEffect, useRef } from 'react'

interface LineWavesProps {
  className?: string
  color?: string
  lineCount?: number
  speed?: number
  amplitude?: number
  opacity?: number
}

export default function LineWaves({
  className = '',
  color = '#D4AF37',
  lineCount = 18,
  speed = 0.4,
  amplitude = 40,
  opacity = 0.18,
}: LineWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < lineCount; i++) {
        const y = (i / (lineCount - 1)) * height
        const phase = (i / lineCount) * Math.PI * 2
        const freq = 0.008 + i * 0.0002
        const amp = amplitude * (0.4 + 0.6 * Math.sin((i / lineCount) * Math.PI))

        ctx.beginPath()
        for (let x = 0; x <= width; x += 2) {
          const dy = Math.sin(x * freq + t + phase) * amp
            + Math.sin(x * freq * 1.7 + t * 1.3 + phase) * amp * 0.3
          if (x === 0) ctx.moveTo(x, y + dy)
          else ctx.lineTo(x, y + dy)
        }

        // Gradient along each line — brighter in the middle
        const grad = ctx.createLinearGradient(0, 0, width, 0)
        grad.addColorStop(0,   `${color}00`)
        grad.addColorStop(0.2, `${color}`)
        grad.addColorStop(0.5, `${color}`)
        grad.addColorStop(0.8, `${color}`)
        grad.addColorStop(1,   `${color}00`)

        ctx.strokeStyle = grad
        ctx.globalAlpha = opacity * (0.5 + 0.5 * Math.abs(Math.sin((i / lineCount) * Math.PI + t * 0.2)))
        ctx.lineWidth = 0.8
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      t += speed * 0.016
      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
    }
  }, [color, lineCount, speed, amplitude, opacity])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
