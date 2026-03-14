import { useState, useEffect } from 'react'

export default function LandingPage({ onStart }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])

  const features = [
    { icon: '🩸', text: 'Kan tahlilleri' },
    { icon: '🩻', text: 'Radyoloji & görüntüleme' },
    { icon: '💉', text: 'Aşı takibi' },
    { icon: '🏥', text: 'Doktor kontrol takvimi' },
  ]

  return (
    <div style={{
      height: '100dvh',
      background: '#FAFAF8',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 24px',
      overflow: 'hidden',
    }}>

      {/* Top — logo + tagline */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        paddingTop: 24,
      }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, #0D7377, #14B8A6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
          boxShadow: '0 6px 24px rgba(13,115,119,0.3)',
        }}>
          <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
            <path d="M24 8C24 8 14 14 14 24C14 29.5 18.5 34 24 34C29.5 34 34 29.5 34 24C34 14 24 8 24 8Z" fill="white" opacity="0.95"/>
            <path d="M24 20V28M20 24H28" stroke="#0D7377" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: -1 }}>
          Canım
        </h1>

        <p style={{
          fontSize: 15, color: '#6B7280', marginTop: 8, marginBottom: 0,
          textAlign: 'center', lineHeight: 1.5, maxWidth: 260,
        }}>
          Yaşınıza ve sağlık durumunuza göre yapmanız gereken takipler
        </p>
      </div>

      {/* Middle — CTA + features */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
        paddingBottom: 8,
      }}>
        {/* CTA button — big, first thing after tagline */}
        <button
          onClick={onStart}
          style={{
            width: '100%', padding: '18px 0', borderRadius: 18,
            background: 'linear-gradient(135deg, #0D7377, #14B8A6)',
            color: 'white', fontWeight: 900, fontSize: 18,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(13,115,119,0.4)',
            marginBottom: 20,
            transition: 'transform 0.12s',
          }}
          onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
          onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          Başla →
        </button>

        {/* Features — 2x2 grid, icon + short label only */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'white', borderRadius: 14, padding: '12px 14px',
              border: '1px solid #F3F4F6', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', lineHeight: 1.3 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Privacy + disclaimer — tiny, single line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ fontSize: 12 }}>🔒</span>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>
            Verileriniz yalnızca cihazınızda saklanır · Ücretsiz
          </span>
        </div>
        <p style={{ textAlign: 'center', fontSize: 10, color: '#D1D5DB', marginTop: 6, marginBottom: 16 }}>
          Tıbbi tavsiye değildir · Prof. Dr. Cem Şimşek
        </p>
      </div>
    </div>
  )
}
