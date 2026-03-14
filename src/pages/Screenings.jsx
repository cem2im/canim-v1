import { useState } from 'react'
import useAppStore from '../store/useAppStore'
import { statusColor, statusLabel } from '../utils/score'
import ScreeningDetail from '../components/ScreeningDetail'
import FeedbackSection from '../components/FeedbackSection'
import Disclaimer from '../components/Disclaimer'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function freqBadge(months) {
  if (!months || months >= 999) return 'Bir kez'
  const map = { 1:'Ayda bir', 3:'3 ayda', 6:'6 ayda', 12:'Yılda bir', 24:'2 yılda', 36:'3 yılda', 60:'5 yılda', 120:'10 yılda' }
  return map[months] || `${months} ayda`
}

const FILTER_TABS = [
  { key: 'all',      label: 'Tümü' },
  { key: 'overdue',  label: '🔴 Gecikmiş' },
  { key: 'upcoming', label: '🔵 Bu Ay' },
  { key: 'soon',     label: '🟡 Yakında' },
  { key: 'ok',       label: '✅ Tamam' },
  { key: 'unknown',  label: '⚪ Belirsiz' },
]

export default function Screenings() {
  const getScreeningCards = useAppStore(s => s.getScreeningCards)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const cards = getScreeningCards()

  const overdue  = cards.filter(c => c.status === 'overdue')
  const upcoming = cards.filter(c => c.status === 'upcoming')
  const soon     = cards.filter(c => c.status === 'soon')
  const ok       = cards.filter(c => c.status === 'ok')
  const unknown  = cards.filter(c => c.status === 'unknown')

  const filteredSections = filter === 'all'
    ? [
        { title: '🔴 Gecikmiş',       cards: overdue },
        { title: '🔵 Bu Ay Yapılmalı', cards: upcoming },
        { title: '🟡 Yaklaşıyor',      cards: soon },
        { title: '⚪ Bilinmiyor',       cards: unknown },
        { title: '✅ Tamamlandı',       cards: ok },
      ].filter(s => s.cards.length > 0)
    : [{ title: null, cards: cards.filter(c => c.status === filter) }]

  if (selected) return (
    <ScreeningDetail screening={selected} onBack={() => setSelected(null)} />
  )

  return (
    <div className="page-enter pb-24 pt-6">
      {/* Header */}
      <div className="px-5 mb-4">
        <h1 className="text-xl font-extrabold text-gray-900 mb-0.5">Taramalarım</h1>
        <p className="text-sm text-gray-500">{cards.length} tarama takip ediliyor</p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-5 mb-5 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
        {FILTER_TABS.map(tab => {
          const count = tab.key === 'all' ? cards.length
            : cards.filter(c => c.status === tab.key).length
          if (tab.key !== 'all' && count === 0) return null
          const active = filter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                border: active ? 'none' : '1.5px solid #E5E7EB',
                background: active ? '#0D7377' : 'white',
                color: active ? 'white' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label} {tab.key !== 'all' && <span style={{opacity:0.75}}>({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Sections */}
      <div className="px-5">
        {filteredSections.map((section, i) => (
          <Section key={i} title={section.title} cards={section.cards} onSelect={setSelected} />
        ))}
        {filteredSections.every(s => s.cards.length === 0) && (
          <div className="text-center py-16 text-gray-400 text-sm">Bu kategoride tarama yok.</div>
        )}
      </div>

      <div className="px-5">
        <FeedbackSection page="screenings" />
        <Disclaimer />
      </div>
    </div>
  )
}

function Section({ title, cards, onSelect }) {
  return (
    <div className="mb-6">
      {title && <h2 className="text-sm font-bold text-gray-700 mb-3">{title}</h2>}
      {cards.map(card => (
        <div
          key={card.id}
          onClick={() => onSelect(card)}
          className="flex items-center gap-3 mb-2 p-4 bg-white rounded-2xl border border-gray-100 cursor-pointer active:scale-98 transition-transform"
          style={{boxShadow:'0 1px 8px rgba(0,0,0,0.04)'}}
        >
          <span className="text-2xl">{card.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm">{card.trName}</div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-400">
                {card.nextDate ? `Sonraki: ${formatDate(card.nextDate)}` : 'Tarih belirsiz'}
              </span>
              {card.frequencyMonths && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:'#F3F4F6', color:'#6B7280'}}>
                  📅 {freqBadge(card.frequencyMonths)}
                </span>
              )}
            </div>
          </div>
          <div
            className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{background:`${statusColor(card.status)}18`, color:statusColor(card.status)}}
          >
            {statusLabel(card.status, card.daysUntil)}
          </div>
        </div>
      ))}
    </div>
  )
}
