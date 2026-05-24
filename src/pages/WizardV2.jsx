import { useState, useMemo, useCallback } from 'react'
import useAppStoreV2 from '../store/useAppStoreV2'
import { DISEASE_SCREENINGS } from '../data/screenings'

// ── Disease metadata ─────────────────────────────────────────────────────────
const DISEASE_META = {
  hipertansiyon:    { label: 'Yüksek Tansiyon',          icon: '🫀' },
  diyabet:          { label: 'Diyabet',                   icon: '🍬' },
  hiperlipidemi:    { label: 'Yüksek Kolesterol',         icon: '💊' },
  yagli_karaciger:  { label: 'Yağlı Karaciğer',           icon: '🫁' },
  kalp_damar:       { label: 'Kalp Damar',                icon: '❤️' },
  kemik_erimesi:    { label: 'Kemik Erimesi',             icon: '🦴' },
  obezite:          { label: 'Aşırı Kilo',                icon: '⚖️' },
  koah:             { label: 'KOAH',                      icon: '🌬️' },
  aile_krc_yuksek:  { label: 'Ailede Kolorektal Kanser',  icon: '🟠' },
  aile_krc_orta:    { label: 'Ailede Kolorektal Kanser',  icon: '🟠' },
  aile_meme_yuksek: { label: 'Ailede Meme Kanseri',       icon: '🩷' },
  aile_meme_orta:   { label: 'Ailede Meme Kanseri',       icon: '🩷' },
  aile_prostat:     { label: 'Ailede Prostat Kanseri',    icon: '🔵' },
  aile_yumurtalik:  { label: 'Ailede Yumurtalık Kanseri', icon: '🟣' },
  brca_lynch:       { label: 'BRCA / Lynch',              icon: '🧬' },
}

const CANCER_IDS  = new Set(['kolonoskopi','mamografi','pap_smear','prostat','akciger_bt','aort_anevrizması','genetik_danisman'])
const VACCINE_IDS = new Set(['asi_grip','asi_td_tdap','asi_hpv','asi_hepatit_b','asi_pnomoni','asi_zona'])

const ANSWER_OPTS = [
  { value: 'this_month', label: 'Bu ay' },
  { value: '6m',         label: '6 ay önce' },
  { value: '1y',         label: '1-2 yıl' },
  { value: 'unknown',    label: 'Hiç yapmadım' },
]

// ── Grouping ─────────────────────────────────────────────────────────────────
function buildWizardGroups(diseases, cards) {
  const assigned = new Set()
  const groups = []

  for (const d of diseases) {
    const dset = DISEASE_SCREENINGS[d]
    if (!dset) continue
    const ids = new Set(dset.screenings.map(s => s.id))
    const gc = cards.filter(c => ids.has(c.id) && !assigned.has(c.id))
    if (!gc.length) continue
    gc.forEach(c => assigned.add(c.id))
    const meta = DISEASE_META[d] || { label: d, icon: '🏥' }
    groups.push({ key: d, label: meta.label, icon: meta.icon, cards: gc })
  }

  const kanser = cards.filter(c => CANCER_IDS.has(c.id) && !assigned.has(c.id))
  if (kanser.length) {
    kanser.forEach(c => assigned.add(c.id))
    groups.push({ key: 'kanser', label: 'Kanser Taramaları', icon: '🔬', cards: kanser })
  }

  const asi = cards.filter(c => VACCINE_IDS.has(c.id) && !assigned.has(c.id))
  if (asi.length) {
    asi.forEach(c => assigned.add(c.id))
    groups.push({ key: 'asi', label: 'Aşılar', icon: '💉', cards: asi })
  }

  const temel = cards.filter(c => !assigned.has(c.id))
  if (temel.length) {
    groups.push({ key: 'temel', label: 'Temel Testler', icon: '🩺', cards: temel })
  }

  return groups
}

// ── Score ─────────────────────────────────────────────────────────────────────
function calcScore(cards, answers, screeningDates) {
  const total = cards.length
  let done = 0
  for (const c of cards) {
    const ans = answers[c.id]
    if (ans && ans !== 'unknown') done++
    else if (!ans && screeningDates[c.id]?.nextDate) done++
  }
  return { total, done, score: total > 0 ? Math.round((done / total) * 100) : 0 }
}

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 54, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width={128} height={128} className="score-ring" aria-hidden="true">
      <circle cx={64} cy={64} r={r} fill="none" stroke="#E5E7EB" strokeWidth={10} />
      <circle cx={64} cy={64} r={r} fill="none" stroke="#0D7377" strokeWidth={10}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 64 64)" />
      <text x={64} y={68} textAnchor="middle" fontSize={28} fontWeight={800}
        fill="#0D7377" fontFamily="Inter,sans-serif">{score}</text>
      <text x={64} y={84} textAnchor="middle" fontSize={11}
        fill="#6B7280" fontFamily="Inter,sans-serif">/ 100</text>
    </svg>
  )
}

// ── Compact screening row ────────────────────────────────────────────────────
function ScreeningRow({ card, answer, onAnswer }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      {/* Name */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl shrink-0">{card.icon}</span>
        <span className="font-semibold text-gray-900 text-sm leading-snug">{card.trName}</span>
      </div>
      {/* Single-row chips */}
      <div className="grid grid-cols-4 gap-1.5">
        {ANSWER_OPTS.map(opt => {
          const sel = answer === opt.value
          return (
            <button key={opt.value}
              onClick={() => onAnswer(card.id, opt.value)}
              className="py-2 rounded-xl text-xs font-semibold border-2 transition-all text-center leading-tight"
              style={{
                minHeight: 44,
                background: sel ? '#0D7377' : '#fff',
                color: sel ? '#fff' : '#4B5563',
                borderColor: sel ? '#0D7377' : '#E5E7EB',
              }}
              aria-pressed={sel}>
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function WizardV2() {
  const diseases           = useAppStoreV2(s => s.diseases)
  const screeningDates     = useAppStoreV2(s => s.screeningDates)
  const applyWizardAnswers = useAppStoreV2(s => s.applyWizardAnswers)
  const setWizardDone      = useAppStoreV2(s => s.setWizardDone)
  const getScreeningCards  = useAppStoreV2(s => s.getScreeningCards)

  const cards  = useMemo(() => getScreeningCards(), [getScreeningCards])
  const groups = useMemo(() => buildWizardGroups(diseases, cards), [diseases, cards])

  // -1 = intro, 0..N-1 = group screens, N = karne
  const [step, setStep]     = useState(-1)
  const [answers, setAnswers] = useState({})
  const [animKey, setAnimKey] = useState(0)

  const totalGroups = groups.length
  const isIntro = step === -1
  const isKarne = step === totalGroups
  const group   = (!isIntro && !isKarne) ? groups[step] : null

  const goNext = useCallback(() => {
    if (step === totalGroups - 1) applyWizardAnswers(answers)
    setStep(s => s + 1)
    setAnimKey(k => k + 1)
  }, [step, totalGroups, answers, applyWizardAnswers])

  const goPrev = useCallback(() => {
    setStep(s => Math.max(-1, s - 1))
    setAnimKey(k => k + 1)
  }, [])

  const handleAnswer = useCallback((id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }, [])

  // ── KARNE ──────────────────────────────────────────────────────────────────
  if (isKarne) {
    const { score, done, total } = calcScore(cards, answers, screeningDates)
    const need = total - done
    const msg  = `Canım'da sağlık karnemi çıkardım: ${score}/100. ${done}/${total} tarama güncel. Sen de karnenizi çıkar: https://canim.uzunyasa.com/app/`

    return (
      <div key={`karne-${animKey}`} className="page-enter flex flex-col h-full" style={{ background: '#FAFAF8' }}>
        <div className="px-5 pt-12 pb-4 bg-white border-b border-gray-100 shrink-0">
          <h1 className="text-2xl font-bold" style={{ color: '#0D7377' }}>🏆 Sağlık Karnen</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tarama özeti hazır</p>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
            <ScoreRing score={score} />
            <p className="text-sm text-gray-600 mt-2">
              <strong>{done}</strong> / {total} tarama güncel
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-3xl font-extrabold" style={{ color: '#10B981' }}>{done}</p>
              <p className="text-xs font-semibold text-gray-500 mt-1">✅ Güncel</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-3xl font-extrabold" style={{ color: need > 0 ? '#EF4444' : '#10B981' }}>{need}</p>
              <p className="text-xs font-semibold text-gray-500 mt-1">⚠️ Gerekli</p>
            </div>
          </div>
          {score < 70 && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">
                💪 Taramalarını güncel tutmak hastalıkları erken yakalamanın en etkili yolu.
              </p>
            </div>
          )}
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white"
            style={{ background: '#25D366', minHeight: 52 }}>
            💚 Karneyi Paylaş
          </button>
          <button onClick={() => setWizardDone()}
            className="w-full py-4 rounded-2xl font-bold text-white"
            style={{ background: '#0D7377', minHeight: 52 }}>
            Listemi Gör →
          </button>
        </div>
      </div>
    )
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (isIntro) {
    return (
      <div key="intro" className="page-enter flex flex-col h-full" style={{ background: '#FAFAF8' }}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6"
            style={{ background: '#e8f4f5' }}>🏥</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            Sağlık karnenizi çıkaralım
          </h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-xs">
            {totalGroups} adımda hangi taramaları yaptırdığını sor,<br />kişisel sağlık karneni hazırlayalım.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {groups.map(g => (
              <span key={g.key}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                style={{ background: '#e8f4f5', borderColor: '#b2d8da', color: '#0D7377' }}>
                {g.icon} {g.label}
              </span>
            ))}
          </div>
        </div>
        <div className="px-5 pb-6 shrink-0">
          <button onClick={goNext}
            className="w-full py-4 rounded-2xl font-bold text-white text-lg"
            style={{ background: '#0D7377', minHeight: 52 }}>
            Hadi Başlayalım →
          </button>
        </div>
      </div>
    )
  }

  // ── GROUP SCREEN ───────────────────────────────────────────────────────────
  const isLast = step === totalGroups - 1

  return (
    <div key={`g-${animKey}`} className="page-enter flex flex-col h-full" style={{ background: '#FAFAF8' }}>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 shrink-0">
        <div className="h-1 transition-all duration-400"
          style={{ width: `${((step + 1) / totalGroups) * 100}%`, background: '#0D7377' }} />
      </div>

      {/* Fixed header */}
      <div className="px-5 pt-5 pb-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button onClick={goPrev}
            className="text-sm text-gray-400 font-medium"
            style={{ minHeight: 44, minWidth: 44 }}
            aria-label="Geri">
            ← Geri
          </button>
          <span className="text-xs text-gray-400 font-semibold">
            {step + 1} / {totalGroups}
          </span>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest mb-0.5"
          style={{ color: '#0D7377' }}>
          {group.icon} {group.label} İçin
        </p>
        <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
          Taramalarını Kontrol Edelim
        </h1>
      </div>

      {/* Scrollable screening list */}
      <div className="flex-1 overflow-y-auto px-5 py-2">
        {group.cards.map(card => (
          <ScreeningRow
            key={card.id}
            card={card}
            answer={answers[card.id]}
            onAnswer={handleAnswer}
          />
        ))}
        <div className="h-4" />
      </div>

      {/* Fixed footer */}
      <div className="px-5 py-4 bg-white border-t border-gray-100 shrink-0">
        <button onClick={goNext}
          className="w-full py-4 rounded-2xl font-bold text-white text-base"
          style={{ background: '#0D7377', minHeight: 52 }}>
          {isLast ? 'Karnemi Gör 🏆' : 'Devam →'}
        </button>
      </div>
    </div>
  )
}
