import { useState, useEffect } from 'react'

// ── Count-up animation hook ────────────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setVal(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}
import useAppStore from '../store/useAppStore'
import { scoreColor, scoreLabel, statusColor, statusLabel } from '../utils/score'
import ScreeningDetail from '../components/ScreeningDetail'
import DoctorVisitModal from '../components/DoctorVisitModal'
import DoctorVisitCard from '../components/DoctorVisitCard'
import DoctorVisitDetail from '../components/DoctorVisitDetail'
import ShareCardModal from '../components/ShareCardModal'
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
  const [showShareModal, setShowShareModal] = useState(false)

  const score = getScore()
  const animatedScore = useCountUp(score, 950)
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
        <div className="text-xs text-gray-500 mb-0.5">{dateStr}</div>
        <h1 className="text-xl font-extrabold text-gray-900">{greeting}, {profile?.name?.split(' ')[0]} 👋</h1>
      </div>

      {/* Score card */}
      <div id="tour-score-card" className="mx-5 mb-4 rounded-3xl p-5 text-white overflow-hidden relative" style={{background:`linear-gradient(135deg, #0D7377, #14919B)`}}>
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 bg-white"/>
        <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full opacity-10 bg-white"/>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium opacity-80 mb-1">Tarama Uyum Puanı</div>
            <div className="text-6xl font-black tracking-tight mb-2" style={{lineHeight:1}}>{animatedScore}</div>
            <div className="inline-block px-3 py-1 rounded-full text-sm font-bold" style={{background:'rgba(255,255,255,0.2)'}}>
              {label}
            </div>
          </div>
          {/* Score ring — visual only, no duplicate number */}
          <ScoreRing score={score} />
        </div>
        {/* Stat boxes — 4-column grid */}
        <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-4 gap-1">
          {[
            { count: cards.filter(c=>c.status==='overdue').length,  label:'Gecikmiş', dot:'#FCA5A5' },
            { count: cards.filter(c=>c.status==='upcoming').length, label:'Bu ay',    dot:'#99F6E4' },
            { count: cards.filter(c=>c.status==='soon').length,     label:'Yakında',  dot:'#FDE68A' },
            { count: okCards.length,                                label:'Tamam',    dot:'#99F6E4' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center py-2 rounded-2xl" style={{background:'rgba(255,255,255,0.1)'}}>
              <span className="text-2xl font-black leading-none mb-1">{s.count}</span>
              <span className="text-xs opacity-75 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivation Banner */}
      <div className="mx-5 mb-4 px-4 py-3 rounded-2xl" style={{background: score >= 70 ? '#e8f4f5' : score >= 50 ? '#fffbeb' : '#fef2f2'}}>
        <p className="text-sm font-semibold text-center" style={{color: score >= 70 ? '#0D7377' : score >= 50 ? '#92400e' : '#991b1b'}}>
          {motivationMsg}
        </p>
      </div>

      {/* Action buttons row */}
      <div id="tour-action-btns" className="mx-5 mb-5 flex gap-2">
        <button
          onClick={() => setShowDoctorModal(true)}
          className="flex-1 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
          style={{background:'linear-gradient(135deg, #14919B, #0D7377)'}}
        >
          🏥 Kontrole Gittim
        </button>
        <button
          onClick={() => setShowShareModal(true)}
          className="py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center gap-1.5 active:scale-98 transition-transform"
          style={{background:'rgba(13,115,119,0.1)', color:'#0D7377', border:'1.5px solid rgba(13,115,119,0.2)'}}
        >
          📤 Paylaş
        </button>
      </div>

      {/* Doktor Kontrolleri section */}
      {doctorCards.length > 0 && (
        <div className="mb-5">
          <div className="px-5 mb-3">
            <h2 className="text-sm font-bold text-gray-700">🏥 Doktor Kontrolleri</h2>
            <p className="text-sm text-gray-500">Hastalıklarınıza göre düzenli ziyaret takvimi</p>
          </div>
          <div className="px-5 stagger">
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

        <div className="stagger">
          {visibleCards.map(card => (
            <ScreeningCard key={card.id} card={card} onClick={() => setSelected(card)} />
          ))}
        </div>

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

      {/* Share Card Modal */}
      {showShareModal && (
        <ShareCardModal
          onClose={() => setShowShareModal(false)}
          score={score}
          label={label}
          name={profile?.name}
          cards={cards}
        />
      )}
    </div>
  )
}

function ScreeningCard({ card, onClick }) {
  const color = statusColor(card.status)
  const doctorBadge = card.doctor ? card.doctor.split(' · ')[0] : null
  const nextDateLabel = card.nextDate
    ? (() => {
        const d = new Date(card.nextDate)
        const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
      })()
    : 'En kısa zamanda'

  // Subtle status bg tint (6% opacity) — helps visual scanning
  const bgTint = {
    overdue:  '#FEF2F2',
    upcoming: '#F0FDFA',
    soon:     '#FFFBEB',
    ok:       '#F0FDFA',
    unknown:  '#FAFAFA',
  }[card.status] ?? '#FAFAFA'

  return (
    <div
      onClick={onClick}
      className="mb-3 rounded-2xl border overflow-hidden cursor-pointer active:scale-98 transition-transform"
      style={{
        background: bgTint,
        borderColor: `${color}30`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-stretch">
        {/* Left color bar */}
        <div className="w-1 flex-shrink-0" style={{background:color}}/>
        <div className="flex-1 px-5 py-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">{card.icon}</span>
              <div className="font-bold text-gray-900 text-base leading-snug">{card.trName}</div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5${card.status === 'overdue' ? ' pulse-slow' : ''}`}
              style={{background:`${color}20`, color}}
            >
              {statusLabel(card.status, card.daysUntil)}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {doctorBadge && (
              <span className="text-xs font-medium text-gray-500 bg-white/70 border border-gray-200 px-2.5 py-1 rounded-full">
                🏥 {doctorBadge}
              </span>
            )}
            <span className="text-xs font-medium text-gray-500">📅 {nextDateLabel}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreRing({ score }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const pct = (score - 40) / 60  // map 40–100 → 0–1
  const dash = Math.max(0, pct) * circ
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      {/* Track */}
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8"/>
      {/* Progress */}
      <circle
        cx="44" cy="44" r={r} fill="none"
        stroke="rgba(255,255,255,0.85)" strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
      />
      {/* Label only — no duplicate score number */}
      <text x="44" y="44" textAnchor="middle" dominantBaseline="middle"
        fill="rgba(255,255,255,0.9)" fontSize="11" fontWeight="700" fontFamily="Inter"
      >/100</text>
    </svg>
  )
}
