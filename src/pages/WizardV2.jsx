import { useState, useMemo, useCallback, useRef } from 'react'
import useAppStoreV2 from '../store/useAppStoreV2'
import { DISEASE_SCREENINGS } from '../data/screenings'
import { shareKarneImage } from '../utils/karneShare'
import { generateScreeningsPdf } from '../utils/generatePdf'
import { LIFESTYLE_QUESTIONS, computeRadarAxes, computeGrade, gradeColor as getGradeColor } from '../data/lifestyle'

// ── Disease metadata ──────────────────────────────────────────────────────────
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
  { value: '1m',      label: 'Bu ay' },
  { value: '6m',      label: '6 ay önce' },
  { value: '1y',      label: '12-24 ay' },   // motor ay bazlı — kullanıcı aynı birimi görür
  { value: 'unknown', label: 'Hiç / Bilmiyorum' },
]

// ── Yaşam Tarzı soruları (UzunYaşa 5 sütun) ──────────────────────────────────
// ── Grouping ──────────────────────────────────────────────────────────────────
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

// ── Radar SVG ─────────────────────────────────────────────────────────────────
function RadarChart({ axes }) {
  // axes: [{ label, icon, score }]  score 0-100
  const N = axes.length
  const cx = 130, cy = 125, R = 80

  const angle = (i) => (Math.PI * 2 * i / N) - Math.PI / 2
  const pt = (i, r) => [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))]

  const rings = [0.33, 0.66, 1]
  const dataPoints = axes.map((a, i) => pt(i, R * (a.score / 100)))
  const dataPoly = dataPoints.map(p => p.join(',')).join(' ')

  return (
    <svg width={260} height={250} viewBox="0 0 260 250" aria-hidden="true">
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0D7377" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#14919B" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Grid rings */}
      {rings.map((r, ri) => {
        const pts = Array.from({ length: N }, (_, i) => pt(i, R * r)).map(p => p.join(',')).join(' ')
        return <polygon key={ri} points={pts} fill="none" stroke="#E5E7EB" strokeWidth={1} />
      })}

      {/* Axis lines */}
      {axes.map((_, i) => {
        const [x, y] = pt(i, R)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E5E7EB" strokeWidth={1} />
      })}

      {/* Data polygon */}
      <polygon points={dataPoly} fill="url(#radarFill)" stroke="#0D7377" strokeWidth={2.5} strokeLinejoin="round" />

      {/* Data dots */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5} fill="#0D7377" stroke="white" strokeWidth={2} />
      ))}

      {/* Labels */}
      {axes.map((a, i) => {
        const [x, y] = pt(i, R + 20)
        return (
          <g key={i}>
            <text x={x} y={y - 8} textAnchor="middle" fontSize={16}>{a.icon}</text>
            <text x={x} y={y + 6} textAnchor="middle" fontSize={9} fontWeight={700}
              fill="#374151" fontFamily="Inter,sans-serif">{a.label}</text>
            <text x={x} y={y + 17} textAnchor="middle" fontSize={9}
              fill="#0D7377" fontFamily="Inter,sans-serif" fontWeight={800}>{a.score}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function WizardV2() {
  const diseases            = useAppStoreV2(s => s.diseases)
  const applyWizardAnswers  = useAppStoreV2(s => s.applyWizardAnswers)
  const setWizardDone       = useAppStoreV2(s => s.setWizardDone)
  const getScreeningCards   = useAppStoreV2(s => s.getScreeningCards)
  const setLifestyleAnswers = useAppStoreV2(s => s.setLifestyleAnswers)

  const cards  = useMemo(() => getScreeningCards(), [getScreeningCards])
  const groups = useMemo(() => buildWizardGroups(diseases, cards), [diseases, cards])

  const allSteps = useMemo(() => {
    const steps = []
    for (const g of groups) {
      for (const card of g.cards) {
        steps.push({ card, groupKey: g.key, groupLabel: g.label, groupIcon: g.icon })
      }
    }
    return steps
  }, [groups])

  const SCREEN_COUNT   = allSteps.length + LIFESTYLE_QUESTIONS.length
  const LIFESTYLE_START = allSteps.length

  // step: 0..allSteps-1=taramalar, allSteps..allSteps+3=lifestyle, allSteps+4=karne
  // Intro kaldırıldı — kullanıcı onboarding'den geliyor
  const [step, setStep]             = useState(0)
  const [answers, setAnswers]       = useState({})    // tarama cevapları
  const [lifestyle, setLifestyle]   = useState({})    // yaşam tarzı cevapları
  const [animKey, setAnimKey]       = useState(0)
  const advancing                   = useRef(false)

  const isLifestyle = step >= LIFESTYLE_START && step < LIFESTYLE_START + LIFESTYLE_QUESTIONS.length
  const isKarne     = step >= LIFESTYLE_START + LIFESTYLE_QUESTIONS.length
  const isScreening = !isLifestyle && !isKarne

  const currentScreening  = isScreening ? allSteps[step] : null
  const currentLifestyleQ = isLifestyle ? LIFESTYLE_QUESTIONS[step - LIFESTYLE_START] : null

  const goNext = useCallback(() => {
    const nextStep = step + 1
    if (nextStep === LIFESTYLE_START) applyWizardAnswers(answers)
    // Karne ekranına geçerken lifestyle cevaplarını store'a kaydet
    if (nextStep === LIFESTYLE_START + LIFESTYLE_QUESTIONS.length) {
      setLifestyleAnswers(lifestyle)
    }
    setStep(nextStep)
    setAnimKey(k => k + 1)
    advancing.current = false
  }, [step, LIFESTYLE_START, answers, lifestyle, applyWizardAnswers, setLifestyleAnswers])

  // Intro ekranını atla — kullanıcı onboarding'den geliyor, zaten biliyor
  // step=-1 yerine direkt 0'dan başla

  const goPrev = useCallback(() => {
    if (step <= 0) return  // ilk soruda geri yok
    setStep(s => s - 1)
    setAnimKey(k => k + 1)
  }, [step])

  const handleScreeningAnswer = useCallback((cardId, value) => {
    if (advancing.current) return
    advancing.current = true
    setAnswers(prev => ({ ...prev, [cardId]: value }))
    setTimeout(goNext, 300)
  }, [goNext])

  const handleLifestyleAnswer = useCallback((qId, value) => {
    if (advancing.current) return
    advancing.current = true
    setLifestyle(prev => ({ ...prev, [qId]: value }))
    setTimeout(goNext, 300)
  }, [goNext])

  // ── Radar veri hesaplama (shared utility) ────────────────────────────────
  const radarAxes = useMemo(() => computeRadarAxes(cards, lifestyle), [cards, lifestyle])

  const overallScore = useMemo(() => {
    const filled = radarAxes.filter(a => a.score > 0)
    if (!filled.length) return 0
    return Math.round(filled.reduce((s, a) => s + a.score, 0) / filled.length)
  }, [radarAxes])

  // ── KARNE ─────────────────────────────────────────────────────────────────
  if (isKarne) {
    const taramaDone  = cards.filter(c => c.status === 'ok' || c.status === 'soon').length
    const taramaTotal = cards.length
    const taramaEksik = taramaTotal - taramaDone

    // Harf notu
    const grade = computeGrade(overallScore)
    const gColor = getGradeColor(overallScore)
    const gradeMsg = overallScore >= 85
      ? 'Harika — taramalarını takip ediyorsun!'
      : overallScore >= 70
      ? 'İyi gidiyorsun, birkaç tarama eksik.'
      : overallScore >= 55
      ? 'Birkaç önemli tarama gecikmiş.'
      : 'Dikkat — bazı kritik taramalar yapılmamış.'

    // WhatsApp kancası — merak uyandırsın
    const waMsg = `Sağlık karnemdeki notuma baktım… ${grade} aldım 😬 Senin notun ne acaba? Canım ile 2 dakikada öğren: https://canim.uzunyasa.com/app/`

    return (
      <div className="page-enter flex flex-col h-full" style={{ background: '#FAFAF8' }}>
        {/* Header — not büyük ve çarpıcı */}
        <div className="px-5 pt-10 pb-5 shrink-0" style={{ background: '#0D7377' }}>
          <p className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>Sağlık Karnen 🎉</p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white leading-tight">{gradeMsg}</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {taramaEksik > 0 ? `${taramaEksik} tarama eksik` : 'Tüm taramalar güncel'}
              </p>
            </div>
            {/* Büyük harf notu */}
            <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 ml-4"
              style={{ background: 'white' }}>
              <span className="text-4xl font-black leading-none" style={{ color: gColor }}>{grade}</span>
              <span className="text-xs font-bold" style={{ color: gColor }}>{overallScore}/100</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {/* Radar */}
          <div className="bg-white rounded-2xl p-3 border border-gray-100 flex flex-col items-center">
            <RadarChart axes={radarAxes} />
          </div>

          {/* Skor çubukları */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="space-y-2">
              {radarAxes.map(a => {
                const barColor = a.score >= 70 ? '#059669' : a.score >= 40 ? '#D97706' : '#DC2626'
                return (
                  <div key={a.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700">{a.icon} {a.label}</span>
                      <span className="text-xs font-bold" style={{ color: barColor }}>{a.score}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100">
                      <div className="h-1.5 rounded-full" style={{ width: `${a.score}%`, background: barColor }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* PRIMARY: Listemi Gör */}
          <button onClick={() => setWizardDone()}
            className="w-full py-4 rounded-2xl font-bold text-white text-base"
            style={{ background: '#0D7377', minHeight: 52 }}>
            Tarama Listemi Gör →
          </button>

          {/* SECONDARY: Görsel Paylaş */}
          <button onClick={() => shareKarneImage({ axes: radarAxes, grade, overallScore, waMsg })}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold border-2"
            style={{ color: '#25D366', borderColor: '#25D366', background: 'white', minHeight: 48 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            Karneyi Paylaş (WhatsApp / Görsel)
          </button>

          {/* TERTIARY: PDF */}
          <button onClick={() => {
            const profile = useAppStoreV2.getState().profile
            generateScreeningsPdf({ profile, screeningCards: cards })
          }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold border-2"
            style={{ color: '#6B7280', borderColor: '#E5E7EB', background: 'white', minHeight: 44 }}>
            📄 PDF İndir
          </button>
        </div>
      </div>
    )
  }

  // Intro kaldırıldı — direkt tarama sorularına başla

  // ── YAŞAM TARZI SORUSU ────────────────────────────────────────────────────
  if (isLifestyle) {
    const q = currentLifestyleQ
    const sel = lifestyle[q.id]
    const qIdx = step - LIFESTYLE_START

    return (
      <div key={`l-${animKey}`} className="page-enter flex flex-col h-full" style={{ background: '#FAFAF8' }}>
        <div className="px-5 pt-8 pb-4 shrink-0" style={{ background: '#14919B' }}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={goPrev}
              className="text-sm font-medium"
              style={{ color: 'rgba(255,255,255,0.8)', minHeight: 44, minWidth: 44 }}
              aria-label="Geri">← Geri</button>
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {step + 1} / {SCREEN_COUNT}
            </span>
          </div>
          <div className="w-full h-1 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <div className="h-1 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / SCREEN_COUNT) * 100}%`, background: 'white' }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <div>
              <p className="text-white font-extrabold text-base leading-tight">Yaşam Tarzı</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {qIdx + 1} / {LIFESTYLE_QUESTIONS.length}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-3">
              <span className="text-5xl">{q.icon}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 text-center leading-tight mb-8">
              {q.question}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {q.opts.map(opt => {
                const isSelected = sel === opt.value
                return (
                  <button key={opt.value}
                    onClick={() => handleLifestyleAnswer(q.id, opt.value)}
                    className="py-4 rounded-2xl font-bold border-2 transition-all text-center text-sm"
                    style={{
                      minHeight: 56,
                      background: isSelected ? '#14919B' : '#fff',
                      color: isSelected ? '#fff' : '#374151',
                      borderColor: isSelected ? '#14919B' : '#E5E7EB',
                      transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                    }}
                    aria-pressed={isSelected}>
                    {opt.label}
                  </button>
                )
              })}
            </div>
            <button onClick={() => handleLifestyleAnswer(q.id, q.opts[0].value)}
              className="mt-3 text-xs text-gray-400 underline underline-offset-2 text-center w-full">
              Cevaplamak istemiyorum →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── TARAMA SORUSU ─────────────────────────────────────────────────────────
  const { card, groupLabel, groupIcon } = currentScreening
  const selectedAnswer = answers[card.id]

  return (
    <div key={`s-${animKey}`} className="page-enter flex flex-col h-full" style={{ background: '#FAFAF8' }}>
      <div className="px-5 pt-8 pb-4 shrink-0" style={{ background: '#0D7377' }}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={goPrev}
            className="text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.8)', minHeight: 44, minWidth: 44 }}
            aria-label="Geri">← Geri</button>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {step + 1} / {SCREEN_COUNT}
          </span>
        </div>
        <div className="w-full h-1 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.25)' }}>
          <div className="h-1 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / SCREEN_COUNT) * 100}%`, background: 'white' }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{groupIcon}</span>
          <div>
            <p className="text-white font-extrabold text-base leading-tight">{groupLabel}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>taramalarını kontrol edelim</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-2">
            <span className="text-5xl">{card.icon}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 text-center leading-tight mb-1">
            {card.trName}
          </h2>
          <p className="text-gray-500 text-base text-center mb-8">Ne zaman yaptırdınız?</p>
          <div className="grid grid-cols-4 gap-2">
            {ANSWER_OPTS.map(opt => {
              const isSel = selectedAnswer === opt.value
              return (
                <button key={opt.value}
                  onClick={() => handleScreeningAnswer(card.id, opt.value)}
                  className="rounded-2xl font-bold border-2 transition-all text-center"
                  style={{
                    minHeight: 52, fontSize: 13,
                    background: isSel ? '#0D7377' : '#fff',
                    color: isSel ? '#fff' : '#374151',
                    borderColor: isSel ? '#0D7377' : '#E5E7EB',
                    transform: isSel ? 'scale(1.05)' : 'scale(1)',
                  }}
                  aria-pressed={isSel}>
                  {opt.label}
                </button>
              )
            })}
          </div>
          <button onClick={() => handleScreeningAnswer(card.id, 'unknown')}
            className="mt-3 text-xs text-gray-400 underline underline-offset-2 text-center w-full">
            Cevaplamak istemiyorum →
          </button>
        </div>
      </div>
    </div>
  )
}
