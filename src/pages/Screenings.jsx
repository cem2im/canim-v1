import { useState } from 'react'
import { createPortal } from 'react-dom'
import useAppStore from '../store/useAppStore'
import { statusColor } from '../utils/score'
import ScreeningDetail from '../components/ScreeningDetail'
import FeedbackSection from '../components/FeedbackSection'
import Disclaimer from '../components/Disclaimer'
import { DISEASE_LIST, DISEASE_SCREENINGS } from '../data/screenings'
import { generateICS, buildWhatsAppReminder } from '../utils/generateICS'

// Blood test IDs
const BLOOD_IDS = new Set([
  'kan_sayimi','biyokimya','lipid','hba1c','tsh','vitamin_d',
  'b12','hepatit','hiv_tarama','prostat','uacr',
])

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
  if (daysUntil !== null && daysUntil <= 30) return '#0D7377'
  if (daysUntil !== null && daysUntil <= 90) return '#D97706'
  return '#6B7280'
}

const primaryDoctor = str => str ? str.split('·')[0].trim() : 'Diğer'

const TR_MONTHS = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
function fmtDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
function freqLabel(months) {
  if (!months || months >= 999) return 'Bir kez'
  const map = { 1:'Ayda bir', 3:'3 ayda bir', 6:'6 ayda bir', 12:'Yılda bir',
    24:'2 yılda bir', 36:'3 yılda bir', 60:'5 yılda bir', 120:'10 yılda bir' }
  return map[months] || `${months} ayda bir`
}

// ── Bottom Sheet (doctor/group view) ─────────────────────────────────────────
function Sheet({ title, icon, items, type, onSelectItem, onClose, onBulkDone }) {
  const [bulkDone, setBulkDone] = useState(false)
  const order = { overdue:0, unknown:0, upcoming:1, soon:2, ok:3 }
  const sorted = [...items].sort((a,b) => order[a.status] - order[b.status])
  const allDone = items.every(c => c.status === 'ok')

  const handleBulk = () => {
    onBulkDone(items)
    setBulkDone(true)
    setTimeout(onClose, 800)
  }

  return createPortal(
    <div className="fixed inset-0 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.48)', zIndex: 9999 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex-1" onClick={onClose} />
      <div className="bg-white rounded-t-3xl flex flex-col"
        style={{ animation: 'slideUp 0.26s cubic-bezier(0.22,1,0.36,1)', maxHeight: '70dvh' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 shrink-0">
          <span className="text-2xl">{icon}</span>
          <div className="flex-1">
            <div className="font-extrabold text-gray-900">{title}</div>
            <div className="text-xs text-gray-400">{items.length} tarama</div>
          </div>
          <button onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background:'#E5E7EB', border:'none', cursor:'pointer', fontSize:22, fontWeight:700, color:'#374151' }}>
            ×
          </button>
        </div>
        {!allDone && (
          <div className="px-4 pt-3 pb-2 shrink-0">
            <button onClick={handleBulk} disabled={bulkDone}
              className="w-full py-3 rounded-2xl text-white font-bold text-sm active:scale-98 transition-all disabled:opacity-60"
              style={{ background: bulkDone ? '#6B7280' : 'linear-gradient(135deg,#0D7377,#14919B)' }}>
              {bulkDone ? '✓ Kaydedildi' : (type === 'doctor' ? '🏥 Bu Doktora Gittim' : '✓ Tümünü Tamamladım')}
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 min-h-0 px-4 py-3 flex flex-col gap-2" style={{ paddingBottom:80 }}>
          {sorted.map(card => {
            const color = statusColor(card.status)
            const isUrgent = card.status === 'overdue' || card.status === 'upcoming'
            return (
              <div key={card.id}
                onClick={() => { onClose(); setTimeout(() => onSelectItem(card), 280) }}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 cursor-pointer active:scale-98 transition-transform"
                style={{
                  border: `1.5px solid ${isUrgent ? color+'40' : '#F3F4F6'}`,
                  boxShadow: isUrgent ? `0 2px 10px ${color}15` : '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                <span className="text-xl shrink-0">{card.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm leading-tight">{card.trName}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {card.nextDate ? fmtDate(card.nextDate) : 'Tarih belirsiz'} · {freqLabel(card.frequencyMonths)}
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                  style={{ background:`${timeLabelColor(card.status,card.daysUntil)}18`, color:timeLabelColor(card.status,card.daysUntil) }}>
                  {timeLabel(card.status, card.daysUntil)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  , document.body)
}

// ── Group Row (doctor view) ───────────────────────────────────────────────────
function GroupRow({ icon, label, items, onClick }) {
  const urgentCount = items.filter(c =>
    c.status === 'overdue' || c.status === 'unknown' ||
    (c.daysUntil !== null && c.daysUntil <= 30)
  ).length
  const preview = items.slice(0,3).map(c => c.icon).join(' ')
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-4 text-left active:scale-98 transition-transform"
      style={{ border:'1.5px solid #F3F4F6', boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
      <span className="text-2xl shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-900 text-sm">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{preview} {items.length > 3 ? `+${items.length-3}` : ''}</div>
      </div>
      {urgentCount > 0 && (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 mr-1"
          style={{ background:'#FEF2F2', color:'#DC2626' }}>
          Hemen
        </span>
      )}
      <span className="text-xs font-black px-2.5 py-1 rounded-full shrink-0"
        style={{ background:'#e8f4f5', color:'#0D7377' }}>{items.length}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" className="shrink-0 ml-0.5">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  )
}

// ── Reminder Sheet ───────────────────────────────────────────────────────────
function ReminderSheet({ cards, profileName, onClose }) {
  const [icsLoading, setIcsLoading] = useState(false)
  const [icsDone,    setIcsDone]    = useState(false)

  const urgentCount = cards.filter(c =>
    c.status === 'overdue' || c.status === 'unknown' ||
    (c.daysUntil !== null && c.daysUntil <= 30)
  ).length
  const soonCount = cards.filter(c =>
    c.daysUntil !== null && c.daysUntil > 30 && c.daysUntil <= 90
  ).length

  const handleICS = () => {
    setIcsLoading(true)
    setTimeout(() => {
      generateICS(cards)
      setIcsLoading(false)
      setIcsDone(true)
    }, 300)
  }

  const handleWhatsApp = () => {
    const msg = buildWhatsAppReminder(cards, profileName)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`)
  }

  return createPortal(
    <div className="fixed inset-0 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.48)', zIndex: 9999 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex-1" onClick={onClose} />
      <div className="bg-white rounded-t-3xl"
        style={{ animation: 'slideUp 0.26s cubic-bezier(0.22,1,0.36,1)', padding: '0 0 40px' }}
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
          <span className="text-2xl">🔔</span>
          <div className="flex-1">
            <div className="font-extrabold text-gray-900">Hatırlatma Kur</div>
            <div className="text-xs text-gray-400">
              {urgentCount > 0 && `${urgentCount} acil`}{urgentCount > 0 && soonCount > 0 && ' · '}{soonCount > 0 && `${soonCount} yakında`}
              {urgentCount === 0 && soonCount === 0 && 'Tüm taramalar güncel'}
            </div>
          </div>
          <button onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#E5E7EB', fontSize: 22, fontWeight: 700, color: '#374151' }}>
            ×
          </button>
        </div>

        <div className="px-5 pt-5 flex flex-col gap-3">

          {/* Option 1: Calendar */}
          <button onClick={handleICS} disabled={icsLoading}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left active:scale-98 transition-all"
            style={{ background: icsDone ? '#F0FDF4' : '#F9FAFB', border: `1.5px solid ${icsDone ? '#BBF7D0' : '#E5E7EB'}` }}>
            <span className="text-3xl shrink-0">{icsDone ? '✅' : icsLoading ? '⏳' : '📅'}</span>
            <div className="flex-1">
              <div className="font-bold text-gray-900 text-sm">
                {icsDone ? 'Takvim dosyası indirildi!' : 'Takvime Ekle (.ics)'}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {icsDone
                  ? 'Telefon takviminize ekleyin, sistem hatırlatır'
                  : 'iPhone/Android takvimine ekle — otomatik bildirim gelir'}
              </div>
            </div>
            {!icsDone && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            )}
          </button>

          {/* Option 2: WhatsApp self-send */}
          <button onClick={handleWhatsApp}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left active:scale-98 transition-all"
            style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
            <span className="text-3xl shrink-0">💬</span>
            <div className="flex-1">
              <div className="font-bold text-gray-900 text-sm">WhatsApp'ta Gönder</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Tarama listenizi kendinize veya ailenize WhatsApp mesajı olarak gönderin
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          {/* Info note */}
          <p className="text-xs text-gray-400 text-center px-2">
            Gerçek zamanlı bildirim için .ics dosyasını telefon takviminize açın
          </p>
        </div>
      </div>
    </div>
  , document.body)
}

// ── Mark-done sheet (for Tahliller tab) ──────────────────────────────────────
function MarkDoneSheet({ card, onDone, onClose }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  return createPortal(
    <div className="fixed inset-0 flex flex-col"
      style={{ background:'rgba(0,0,0,0.48)', zIndex:9999 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex-1" onClick={onClose} />
      <div className="bg-white rounded-t-3xl"
        style={{ animation:'slideUp 0.26s cubic-bezier(0.22,1,0.36,1)', padding:'20px 20px 40px' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-center mb-4"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
        <div className="text-base font-extrabold text-gray-900 mb-1">{card.icon} {card.trName}</div>
        <div className="text-sm text-gray-500 mb-4">Yapıldığı tarihi girin</div>
        <input type="date"
          className="w-full px-4 py-3.5 rounded-2xl border-2 text-gray-900 font-semibold outline-none mb-4"
          style={{ borderColor:'#0D7377' }}
          value={date} max={new Date().toISOString().slice(0,10)}
          onChange={e => setDate(e.target.value)}
        />
        <button onClick={() => { onDone(card.id, date); onClose() }}
          className="w-full py-4 rounded-2xl text-white font-bold text-base"
          style={{ background:'linear-gradient(135deg,#0D7377,#14919B)', boxShadow:'0 4px 16px rgba(13,115,119,0.3)' }}>
          ✓ Kaydet
        </button>
      </div>
    </div>
  , document.body)
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Screenings() {
  const getScreeningCards = useAppStore(s => s.getScreeningCards)
  const logDoctorVisit    = useAppStore(s => s.logDoctorVisit)
  const markDone          = useAppStore(s => s.markDone)
  const profile           = useAppStore(s => s.profile)

  const [selected,       setSelected]       = useState(null)
  const [mainTab,        setMainTab]        = useState('taramalar')
  const [openSheet,      setOpenSheet]      = useState(null)
  const [markCard,       setMarkCard]       = useState(null)
  const [showReminder,   setShowReminder]   = useState(false)

  const cards = getScreeningCards()
  const urgentCount = cards.filter(c =>
    c.status === 'overdue' || c.status === 'unknown' ||
    (c.daysUntil !== null && c.daysUntil <= 30)
  ).length

  // Blood test cards
  const bloodCards = cards.filter(c => BLOOD_IDS.has(c.id))
  const bloodUrgent = bloodCards.filter(c =>
    c.status === 'overdue' || c.status === 'unknown' ||
    (c.daysUntil !== null && c.daysUntil <= 30)
  ).length

  // Build doctor groups
  function getDoctorGroups() {
    const map = {}
    for (const c of cards) {
      const doc = primaryDoctor(c.doctor)
      if (!map[doc]) map[doc] = []
      map[doc].push(c)
    }
    return Object.entries(map)
      .map(([doc, items]) => ({ key:doc, icon:'🏥', label:doc, items }))
      .sort((a,b) => {
        const uA = a.items.filter(c => c.status==='overdue'||c.status==='unknown').length
        const uB = b.items.filter(c => c.status==='overdue'||c.status==='unknown').length
        return uB - uA
      })
  }

  function handleBulkDone(items, type, label) {
    const today = new Date().toISOString().slice(0,10)
    if (type === 'doctor') {
      logDoctorVisit(today, label, items.map(c => c.id))
    } else {
      for (const card of items) markDone(card.id, today)
    }
  }

  if (selected) return <ScreeningDetail screening={selected} onBack={() => setSelected(null)} />

  const doctorGroups = getDoctorGroups()

  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column', background:'#FAFAF8', overflow:'hidden' }}
      className="page-enter">

      {/* Header */}
      <div style={{ padding:'20px 20px 10px', flexShrink:0 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-extrabold text-gray-900">Sağlık Takiplerim</h1>
          <button onClick={() => setShowReminder(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs active:scale-95 transition-transform"
            style={{ background: '#FEF9C3', color: '#92400E', border: '1.5px solid #FDE68A' }}>
            🔔 Hatırlatma
          </button>
        </div>
        {urgentCount > 0 ? (
          <p className="text-sm font-bold mb-3" style={{ color:'#DC2626' }}>
            ⚠️ {urgentCount} taramanızda gecikme var
          </p>
        ) : (
          <p className="text-sm font-semibold mb-3" style={{ color:'#0D7377' }}>
            ✓ Tüm takipler güncel
          </p>
        )}

        {/* 2-tab switcher */}
        <div className="flex rounded-2xl p-1 gap-1" style={{ background:'#F3F4F6' }}>
          <button onClick={() => setMainTab('taramalar')}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
            style={mainTab === 'taramalar'
              ? { background:'white', color:'#0D7377', boxShadow:'0 1px 6px rgba(0,0,0,0.08)' }
              : { background:'transparent', color:'#9CA3AF' }}>
            🏥 Taramalar
          </button>
          <button onClick={() => setMainTab('tahliller')}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
            style={mainTab === 'tahliller'
              ? { background:'white', color:'#0D7377', boxShadow:'0 1px 6px rgba(0,0,0,0.08)' }
              : { background:'transparent', color:'#9CA3AF' }}>
            🩸 Tahliller {bloodUrgent > 0 && <span style={{color:'#DC2626'}}>· {bloodUrgent}</span>}
          </button>
        </div>
      </div>

      {/* ── TARAMALAR TAB ── */}
      {mainTab === 'taramalar' && (
        <div style={{ flex:1, padding:'8px 20px 16px', display:'flex', flexDirection:'column', gap:8, overflowY:'auto' }}>
          {doctorGroups.map(g => (
            <GroupRow key={g.key} icon={g.icon} label={g.label} items={g.items}
              onClick={() => setOpenSheet({ icon:g.icon, label:g.label, items:g.items, type:'doctor' })} />
          ))}
          <div style={{ marginTop:'auto', paddingTop:8 }}>
            <FeedbackSection page="screenings" />
            <Disclaimer />
          </div>
        </div>
      )}

      {/* ── TAHLILLER TAB ── */}
      {mainTab === 'tahliller' && (
        <div style={{ flex:1, padding:'8px 20px 16px', display:'flex', flexDirection:'column', gap:8, overflowY:'auto' }}>
          {bloodCards.map(card => {
            const color  = timeLabelColor(card.status, card.daysUntil)
            const label  = timeLabel(card.status, card.daysUntil)
            const urgent = card.status === 'overdue' || card.status === 'unknown'
            return (
              <div key={card.id}
                onClick={() => setSelected(card)}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 cursor-pointer active:scale-98 transition-transform"
                style={{
                  border: `1.5px solid ${urgent ? color+'40' : '#F3F4F6'}`,
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
                    style={{ background:'#F0FDF4', color:'#16A34A', border:'1.5px solid #DCFCE7' }}>
                    ✓ Yapıldı
                  </button>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background:`${color}18`, color }}>
                    {label}
                  </span>
                </div>
              </div>
            )
          })}
          {bloodCards.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="text-5xl mb-3">🩸</div>
              <div className="font-bold text-gray-700 mb-1">Tahlil takibi yok</div>
              <div className="text-sm text-gray-400">Profilinize hastalık ekleyerek tahlil takibi oluşturabilirsiniz.</div>
            </div>
          )}
          <div style={{ marginTop:'auto', paddingTop:8 }}>
            <FeedbackSection page="tahliller" />
          </div>
        </div>
      )}

      {/* Bottom sheet */}
      {openSheet && (
        <Sheet
          icon={openSheet.icon}
          label={openSheet.label}
          items={openSheet.items}
          type={openSheet.type}
          onSelectItem={setSelected}
          onClose={() => setOpenSheet(null)}
          onBulkDone={(items) => handleBulkDone(items, openSheet.type, openSheet.label)}
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
