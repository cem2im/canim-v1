import { useState, useMemo, useCallback } from 'react'
import useAppStoreV2 from '../store/useAppStoreV2'
import { DISEASE_SCREENINGS } from '../data/screenings'
import { buildScreeningList } from '../utils/engine'

// ── Disease metadata ────────────────────────────────────────────────────────
const DISEASE_META = {
  hipertansiyon:    { label: 'Yüksek Tansiyon',                      icon: '🫀' },
  diyabet:          { label: 'Diyabet',                               icon: '🍬' },
  hiperlipidemi:    { label: 'Yüksek Kolesterol',                     icon: '💊' },
  yagli_karaciger:  { label: 'Yağlı Karaciğer',                       icon: '🫁' },
  kalp_damar:       { label: 'Kalp Damar',                            icon: '❤️' },
  kemik_erimesi:    { label: 'Kemik Erimesi',                         icon: '🦴' },
  obezite:          { label: 'Aşırı Kilo',                            icon: '⚖️' },
  koah:             { label: 'KOAH',                                  icon: '🌬️' },
  aile_krc_yuksek:  { label: 'Ailede Kolorektal Kanser (Yüksek)',     icon: '🟠' },
  aile_krc_orta:    { label: 'Ailede Kolorektal Kanser',              icon: '🟠' },
  aile_meme_yuksek: { label: 'Ailede Meme Kanseri (Yüksek)',          icon: '🩷' },
  aile_meme_orta:   { label: 'Ailede Meme Kanseri',                   icon: '🩷' },
  aile_prostat:     { label: 'Ailede Prostat Kanseri',                icon: '🔵' },
  aile_yumurtalik:  { label: 'Ailede Yumurtalık Kanseri',             icon: '🟣' },
  brca_lynch:       { label: 'BRCA / Lynch',                          icon: '🧬' },
}

// ── Answer options ──────────────────────────────────────────────────────────
const ANSWER_OPTS = [
  { value: 'this_month', label: '✓ Bu ay' },
  { value: '6m',         label: '6 ay içinde' },
  { value: '1y',         label: '1-2 yıl önce' },
  { value: 'unknown',    label: 'Yapmadım / Bilmiyorum' },
]

// ── Grouping algorithm ──────────────────────────────────────────────────────
function buildWizardGroups(diseases, cards) {
  const assigned = new Set()
  const groups = []

  for (const d of diseases) {
    const dset = DISEASE_SCREENINGS[d]
    if (!dset) continue
    const ids = new Set(dset.screenings.map(s => s.id))
    const groupCards = cards.filter(c => ids.has(c.id) && !assigned.has(c.id))
    if (!groupCards.length) continue
    groupCards.forEach(c => assigned.add(c.id))
    const meta = DISEASE_META[d] || { label: d, icon: '🏥' }
    groups.push({ key: d, label: meta.label, icon: meta.icon, cards: groupCards })
  }

  // Remaining (genel)
  const genel = cards.filter(c => !assigned.has(c.id))
  if (genel.length) {
    groups.push({ key: 'genel', label: 'Genel Taramalar', icon: '🏥', cards: genel })
  }

  return groups
}

// ── Score calculator ────────────────────────────────────────────────────────
function calcScore(cards, answers, screeningDates) {
  const total = cards.length
  let done = 0
  for (const c of cards) {
    const ans = answers[c.id]
    const hasExistingDate = screeningDates[c.id]?.nextDate
    if (ans && ans !== 'unknown') done++
    else if (!ans && hasExistingDate) done++ // already tracked before wizard
  }
  return { total, done, score: total > 0 ? Math.round((done / total) * 100) : 0 }
}

// ── Chip component ──────────────────────────────────────────────────────────
function AnswerChip({ value, selected, onClick }) {
  const opt = ANSWER_OPTS.find(o => o.value === value)
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all"
      style={{
        minHeight: 44,
        background: selected ? '#0D7377' : '#fff',
        color: selected ? '#fff' : '#374151',
        borderColor: selected ? '#0D7377' : '#E5E7EB',
      }}
      aria-pressed={selected}
    >
      {opt?.label}
    </button>
  )
}

// ── Screening card in wizard ────────────────────────────────────────────────
function WizardScreeningRow({ card, answer, onAnswer }) {
  return (
    <div className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
      <div className="flex items-start gap-2 mb-3">
        <span className="text-2xl shrink-0 mt-0.5">{card.icon}</span>
        <div>
          <p className="font-bold text-gray-900 leading-tight">{card.trName}</p>
          {card.why && (
            <p className="text-xs text-gray-500 mt-1 leading-snug line-clamp-2">{card.why}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ANSWER_OPTS.map(opt => (
          <AnswerChip
            key={opt.value}
            value={opt.value}
            selected={answer === opt.value}
            onClick={() => onAnswer(card.id, opt.value)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Progress bar ────────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, background: '#0D7377' }}
      />
    </div>
  )
}

// ── Score ring ──────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width={128} height={128} className="score-ring" aria-hidden="true">
      <circle cx={64} cy={64} r={r} fill="none" stroke="#E5E7EB" strokeWidth={10} />
      <circle
        cx={64} cy={64} r={r} fill="none"
        stroke="#0D7377" strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 64 64)"
      />
      <text x={64} y={68} textAnchor="middle" fontSize={26} fontWeight={800} fill="#0D7377" fontFamily="Inter,sans-serif">
        {score}
      </text>
      <text x={64} y={84} textAnchor="middle" fontSize={11} fill="#6B7280" fontFamily="Inter,sans-serif">
        / 100
      </text>
    </svg>
  )
}

// ── Main WizardV2 component ─────────────────────────────────────────────────
export default function WizardV2() {
  const diseases        = useAppStoreV2(s => s.diseases)
  const profile         = useAppStoreV2(s => s.profile)
  const screeningDates  = useAppStoreV2(s => s.screeningDates)
  const applyWizardAnswers = useAppStoreV2(s => s.applyWizardAnswers)
  const setWizardDone   = useAppStoreV2(s => s.setWizardDone)
  const getScreeningCards = useAppStoreV2(s => s.getScreeningCards)

  const cards = useMemo(() => getScreeningCards(), [getScreeningCards])
  const groups = useMemo(() => buildWizardGroups(diseases, cards), [diseases, cards])

  // step: 0 = intro, 1..N = groups, N+1 = karne
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showKarne, setShowKarne] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  const totalSteps = groups.length // number of group steps (0-indexed after intro)

  const handleAnswer = useCallback((screeningId, value) => {
    setAnswers(prev => ({ ...prev, [screeningId]: value }))
  }, [])

  const goNext = useCallback(() => {
    if (step < totalSteps) {
      setStep(s => s + 1)
      setAnimKey(k => k + 1)
    } else {
      // Final: apply answers & show karne
      applyWizardAnswers(answers)
      setShowKarne(true)
      setAnimKey(k => k + 1)
    }
  }, [step, totalSteps, answers, applyWizardAnswers])

  const goFinish = useCallback(() => {
    setWizardDone()
  }, [setWizardDone])

  const handleWhatsApp = useCallback(() => {
    const { score, done, total } = calcScore(cards, answers, screeningDates)
    const msg = `Canım'da sağlık karnemi çıkardım: ${score}/100. ${done}/${total} tarama güncel. Sen de karnenizi çıkar: https://canim.uzunyasa.com/app/`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }, [cards, answers, screeningDates])

  // ── KARNE SCREEN ───────────────────────────────────────────────────────────
  if (showKarne) {
    const { score, done, total } = calcScore(cards, answers, screeningDates)
    const needCount = total - done
    return (
      <div key={`karne-${animKey}`} className="page-enter flex flex-col h-full" style={{ background: '#FAFAF8' }}>
        {/* Header */}
        <div className="px-5 pt-12 pb-4 bg-white border-b border-gray-100">
          <h1 className="text-2xl font-bold" style={{ color: '#0D7377' }}>Sağlık Karnen</h1>
          <p className="text-sm text-gray-500 mt-1">Tarama özeti hazır</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {/* Score ring */}
          <div className="bg-white rounded-2xl p-6 mb-4 border border-gray-100 flex flex-col items-center text-center">
            <p className="text-lg font-bold text-gray-900 mb-4">🏆 Sağlık Karnen Hazır!</p>
            <ScoreRing score={score} />
            <p className="text-sm text-gray-600 mt-3">
              <span className="font-bold text-gray-900">{done}/{total}</span> tarama güncel
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-3xl font-extrabold" style={{ color: '#10B981' }}>{done}</p>
              <p className="text-xs font-semibold text-gray-500 mt-1">✅ Güncel</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-3xl font-extrabold" style={{ color: needCount > 0 ? '#EF4444' : '#10B981' }}>{needCount}</p>
              <p className="text-xs font-semibold text-gray-500 mt-1">⚠️ Gerekli</p>
            </div>
          </div>

          {/* Encouragement */}
          {score === 100 ? (
            <div className="bg-green-50 rounded-2xl p-4 mb-4 border border-green-100 text-center">
              <p className="font-bold text-green-700">🎉 Mükemmel! Tüm taramalar güncel.</p>
            </div>
          ) : score >= 70 ? (
            <div className="rounded-2xl p-4 mb-4 border" style={{ background: '#e8f4f5', borderColor: '#b2d8da' }}>
              <p className="font-semibold text-sm" style={{ color: '#0D7377' }}>
                👍 İyi gidiyorsun! Birkaç taramayı tamamlayarak sağlığını zirveye taşı.
              </p>
            </div>
          ) : (
            <div className="bg-orange-50 rounded-2xl p-4 mb-4 border border-orange-100">
              <p className="font-semibold text-sm text-orange-700">
                💪 Taramalarını güncel tutmak sağlığını korur. Hadi liste ekranından başlayalım!
              </p>
            </div>
          )}

          {/* CTA buttons */}
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white mb-3"
            style={{ background: '#25D366', minHeight: 44 }}
          >
            💚 WhatsApp'ta Paylaş
          </button>

          <button
            onClick={goFinish}
            className="w-full py-4 rounded-2xl font-bold text-white"
            style={{ background: '#0D7377', minHeight: 44 }}
          >
            Listemi Gör →
          </button>
        </div>
      </div>
    )
  }

  // ── INTRO SCREEN (step 0) ──────────────────────────────────────────────────
  if (step === 0) {
    const diseaseCount = groups.filter(g => g.key !== 'genel').length
    const totalCards = cards.length

    return (
      <div key={`intro-${animKey}`} className="page-enter flex flex-col h-full" style={{ background: '#FAFAF8' }}>
        {/* Header */}
        <div className="px-5 pt-12 pb-4 bg-white border-b border-gray-100">
          <h1 className="text-2xl font-bold" style={{ color: '#0D7377' }}>Sağlık Karnesi</h1>
          <p className="text-sm text-gray-500 mt-1">Tarama geçmişini girelim</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col">
          {/* Big icon + title */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-5"
              style={{ background: '#e8f4f5' }}
            >
              🏥
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">
              {diseaseCount > 0
                ? `${diseaseCount} hastalık durumun için ${totalCards} tarama var`
                : `${totalCards} tarama önerimiz var`}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Hangi taramaları ne zaman yaptırdığını söyle — sana kişisel bir sağlık karnesi hazırlayalım.
            </p>

            {/* Group preview chips */}
            {groups.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {groups.map(g => (
                  <span
                    key={g.key}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                    style={{ background: '#e8f4f5', borderColor: '#b2d8da', color: '#0D7377' }}
                  >
                    {g.icon} {g.label}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400">
              Sadece {totalSteps} adım — 2 dakika sürer
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={goNext}
            className="w-full py-4 rounded-2xl font-bold text-white text-lg mt-4"
            style={{ background: '#0D7377', minHeight: 44 }}
          >
            Hadi Kontrol Edelim →
          </button>
        </div>
      </div>
    )
  }

  // ── GROUP SCREENS (step 1..N) ──────────────────────────────────────────────
  const groupIndex = step - 1
  const group = groups[groupIndex]

  if (!group) {
    // Safety: shouldn't happen, but jump to karne
    applyWizardAnswers(answers)
    setShowKarne(true)
    return null
  }

  const isLast = step === totalSteps

  return (
    <div key={`step-${animKey}`} className="page-enter flex flex-col h-full" style={{ background: '#FAFAF8' }}>
      {/* Fixed header */}
      <div className="px-5 pt-12 pb-3 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{group.icon}</span>
            <h1 className="text-lg font-extrabold text-gray-900">{group.label}</h1>
          </div>
          <span className="text-xs text-gray-400 font-semibold">
            Adım {step} / {totalSteps}
          </span>
        </div>
        <ProgressBar current={step} total={totalSteps} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {group.cards.map(card => (
          <WizardScreeningRow
            key={card.id}
            card={card}
            answer={answers[card.id]}
            onAnswer={handleAnswer}
          />
        ))}
        {/* bottom padding so last card isn't hidden behind footer */}
        <div className="h-4" />
      </div>

      {/* Fixed footer */}
      <div className="px-5 py-4 bg-white border-t border-gray-100 shrink-0">
        <button
          onClick={goNext}
          className="w-full py-4 rounded-2xl font-bold text-white text-base"
          style={{ background: '#0D7377', minHeight: 44 }}
        >
          {isLast ? 'Karnemi Gör 🏆' : 'Devam →'}
        </button>
      </div>
    </div>
  )
}
