import { useState, useEffect } from 'react'

export default function LandingPage({ onStart }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const features = [
    { icon: '🩺', title: 'Kişiselleştirilmiş Taramalar', desc: 'Yaşınıza, cinsiyetinize ve hastalıklarınıza göre hangi testleri ne zaman yaptırmanız gerektiğini öğrenin.' },
    { icon: '📅', title: 'Doktor Kontrol Takvimi', desc: 'Hangi uzmana ne sıklıkta gitmeniz gerektiğini takip edin. Hiçbir kontrolü kaçırmayın.' },
    { icon: '💉', title: 'Aşı Takibi', desc: 'Grip, zona, pnömokok ve diğer yetişkin aşılarınızın durumunu görün.' },
    { icon: '📊', title: 'Tarama Uyum Puanı', desc: 'Önleyici sağlık bakımınızı ne kadar iyi yönettiğinizi bir puanla ölçün.' },
  ]

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #0D7377 0%, #145A5E 40%, #FAFAF8 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Hero */}
      <div
        id="tour-landing-hero"
        style={{
          padding: '56px 24px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        {/* App icon */}
        <div style={{
          width: 88,
          height: 88,
          borderRadius: 24,
          background: 'rgba(255,255,255,0.15)',
          border: '1.5px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          backdropFilter: 'blur(8px)',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 8C24 8 14 14 14 24C14 29.5 18.5 34 24 34C29.5 34 34 29.5 34 24C34 14 24 8 24 8Z" fill="white" opacity="0.9"/>
            <path d="M24 20V28M20 24H28" stroke="#0D7377" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="36" cy="12" r="4" fill="#14B8A6" opacity="0.8"/>
          </svg>
        </div>

        <h1 style={{ color: 'white', fontSize: 38, fontWeight: 800, margin: 0, letterSpacing: -1 }}>
          Canım
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, marginTop: 6, marginBottom: 0, textAlign: 'center', fontWeight: 500 }}>
          Kişisel Sağlık Tarama Rehberiniz
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
          Prof. Dr. Cem Şimşek · Hacettepe Üniversitesi
        </p>
      </div>

      {/* White card section */}
      <div style={{
        flex: 1,
        background: '#FAFAF8',
        borderRadius: '28px 28px 0 0',
        padding: '32px 20px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s',
      }}>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 4px 0' }}>
          Sağlığınızı önceden yönetin
        </h2>
        <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px 0', lineHeight: 1.6 }}>
          Kanıta dayalı kılavuzlara göre hangi testleri, hangi sıklıkla yaptırmanız gerektiğini öğrenin. Tamamen ücretsiz, tamamen gizli.
        </p>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                background: 'white',
                borderRadius: 16,
                padding: '14px 16px',
                border: '1px solid #F3F4F6',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                transition: `opacity 0.5s ease ${0.25 + i * 0.08}s, transform 0.5s ease ${0.25 + i * 0.08}s`,
              }}
            >
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #E6F7F7, #C8EFEF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 24,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
          <p style={{ fontSize: 12, color: '#166534', margin: 0, lineHeight: 1.5 }}>
            <strong>Gizliliğiniz önceliğimiz.</strong> Verileriniz yalnızca cihazınızda saklanır. Kişisel bilgileriniz sunucularımıza gönderilmez.
          </p>
        </div>

        {/* CTA */}
        <button
          id="tour-landing-cta"
          onClick={onStart}
          style={{
            width: '100%',
            padding: '17px 0',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #0D7377, #14B8A6)',
            color: 'white',
            fontWeight: 800,
            fontSize: 17,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(13,115,119,0.35)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(13,115,119,0.25)' }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(13,115,119,0.35)' }}
          onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
          onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          Başla →
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 16, lineHeight: 1.5 }}>
          Bu uygulama tıbbi tavsiye vermez. Bilgilendirme amaçlıdır.
        </p>
      </div>
    </div>
  )
}
