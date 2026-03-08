import { useState, useEffect, useCallback } from 'react'

// ── Steps per screen ──────────────────────────────────────────────────────────
const SCREEN_STEPS = {
  landing: [
    { id: 'tour-landing-hero', title: 'Canım\'a Hoş Geldiniz 👋', desc: 'Kişisel sağlık takip asistanınız. Yaşınıza ve hastalıklarınıza göre hangi taramaları ne zaman yaptırmanız gerektiğini gösterir.' },
    { id: 'tour-landing-cta',  title: 'Başlamak Çok Kolay',      desc: 'Kayıt veya şifre gerekmez. Sadece bu butona dokunun!' },
  ],
  auth: [
    { id: 'tour-auth-anon', title: 'Gizliliğiniz Korunur 🔒', desc: 'Tüm bilgileriniz yalnızca bu cihazda saklanır. Sunucuya hiçbir şey gönderilmez.' },
  ],
  onboarding: [
    { id: 'tour-ob-year',     title: 'Doğum Yılınız',    desc: 'Tarama önerileri yaşa göre değişir. Artı/eksi tuşlarıyla veya direkt yazarak girebilirsiniz.' },
    { id: 'tour-ob-diseases', title: 'Hastalıklarınız',  desc: 'Kronik hastalıklarınızı seçin — taramalar sizin için kişiselleştirilir. Hiç hastalığınız yoksa en üstteki butona dokunun.' },
  ],
  app: [
    { id: 'tour-score-card',     title: '🎯 Sağlık Skorunuz',   desc: 'Taramalarınızı yaptırdıkça bu puan yükselir. Amacınız 100\'e ulaşmak!' },
    { id: 'tour-action-btns',    title: '✅ Kontrole Gittim',   desc: 'Doktora her gittiğinizde bu butona dokunun. Tarih kaydedilir, puanınız güncellenir.' },
    { id: 'tour-tab-screenings', title: '🔬 Taramalar Sekmesi', desc: 'Tüm taramalarınızı ve ne zaman yapılması gerektiğini buradan görebilirsiniz.' },
    { id: 'tour-tab-profile',    title: '👤 Profil Sekmesi',    desc: 'Bilgilerinizi güncelleyin ve kişisel sağlık raporunuzu PDF olarak indirin.' },
  ],
}

const doneKey  = (screen) => `canim_tour_done_${screen}`
const allKeys  = () => Object.keys(SCREEN_STEPS).map(doneKey)
export const resetAllTours = () => allKeys().forEach(k => localStorage.removeItem(k))
export const isScreenDone  = (screen) => !!localStorage.getItem(doneKey(screen))

const PAD = 12

// ── Animated SVG arrow ────────────────────────────────────────────────────────
function Arrow({ direction }) {
  // direction: 'up' | 'down'
  const rot = direction === 'up' ? 180 : 0
  return (
    <svg
      width="32" height="32" viewBox="0 0 32 32" fill="none"
      style={{
        display: 'block',
        animation: direction === 'down' ? 'tour-bounce-down 1s ease-in-out infinite' : 'tour-bounce-up 1s ease-in-out infinite',
        transform: `rotate(${rot}deg)`,
      }}
    >
      <path
        d="M16 6 L16 24 M8 16 L16 24 L24 16"
        stroke="#0D7377" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TourGuide({ currentScreen }) {
  const steps = SCREEN_STEPS[currentScreen] || []

  const [screenStep, setScreenStep] = useState(0)
  const [rect, setRect]             = useState(null)
  const [visible, setVisible]       = useState(true)
  const [done, setDone]             = useState(() => isScreenDone(currentScreen))

  // Reset when screen changes
  useEffect(() => {
    setDone(isScreenDone(currentScreen))
    setScreenStep(0)
    setRect(null)
    setVisible(true)
  }, [currentScreen])

  const currentStep = steps[screenStep]

  const measureEl = useCallback(() => {
    if (!currentStep) return
    let tries = 0
    const attempt = () => {
      const el = document.getElementById(currentStep.id)
      if (!el && tries++ < 20) { setTimeout(attempt, 250); return }
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      setTimeout(() => {
        const r = el.getBoundingClientRect()
        if (r.width === 0 && tries++ < 20) { setTimeout(attempt, 250); return }
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
        setVisible(true)
      }, 100)
    }
    attempt()
  }, [currentStep])

  useEffect(() => {
    if (done) return
    setVisible(false)
    setRect(null)
    const delay = (currentScreen === 'landing' || currentScreen === 'auth') ? 800
                : screenStep === 0 ? 700 : 200
    const t = setTimeout(measureEl, delay)
    return () => clearTimeout(t)
  }, [screenStep, measureEl, done, currentScreen])

  const next = () => {
    if (screenStep < steps.length - 1) {
      setScreenStep(s => s + 1)
    } else {
      finish()
    }
  }

  const finish = () => {
    localStorage.setItem(doneKey(currentScreen), '1')
    setDone(true)
  }

  if (done || !currentStep) return null

  // Fallback rect if element not found yet
  const fallback   = { top: window.innerHeight * 0.3, left: window.innerWidth * 0.05, width: window.innerWidth * 0.9, height: 80 }
  const activeRect = rect || fallback

  const spotTop  = activeRect.top  - PAD
  const spotLeft = activeRect.left - PAD
  const spotW    = activeRect.width  + PAD * 2
  const spotH    = activeRect.height + PAD * 2

  const tooltipAbove = activeRect.top > window.innerHeight * 0.52
  const tipLeft      = Math.max(16, Math.min(window.innerWidth - 316, spotLeft + spotW / 2 - 150))
  const tipStyle     = tooltipAbove
    ? { bottom: Math.max(16, window.innerHeight - spotTop + 12) }
    : { top: Math.min(window.innerHeight - 280, spotTop + spotH + 12) }

  const totalSteps = steps.length

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9990 }} onClick={e => e.stopPropagation()}>

      {/* Spotlight */}
      <div style={{
        position:      'fixed',
        top:           spotTop,
        left:          spotLeft,
        width:         spotW,
        height:        spotH,
        borderRadius:  18,
        boxShadow:     '0 0 0 100vw rgba(0,0,0,0.72)',
        border:        '3px solid #EF4444',
        zIndex:        9991,
        pointerEvents: 'none',
        opacity:       visible ? 1 : 0,
        transition:    'opacity 0.3s ease, top 0.38s cubic-bezier(.4,0,.2,1), left 0.38s cubic-bezier(.4,0,.2,1), width 0.38s cubic-bezier(.4,0,.2,1), height 0.38s cubic-bezier(.4,0,.2,1)',
        animation:     'tour-spotlight-red-pulse 1.1s ease-in-out infinite',
      }} />

      {/* Tooltip */}
      <div style={{
        position:   'fixed',
        left:       tipLeft,
        width:      300,
        zIndex:     9995,
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(6px)',
        transition: 'opacity 0.3s ease 0.08s, transform 0.3s ease 0.08s',
        display:    'flex',
        flexDirection: tooltipAbove ? 'column' : 'column-reverse',
        alignItems: 'center',
        gap:        4,
        ...tipStyle,
      }}>

        {/* Arrow */}
        <Arrow direction={tooltipAbove ? 'down' : 'up'} />

        {/* Card */}
        <div style={{
          width:        '100%',
          background:   'white',
          borderRadius: 20,
          overflow:     'hidden',
          boxShadow:    '0 16px 48px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.12)',
        }}>
          {/* Teal header strip */}
          <div style={{
            background:  'linear-gradient(135deg, #0D7377, #14919B)',
            padding:     '14px 18px 12px',
            display:     'flex',
            alignItems:  'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ color: 'white', fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>
              {currentStep.title}
            </span>
            <span style={{
              color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 600,
              background: 'rgba(0,0,0,0.15)', borderRadius: 999, padding: '2px 8px',
              whiteSpace: 'nowrap', marginLeft: 8,
            }}>
              {screenStep + 1} / {totalSteps}
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: '14px 18px 16px' }}>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65, margin: 0, marginBottom: 14 }}>
              {currentStep.desc}
            </p>

            <p style={{ fontSize: 12, color: '#EF4444', fontWeight: 600, margin: '0 0 10px 0', textAlign: 'center' }}>
              ⚠️ Devam etmek için lütfen okuyun
            </p>
            <button
              onClick={next}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #0D7377, #14919B)',
                color: 'white', border: 'none', borderRadius: 12,
                padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {screenStep < totalSteps - 1 ? 'Anladım, İleri →' : '✓ Anladım!'}
            </button>

            {/* Progress dots */}
            {totalSteps > 1 && (
              <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 12 }}>
                {steps.map((_, i) => (
                  <div key={i} style={{
                    height: 5, borderRadius: 3,
                    width:      i === screenStep ? 18 : 5,
                    background: i === screenStep ? '#0D7377' : '#E5E7EB',
                    transition: 'all 0.3s ease',
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
