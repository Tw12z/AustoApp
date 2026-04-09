import React from 'react'

interface GoldBarProps {
  width?: number
  className?: string
  style?: React.CSSProperties
}

export default function GoldBar({ width = 200, className = '', style }: GoldBarProps) {
  const w = width
  const h = Math.round(w * 0.28)   // front face height
  const depth = Math.round(w * 0.13) // top face depth
  const side = Math.round(w * 0.14)  // right side width

  // Points for each face
  const topFace    = `${depth},0 ${w + depth},0 ${w + side + depth},${depth} ${side},${depth}`
  const frontFace  = `${side},${depth} ${w + side},${depth} ${w + side},${depth + h} ${side},${depth + h}`
  const rightFace  = `${w + side},${depth} ${w + side + depth},0 ${w + side + depth},${h} ${w + side},${depth + h}`

  const totalW = w + side + depth
  const totalH = depth + h

  // Emboss text position on front face
  const textX = side + w / 2
  const textY = depth + h / 2

  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      width={totalW}
      height={totalH}
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Top face — bright gold */}
        <linearGradient id="gbTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#f5e17a" />
          <stop offset="30%"  stopColor="#d4a017" />
          <stop offset="60%"  stopColor="#f0c040" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
        {/* Front face — mid gold with texture shimmer */}
        <linearGradient id="gbFront" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#e8b820" />
          <stop offset="20%"  stopColor="#c9971a" />
          <stop offset="45%"  stopColor="#f0d060" />
          <stop offset="65%"  stopColor="#b8860b" />
          <stop offset="85%"  stopColor="#d4a820" />
          <stop offset="100%" stopColor="#a07010" />
        </linearGradient>
        {/* Right face — dark gold */}
        <linearGradient id="gbRight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#c8900a" />
          <stop offset="50%"  stopColor="#9a6800" />
          <stop offset="100%" stopColor="#7a5000" />
        </linearGradient>
        {/* Subtle noise texture overlay */}
        <filter id="gbNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blend" />
          <feComposite in="blend" in2="SourceGraphic" operator="in" />
        </filter>
        {/* Bevel / inner shadow on front */}
        <filter id="gbBevel">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Top face */}
      <polygon points={topFace} fill="url(#gbTop)" />

      {/* Top face highlight edge */}
      <polygon points={topFace} fill="none" stroke="rgba(255,240,120,0.4)" strokeWidth="0.8" />

      {/* Front face */}
      <polygon points={frontFace} fill="url(#gbFront)" filter="url(#gbNoise)" />

      {/* Front face inner bevel top */}
      <line
        x1={side + 4} y1={depth + 4}
        x2={w + side - 4} y2={depth + 4}
        stroke="rgba(255,230,80,0.25)" strokeWidth="1"
      />
      {/* Front face inner bevel bottom */}
      <line
        x1={side + 4} y1={depth + h - 4}
        x2={w + side - 4} y2={depth + h - 4}
        stroke="rgba(0,0,0,0.2)" strokeWidth="1"
      />

      {/* Right face */}
      <polygon points={rightFace} fill="url(#gbRight)" />
      <polygon points={rightFace} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />

      {/* Embossed "FINE" text */}
      <text
        x={textX} y={textY - 5}
        textAnchor="middle"
        fontSize={Math.round(w * 0.072)}
        fontFamily="serif"
        fontWeight="bold"
        fill="rgba(0,0,0,0.18)"
        letterSpacing="2"
      >FINE</text>
      <text
        x={textX} y={textY + Math.round(w * 0.072) + 1}
        textAnchor="middle"
        fontSize={Math.round(w * 0.072)}
        fontFamily="serif"
        fontWeight="bold"
        fill="rgba(0,0,0,0.18)"
        letterSpacing="2"
      >GOLD</text>

      {/* Top highlight streak */}
      <polygon
        points={`${depth + side * 0.3},${depth * 0.3} ${w * 0.6 + depth},${depth * 0.3} ${w * 0.55 + side},${depth * 0.8} ${depth + side * 0.25},${depth * 0.8}`}
        fill="rgba(255,250,180,0.18)"
      />

      {/* Outer edge */}
      <polygon
        points={`${side},${depth} ${w + side + depth},0 ${w + side + depth},${h} ${w + side},${depth + h} ${side},${depth + h}`}
        fill="none"
        stroke="rgba(200,160,0,0.3)"
        strokeWidth="0.5"
      />
    </svg>
  )
}
