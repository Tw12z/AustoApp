import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calculator as CalcIcon, X, Delete } from 'lucide-react'

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

/** Rendered once from Layout so it survives page navigation — the sidebar
 * and header don't remount when the route changes, so neither does this,
 * meaning the open/closed state and whatever's on the screen both persist
 * while browsing between pages (useful for checking stock value against a
 * live gold price without losing a running calculation). */
export default function FloatingCalculator() {
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

  const digitBtn = 'h-10 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-95'
  const opBtnStyle = (active: boolean) => ({
    background: active ? '#D4AF37' : 'rgba(212,175,55,0.12)',
    color: active ? '#0A0A0A' : '#D4AF37',
    border: '1px solid rgba(212,175,55,0.25)',
  })

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={t('layout.calculator.toggle')}
        aria-pressed={open}
        className="fixed z-40 flex items-center justify-center rounded-full transition-all duration-300"
        style={{
          bottom: 24, right: 24, width: 52, height: 52,
          background: open ? '#161616' : 'linear-gradient(135deg,#D4AF37,#F5C842)',
          border: open ? '1px solid rgba(212,175,55,0.3)' : 'none',
          boxShadow: open ? '0 8px 24px rgba(0,0,0,0.5)' : '0 4px 20px rgba(212,175,55,0.4)',
        }}
      >
        {open ? <X size={20} style={{ color: '#D4AF37' }} /> : <CalcIcon size={22} style={{ color: '#0A0A0A' }} />}
      </button>

      {open && (
        <div
          className="fixed z-40 rounded-2xl overflow-hidden"
          style={{
            bottom: 86, right: 24, width: 252,
            background: '#111111',
            border: '1px solid rgba(212,175,55,0.2)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.65), 0 0 40px rgba(212,175,55,0.06)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5"
            style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#888' }}>
              {t('layout.calculator.title')}
            </span>
            <button onClick={backspace} aria-label={t('layout.calculator.backspace')}
              className="text-gray-500 hover:text-gray-300 transition-colors">
              <Delete size={14} />
            </button>
          </div>

          {/* Display */}
          <div className="px-4 py-4" style={{ background: '#0A0A0A' }}>
            <div className="text-right font-bold text-white truncate" style={{ fontSize: 26, fontVariantNumeric: 'tabular-nums' }}>
              {display}
            </div>
            {op && prev !== null && (
              <div className="text-right mt-0.5" style={{ fontSize: 11, color: '#D4AF37', opacity: 0.8 }}>
                {trim(prev)} {op}
              </div>
            )}
          </div>

          {/* Keys */}
          <div className="grid grid-cols-4 gap-1.5 p-2.5">
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
    </>
  )
}
