import { useState } from 'react'
import { createPortal } from 'react-dom'
import useAppStore from '../store/useAppStore'
import ScreeningDetail from '../components/ScreeningDetail'
import FeedbackSection from '../components/FeedbackSection'

// Blood test screening IDs
const BLOOD_IDS = new Set([
  'kan_sayimi','biyokimya','lipid','hba1c','tsh','vitamin_d',
  'b12','hepatit','hiv_tarama','prostat','idrar',
])

function timeLabel(status, daysUntil) {
  if (status === 'overdue' || status === 'unknown') return 'Hemen'
  if (daysUntil === null || daysUntil <= 30) return 'Hemen'
  if (daysUntil <= 60)   return '2 ay sonra'
  if (daysUntil <= 90)   return '3 ay sonra'
  if (daysUntil <= 180)  return '6 ay sonra'
  if (daysUntil <= 365)  return '1 yıl sonra'
  if (daysUntil <= 730)  return '2 yıl sonra'
  return '5+ yıl sonra'
}
function timeLabelColor(status, daysUntil) {
  if (status === 'overdue' || status === 'unknown') return '#DC2626'
  if (daysUntil !== null && daysUntil <= 30)  return '#0D7377'
  if (daysUntil !== null && daysUntil <= 90)  return '#D97706'
  return '#6B7280'
}

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
        style={{ animation: 'slideUp 0.26s cubic-bezier(0.22,1,0.36,1)', padding: '20px 20px 40px' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="text-base font-extrabold text-gray-900 mb-1">
          {card.icon} {card.trName}
        </div>
        <div className="text-sm text-gray-500 mb-4">Yapıldığı tarihi girin</div>
        <input
          type="date"
          className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-900 font-semibold outline-none mb-4"
          style={{ borderColor: '#0D7377' }}
          value={date}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => setDate(e.target.value)}
        />
        <button
          onClick={() => { onDone(card.id, date); onClose() }}
          className="w-full py-4 rounded-2xl text-white font-bold text-base"
          style={{ background: 'linear-gradient(135deg,#0D7377,#14919B)', boxShadow: '0 4px 16px rgba(13,115,119,0.3)' }}>
          ✓ Kaydet
        </button>
      </div>
    </div>
  , document.body)
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Tahliller() {
  const getScreeningCards = useAppStore(s => s.getScreeningCards)
  const markDone          = useAppStore(s => s.markDone)

  const [selected,  setSelected]  = useState(null)
  const [markCard,  setMarkCard]  = useState(null)

  const cards = getScreeningCards().filter(c => BLOOD_IDS.has(c.id))
  const urgentCount = cards.filter(c =>
    c.status === 'overdue' || c.status === 'unknown' ||
    (c.daysUntil !== null && c.daysUntil <= 30)
  ).length

  if (selected) return <ScreeningDetail screening={selected} onBack={() => setSelected(null)} />

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#FAFAF8', overflow: 'hidden' }}
      className="page-enter">

      {/* Header */}
      <div style={{ padding: '20px 20px 10px', flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-extrabold text-gray-900">Tahlillerim</h1>
          <button
            onClick={() => {
              // Open mark-done for first urgent card, or first card
              const target = cards.find(c => c.status === 'overdue' || c.status === 'unknown') || cards[0]
              if (target) setMarkCard(target)
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs active:scale-95"
            style={{ background: '#0D7377', color: 'white', border: 'none' }}>
            ➕ Test Kaydet
          </button>
        </div>
        {urgentCount > 0 ? (
          <p className="text-sm font-bold mb-3" style={{ color: '#DC2626' }}>
            ⚠️ {urgentCount} tahlil bekliyor
          </p>
        ) : (
          <p className="text-sm font-semibold mb-3" style={{ color: '#0D7377' }}>
            ✓ Tüm tahliller güncel
          </p>
        )}
      </div>

      {/* Cards list */}
      <div style={{ flex: 1, padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
        {cards.map(card => {
          const color  = timeLabelColor(card.status, card.daysUntil)
          const label  = timeLabel(card.status, card.daysUntil)
          const urgent = card.status === 'overdue' || card.status === 'unknown'
          return (
            <div key={card.id}
              onClick={() => setSelected(card)}
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 cursor-pointer active:scale-98 transition-transform"
              style={{
                border: `1.5px solid ${urgent ? color + '40' : '#F3F4F6'}`,
                boxShadow: urgent ? `0 2px 10px ${color}15` : '0 1px 4px rgba(0,0,0,0.04)',
              }}>
              <span className="text-2xl shrink-0">{card.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm leading-tight">{card.trName}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {card.lastDoneDate ? `Son: ${fmtDate(card.lastDoneDate)}` : 'Hiç yapılmadı'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); setMarkCard(card) }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold active:scale-90 transition-transform"
                  style={{ background: '#F0FDF4', color: '#16A34A', border: '1.5px solid #DCFCE7' }}>
                  ✓ Yapıldı
                </button>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${color}18`, color }}>
                  {label}
                </span>
              </div>
            </div>
          )
        })}

        {cards.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="text-5xl mb-3">🩸</div>
            <div className="font-bold text-gray-700 mb-1">Tahlil takibi yok</div>
            <div className="text-sm text-gray-400">Profilinize hastalık ekleyerek tahlil takibi oluşturabilirsiniz.</div>
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <FeedbackSection page="tahliller" />
        </div>
      </div>

      {/* Mark done sheet */}
      {markCard && (
        <MarkDoneSheet
          card={markCard}
          onDone={(id, date) => markDone(id, date)}
          onClose={() => setMarkCard(null)}
        />
      )}
    </div>
  )
}
