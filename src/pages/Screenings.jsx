import { useState } from 'react'
import useAppStore from '../store/useAppStore'
import { statusColor, statusLabel } from '../utils/score'
import { generateScreeningsPdf } from '../utils/generatePdf'
import ScreeningDetail from '../components/ScreeningDetail'
import FeedbackSection from '../components/FeedbackSection'
import Disclaimer from '../components/Disclaimer'

// ── Category map ─────────────────────────────────────────────────────────────
const SCREENING_TYPE = {
  // Kan tahlilleri
  kan_sayimi: 'blood', biyokimya: 'blood', lipid: 'blood', hba1c: 'blood',
  tsh: 'blood', vitamin_d: 'blood', b12: 'blood', hepatit: 'blood',
  hiv_tarama: 'blood', prostat: 'blood', uacr: 'blood',
  // İdrar
  idrar: 'urine',
  // Radyoloji & görüntüleme
  dexa: 'imaging', karin_usg: 'imaging', karotis_usg: 'imaging',
  fibroscan: 'imaging', mamografi: 'imaging', aort_anevrizması: 'imaging',
  akci_bt: 'imaging', akciger_bt: 'imaging', ekokardiyografi: 'imaging',
  // Aşılar
  asi_grip: 'vaccine', asi_td_tdap: 'vaccine', asi_zona: 'vaccine',
  asi_pnomoni: 'vaccine', asi_hpv: 'vaccine', asi_hepatit_b: 'vaccine',
}
function getType(id) { return SCREENING_TYPE[id] || 'other' }

const CATEGORIES = [
  { key: 'blood',   label: 'Kan Tahlilleri',          icon: '🩸' },
  { key: 'urine',   label: 'İdrar Tahlilleri',         icon: '🧪' },
  { key: 'imaging', label: 'Radyoloji & Görüntüleme',  icon: '🩻' },
  { key: 'other',   label: 'Diğer Tetkikler',          icon: '📋' },
  { key: 'vaccine', label: 'Aşılar',                   icon: '💉' },
]

// Extract primary doctor from "Aile Hekimi · İç Hastalıkları · ..."
function primaryDoctor(doctorStr) {
  if (!doctorStr) return 'Diğer'
  return doctorStr.split('·')[0].trim()
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function freqLabel(months) {
  if (!months || months >= 999) return 'Bir kez'
  const map = { 1:'Ayda bir', 3:'3 ayda bir', 6:'6 ayda bir', 12:'Yılda bir',
    24:'2 yılda bir', 36:'3 yılda bir', 60:'5 yılda bir', 120:'10 yılda bir' }
  return map[months] || `${months} ayda bir`
}

// ── Screening Card ────────────────────────────────────────────────────────────
function ScreeningCard({ card, onSelect, compact = false }) {
  const color = statusColor(card.status)
  const isUrgent = card.status === 'overdue' || card.status === 'upcoming'
  return (
    <div
      onClick={() => onSelect(card)}
      className="flex items-center gap-3 mb-2 bg-white rounded-2xl border cursor-pointer active:scale-98 transition-transform"
      style={{
        padding: compact ? '12px 14px' : '14px 16px',
        borderColor: isUrgent ? `${color}40` : '#F3F4F6',
        boxShadow: isUrgent ? `0 2px 12px ${color}15` : '0 1px 6px rgba(0,0,0,0.04)',
      }}
    >
      <span className="text-xl shrink-0">{card.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm leading-tight">{card.trName}</div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-gray-400">
            {card.nextDate ? formatDate(card.nextDate) : 'Tarih belirsiz'}
          </span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">{freqLabel(card.frequencyMonths)}</span>
        </div>
      </div>
      <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
        style={{ background: `${color}15`, color }}>
        {statusLabel(card.status, card.daysUntil)}
      </span>
    </div>
  )
}

// ── Doctor Show Modal ─────────────────────────────────────────────────────────
function DoctorShowModal({ cards, onClose }) {
  const urgent = cards.filter(c => c.status === 'overdue' || c.status === 'upcoming')
  const soon   = cards.filter(c => c.status === 'soon')

  // Group urgent by primary doctor
  const byDoctor = {}
  for (const c of [...urgent, ...soon]) {
    const doc = primaryDoctor(c.doctor)
    if (!byDoctor[doc]) byDoctor[doc] = []
    byDoctor[doc].push(c)
  }
  const doctorGroups = Object.entries(byDoctor).sort((a, b) => b[1].length - a[1].length)

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex-1" onClick={onClose} />
      <div className="bg-white rounded-t-3xl max-h-[90dvh] flex flex-col"
        style={{ animation: 'slideUp 0.28s cubic-bezier(0.22,1,0.36,1)' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Doktora Göster</h2>
              <p className="text-xs text-gray-500 mt-0.5">Yapılması gereken taramalar</p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: '#F3F4F6', color: '#6B7280', border: 'none', cursor: 'pointer', fontSize: 18 }}>
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 py-4 flex-1">
          {doctorGroups.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-3">🎉</div>
              <div className="font-semibold">Tüm taramalar güncel!</div>
              <div className="text-sm mt-1">Yakında yapılması gereken tarama yok.</div>
            </div>
          ) : (
            doctorGroups.map(([doctor, items]) => (
              <div key={doctor} className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">🏥</span>
                  <span className="text-sm font-black text-gray-800">{doctor}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-auto"
                    style={{ background: '#e8f4f5', color: '#0D7377' }}>
                    {items.length} tarama
                  </span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3 flex flex-col gap-1.5">
                  {items.map(c => (
                    <div key={c.id} className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5"
                      style={{ border: '1px solid #F3F4F6' }}>
                      <span className="text-lg shrink-0">{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 leading-tight">{c.trName}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{freqLabel(c.frequencyMonths)}</div>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full shrink-0"
                        style={{ background: `${statusColor(c.status)}15`, color: statusColor(c.status) }}>
                        {c.status === 'overdue' ? '⚠️ Gecikmiş' : c.status === 'upcoming' ? 'Bu ay' : 'Yakında'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 pb-8 pt-2">
          <button onClick={onClose}
            className="w-full py-4 rounded-2xl text-white font-bold text-sm"
            style={{ background: '#0D7377', border: 'none', cursor: 'pointer' }}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Screenings() {
  const getScreeningCards = useAppStore(s => s.getScreeningCards)
  const profile           = useAppStore(s => s.profile)
  const [selected, setSelected]               = useState(null)
  const [viewMode, setViewMode]               = useState('category') // 'category' | 'doctor'
  const [showDoctorModal, setShowDoctorModal] = useState(false)
  const [printing, setPrinting]               = useState(false)

  const cards = getScreeningCards()
  const urgentCount = cards.filter(c => c.status === 'overdue' || c.status === 'upcoming').length

  function handlePrint() {
    setPrinting(true)
    setTimeout(() => {
      try { generateScreeningsPdf({ profile, screeningCards: cards }) }
      catch (e) { console.error(e) }
      setPrinting(false)
    }, 50)
  }

  if (selected) return <ScreeningDetail screening={selected} onBack={() => setSelected(null)} />

  // ── Category view ───────────────────────────────────────────────────────────
  function CategoryView() {
    return (
      <>
        {CATEGORIES.map(cat => {
          const items = cards.filter(c => getType(c.id) === cat.key)
          if (items.length === 0) return null
          // Sort: overdue → upcoming → soon → unknown → ok
          const order = { overdue:0, upcoming:1, soon:2, unknown:3, ok:4 }
          items.sort((a,b) => order[a.status] - order[b.status])
          return (
            <div key={cat.key} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{cat.icon}</span>
                <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{cat.label}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-1"
                  style={{ background: '#F3F4F6', color: '#9CA3AF' }}>{items.length}</span>
              </div>
              {items.map(c => <ScreeningCard key={c.id} card={c} onSelect={setSelected} />)}
            </div>
          )
        })}
      </>
    )
  }

  // ── Doctor view ─────────────────────────────────────────────────────────────
  function DoctorView() {
    const byDoctor = {}
    for (const c of cards) {
      const doc = primaryDoctor(c.doctor)
      if (!byDoctor[doc]) byDoctor[doc] = []
      byDoctor[doc].push(c)
    }
    // Sort doctors: those with urgent items first
    const sorted = Object.entries(byDoctor).sort((a, b) => {
      const urgA = a[1].filter(c => c.status === 'overdue' || c.status === 'upcoming').length
      const urgB = b[1].filter(c => c.status === 'overdue' || c.status === 'upcoming').length
      return urgB - urgA
    })
    return (
      <>
        {sorted.map(([doc, items]) => {
          const order = { overdue:0, upcoming:1, soon:2, unknown:3, ok:4 }
          items.sort((a,b) => order[a.status] - order[b.status])
          const urgCount = items.filter(c => c.status === 'overdue' || c.status === 'upcoming').length
          return (
            <div key={doc} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">🏥</span>
                <span className="text-xs font-black text-gray-500 uppercase tracking-wider flex-1">{doc}</span>
                {urgCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#FEF2F2', color: '#DC2626' }}>
                    {urgCount} bekliyor
                  </span>
                )}
              </div>
              {items.map(c => <ScreeningCard key={c.id} card={c} onSelect={setSelected} compact />)}
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div className="page-enter pb-28 pt-6">

      {/* Header */}
      <div className="px-5 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-0.5">Taramalarım</h1>
            <p className="text-sm text-gray-500">{cards.length} tarama takip ediliyor</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {urgentCount > 0 && (
              <button
                onClick={() => setShowDoctorModal(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-2xl text-white font-bold text-xs active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg,#0D7377,#14919B)', boxShadow: '0 3px 12px rgba(13,115,119,0.3)' }}
              >
                🏥 Göster
              </button>
            )}
            <button
              onClick={handlePrint}
              disabled={printing}
              className="flex items-center gap-1 px-3 py-2 rounded-2xl font-bold text-xs active:scale-95 transition-transform"
              style={{ background: '#F3F4F6', color: printing ? '#9CA3AF' : '#374151', border: '1.5px solid #E5E7EB' }}
            >
              {printing ? '⏳' : '🖨️'} Çıktı Al
            </button>
          </div>
        </div>

        {/* Urgent alert banner */}
        {urgentCount > 0 && (
          <div className="mt-3 px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <span className="text-sm font-bold text-red-700">{urgentCount} tarama yapılmalı</span>
              <span className="text-xs text-red-500 block mt-0.5">Gecikmiş veya bu ay yapılması gereken taramalar var</span>
            </div>
            <button
              onClick={() => setShowDoctorModal(true)}
              className="text-xs font-bold text-red-600 shrink-0">Göster →</button>
          </div>
        )}
      </div>

      {/* View toggle */}
      <div className="px-5 mb-4">
        <div className="flex rounded-2xl p-1 gap-1" style={{ background: '#F3F4F6' }}>
          {[
            { key: 'category', label: '🗂️ Kategoriye Göre' },
            { key: 'doctor',   label: '🏥 Doktora Göre' },
          ].map(v => (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition-all active:scale-97"
              style={viewMode === v.key
                ? { background: 'white', color: '#0D7377', boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }
                : { background: 'transparent', color: '#9CA3AF', border: 'none' }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
        {viewMode === 'category' ? <CategoryView /> : <DoctorView />}
        <FeedbackSection page="screenings" />
        <Disclaimer />
      </div>

      {/* Doctor show modal */}
      {showDoctorModal && (
        <DoctorShowModal cards={cards} onClose={() => setShowDoctorModal(false)} />
      )}
    </div>
  )
}
