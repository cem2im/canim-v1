import { useState } from 'react'
import useAppStore from '../store/useAppStore'
import { scoreColor, scoreLabel, statusColor, statusLabel } from '../utils/score'
import ScreeningDetail from '../components/ScreeningDetail'
import DoctorVisitModal from '../components/DoctorVisitModal'
import DoctorVisitCard from '../components/DoctorVisitCard'
import DoctorVisitDetail from '../components/DoctorVisitDetail'
import FeedbackSection from '../components/FeedbackSection'
import Disclaimer from '../components/Disclaimer'

export default function Today() {
  const profile = useAppStore(s => s.profile)
  const getScore = useAppStore(s => s.getScore)
  const getScreeningCards = useAppStore(s => s.getScreeningCards)
  const getDoctorVisitCards = useAppStore(s => s.getDoctorVisitCards)
  const [selected, setSelected] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showDoctorModal, setShowDoctorModal] = useState(false)

  const score = getScore()
  const cards = getScreeningCards()
  const doctorCards = getDoctorVisitCards()
  const color = scoreColor(score)
  const label = scoreLabel(score)

  // Greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar'

  // Turkish date
  const now = new Date()
  const days = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi']
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
  const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`

  // Show overdue + upcoming + soon by default, hide ok
  const visibleCards = cards.filter(c => c.status !== 'ok')
  const okCards = cards.filter(c => c.status === 'ok')
  const [showAll, setShowAll] = useState(false)

  // Motivation message based on score
  const motivationMsg = score >= 90 ? 'Harika gidiyorsun! Taramalarını düzenli yaptırıyorsun. 🎉'
    : score >= 70 ? 'İyi gidiyorsun, birkaç tarama yaklaşıyor.'
    : score >= 50 ? 'Bazı taramaların gecikmiş, takvimini kontrol et.'
    : 'Dikkat! Gecikmiş taramaların var, en kısa sürede randevu al. ⚠️'

  if (selected) return (
    <ScreeningDetail screening={selected} onBack={() => setSelected(null)} />
  )

  if (selectedDoctor) return (
    <DoctorVisitDetail
      schedule={selectedDoctor}
      lastVisitDate={selectedDoctor.lastVisitDate}
      onBack={() => setSelectedDoctor(null)}
    />
  )

  return (
    <div className="page-enter pb-28">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="text-xs text-gray-400 mb-0.5">{dateStr}</div>
        <h1 className="text-xl font-extrabold text-gray-900">{greeting}, {profile?.name?.split(' ')[0]} 👋</h1>
      </div>

      {/* Score card */}
      <div className="mx-5 mb-4 rounded-3xl p-5 text-white overflow-hidden relative" style={{background:`linear-gradient(135deg, #0D7377, #14919B)`}}>
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 bg-white"/>
        <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full opacity-10 bg-white"/>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium opacity-80 mb-1">Tarama Uyum Puanı</div>
            <div className="text-5xl font-black mb-1">{score}</div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{background:'rgba(255,255,255,0.2)'}}>
              {label}
            </div>
          </div>
          {/* Score ring */}
          <ScoreRing score={score} color="rgba(255,255,255,0.9)" />
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 flex gap-4 text-sm">
          <div>
            <span className="font-black">{cards.filter(c=>c.status==='overdue').length}</span>
            <span className="opacity-70 ml-1">Gecikmiş</span>
          </div>
          <div>
            <span className="font-black">{cards.filter(c=>c.status==='upcoming').length}</span>
            <span className="opacity-70 ml-1">Bu ay</span>
          </div>
          <div>
            <span className="font-black">{okCards.length}</span>
            <span className="opacity-70 ml-1">Tamam</span>
          </div>
        </div>
      </div>

      {/* Motivation Banner */}
      <div className="mx-5 mb-4 px-4 py-3 rounded-2xl" style={{background: score >= 70 ? '#e8f4f5' : score >= 50 ? '#fffbeb' : '#fef2f2'}}>
        <p className="text-sm font-semibold text-center" style={{color: score >= 70 ? '#0D7377' : score >= 50 ? '#92400e' : '#991b1b'}}>
          {motivationMsg}
        </p>
      </div>

      {/* Kontrole Gittim button */}
      <div className="mx-5 mb-5">
        <button
          onClick={() => setShowDoctorModal(true)}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-transform"
          style={{background:'linear-gradient(135deg, #14919B, #0D7377)'}}
        >
          🏥 Kontrole Gittim — Taramaları Kaydet
        </button>
      </div>

      {/* Doktor Kontrolleri section */}
      {doctorCards.length > 0 && (
        <div className="mb-5">
          <div className="px-5 mb-3">
            <h2 className="text-sm font-bold text-gray-700">🏥 Doktor Kontrolleri</h2>
            <p className="text-xs text-gray-400">Hastalıklarınıza göre düzenli ziyaret takvimi</p>
          </div>
          <div className="px-5">
            {doctorCards.map(card => (
              <DoctorVisitCard
                key={card.id}
                schedule={card}
                lastVisitDate={card.lastVisitDate}
                nextVisitDate={card.nextVisitDate}
                status={card.status}
                daysUntil={card.daysUntil}
                onClick={() => setSelectedDoctor(card)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action list */}
      <div className="px-5">
        <h2 className="text-sm font-bold text-gray-700 mb-3">Yapılacaklar</h2>

        {visibleCards.length === 0 && (
          <div className="rounded-3xl p-6 text-center" style={{background:'#e8f4f5'}}>
            <div className="text-3xl mb-2">🎉</div>
            <div className="font-bold text-teal text-base">Her şey yolunda!</div>
            <div className="text-sm text-gray-500 mt-1">Tüm taramalarınız güncel.</div>
          </div>
        )}

        {visibleCards.map(card => (
          <ScreeningCard key={card.id} card={card} onClick={() => setSelected(card)} />
        ))}

        {okCards.length > 0 && (
          <button
            onClick={() => setShowAll(v=>!v)}
            className="w-full py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500 bg-white mb-3"
          >
            {showAll ? '▲ Gizle' : `▼ ${okCards.length} tamamlananı göster`}
          </button>
        )}

        {showAll && okCards.map(card => (
          <ScreeningCard key={card.id} card={card} onClick={() => setSelected(card)} />
        ))}
      </div>

      {/* Feedback + Disclaimer */}
      <FeedbackSection page="today" />
      <Disclaimer />

      {/* Doctor Visit Modal */}
      {showDoctorModal && (
        <DoctorVisitModal onClose={() => setShowDoctorModal(false)} />
      )}
    </div>
  )
}

function ScreeningCard({ card, onClick }) {
  const color = statusColor(card.status)
  // Doctor specialty badge — first item from doctor field
  const doctorBadge = card.doctor ? card.doctor.split(' · ')[0] : null
  // Format next date nicely
  const nextDateLabel = card.nextDate
    ? (() => {
        const d = new Date(card.nextDate)
        const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
      })()
    : 'En kısa zamanda'

  return (
    <div
      onClick={onClick}
      className="mb-3 bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer active:scale-98 transition-transform"
      style={{boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}
    >
      <div className="flex items-stretch">
        {/* Left color bar */}
        <div className="w-1.5 flex-shrink-0" style={{background:color}}/>
        <div className="flex-1 px-4 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xl">{card.icon}</span>
              <div>
                <div className="font-bold text-gray-900 text-sm">{card.trName}</div>
                {card.why && (
                  <div className="text-xs text-gray-400 mt-0.5 leading-relaxed max-w-xs">{card.why}</div>
                )}
              </div>
            </div>
            <div className="ml-2 flex-shrink-0">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:`${color}18`, color}}>
                {statusLabel(card.status, card.daysUntil)}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            {doctorBadge && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">🏥 {doctorBadge}</span>
            )}
            <span className="text-xs text-gray-400">📅 {nextDateLabel}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreRing({ score, color = '#fff' }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const pct = (score - 40) / 60 // map 40-100 → 0-1
  const dash = pct * circ
  return (
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7"/>
      <circle
        cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 45 45)"
        className="score-ring"
      />
      <text x="45" y="45" textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="16" fontWeight="800" fontFamily="Inter"
      >{score}</text>
      <text x="45" y="60" textAnchor="middle" fill={color} fontSize="8" opacity="0.7" fontFamily="Inter">/ 100</text>
    </svg>
  )
}
