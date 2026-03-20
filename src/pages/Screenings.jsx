import { useState } from 'react'
import { createPortal } from 'react-dom'
import useAppStore from '../store/useAppStore'
import ScreeningDetail from '../components/ScreeningDetail'
import FeedbackSection from '../components/FeedbackSection'
import Disclaimer from '../components/Disclaimer'
import { generateICS, buildWhatsAppReminder } from '../utils/generateICS'

// ── Category map ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    key: 'blood',
    icon: '🩸',
    label: 'Kan Tahlilleri',
    ids: new Set(['kan_sayimi','biyokimya','lipid','hba1c','tsh','vitamin_d','b12','hepatit','hiv_tarama','prostat','idrar']),
  },
  {
    key: 'imaging',
    icon: '🩻',
    label: 'Görüntüleme',
    ids: new Set(['dexa','karin_usg','karotis_usg','fibroscan','mamografi','aort_anevrizması','akci_bt','akciger_bt','ekokardiyografi']),
  },
  {
    key: 'vaccine',
    icon: '💉',
    label: 'Aşılar',
    ids: new Set(['asi_grip','asi_td_tdap','asi_zona','asi_pnomoni','asi_hpv','asi_hepatit_b']),
  },
  {
    key: 'checkup',
    icon: '🩺',
    label: 'Muayene & Tarama',
    ids: new Set(['tansiyon_olcumu','obezite_tarama','depresyon_tarama','ekg','goz_dibi','dis_kontrol','kolonoskopi','pap_smear','sft','genetik_danisman']),
  },
]

function getCategory(id) {
  for (const cat of CATEGORIES) {
    if (cat.ids.has(id)) return cat.key
  }
  return 'checkup'
}

// ── Urgency sort ──────────────────────────────────────────────────────────────
function urgencyScore(card) {
  if (card.status === 'overdue' || card.status === 'unknown') return -999
  if (card.daysUntil === null) return 9999
  return card.daysUntil
}

// ── Time helpers ──────────────────────────────────────────────────────────────
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

// ── Group Row ─────────────────────────────────────────────────────────────────
function GroupRow({ icon, label, items, onClick }) {
  const urgentCount = items.filter(c =>
    c.status === 'overdue' || c.status === 'unknown' ||
    (c.daysUntil !== null && c.daysUntil <= 30)
  ).length
  const preview = [...items]
    .sort((a,b) => urgencyScore(a) - urgencyScore(b))
    .slice(0, 3).map(c => c.icon).join(' ')

  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-4 text-left active:scale-98 transition-transform"
      style={{ border: '1.5px solid #F3F4F6', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
      <span className="text-2xl shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-900 text-sm">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          {preview}{items.length > 3 ? ` +${items.length - 3}` : ''}
        </div>
      </div>
      {urgentCount > 0 && (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
          style={{ background: '#FEF2F2', color: '#DC2626' }}>
          {urgentCount} bekliyor
        </span>
      )}
      <span className="text-xs font-black px-2.5 py-1 rounded-full shrink-0"
        style={{ background: '#e8f4f5', color: '#0D7377' }}>{items.length}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  )
}

// ── Detail Sheet (items inside a category) ────────────────────────────────────
function DetailSheet({ icon, label, items, onSelectItem, onClose, onMarkDone }) {
  const sorted = [...items].sort((a, b) => urgencyScore(a) - urgencyScore(b))

  return createPortal(
    <div className="fixed inset-0 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.48)', zIndex: 9999 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex-1" onClick={onClose} />
      <div className="bg-white rounded-t-3xl flex flex-col"
        style={{ animation: 'slideUp 0.26s cubic-bezier(0.22,1,0.36,1)', maxHeight: '75dvh' }}
        onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 shrink-0">
          <span className="text-2xl">{icon}</span>
          <div className="flex-1">
            <div className="font-extrabold text-gray-900">{label}</div>
            <div className="text-xs text-gray-400">{items.length} tarama</div>
          </div>
          <button onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90"
            style={{ background: '#E5E7EB', fontSize: 22, fontWeight: 700, color: '#374151' }}>×</button>
        </div>
        {/* Items */}
        <div className="overflow-y-auto flex-1 min-h-0 px-4 py-3 flex flex-col gap-2"
          style={{ paddingBottom: 80 }}>
          {sorted.map(card => {
            const color   = timeLabelColor(card.status, card.daysUntil)
            const label   = timeLabel(card.status, card.daysUntil)
            const urgent  = card.status === 'overdue' || card.status === 'unknown'
            return (
              <div key={card.id}
                onClick={() => { onClose(); setTimeout(() => onSelectItem(card), 280) }}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 cursor-pointer active:scale-98 transition-transform"
                style={{
                  border: `1.5px solid ${urgent ? '#FEE2E2' : '#F3F4F6'}`,
                  boxShadow: urgent ? '0 2px 8px rgba(220,38,38,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                <span className="text-xl shrink-0">{card.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm leading-tight">{card.trName}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {primaryDoctor(card.doctor)}
                    {card.lastDoneDate && ` · Son: ${fmtDate(card.lastDoneDate)}`}
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 mr-1"
                  style={{ background: `${color}18`, color }}>{label}</span>
                <button
                  onClick={e => { e.stopPropagation(); onMarkDone(card) }}
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 active:scale-90"
                  style={{ background: '#F0FDF4', border: '1.5px solid #DCFCE7', color: '#16A34A', fontSize: 14, fontWeight: 700 }}>
                  ✓
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  , document.body)
}

// ── Mark-done sheet ───────────────────────────────────────────────────────────
function MarkDoneSheet({ card, onDone, onClose }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  return createPortal(
    <div className="fixed inset-0 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.48)', zIndex: 10000 }}
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
          <button onClick={() => { generateICS(cards); setIcsDone(true) }}
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Screenings() {
  const getScreeningCards = useAppStore(s => s.getScreeningCards)
  const markDone          = useAppStore(s => s.markDone)
  const profile           = useAppStore(s => s.profile)

  const [selected,     setSelected]     = useState(null)
  const [openSheet,    setOpenSheet]    = useState(null)
  const [markCard,     setMarkCard]     = useState(null)
  const [showReminder, setShowReminder] = useState(false)
  const [viewMode,     setViewMode]     = useState('category') // 'category' | 'doctor'

  const cards = getScreeningCards()

  const hemenCount    = cards.filter(c => c.status === 'overdue' || c.status === 'unknown').length
  const yaklasanCount = cards.filter(c => c.status === 'upcoming' || c.status === 'soon').length
  const urgentCount   = hemenCount + yaklasanCount

  // Category groups
  const categoryGroups = CATEGORIES
    .map(cat => ({
      ...cat,
      items: cards
        .filter(c => cat.ids.has(c.id))
        .sort((a, b) => urgencyScore(a) - urgencyScore(b)),
    }))
    .filter(g => g.items.length > 0)

  // Doctor groups
  const doctorMap = {}
  for (const c of cards) {
    const doc = primaryDoctor(c.doctor)
    if (!doctorMap[doc]) doctorMap[doc] = []
    doctorMap[doc].push(c)
  }
  const doctorGroups = Object.entries(doctorMap)
    .map(([doc, items]) => ({
      key: doc, icon: '🏥', label: doc,
      items: items.sort((a, b) => urgencyScore(a) - urgencyScore(b)),
    }))
    .sort((a, b) => {
      const uA = a.items.filter(c => c.status === 'overdue' || c.status === 'unknown').length
      const uB = b.items.filter(c => c.status === 'overdue' || c.status === 'unknown').length
      return uB - uA
    })

  const groups = viewMode === 'category' ? categoryGroups : doctorGroups

  if (selected) return <ScreeningDetail screening={selected} onBack={() => setSelected(null)} />

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#FAFAF8', overflow: 'hidden' }}
      className="page-enter">

      {/* Header */}
      <div style={{ padding: '20px 20px 10px', flexShrink: 0 }}>
        {/* Reminder button — full width at top */}
        <button onClick={() => setShowReminder(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm active:scale-95 mb-3"
          style={{ background: '#FEF9C3', color: '#92400E', border: '1.5px solid #FDE68A', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          🔔 Kendine hatırlatma kur
        </button>

        <h1 className="text-xl font-extrabold text-gray-900 mb-1">Sağlık Takiplerim</h1>
        {hemenCount > 0 ? (
          <p className="text-sm font-bold mb-2" style={{ color: '#DC2626' }}>
            ⚠️ {hemenCount} tanesi hemen yapılmalı
          </p>
        ) : yaklasanCount > 0 ? (
          <p className="text-sm font-bold mb-2" style={{ color: '#D97706' }}>
            📅 {yaklasanCount} tanesi yaklaşıyor
          </p>
        ) : (
          <p className="text-sm font-semibold mb-2" style={{ color: '#0D7377' }}>
            ✓ Tüm takipler güncel
          </p>
        )}

        {/* Stacked view mode selector */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setViewMode('category')}
            className="w-full py-3 px-4 rounded-2xl text-sm font-bold transition-all text-left"
            style={viewMode === 'category'
              ? { background: '#0D7377', color: 'white', boxShadow: '0 2px 8px rgba(13,115,119,0.25)' }
              : { background: '#F3F4F6', color: '#6B7280' }}>
            🔬 Hangi testleri yaptırmalıyım?
          </button>
          <div className="text-center text-xs font-semibold" style={{ color: '#9CA3AF', lineHeight: '1.2', padding: '2px 0' }}>
            veya
          </div>
          <button
            onClick={() => setViewMode('doctor')}
            className="w-full py-3 px-4 rounded-2xl text-sm font-bold transition-all text-left"
            style={viewMode === 'doctor'
              ? { background: '#0D7377', color: 'white', boxShadow: '0 2px 8px rgba(13,115,119,0.25)' }
              : { background: '#F3F4F6', color: '#6B7280' }}>
            👨‍⚕️ Hangi doktora gitmeliyim?
          </button>
        </div>
      </div>

      {/* Category groups */}
      <div style={{ flex: 1, padding: '8px 16px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {groups.map(g => (
          <GroupRow
            key={g.key}
            icon={g.icon}
            label={g.label}
            items={g.items}
            onClick={() => setOpenSheet({ icon: g.icon, label: g.label, items: g.items })}
          />
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <FeedbackSection page="screenings" />
          <Disclaimer />
        </div>
      </div>

      {/* Detail sheet */}
      {openSheet && (
        <DetailSheet
          icon={openSheet.icon}
          label={openSheet.label}
          items={openSheet.items}
          onSelectItem={setSelected}
          onClose={() => setOpenSheet(null)}
          onMarkDone={card => { setOpenSheet(null); setMarkCard(card) }}
        />
      )}

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
