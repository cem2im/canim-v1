import { useState, useEffect, useCallback } from 'react'

const STEPS = [
  {
    id: 'tour-score-card',
    title: '🎯 Sağlık Skorunuz',
    desc: 'Bu puan taramalarınıza göre hesaplanır. Ne kadar çok tarama yaptırırsanız o kadar yükselir!',
  },
  {
    id: 'tour-action-btns',
    title: '✅ Kontrole Gittim',
    desc: 'Doktora her gittiğinizde bu butona dokunun. Tarih kaydedilir, skorunuz güncellenir.',
  },
  {
    id: 'tour-tab-screenings',
    title: '🔬 Taramalar Sekmesi',
    desc: 'Yapılması gereken tüm taramalarınız burada listelenir. Her birinin ne zaman yapılacağını görebilirsiniz.',
  },
  {
    id: 'tour-tab-profile',
    title: '👤 Profil Sekmesi',
    desc: 'Kişisel bilgilerinizi güncelleyin ve sağlık raporunuzu PDF olarak indirin.',
  },
]

export const TOUR_KEY = 'canim_tour_seen'
const PAD = 10

export default function TourOverlay({ onDone }) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState(null)
  const [visible, setVisible] = useState(true)

  const currentStep = STEPS[step]

  const measureEl = useCallback(() => {
    let attempts = 0
    const tryMeasure = () => {
      const el = document.getElementById(currentStep.id)
      if (!el) {
        if (attempts++ < 15) setTimeout(tryMeasure, 200)
        return
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      setTimeout(() => {
        const r = el.getBoundingClientRect()
        if (r.width === 0 && attempts++ < 15) { setTimeout(tryMeasure, 200); return }
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
        setVisible(true)
      }, 120)
    }
    tryMeasure()
  }, [currentStep.id])

  useEffect(() => {
    if (step > 0) setVisible(false)
    setRect(null)
    // First step needs extra time for page to render
    const delay = step === 0 ? 700 : 200
    const t = setTimeout(measureEl, delay)
    return () => clearTimeout(t)
  }, [step, measureEl])

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      finish()
    }
  }

  const finish = () => {
    localStorage.setItem(TOUR_KEY, '1')
    onDone()
  }

  // Fallback: show centered card even if element not found yet
  const fallbackRect = { top: window.innerHeight * 0.35, left: window.innerWidth * 0.1, width: window.innerWidth * 0.8, height: 80 }
  const activeRect = rect || fallbackRect

  const spotTop    = activeRect.top  - PAD
  const spotLeft   = activeRect.left - PAD
  const spotW      = activeRect.width  + PAD * 2
  const spotH      = activeRect.height + PAD * 2

  // Put tooltip above element if it's in the bottom 45% of screen
  const tooltipAbove = activeRect.top > window.innerHeight * 0.55

  // Tooltip horizontal center aligned with spotlight, clamped to screen
  const tipLeft = Math.max(12, Math.min(window.innerWidth - 312, spotLeft + spotW / 2 - 150))

  // Tooltip vertical position
  const tipStyle = tooltipAbove
    ? { bottom: window.innerHeight - spotTop + 14 }
    : { top:    spotTop + spotH + 14 }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9990, pointerEvents: 'auto' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Dark overlay via spotlight box-shadow */}
      <div
        style={{
          position:     'fixed',
          top:          spotTop,
          left:         spotLeft,
          width:        spotW,
          height:       spotH,
          borderRadius: 18,
          boxShadow:    '0 0 0 100vw rgba(0,0,0,0.78)',
          border:       '2px solid rgba(255,255,255,0.5)',
          zIndex:       9991,
          pointerEvents: 'none',
          opacity:      visible ? 1 : 0,
          transition:   'opacity 0.3s ease, top 0.4s cubic-bezier(.4,0,.2,1), left 0.4s cubic-bezier(.4,0,.2,1), width 0.4s cubic-bezier(.4,0,.2,1), height 0.4s cubic-bezier(.4,0,.2,1)',
          animation:    'tour-pulse 2.2s ease-in-out infinite',
        }}
      />

      {/* Tooltip + arrow */}
      <div
        style={{
          position:  'fixed',
          left:      tipLeft,
          width:     300,
          zIndex:    9993,
          opacity:   visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.92)',
          transition:'opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s',
          display:   'flex',
          flexDirection: tooltipAbove ? 'column' : 'column-reverse',
          alignItems:'center',
          ...tipStyle,
        }}
      >
        {/* Arrow emoji — bounces toward the spotlight */}
        <div style={{
          fontSize: 28,
          lineHeight: 1,
          margin:   tooltipAbove ? '0 0 4px 0' : '4px 0 0 0',
          animation: tooltipAbove ? 'bounce-down 1s ease-in-out infinite' : 'bounce-up 1s ease-in-out infinite',
        }}>
          {tooltipAbove ? '⬇️' : '⬆️'}
        </div>

        {/* Card */}
        <div style={{
          background:   'white',
          borderRadius: 22,
          padding:      '20px 20px 16px',
          boxShadow:    '0 12px 40px rgba(0,0,0,0.35)',
          width:        '100%',
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#111', marginBottom: 8, lineHeight: 1.3 }}>
            {currentStep.title}
          </div>
          <div style={{ fontSize: 15, color: '#444', lineHeight: 1.6, marginBottom: 16 }}>
            {currentStep.desc}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={next}
              style={{
                flex: 1, background: '#0D7377', color: 'white',
                border: 'none', borderRadius: 14, padding: '13px 0',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                letterSpacing: '-0.2px',
              }}
            >
              {step < STEPS.length - 1 ? 'İleri →' : '✓ Anladım!'}
            </button>
            <button
              onClick={finish}
              style={{
                color: '#9CA3AF', background: 'none', border: 'none',
                fontSize: 13, cursor: 'pointer', padding: '6px 8px', whiteSpace: 'nowrap',
              }}
            >
              Atla
            </button>
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  height: 6, borderRadius: 3,
                  width:      i === step ? 20 : 6,
                  background: i === step ? '#0D7377' : '#E5E7EB',
                  transition: 'all 0.35s ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
