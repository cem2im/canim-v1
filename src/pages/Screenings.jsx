import { useState } from 'react'
import { createPortal } from 'react-dom'
import useAppStore from '../store/useAppStore'
import ScreeningDetail from '../components/ScreeningDetail'
import FeedbackSection from '../components/FeedbackSection'
import Disclaimer from '../components/Disclaimer'
import { generateICS, buildWhatsAppReminder } from '../utils/generateICS'

// ── Urgency sort: overdue/unknown first, then by daysUntil, ok last ───────────
function urgencyScore(card) {
  if (card.status === 'overdue' || card.status === 'unknown') return -999
  if (card.daysUntil === null) return 9999
  return card.daysUntil
}

// ── Time label & color ────────────────────────────────────────────────────────
function timeLabel(status, daysUntil) {
  if (status === 'overdue' || status === 'unknown') return 'Hemen'
  if (daysUntil === null || daysUntil <= 30) return 'Hemen'
  if (daysUntil <= 60)   return '2 ay sonra'
  if (daysUntil <= 90)   return '3 ay sonra'
  if (daysUntil <= 180)  return '6 ay sonra'
  if (daysUntil <= 365)  return '1 yıl sonra'
  if (daysUntil <= 730)  return '2 yıl sonra'
  if (daysUntil <= 1825) return '5 yıl sonra'
  return '5+ yıl sonra'
}
function timeLabelColor(status, daysUntil) {
  if (status === 'overdue' || status === 'unknown') return '#DC2626'
  if (daysUntil !== null && daysUntil <= 30)  return '#0D7377'
  if (daysUntil !== null && daysUntil <= 90)  return '#D97706'
  return '#9CA3AF'
}

const primaryDoctor = str => str ? str.split('·')[0].trim() : 'Laboratuvar'

const TR_MONTHS = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
function fmtDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ── Mark-done sheet ───────────────────────────────────────────────────────────
function MarkDoneSheet({ card, onDone, onClose }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  return createPortal(
    <div className="fixed inset-0 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.48)', zIndex: 9999 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex-1" onClick={onClose} />
      <div className="bg-white rounded-t-3xl"
        style={{ animation: 'slideUp 0.26s cubic-bezier(0.22,1,0.36,1)', padding: '20px 20px 44px' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="text-base font-extrabold text-gray-900 mb-0.5">{card.icon} {card.trName}</div>
        <div className="text-sm text-gray-400 mb-4">{primaryDoctor(card.doctor)}</div>
        <input type="date"
          className="w-full px-4 py-3.5 rounded-2xl border-2 text-gray-900 font-semibold outline-none mb-4"
          style={{ borderColor: '#0D7377' }}
          value={date}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => setDate(e.target.value)}
        />
        <button onClick={() => { onDone(card.id, date); onClose() }}
          className="w-full py-4 rounded-2xl text-white font-bold text-base"
          style={{ background: 'linear-gradient(135deg,#0D7377,#14919B)', boxShadow: '0 4px 16px rgba(13,115,119,0.3)' }}>
          ✓ Yapıldı Olarak Kaydet
        </button>
      </div>
    </div>
  , document.body)
}

// ── Reminder sheet ────────────────────────────────────────────────────────────
function ReminderSheet({ cards, profileName, onClose }) {
  const [icsDone, setIcsDone] = useState(false)
  const urgentCount = cards.filter(c =>
    c.status === 'overdue' || c.status === 'unknown' ||
    (c.daysUntil !== null && c.daysUntil <= 30)
  ).length

  return createPortal(
    <div className="fixed inset-0 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.48)', zIndex: 9999 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex-1" onClick={onClose} />
      <div className="bg-white rounded-t-3xl"
        style={{ animation: 'slideUp 0.26s cubic-bezier(0.22,1,0.36,1)', paddingBottom: 40 }}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
          <span className="text-2xl">🔔</span>
          <div className="flex-1">
            <div className="font-extrabold text-gray-900">Hatırlatma Kur</div>
            <div className="text-xs text-gray-400">
              {urgentCount > 0 ? `${urgentCount} acil tarama var` : 'Tüm taramalar güncel'}
            </div>
          </div>
          <button onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#E5E7EB', fontSize: 22, fontWeight: 700, color: '#374151' }}>×</button>
        </div>
        <div className="px-5 pt-5 flex flex-col gap-3">
          <button
            onClick={() => { generateICS(cards); setIcsDone(true) }}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left active:scale-98"
            style={{ background: icsDone ? '#F0FDF4' : '#F9FAFB', border: `1.5px solid ${icsDone ? '#BBF7D0' : '#E5E7EB'}` }}>
            <span className="text-3xl">{icsDone ? '✅' : '📅'}</span>
            <div>
              <div className="font-bold text-gray-900 text-sm">{icsDone ? 'İndirildi!' : 'Takvime Ekle (.ics)'}</div>
              <div className="text-xs text-gray-500 mt-0.5">iPhone/Android takvimine ekle — otomatik bildirim gelir</div>
            </div>
          </button>
          <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildWhatsAppReminder(cards, profileName))}`)}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left active:scale-98"
            style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
            <span className="text-3xl">💬</span>
            <div>
              <div className="font-bold text-gray-900 text-sm">WhatsApp'ta Gönder</div>
              <div className="text-xs text-gray-500 mt-0.5">Kendinize veya ailenize tarama listesini gönderin</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  , document.body)
}

// ── Divider label between urgency groups ──────────────────────────────────────
function GroupDivider({ label, color }) {
  return (
    <div className="flex items-center gap-2 mt-2 mb-1 px-1">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{label}</span>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Screenings() {
  const getScreeningCards = useAppStore(s => s.getScreeningCards)
  const markDone          = useAppStore(s => s.markDone)
  const profile           = useAppStore(s => s.profile)

  const [selected,     setSelected]     = useState(null)
  const [markCard,     setMarkCard]     = useState(null)
  const [showReminder, setShowReminder] = useState(false)

  const cards  = getScreeningCards()
  const sorted = [...cards].sort((a, b) => urgencyScore(a) - urgencyScore(b))

  const urgentCount = cards.filter(c =>
    c.status === 'overdue' || c.status === 'unknown' ||
    (c.daysUntil !== null && c.daysUntil <= 30)
  ).length

  // Group boundaries for dividers
  const hasOverdue  = sorted.some(c => c.status === 'overdue' || c.status === 'unknown')
  const hasUpcoming = sorted.some(c => c.daysUntil !== null && c.daysUntil > 30 && c.daysUntil <= 90)
  const hasOk       = sorted.some(c => c.status === 'ok' && (c.daysUntil === null || c.daysUntil > 90))

  if (selected) return <ScreeningDetail screening={selected} onBack={() => setSelected(null)} />

  let shownOverdueDivider  = false
  let shownUpcomingDivider = false
  let shownOkDivider       = false

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#FAFAF8', overflow: 'hidden' }}
      className="page-enter">

      {/* Header */}
      <div style={{ padding: '20px 20px 10px', flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-extrabold text-gray-900">Sağlık Takiplerim</h1>
          <button onClick={() => setShowReminder(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs active:scale-95"
            style={{ background: '#FEF9C3', color: '#92400E', border: '1.5px solid #FDE68A' }}>
            🔔 Hatırlatma
          </button>
        </div>
        {urgentCount > 0 ? (
          <p className="text-sm font-bold" style={{ color: '#DC2626' }}>
            ⚠️ {urgentCount} taramanızda gecikme var
          </p>
        ) : (
          <p className="text-sm font-semibold" style={{ color: '#0D7377' }}>
            ✓ Tüm takipler güncel
          </p>
        )}
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, padding: '4px 16px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {sorted.map(card => {
          const isUrgent   = card.status === 'overdue' || card.status === 'unknown'
          const isUpcoming = !isUrgent && card.daysUntil !== null && card.daysUntil <= 90
          const isOk       = card.status === 'ok' && !isUpcoming && !isUrgent
          const color      = timeLabelColor(card.status, card.daysUntil)
          const label      = timeLabel(card.status, card.daysUntil)

          // Insert dividers
          const dividers = []
          if (isUrgent && !shownOverdueDivider) {
            shownOverdueDivider = true
            dividers.push(<GroupDivider key="d-overdue" label="Hemen Yapılmalı" color="#DC2626" />)
          } else if (isUpcoming && !shownUpcomingDivider) {
            shownUpcomingDivider = true
            dividers.push(<GroupDivider key="d-upcoming" label="Yakında" color="#D97706" />)
          } else if (isOk && !shownOkDivider) {
            shownOkDivider = true
            dividers.push(<GroupDivider key="d-ok" label="Güncel" color="#0D7377" />)
          }

          return (
            <div key={card.id}>
              {dividers}
              <div
                onClick={() => setSelected(card)}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 mb-2 cursor-pointer active:scale-98 transition-transform"
                style={{
                  border: `1.5px solid ${isUrgent ? '#FEE2E2' : isUpcoming ? '#FEF3C7' : '#F3F4F6'}`,
                  boxShadow: isUrgent ? '0 2px 10px rgba(220,38,38,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                {/* Icon */}
                <span className="text-2xl shrink-0">{card.icon}</span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm leading-tight truncate">{card.trName}</div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate">
                    {primaryDoctor(card.doctor)}
                    {card.lastDoneDate && ` · Son: ${fmtDate(card.lastDoneDate)}`}
                  </div>
                </div>

                {/* Time badge */}
                <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 mx-1"
                  style={{ background: `${color}18`, color }}>
                  {label}
                </span>

                {/* Quick done button */}
                <button
                  onClick={e => { e.stopPropagation(); setMarkCard(card) }}
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                  style={{ background: '#F0FDF4', border: '1.5px solid #DCFCE7', color: '#16A34A', fontSize: 14, fontWeight: 700 }}>
                  ✓
                </button>
              </div>
            </div>
          )
        })}

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <FeedbackSection page="screenings" />
          <Disclaimer />
        </div>
      </div>

      {/* Mark-done sheet */}
      {markCard && (
        <MarkDoneSheet
          card={markCard}
          onDone={(id, date) => markDone(id, date)}
          onClose={() => setMarkCard(null)}
        />
      )}

      {/* Reminder sheet */}
      {showReminder && (
        <ReminderSheet
          cards={cards}
          profileName={profile?.name}
          onClose={() => setShowReminder(false)}
        />
      )}
    </div>
  )
}
