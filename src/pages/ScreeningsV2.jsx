import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import useAppStoreV2 from '../store/useAppStoreV2'
import WizardV2 from './WizardV2'

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

export default function ScreeningsV2() {
  const wizardDone = useAppStoreV2(s => s.wizardDone)
  const markDone = useAppStoreV2(s => s.markDone)
  const getScreeningCards = useAppStoreV2(s => s.getScreeningCards)

  const [toast, setToast] = useState(null)
  const [markDoneCard, setMarkDoneCard] = useState(null)
  const [detailCard, setDetailCard] = useState(null)
  const [showReminder, setShowReminder] = useState(false)

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
          <button onClick={() => setShowReminder(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-xl"
            style={{minWidth:44,minHeight:44}} aria-label="Hatırlatma kur">🔔</button>
        </div>
        {statusLine}
      </div>

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
      {toast && <Toast message={toast} />}
    </div>
  )
}
