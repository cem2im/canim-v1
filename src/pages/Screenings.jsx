import { useState } from 'react'
import useAppStore from '../store/useAppStore'
import { statusColor } from '../utils/score'
import { generateScreeningsPdf } from '../utils/generatePdf'
import ScreeningDetail from '../components/ScreeningDetail'
import FeedbackSection from '../components/FeedbackSection'
import Disclaimer from '../components/Disclaimer'

// unknown = hiç yapılmamış → Hemen (gecikmiş sayılır)
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

// ── Category map ─────────────────────────────────────────────────────────────
const SCREENING_TYPE = {
  kan_sayimi:'blood', biyokimya:'blood', lipid:'blood', hba1c:'blood',
  tsh:'blood', vitamin_d:'blood', b12:'blood', hepatit:'blood',
  hiv_tarama:'blood', prostat:'blood', uacr:'blood',
  idrar:'urine',
  dexa:'imaging', karin_usg:'imaging', karotis_usg:'imaging',
  fibroscan:'imaging', mamografi:'imaging', aort_anevrizması:'imaging',
  akci_bt:'imaging', akciger_bt:'imaging', ekokardiyografi:'imaging',
  asi_grip:'vaccine', asi_td_tdap:'vaccine', asi_zona:'vaccine',
  asi_pnomoni:'vaccine', asi_hpv:'vaccine', asi_hepatit_b:'vaccine',
}
const getType = id => SCREENING_TYPE[id] || 'other'

const CATEGORIES = [
  { key:'blood',   label:'Kan Tahlilleri',         icon:'🩸' },
  { key:'urine',   label:'İdrar Tahlilleri',        icon:'🧪' },
  { key:'imaging', label:'Radyoloji & Görüntüleme', icon:'🩻' },
  { key:'other',   label:'Diğer Tetkikler',         icon:'📋' },
  { key:'vaccine', label:'Aşılar',                  icon:'💉' },
]

const primaryDoctor = str => str ? str.split('·')[0].trim() : 'Diğer'

function fmtDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const m = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`
}
function freqLabel(months) {
  if (!months || months >= 999) return 'Bir kez'
  const map = { 1:'Ayda bir', 3:'3 ayda bir', 6:'6 ayda bir', 12:'Yılda bir',
    24:'2 yılda bir', 36:'3 yılda bir', 60:'5 yılda bir', 120:'10 yılda bir' }
  return map[months] || `${months} ayda bir`
}

// ── Bottom Sheet ──────────────────────────────────────────────────────────────
function Sheet({ title, icon, items, onSelectItem, onClose }) {
  const order = { overdue:0, unknown:0, upcoming:1, soon:2, ok:3 }
  const sorted = [...items].sort((a,b) => order[a.status] - order[b.status])
  return (
    <div className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.48)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex-1" onClick={onClose} />
      <div className="bg-white rounded-t-3xl max-h-[85dvh] flex flex-col"
        style={{ animation: 'slideUp 0.26s cubic-bezier(0.22,1,0.36,1)' }}
        onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 shrink-0">
          <span className="text-2xl">{icon}</span>
          <div className="flex-1">
            <div className="font-extrabold text-gray-900">{title}</div>
            <div className="text-xs text-gray-400">{items.length} tarama</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background:'#F3F4F6', border:'none', cursor:'pointer', fontSize:18, color:'#6B7280' }}>×</button>
        </div>
        {/* Items */}
        <div className="overflow-y-auto px-4 py-3 flex flex-col gap-2">
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
                  style={{ background:`${timeLabelColor(card.status, card.daysUntil)}18`, color: timeLabelColor(card.status, card.daysUntil) }}>
                  {timeLabel(card.status, card.daysUntil)}
                </span>
              </div>
            )
          })}
        </div>
        <div className="px-5 pb-8 pt-2 shrink-0">
          <button onClick={onClose} className="w-full py-3.5 rounded-2xl text-white font-bold text-sm"
            style={{ background:'#0D7377', border:'none', cursor:'pointer' }}>Kapat</button>
        </div>
      </div>
    </div>
  )
}

// ── Group Row ─────────────────────────────────────────────────────────────────
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
        <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mr-1"
          style={{ background:'#FEF2F2', color:'#DC2626' }}>
          {urgentCount} bekliyor
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Screenings() {
  const getScreeningCards = useAppStore(s => s.getScreeningCards)
  const profile           = useAppStore(s => s.profile)
  const [selected, setSelected]   = useState(null)
  const [viewMode, setViewMode]   = useState('category')
  const [openSheet, setOpenSheet] = useState(null) // { icon, label, items }
  const [printing, setPrinting]   = useState(false)

  const cards = getScreeningCards()
  const urgentCount = cards.filter(c =>
    c.status === 'overdue' || c.status === 'unknown' ||
    (c.daysUntil !== null && c.daysUntil <= 30)
  ).length

  function handlePrint() {
    setPrinting(true)
    setTimeout(() => {
      try { generateScreeningsPdf({ profile, screeningCards: cards }) }
      catch(e) { console.error(e) }
      setPrinting(false)
    }, 50)
  }

  // Build category groups
  function getCategoryGroups() {
    return CATEGORIES.map(cat => ({
      key: cat.key, icon: cat.icon, label: cat.label,
      items: cards.filter(c => getType(c.id) === cat.key),
    })).filter(g => g.items.length > 0)
  }

  // Build doctor groups
  function getDoctorGroups() {
    const map = {}
    for (const c of cards) {
      const doc = primaryDoctor(c.doctor)
      if (!map[doc]) map[doc] = []
      map[doc].push(c)
    }
    return Object.entries(map)
      .map(([doc, items]) => ({ key: doc, icon: '🏥', label: doc, items }))
      .sort((a, b) => {
        const uA = a.items.filter(c=>c.status==='overdue'||c.status==='upcoming').length
        const uB = b.items.filter(c=>c.status==='overdue'||c.status==='upcoming').length
        return uB - uA
      })
  }

  const groups = viewMode === 'category' ? getCategoryGroups() : getDoctorGroups()

  // Detail view for a screening
  if (selected) return <ScreeningDetail screening={selected} onBack={() => setSelected(null)} />

  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column', background:'#FAFAF8', overflow:'hidden' }}
      className="page-enter">

      {/* Header */}
      <div style={{ padding:'24px 20px 12px', flexShrink:0 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-extrabold text-gray-900">Sağlık Takiplerim</h1>
          <button onClick={handlePrint} disabled={printing}
            className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-xs active:scale-95"
            style={{ background:'#F3F4F6', color: printing ? '#9CA3AF' : '#374151', border:'1.5px solid #E5E7EB' }}>
            {printing ? '⏳' : '🖨️'} Çıktı
          </button>
        </div>

        {/* Alert satırı */}
        {urgentCount > 0 ? (
          <p className="text-sm font-bold mb-1" style={{ color:'#DC2626' }}>
            ⚠️ {urgentCount} taramanızda gecikme var
          </p>
        ) : (
          <p className="text-sm font-semibold mb-1" style={{ color:'#0D7377' }}>
            ✓ Tüm takipler güncel
          </p>
        )}
        <p className="text-xs text-gray-400 mb-3">
          Aşağıda hangi taramaları yaptırmanız gerektiğini bulabilirsiniz
        </p>

        {/* View toggle */}
        <div className="flex rounded-2xl p-1 gap-1" style={{ background:'#F3F4F6' }}>
          {[
            { key:'category', label:'🗂️ Test Türüne Göre' },
            { key:'doctor',   label:'🏥 Doktora Göre' },
          ].map(v => (
            <button key={v.key} onClick={() => setViewMode(v.key)}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
              style={viewMode === v.key
                ? { background:'white', color:'#0D7377', boxShadow:'0 1px 6px rgba(0,0,0,0.08)' }
                : { background:'transparent', color:'#9CA3AF', border:'none' }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Group rows — fills remaining screen, no scroll */}
      <div style={{ flex:1, padding:'0 20px 16px', display:'flex', flexDirection:'column', gap:8, overflow:'hidden' }}>
        {groups.map(g => (
          <GroupRow key={g.key} icon={g.icon} label={g.label} items={g.items}
            onClick={() => setOpenSheet({ icon: g.icon, label: g.label, items: g.items })} />
        ))}

        <div style={{ marginTop:'auto', paddingTop:8 }}>
          <FeedbackSection page="screenings" />
          <Disclaimer />
        </div>
      </div>

      {/* Bottom sheet */}
      {openSheet && (
        <Sheet
          icon={openSheet.icon}
          label={openSheet.label}
          items={openSheet.items}
          onSelectItem={setSelected}
          onClose={() => setOpenSheet(null)}
        />
      )}
    </div>
  )
}
