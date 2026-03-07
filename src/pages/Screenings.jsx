import { useState } from 'react'
import useAppStore from '../store/useAppStore'
import { statusColor, statusLabel } from '../utils/score'
import ScreeningDetail from '../components/ScreeningDetail'
import FeedbackSection from '../components/FeedbackSection'
import Disclaimer from '../components/Disclaimer'

export default function Screenings() {
  const getScreeningCards = useAppStore(s => s.getScreeningCards)
  const [selected, setSelected] = useState(null)
  const cards = getScreeningCards()

  const overdue  = cards.filter(c => c.status === 'overdue')
  const upcoming = cards.filter(c => c.status === 'upcoming')
  const soon     = cards.filter(c => c.status === 'soon')
  const ok       = cards.filter(c => c.status === 'ok')
  const unknown  = cards.filter(c => c.status === 'unknown')

  if (selected) return (
    <ScreeningDetail screening={selected} onBack={() => setSelected(null)} />
  )

  return (
    <div className="page-enter pb-24 px-5 pt-6">
      <h1 className="text-xl font-extrabold text-gray-900 mb-1">Taramalarım</h1>
      <p className="text-sm text-gray-400 mb-5">{cards.length} tarama takip ediliyor</p>

      {overdue.length > 0 && <Section title="🔴 Gecikmiş" cards={overdue} onSelect={setSelected} />}
      {upcoming.length > 0 && <Section title="🔵 Bu Ay Yapılmalı" cards={upcoming} onSelect={setSelected} />}
      {soon.length > 0 && <Section title="🟡 Yaklaşıyor" cards={soon} onSelect={setSelected} />}
      {unknown.length > 0 && <Section title="⚪ Bilinmiyor" cards={unknown} onSelect={setSelected} />}
      {ok.length > 0 && <Section title="✅ Tamamlandı" cards={ok} onSelect={setSelected} />}

      <FeedbackSection page="screenings" />
      <Disclaimer />
    </div>
  )
}

function Section({ title, cards, onSelect }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold text-gray-700 mb-3">{title}</h2>
      {cards.map(card => (
        <div
          key={card.id}
          onClick={() => onSelect(card)}
          className="flex items-center gap-3 mb-2 p-4 bg-white rounded-2xl border border-gray-100 cursor-pointer active:scale-98 transition-transform"
          style={{boxShadow:'0 1px 8px rgba(0,0,0,0.04)'}}
        >
          <span className="text-2xl">{card.icon}</span>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-sm">{card.trName}</div>
            <div className="text-xs text-gray-400">
              {card.nextDate ? `Sonraki: ${card.nextDate}` : 'Tarih belirsiz'}
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
