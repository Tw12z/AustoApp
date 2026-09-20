import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import jsQR from 'jsqr'
import { Camera, X, SwitchCamera, Zap, ZapOff, ImageUp } from 'lucide-react'

// Decoding runs on a downscaled copy of the frame — a 1080p video frame is far
// more pixels than jsQR needs, and scanning it every frame janks the preview on
// the phones this actually runs on.
const SCAN_MAX_EDGE = 640
// Same code scanned twice in a row is almost always one label held in frame, not
// two reads, so continuous mode ignores repeats inside this window.
const REPEAT_COOLDOWN_MS = 2500

type Props = {
  open: boolean
  onClose: () => void
  /** Called with the raw decoded text. In continuous mode it can fire many times. */
  onScan: (text: string) => void
  title?: string
  /** Keep the camera running after a hit (scanning a pile of labels in a row). */
  continuous?: boolean
  /** Shown under the viewfinder — e.g. "added 3 items" or a not-found warning. */
  feedback?: string
}

export default function QrScanner({ open, onClose, onScan, title, continuous, feedback }: Props) {
  const { t } = useTranslation()
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef    = useRef<number | null>(null)
  const lastHit   = useRef<{ text: string; at: number }>({ text: '', at: 0 })

  const [error, setError]       = useState('')
  const [starting, setStarting] = useState(false)
  const [devices, setDevices]   = useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined)
  const [torchOn, setTorchOn]   = useState(false)
  const [torchable, setTorchable] = useState(false)

  const stop = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    setTorchOn(false); setTorchable(false)
  }, [])

  const handleHit = useCallback((text: string) => {
    const now = Date.now()
    if (continuous && text === lastHit.current.text && now - lastHit.current.at < REPEAT_COOLDOWN_MS) return
    lastHit.current = { text, at: now }
    navigator.vibrate?.(60)
    if (!continuous) { stop(); onScan(text); onClose(); return }
    onScan(text)
  }, [continuous, onScan, onClose, stop])

  // ── Frame loop ────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !streamRef.current) return
    if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
      const scale = Math.min(1, SCAN_MAX_EDGE / Math.max(video.videoWidth, video.videoHeight))
      const w = Math.round(video.videoWidth * scale)
      const h = Math.round(video.videoHeight * scale)
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h)
        const code = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'attemptBoth' })
        if (code?.data) handleHit(code.data)
      }
    }
    if (streamRef.current) rafRef.current = requestAnimationFrame(tick)
  }, [handleHit])

  // ── Camera ────────────────────────────────────────────────────────────────
  const start = useCallback(async (id?: string) => {
    stop()
    setError(''); setStarting(true)
    if (!window.isSecureContext) { setError(t('qrScanner.insecure')); setStarting(false); return }
    if (!navigator.mediaDevices?.getUserMedia) { setError(t('qrScanner.unsupported')); setStarting(false); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: id ? { deviceId: { exact: id } } : { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) { stream.getTracks().forEach(tr => tr.stop()); return }
      video.srcObject = stream
      video.setAttribute('playsinline', 'true')
      await video.play()

      const track = stream.getVideoTracks()[0]
      setDeviceId(track?.getSettings().deviceId)
      // `torch` is a real constraint on Android Chrome but isn't in the DOM types.
      setTorchable(Boolean((track?.getCapabilities?.() as { torch?: boolean } | undefined)?.torch))
      // Labels only become readable once permission is granted, so enumerate after.
      const all = await navigator.mediaDevices.enumerateDevices()
      setDevices(all.filter(d => d.kind === 'videoinput'))

      rafRef.current = requestAnimationFrame(tick)
    } catch (err) {
      const name = (err as DOMException)?.name
      setError(
        name === 'NotAllowedError' || name === 'SecurityError' ? t('qrScanner.denied')
        : name === 'NotFoundError' || name === 'OverconstrainedError' ? t('qrScanner.noCamera')
        : t('qrScanner.failed')
      )
    } finally { setStarting(false) }
  }, [stop, t, tick])

  useEffect(() => {
    if (!open) { stop(); return }
    lastHit.current = { text: '', at: 0 }
    start()
    return stop
    // `start` is stable enough here; re-running it on every render would restart
    // the camera mid-scan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const switchCamera = () => {
    if (devices.length < 2) return
    const idx = devices.findIndex(d => d.deviceId === deviceId)
    start(devices[(idx + 1) % devices.length].deviceId)
  }

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    const next = !torchOn
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] } as unknown as MediaTrackConstraints)
      setTorchOn(next)
    } catch { setTorchable(false) }
  }

  // Desktop fallback: decode a photo of the label instead of a live camera.
  const scanFile = async (file: File) => {
    setError('')
    try {
      const bitmap = await createImageBitmap(file)
      const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height))
      const w = Math.round(bitmap.width * scale)
      const h = Math.round(bitmap.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.drawImage(bitmap, 0, 0, w, h)
      const code = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'attemptBoth' })
      if (code?.data) handleHit(code.data)
      else setError(t('qrScanner.fileNoCode'))
    } catch { setError(t('qrScanner.fileNoCode')) }
  }

  if (!open) return null
  return (
    <div className="modal-overlay" style={{ zIndex: 60 }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <div className="flex items-center gap-2">
            <Camera size={16} style={{ color: '#D4AF37' }} />
            <h2 className="text-base font-semibold text-white">{title ?? t('qrScanner.title')}</h2>
          </div>
          <button onClick={onClose} aria-label={t('common.close')} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div className="relative overflow-hidden rounded-xl"
            style={{ background: '#000', border: '1px solid rgba(212,175,55,0.2)', aspectRatio: '1 / 1' }}>
            <video ref={videoRef} muted playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: error ? 'none' : 'block' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Viewfinder corners */}
            {!error && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div style={{ width: '62%', aspectRatio: '1 / 1', position: 'relative' }}>
                  {[
                    { top: 0, left: 0, borderTop: '3px solid #D4AF37', borderLeft: '3px solid #D4AF37', borderTopLeftRadius: 10 },
                    { top: 0, right: 0, borderTop: '3px solid #D4AF37', borderRight: '3px solid #D4AF37', borderTopRightRadius: 10 },
                    { bottom: 0, left: 0, borderBottom: '3px solid #D4AF37', borderLeft: '3px solid #D4AF37', borderBottomLeftRadius: 10 },
                    { bottom: 0, right: 0, borderBottom: '3px solid #D4AF37', borderRight: '3px solid #D4AF37', borderBottomRightRadius: 10 },
                  ].map((s, i) => <div key={i} style={{ position: 'absolute', width: 34, height: 34, ...s }} />)}
                </div>
              </div>
            )}

            {(starting || error) && (
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm"
                style={{ color: error ? '#EF4444' : '#888' }}>
                {error || t('qrScanner.starting')}
              </div>
            )}
          </div>

          <p className="text-xs text-center" style={{ color: '#7D7D7D' }}>{t('qrScanner.hint')}</p>

          {feedback && (
            <div className="text-sm px-3 py-2.5 rounded-lg text-center"
              style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
              {feedback}
            </div>
          )}

          <div className="flex items-center gap-2">
            {devices.length > 1 && (
              <button type="button" className="btn-outline flex-1 flex items-center justify-center gap-2 py-2 text-sm" onClick={switchCamera}>
                <SwitchCamera size={15} /> {t('qrScanner.switchCamera')}
              </button>
            )}
            {torchable && (
              <button type="button" className="btn-outline flex-1 flex items-center justify-center gap-2 py-2 text-sm" onClick={toggleTorch}>
                {torchOn ? <ZapOff size={15} /> : <Zap size={15} />} {torchOn ? t('qrScanner.torchOff') : t('qrScanner.torchOn')}
              </button>
            )}
            <label className="btn-outline flex-1 flex items-center justify-center gap-2 py-2 text-sm cursor-pointer">
              <ImageUp size={15} /> {t('qrScanner.fromImage')}
              <input type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) scanFile(f); e.target.value = '' }} />
            </label>
          </div>

          {error && (
            <button type="button" className="btn-outline w-full py-2 text-sm" onClick={() => start(deviceId)}>
              {t('qrScanner.retry')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
