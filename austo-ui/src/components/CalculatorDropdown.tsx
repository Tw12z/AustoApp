import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calculator as CalcIcon, Delete } from 'lucide-react'

type Op = '+' | '−' | '×' | '÷' | null

function compute(a: number, b: number, op: Op): number {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return b === 0 ? 0 : a / b
    default:  return b
  }
}

// Trim float noise (0.1 + 0.2 === 0.30000000000000004) without losing real precision.
function trim(n: number): string {
  if (!Number.isFinite(n)) return '0'
  return Number(n.toPrecision(12)).toString()
}

/** Rendered once from Layout, next to the header clock — the sidebar/header
 * don't remount when the route changes, so neither does this, meaning the
 * open/closed state and whatever's on the screen both persist while
 * browsing between pages (useful for checking stock value against a live
 * gold price without losing a running calculation). */
export default function CalculatorDropdown() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState<number | null>(null)
  const [op, setOp] = useState<Op>(null)
  const [waiting, setWaiting] = useState(false)

  function inputDigit(d: string) {
    if (waiting) { setDisplay(d); setWaiting(false); return }
    setDisplay(display === '0' ? d : display + d)
  }
  function inputDecimal() {
    if (waiting) { setDisplay('0.'); setWaiting(false); return }
    if (!display.includes('.')) setDisplay(display + '.')
  }
  function clear() {
    setDisplay('0'); setPrev(null); setOp(null); setWaiting(false)
  }
  function backspace() {
    setDisplay(d => (d.length > 1 ? d.slice(0, -1) : '0'))
  }
  function toggleSign() {
    setDisplay(d => (d.startsWith('-') ? d.slice(1) : (d === '0' ? d : '-' + d)))
  }
  function percent() {
    setDisplay(d => trim(parseFloat(d) / 100))
  }
  function chooseOp(nextOp: Op) {
    const value = parseFloat(display)
    if (prev !== null && op && !waiting) {
      setDisplay(trim(compute(prev, value, op)))
      setPrev(compute(prev, value, op))
    } else {
      setPrev(value)
    }
    setOp(nextOp)
    setWaiting(true)
  }
  function equals() {
    if (op === null || prev === null) return
    const value = parseFloat(display)
    setDisplay(trim(compute(prev, value, op)))
    setPrev(null)
    setOp(null)
    setWaiting(true)
  }

  const digitBtn = 'h-8 rounded-md text-xs font-semibold transition-all duration-150 active:scale-95'
  const opBtnStyle = (active: boolean) => ({
    background: active ? '#D4AF37' : 'rgba(212,175,55,0.12)',
    color: active ? '#0A0A0A' : '#D4AF37',
    border: '1px solid rgba(212,175,55,0.25)',
  })

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={t('layout.calculator.toggle')}
        aria-pressed={open}
        className="flex items-center justify-center rounded-md transition-all duration-150 active:scale-95"
        style={{
          // Visually the same chip as before (border/fill only show up as
          // 22px), but the actual tap target is padded out to ~36px — on a
          // real phone this was the smallest, right-most target in the
          // header and the easiest to miss or fat-finger into the calendar-
          // clock next to it.
          width: 36, height: 36,
          background: open ? 'rgba(212,175,55,0.15)' : 'transparent',
          border: `1px solid ${open ? 'rgba(212,175,55,0.3)' : 'transparent'}`,
          color: open ? '#D4AF37' : '#7D7D7D',
        }}
      >
        <CalcIcon size={15} />
      </button>

      {open && (
        <div
          className="absolute rounded-xl overflow-hidden"
          style={{
            top: 'calc(100% + 10px)', right: 0, width: 208, zIndex: 60,
            background: '#111111',
            border: '1px solid rgba(212,175,55,0.2)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.65), 0 0 40px rgba(212,175,55,0.06)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#888' }}>
              {t('layout.calculator.title')}
            </span>
            <button onClick={backspace} aria-label={t('layout.calculator.backspace')}
              className="text-gray-500 hover:text-gray-300 transition-colors">
              <Delete size={12} />
            </button>
          </div>

          {/* Display */}
          <div className="px-3 py-3" style={{ background: '#0A0A0A' }}>
            <div className="text-right font-bold text-white truncate" style={{ fontSize: 20, fontVariantNumeric: 'tabular-nums' }}>
              {display}
            </div>
            {op && prev !== null && (
              <div className="text-right mt-0.5" style={{ fontSize: 10, color: '#D4AF37', opacity: 0.8 }}>
                {trim(prev)} {op}
              </div>
            )}
          </div>

          {/* Keys */}
          <div className="grid grid-cols-4 gap-1 p-2">
            <button className={digitBtn} onClick={clear} style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>C</button>
            <button className={digitBtn} onClick={toggleSign} style={{ background: '#1A1A1A', color: '#E5E5E5' }}>±</button>
            <button className={digitBtn} onClick={percent} style={{ background: '#1A1A1A', color: '#E5E5E5' }}>%</button>
            <button className={digitBtn} onClick={() => chooseOp('÷')} style={opBtnStyle(op === '÷' && waiting)}>÷</button>

            {(['7', '8', '9'] as const).map(d => (
              <button key={d} className={digitBtn} onClick={() => inputDigit(d)} style={{ background: '#1A1A1A', color: '#fff' }}>{d}</button>
            ))}
            <button className={digitBtn} onClick={() => chooseOp('×')} style={opBtnStyle(op === '×' && waiting)}>×</button>

            {(['4', '5', '6'] as const).map(d => (
              <button key={d} className={digitBtn} onClick={() => inputDigit(d)} style={{ background: '#1A1A1A', color: '#fff' }}>{d}</button>
            ))}
            <button className={digitBtn} onClick={() => chooseOp('−')} style={opBtnStyle(op === '−' && waiting)}>−</button>

            {(['1', '2', '3'] as const).map(d => (
              <button key={d} className={digitBtn} onClick={() => inputDigit(d)} style={{ background: '#1A1A1A', color: '#fff' }}>{d}</button>
            ))}
            <button className={digitBtn} onClick={() => chooseOp('+')} style={opBtnStyle(op === '+' && waiting)}>+</button>

            <button className={`${digitBtn} col-span-2`} onClick={() => inputDigit('0')} style={{ background: '#1A1A1A', color: '#fff' }}>0</button>
            <button className={digitBtn} onClick={inputDecimal} style={{ background: '#1A1A1A', color: '#fff' }}>.</button>
            <button className={digitBtn} onClick={equals} style={{ background: 'linear-gradient(135deg,#D4AF37,#F5C842)', color: '#0A0A0A', fontWeight: 700 }}>=</button>
          </div>
        </div>
      )}
    </div>
  )
}
