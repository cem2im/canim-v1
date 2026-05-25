import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import useAppStoreV2 from '../store/useAppStoreV2'
import WizardV2 from './WizardV2'
import { shareKarneImage } from '../utils/karneShare'
import { generateScreeningsPdf } from '../utils/generatePdf'
import { computeRadarAxes, computeGrade, gradeColor as getGradeColor } from '../data/lifestyle'

const FREQ_LABELS = {
  1: 'Ayda bir', 3: '3 ayda bir', 6: '6 ayda bir', 12: 'Yılda bir',
  24: '2 yılda bir', 36: '3 yılda bir', 60: '5 yılda bir',
  120: '10 yılda bir', 999: 'Bir defaya mahsus',
}

function freqLabel(months) {
  return FREQ_LABELS[months] || `${months} ayda bir`
}

function timeLabel(card) {
  if (card.status === 'unknown') return { text: 'Yapılmadı', color: '#6B7280' }
  if (card.status === 'overdue') return { text: 'Hemen', color: '#EF4444' }
  if (card.status === 'upcoming') return { text: 'Bu ay', color: '#F59E0B' }
  if (card.status === 'soon') {
    const months = Math.round(card.daysUntil / 30)
    if (months <= 3) return { text: `${months} ay sonra`, color: '#F59E0B' }
    return { text: '3-6 ay', color: '#10B981' }
  }
  // ok — gerçek lastDoneDate'den hesapla (daysUntil değil!)
  if (card.lastDoneDate) {
    const daysSince = Math.round((new Date() - new Date(card.lastDoneDate)) / 86400000)
    const months = Math.round(daysSince / 30)
    if (months <= 0) return { text: 'Bu ay yapıldı', color: '#10B981' }
    if (months === 1) return { text: '1 ay önce', color: '#10B981' }
    if (months < 12) return { text: `${months} ay önce`, color: '#10B981' }
    const years = Math.round(months / 12)
    return { text: `${years} yıl önce`, color: '#10B981' }
  }
  return { text: 'Güncel', color: '#10B981' }
}

// Toast
function Toast({ message }) {
  return createPortal(
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-white text-sm font-semibold animate-[slideUp_0.3s_ease-out]"
      style={{background:'#0D7377',maxWidth:'90vw'}} role="status" aria-live="polite">
      {message}
    </div>,
    document.body
  )
}

// MarkDoneSheet
function MarkDoneSheet({ screening, onClose, onDone }) {
  const today = new Date()
  const chips = [
    { label: 'Bu ay',     months: 0 },
    { label: '3 ay önce', months: 3 },
    { label: '6 ay önce', months: 6 },
    { label: '1 yıl önce',months: 12 },
    { label: '2 yıl önce',months: 24 },
    { label: 'Daha eski', months: 36 },
  ]

  const handleChip = (months) => {
    const d = new Date(today)
    d.setMonth(d.getMonth() - months)
    const dateStr = d.toISOString().slice(0, 10)
    onDone(screening.id, dateStr)
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label="Tarama tarihi seç">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6" style={{maxWidth:480,margin:'0 auto'}}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-1">{screening.icon} {screening.trName}</h2>
        <p className="text-gray-600 text-sm mb-5">Ne zaman yaptırdınız?</p>
        <div className="grid grid-cols-2 gap-3">
          {chips.map(c => (
            <button key={c.label} onClick={() => handleChip(c.months)}
              className="py-4 rounded-2xl border-2 font-semibold text-base transition-all hover:border-teal-600 hover:text-teal-700"
              style={{borderColor:'#E5E7EB',color:'#374151',minHeight:44}}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

// DetailSheet
function DetailSheet({ screening, onClose, onMarkDone }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label="Tarama detayı">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6 max-h-[70dvh] overflow-y-auto" style={{maxWidth:480,margin:'0 auto'}}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{screening.icon}</span>
          <h2 className="text-2xl font-bold">{screening.trName}</h2>
        </div>
        <hr className="border-gray-100 mb-4" />
        {screening.why && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Neden?</p>
            <p className="text-gray-800 text-sm leading-relaxed">{screening.why}</p>
          </div>
        )}
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Ne sıklıkla?</p>
          <p className="text-gray-800 text-sm">{freqLabel(screening.frequencyMonths)}</p>
        </div>
        {screening.doctor && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Nereye?</p>
            <p className="text-gray-800 text-sm">{screening.doctor}</p>
          </div>
        )}
        {screening.sources && screening.sources[0] && (
          <div className="mb-4">
            <a href={screening.sources[0].url} target="_blank" rel="noopener noreferrer"
              className="text-sm underline" style={{color:'#0D7377'}}>
              Kaynak: {screening.sources[0].name}
            </a>
          </div>
        )}
        <button onClick={onMarkDone}
          className="w-full py-4 rounded-2xl text-lg font-bold text-white mt-2"
          style={{background:'#0D7377'}}>
          ✓ Yaptırdım
        </button>
      </div>
    </div>,
    document.body
  )
}

// ReminderSheet
function ReminderSheet({ cards, onClose }) {
  const [emptyMsg, setEmptyMsg] = useState(false)
  const handleICS = () => {
    const upcoming = cards.filter(c => c.status !== 'ok' && c.nextDate)
    if (!upcoming.length) { setEmptyMsg(true); return }
    setEmptyMsg(false)
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Canım//TR']
    for (const c of upcoming) {
      const dt = (c.nextDate || new Date().toISOString().slice(0,10)).replace(/-/g,'')
      lines.push('BEGIN:VEVENT',
        `DTSTART;VALUE=DATE:${dt}`,
        `SUMMARY:${c.trName} taraması`,
        `DESCRIPTION:${c.why || ''}`,
        'END:VEVENT')
    }
    lines.push('END:VCALENDAR')
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'canim-taramalar.ics'
    a.click()
  }

  const handleWhatsApp = () => {
    const lines = ['📋 Tarama Listem (Canım App):']
    for (const c of cards.slice(0, 10)) {
      const lbl = timeLabel(c)
      lines.push(`• ${c.icon} ${c.trName} — ${lbl.text}`)
    }
    const text = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label="Hatırlatma kur">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6" style={{maxWidth:480,margin:'0 auto'}}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-5">Hatırlatma Kur</h2>
        {emptyMsg && (
          <p className="text-sm text-green-700 font-semibold mb-3 px-1" role="status">
            ✅ Tüm taramalar güncel — eklenecek randevu yok.
          </p>
        )}
        <div className="space-y-3">
          <button onClick={handleICS}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border border-gray-200 bg-white text-left"
            style={{minHeight:44}}>
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-semibold">Takvime Ekle (.ics)</p>
              <p className="text-gray-600 text-sm">Tüm tarama randevularını takvime ekle</p>
            </div>
          </button>
          <button onClick={handleWhatsApp}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border border-gray-200 bg-white text-left"
            style={{minHeight:44}}>
            <span className="text-2xl">💬</span>
            <div>
              <p className="font-semibold">WhatsApp'ta Gönder</p>
              <p className="text-gray-600 text-sm">Listeni paylaş</p>
            </div>
          </button>
        </div>
        <button onClick={onClose} className="mt-5 w-full py-3 rounded-2xl border border-gray-300 text-gray-700 font-semibold">Kapat</button>
      </div>
    </div>,
    document.body
  )
}

// Group header
function GroupHeader({ label, color = '#6B7280', bg = '#F9FAFB', count }) {
  return (
    <div className="px-5 py-2 mt-3 first:mt-0 flex items-center justify-between"
      style={{ background: bg, borderLeft: `4px solid ${color}` }}>
      <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color }}>{label}</p>
      {count != null && (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: color }}>{count}</span>
      )}
    </div>
  )
}

// ── Mini Radar (karne sheet için) ─────────────────────────────────────────
function RadarMini({ axes }) {
  const N = axes.length
  const cx = 130, cy = 125, R = 80
  const angle = (i) => (Math.PI * 2 * i / N) - Math.PI / 2
  const pt = (i, r) => [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))]
  const dataPoints = axes.map((a, i) => pt(i, R * (a.score / 100)))
  const dataPoly = dataPoints.map(p => p.join(',')).join(' ')
  return (
    <svg width={260} height={250} viewBox="0 0 260 250" aria-hidden="true">
      <defs>
        <linearGradient id="rf2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0D7377" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#14919B" stopOpacity="0.15"/>
        </linearGradient>
      </defs>
      {[0.33,0.66,1].map((r,ri) => {
        const pts = Array.from({length:N},(_,i)=>pt(i,R*r)).map(p=>p.join(',')).join(' ')
        return <polygon key={ri} points={pts} fill="none" stroke="#E5E7EB" strokeWidth={1}/>
      })}
      {axes.map((_,i)=>{const[x,y]=pt(i,R);return<line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E5E7EB" strokeWidth={1}/>})}
      <polygon points={dataPoly} fill="url(#rf2)" stroke="#0D7377" strokeWidth={2.5} strokeLinejoin="round"/>
      {dataPoints.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={5} fill="#0D7377" stroke="white" strokeWidth={2}/>)}
      {axes.map((a,i)=>{const[x,y]=pt(i,R+20);return(
        <g key={i}>
          <text x={x} y={y-8} textAnchor="middle" fontSize={16}>{a.icon}</text>
          <text x={x} y={y+6} textAnchor="middle" fontSize={9} fontWeight={700} fill="#374151" fontFamily="Inter,sans-serif">{a.label}</text>
          <text x={x} y={y+17} textAnchor="middle" fontSize={9} fill="#0D7377" fontFamily="Inter,sans-serif" fontWeight={800}>{a.score}</text>
        </g>
      )})}
    </svg>
  )
}

// ── KarneSheet ────────────────────────────────────────────────────────────
function KarneSheet({ cards, lifestyleAnswers, profile, onClose }) {
  const [sharing, setSharing] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const resetAll = useAppStoreV2(s => s.resetAll)
  const axes = useMemo(() => computeRadarAxes(cards, lifestyleAnswers), [cards, lifestyleAnswers])
  const overallScore = useMemo(() => {
    const filled = axes.filter(a => a.score > 0)
    return filled.length ? Math.round(filled.reduce((s,a) => s + a.score, 0) / filled.length) : 0
  }, [axes])
  const grade = computeGrade(overallScore)
  const gColor = getGradeColor(overallScore)
  const gradeMsg = overallScore >= 85 ? 'Harika — taramalarını takip ediyorsun!'
    : overallScore >= 70 ? 'İyi gidiyorsun, birkaç tarama eksik.'
    : overallScore >= 55 ? 'Birkaç önemli tarama gecikmiş.'
    : 'Dikkat — bazı kritik taramalar yapılmamış.'

  const waMsg = `Sağlık karnemdeki notuma baktım… ${grade} aldım 😬 Senin notun ne acaba? Canım ile 2 dakikada öğren: https://canim.uzunyasa.com/app/`

  const handleShare = async () => {
    setSharing(true)
    try { await shareKarneImage({ axes, grade, overallScore, waMsg }) }
    finally { setSharing(false) }
  }

  const handlePdf = () => {
    generateScreeningsPdf({ profile, screeningCards: cards, axes })
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label="Sağlık Karnem">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative w-full bg-white rounded-t-3xl max-h-[90dvh] overflow-y-auto" style={{maxWidth:480,margin:'0 auto'}}>
        {/* Header */}
        <div className="px-5 pt-5 pb-4 shrink-0" style={{background:'#0D7377',borderRadius:'24px 24px 0 0'}}>
          <div className="w-10 h-1 bg-white/40 rounded-full mx-auto mb-4"/>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Sağlık Karnen</p>
              <h2 className="text-xl font-extrabold text-white leading-tight">{gradeMsg}</h2>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white flex flex-col items-center justify-center shrink-0 ml-3">
              <span className="text-3xl font-black leading-none" style={{color:gColor}}>{grade}</span>
              <span className="text-xs font-bold" style={{color:gColor}}>{overallScore}/100</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          {/* Radar */}
          <div className="bg-gray-50 rounded-2xl flex justify-center py-2 border border-gray-100">
            <RadarMini axes={axes}/>
          </div>

          {/* Bar scores */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="space-y-2">
              {axes.map(a => {
                const bc = a.score >= 70 ? '#059669' : a.score >= 40 ? '#D97706' : '#DC2626'
                return (
                  <div key={a.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700">{a.icon} {a.label}</span>
                      <span className="text-xs font-bold" style={{color:bc}}>{a.score}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100">
                      <div className="h-1.5 rounded-full transition-all" style={{width:`${a.score}%`,background:bc}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Paylaş (WhatsApp + görsel) */}
          <button onClick={handleShare} disabled={sharing}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold border-2 text-sm"
            style={{color:'#25D366',borderColor:'#25D366',background:'white',minHeight:48,opacity:sharing?0.6:1}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            {sharing ? 'Hazırlanıyor…' : 'Karneyi Paylaş (WhatsApp / Görsel)'}
          </button>

          {/* PDF */}
          <button onClick={handlePdf}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold border border-gray-200 text-gray-600 text-sm"
            style={{minHeight:44}}>
            📄 PDF İndir
          </button>

          <button onClick={onClose}
            className="w-full py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm font-medium"
            style={{minHeight:44}}>
            Kapat
          </button>

          {/* Sıfırla */}
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)}
              className="w-full py-2 text-xs text-red-400 font-medium"
              style={{minHeight:36}}>
              🔄 Baştan Başla
            </button>
          ) : (
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
              <p className="text-sm text-red-700 font-semibold mb-3 text-center">
                Tüm tarama verileri silinecek. Emin misin?
              </p>
              <div className="flex gap-2">
                <button onClick={() => { resetAll(); onClose() }}
                  className="flex-1 py-3 rounded-2xl text-white font-bold text-sm"
                  style={{background:'#EF4444', minHeight:44}}>
                  Evet, Sıfırla
                </button>
                <button onClick={() => setConfirmReset(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-300 text-gray-600 font-semibold text-sm"
                  style={{minHeight:44}}>
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function ScreeningsV2() {
  const wizardDone = useAppStoreV2(s => s.wizardDone)
  const markDone = useAppStoreV2(s => s.markDone)
  const getScreeningCards = useAppStoreV2(s => s.getScreeningCards)
  const profile = useAppStoreV2(s => s.profile)
  const lifestyleAnswers = useAppStoreV2(s => s.lifestyleAnswers)

  const [toast, setToast] = useState(null)
  const [markDoneCard, setMarkDoneCard] = useState(null)
  const [detailCard, setDetailCard] = useState(null)
  const [showReminder, setShowReminder] = useState(false)
  const [showKarne, setShowKarne] = useState(false)
  const [legendDismissed, setLegendDismissed] = useState(
    () => localStorage.getItem('canim-legend-seen') === '1'
  )
  const dismissLegend = () => {
    localStorage.setItem('canim-legend-seen', '1')
    setLegendDismissed(true)
  }

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  const handleMarkDone = useCallback((id, date) => {
    markDone(id, date)
    showToast('✅ Kaydedildi')
  }, [markDone, showToast])

  if (!wizardDone) return <WizardV2 />

  const cards = getScreeningCards()

  // Group cards
  const unknown  = cards.filter(c => c.status === 'unknown')
  const overdue  = cards.filter(c => c.status === 'overdue')
  const yakinda  = cards.filter(c => c.status === 'upcoming' || c.status === 'soon')
  const ok       = cards.filter(c => c.status === 'ok')

  // Status summary
  const pendingCount = unknown.length + overdue.length
  const upcomingCount = yakinda.length

  let statusLine = null
  if (pendingCount > 0) {
    statusLine = <p className="text-sm font-semibold mt-1" style={{color:'#EF4444'}}>⚠️ {pendingCount} tarama yapılmadı</p>
  } else if (upcomingCount > 0) {
    statusLine = <p className="text-sm font-semibold mt-1" style={{color:'#F59E0B'}}>📅 {upcomingCount} tarama yaklaşıyor</p>
  } else {
    statusLine = <p className="text-sm font-semibold mt-1" style={{color:'#0D7377'}}>✓ Tüm takipler güncel</p>
  }

  const renderCard = (card) => {
    const lbl = timeLabel(card)
    return (
      <div key={card.id} className="flex items-center gap-3 px-5 py-4 bg-white border-b border-gray-100 last:border-0">
        <button className="flex-1 flex items-center gap-3 text-left min-w-0" onClick={() => setDetailCard(card)} style={{minHeight:44}}>
          <span className="text-2xl shrink-0">{card.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">{card.trName}</p>
            <p className="text-xs font-medium mt-0.5" style={{color: lbl.color}}>{lbl.text}</p>
          </div>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setMarkDoneCard(card) }}
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
          style={{background:'#0D7377', minWidth:44, minHeight:44}}
          aria-label={`${card.trName} yaptırdım`}>✓</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{color:'#0D7377'}}>Taramalarım</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowKarne(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-lg"
              style={{minWidth:44,minHeight:44}} aria-label="Karneyi gör">📊</button>
            <button onClick={() => setShowReminder(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-xl"
              style={{minWidth:44,minHeight:44}} aria-label="Hatırlatma kur">🔔</button>
          </div>
        </div>
        {statusLine}
      </div>

      {/* Renk legend — ilk ziyarette bir kez */}
      {!legendDismissed && (
        <div className="mx-4 mt-3 mb-1 bg-white rounded-2xl border border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-600">Renk sistemi</p>
            <button onClick={dismissLegend} className="text-xs text-gray-400 underline" style={{minHeight:32,minWidth:32}}>Anladım ✓</button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              { color:'#DC2626', label:'Hemen Yapılmalı' },
              { color:'#D97706', label:'Yakında' },
              { color:'#059669', label:'Güncel' },
              { color:'#6B7280', label:'Bilgi Yok' },
            ].map(({color,label}) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full shrink-0" style={{background:color}} />
                <span className="text-gray-600 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 px-6 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="font-semibold">Henüz tarama yok</p>
            <p className="text-sm text-gray-500 mt-1">Profilinizi güncelleyin</p>
          </div>
        ) : (
          <div className="pb-6">
            {/* Hemen — en büyük görsel ağırlık */}
            {(unknown.length + overdue.length) > 0 && (
              <>
                <GroupHeader label="⚠️ Hemen Yapılmalı"
                  color="#DC2626" bg="#FEF2F2"
                  count={unknown.length + overdue.length} />
                <div className="bg-white border-y border-red-100">
                  {[...overdue, ...unknown].map(renderCard)}
                </div>
              </>
            )}
            {/* Yakında — orta ağırlık */}
            {yakinda.length > 0 && (
              <>
                <GroupHeader label="📅 Yakında"
                  color="#D97706" bg="#FFFBEB"
                  count={yakinda.length} />
                <div className="bg-white border-y border-amber-100">{yakinda.map(renderCard)}</div>
              </>
            )}
            {/* Güncel — en sönük */}
            {ok.length > 0 && (
              <>
                <GroupHeader label="✅ Güncel"
                  color="#059669" bg="#F0FDF4"
                  count={ok.length} />
                <div className="bg-white border-y border-green-100 opacity-80">{ok.map(renderCard)}</div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Sheets */}
      {markDoneCard && (
        <MarkDoneSheet
          screening={markDoneCard}
          onClose={() => setMarkDoneCard(null)}
          onDone={handleMarkDone}
        />
      )}
      {detailCard && (
        <DetailSheet
          screening={detailCard}
          onClose={() => setDetailCard(null)}
          onMarkDone={() => { setMarkDoneCard(detailCard); setDetailCard(null) }}
        />
      )}
      {showReminder && (
        <ReminderSheet cards={cards} onClose={() => setShowReminder(false)} />
      )}
      {showKarne && (
        <KarneSheet
          cards={cards}
          lifestyleAnswers={lifestyleAnswers}
          profile={profile}
          onClose={() => setShowKarne(false)}
        />
      )}
      {toast && <Toast message={toast} />}
    </div>
  )
}
