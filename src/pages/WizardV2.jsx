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

// Zaman seçenekleri — açıklayıcı
const ANSWER_OPTS = [
  { value: '1m',      label: 'Bu ay' },
  { value: '6m',      label: '6 ay içinde' },
  { value: '1y',      label: '1–2 yıl önce' },
  { value: 'unknown', label: 'Hiç / Bilmiyorum' },
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

// Maks 4 tarama / sayfa → pages dizisi
function buildPages(groups) {
  const pages = []
  for (const g of groups) {
    const chunks = []
    for (let i = 0; i < g.cards.length; i += 4) chunks.push(g.cards.slice(i, i + 4))
    chunks.forEach((chunk, idx) => pages.push({
      key: `${g.key}-${idx}`,
      groupKey: g.key,
      label: g.label,
      icon: g.icon,
      cards: chunk,
      pageNum: idx + 1,
      totalChunks: chunks.length,
    }))
  }
  return pages
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
    <div className="py-4 border-b border-gray-100 last:border-0">
      {/* Question */}
      <div className="flex items-start gap-2 mb-1">
        <span className="text-xl shrink-0 mt-0.5">{card.icon}</span>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-snug">{card.trName}</p>
          <p className="text-xs text-gray-500 mt-0.5">Ne zaman yaptırdınız?</p>
        </div>
      </div>
      {/* Answer chips */}
      <div className="grid grid-cols-2 gap-1.5 mt-2 pl-8">
        {ANSWER_OPTS.map(opt => {
          const sel = answer === opt.value
          return (
            <button key={opt.value}
              onClick={() => onAnswer(card.id, opt.value)}
              className="py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all text-center"
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
  const pages  = useMemo(() => buildPages(groups), [groups])

  // -1 = intro, 0..N-1 = pages, N = karne
  const [step, setStep]     = useState(-1)
  const [answers, setAnswers] = useState({})
  const [animKey, setAnimKey] = useState(0)

  const totalPages = pages.length
  const isIntro = step === -1
  const isKarne = step === totalPages
  const page    = (!isIntro && !isKarne) ? pages[step] : null

  const goNext = useCallback(() => {
    if (step === totalPages - 1) applyWizardAnswers(answers)
    setStep(s => s + 1)
    setAnimKey(k => k + 1)
    window.scrollTo?.(0, 0)
  }, [step, totalPages, answers, applyWizardAnswers])

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
        {/* Teal header */}
        <div className="px-5 pt-12 pb-6 shrink-0" style={{ background: '#0D7377' }}>
          <p className="text-white text-opacity-80 text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Tamamlandı 🎉
          </p>
          <h1 className="text-3xl font-extrabold text-white leading-tight">Sağlık Karnen</h1>
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
        {/* Teal header */}
        <div className="px-5 pt-12 pb-6 shrink-0" style={{ background: '#0D7377' }}>
          <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Kişisel Sağlık Karnesi
          </p>
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            Hangi taramaları yaptırman gerekiyor?
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
            ~2 dakika · {totalPages} adım
          </p>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-6">
          <ol className="space-y-4">
            {[
              { n: '1', text: 'Yaşını ve durumunu gir' },
              { n: '2', text: 'Son kontrol tarihlerini söyle' },
              { n: '3', text: 'Kişisel karnen hazırlanır' },
              { n: '4', text: 'Eksik taramaları gör' },
            ].map(item => (
              <li key={item.n} className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-base font-extrabold text-white shrink-0"
                  style={{ background: '#0D7377' }}>{item.n}</span>
                <p className="text-gray-800 text-xl font-bold leading-tight">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="px-5 pb-6 shrink-0">
          <button onClick={goNext}
            className="w-full py-4 rounded-2xl font-bold text-white text-lg"
            style={{ background: '#0D7377', minHeight: 52 }}>
            Karnemizi Oluştur →
          </button>
        </div>
      </div>
    )
  }

  // ── PAGE SCREEN ────────────────────────────────────────────────────────────
  const isLast = step === totalPages - 1
  const subLabel = page.totalChunks > 1 ? ` (${page.pageNum}/${page.totalChunks})` : ''

  return (
    <div key={`p-${animKey}`} className="page-enter flex flex-col h-full" style={{ background: '#FAFAF8' }}>

      {/* Teal header — büyük, göze çarpan */}
      <div className="px-5 pt-10 pb-5 shrink-0" style={{ background: '#0D7377' }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={goPrev}
            className="text-sm font-medium flex items-center gap-1"
            style={{ color: 'rgba(255,255,255,0.75)', minHeight: 44, minWidth: 44 }}
            aria-label="Geri">
            ← Geri
          </button>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {step + 1} / {totalPages}
          </span>
        </div>

        {/* İlerleme çubuğu */}
        <div className="w-full h-1 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.25)' }}>
          <div className="h-1 rounded-full transition-all duration-400"
            style={{ width: `${((step + 1) / totalPages) * 100}%`, background: 'white' }} />
        </div>

        {/* Büyük icon + hastalık adı */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">{page.icon}</span>
          <div>
            <h1 className="text-2xl font-extrabold text-white leading-tight">
              {page.label}{subLabel}
            </h1>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
              taramalarını kontrol edelim
            </p>
          </div>
        </div>
      </div>

      {/* Tarama listesi */}
      <div className="flex-1 overflow-y-auto px-5 py-3 bg-white">
        {page.cards.map(card => (
          <ScreeningRow
            key={card.id}
            card={card}
            answer={answers[card.id]}
            onAnswer={handleAnswer}
          />
        ))}
      </div>

      {/* Devam butonu */}
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
