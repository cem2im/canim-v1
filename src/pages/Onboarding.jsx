import { useState, useMemo } from 'react'
import useAppStore from '../store/useAppStore'

// ── Step progress bar ─────────────────────────────────────────────────────────
function StepBar({ current, total = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          flex: 1, height: 8, borderRadius: 999,
          background: i < current
            ? 'linear-gradient(90deg, #0D7377, #14B8A6)'
            : '#E5E7EB',
          transition: 'background 0.3s ease',
          boxShadow: i < current ? '0 2px 8px rgba(13,115,119,0.35)' : 'none',
        }} />
      ))}
      <span style={{ fontSize: 11, fontWeight: 800, color: '#0D7377', marginLeft: 4, whiteSpace: 'nowrap' }}>
        {current} / {total}
      </span>
    </div>
  )
}
import { DISEASE_LIST, SCREENINGS, DISEASE_DOCTOR_SCHEDULE, DISEASE_SCREENINGS } from '../data/screenings'
import { buildScreeningList, buildInitialDates, TIME_OPTIONS } from '../utils/engine'

// ── Category buckets for the summary screen ──────────────────────────────────
const SCREENING_CATEGORY = {
  kan_sayimi:'blood', biyokimya:'blood', lipid:'blood', hba1c:'blood',
  tsh:'blood', vitamin_d:'blood', uacr:'blood', hepatit:'blood',
  hiv_tarama:'blood', depresyon_tarama:'vitals',
  tansiyon_olcumu:'vitals', obezite_tarama:'vitals', ekg:'vitals',
  ekokardiyografi:'vitals', dexa:'vitals', fibroscan:'vitals', karin_usg:'vitals',
  mamografi:'cancer', pap_smear:'cancer', prostat:'cancer',
  kolonoskopi:'cancer', kolon_kanseri:'cancer', aort_anevrizması:'cancer',
  genetik_danisman:'cancer',
}
const CATEGORIES = [
  { key:'blood',  label:'Kan Tahlilleri',     icon:'🩸' },
  { key:'vitals', label:'Muayene & İzleme',   icon:'🩺' },
  { key:'cancer', label:'Kanser Taraması',    icon:'🔬' },
  { key:'other',  label:'Özel Taramalar',     icon:'📋' },
]
function freqLabel(months) {
  if (months >= 999) return 'Bir defaya mahsus'
  const map = {1:'Ayda bir',3:'3 ayda bir',6:'6 ayda bir',12:'Yılda bir',
    24:'2 yılda bir',36:'3 yılda bir',60:'5 yılda bir',120:'10 yılda bir'}
  return map[months] || `${months} ayda bir`
}
// Screenings to hide from summary
const HIDDEN_FROM_SUMMARY = new Set(['hiv_tarama'])
// Display name overrides
function screeningDisplayName(s) {
  if (s.id === 'hepatit') return 'Viral Hepatit Taraması'
  return s.trName
}
// Build grouped list: disease groups first, then age/gender base
function buildGroupedScreenings(diseases, allList) {
  const assigned = new Set()
  const groups = []
  for (const diseaseId of diseases) {
    const set = DISEASE_SCREENINGS[diseaseId]
    if (!set) continue
    const meta = DISEASE_LIST.find(d => d.id === diseaseId)
    const items = []
    for (const { id } of set.screenings) {
      if (assigned.has(id)) continue
      const s = allList.find(x => x.id === id)
      if (!s) continue
      assigned.add(id)
      items.push(s)
    }
    if (items.length > 0) {
      groups.push({ key: diseaseId, label: `${meta?.label || diseaseId} Nedeniyle`, icon: meta?.icon || '💊', items })
    }
  }
  // Age/gender base group
  const baseItems = allList.filter(s => !assigned.has(s.id))
  if (baseItems.length > 0) {
    groups.push({ key: 'base', label: 'Yaş ve Cinsiyetinize Göre', icon: '🩺', items: baseItems })
  }
  return groups
}

const ROUTINE_IDS = new Set(['kan_sayimi','biyokimya','lipid','hba1c','tansiyon_olcumu'])

// Maps onboarding time answers to approximate dates
function doctorTimeToDate(timeOption) {
  const today = new Date()
  const map = {
    'this_month': 0,
    '3m': 3,
    '6m': 6,
    '1y': 12,
    '2y': 24,
    'never': null,
  }
  const months = map[timeOption]
  if (months === null || months === undefined) return null
  const d = new Date(today)
  d.setMonth(d.getMonth() - months)
  return d.toISOString().slice(0, 10)
}

export default function Onboarding() {
  const [step, setStep] = useState(1)          // 1=basicInfo, 2=diseases, 3=summary, 4=questions
  const [subPage, setSubPage] = useState(null) // null | 'cancer'
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [openGroup, setOpenGroup] = useState(null) // step 3 — group detail sheet

  // Step 1 state
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState(1970)
  const [birthYearRaw, setBirthYearRaw] = useState('1970')
  const [sex, setSex] = useState(null)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [skipMeasurements, setSkipMeasurements] = useState(false)

  // Step 2 state
  const [diseases, setDiseases] = useState([])

  // Step 3 state
  const [answers, setAnswers] = useState({}) // { screeningId: timeOption }
  const [doctorAnswers, setDoctorAnswers] = useState({}) // { scheduleId: timeOption }
  const [doctorSubStep, setDoctorSubStep] = useState(0) // 0=doctor visit questions, 1=screening questions

  const completeOnboarding = useAppStore(s => s.completeOnboarding)

  const age = new Date().getFullYear() - birthYear
  const profile = { name, birthYear, sex, height: skipMeasurements ? null : (height ? parseInt(height) : null), weight: skipMeasurements ? null : (weight ? parseFloat(weight) : null) }

  // ── STEP 1: Basic Info ────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="min-h-dvh flex flex-col px-6 py-10 page-enter">
      <div className="flex-1">
        <StepBar current={1} total={3} />
        <div className="mb-2 text-xs font-bold text-teal uppercase tracking-widest">Adım 1 / 4</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Sizi Tanıyalım</h1>
        <p className="text-gray-500 text-sm mb-8">Kişiselleştirilmiş tarama takviminiz için gerekli.</p>

        {/* Name */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Adınız</label>
          <input
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 text-lg font-semibold outline-none focus:border-teal transition-colors"
            placeholder="Adınızı girin"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        {/* Birth year — direct number input */}
        <div id="tour-ob-year" className="mb-6">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Doğum Yılınız</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 text-3xl font-black text-center outline-none focus:border-teal transition-colors"
            value={birthYearRaw}
            onChange={e => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              setBirthYearRaw(raw)
              const y = parseInt(raw)
              if (!isNaN(y) && y >= 1920 && y <= new Date().getFullYear() - 1) {
                setBirthYear(y)
              }
            }}
            onBlur={() => {
              const y = parseInt(birthYearRaw)
              const clamped = isNaN(y) ? 1970 : Math.max(1920, Math.min(y, new Date().getFullYear() - 1))
              setBirthYear(clamped)
              setBirthYearRaw(String(clamped))
            }}
            placeholder="1985"
            maxLength={4}
          />
          {age > 0 && age < 120 && (
            <div className="text-center text-sm text-gray-500 mt-2 font-medium">{age} yaşında</div>
          )}
        </div>

        {/* Sex */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Cinsiyet</label>
          <div className="grid grid-cols-2 gap-3">
            {[{v:'F', label:'Kadın', icon:'👩'}, {v:'M', label:'Erkek', icon:'👨'}].map(opt => (
              <button
                key={opt.v}
                onClick={() => setSex(opt.v)}
                className={`py-5 rounded-2xl border-2 text-center font-bold text-base transition-all active:scale-95 ${
                  sex === opt.v ? 'border-teal bg-teal-pale text-teal' : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <div className="text-3xl mb-1">{opt.icon}</div>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Height & Weight — Biliyorum / Bilmiyorum */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Boy & Kilo</label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => setSkipMeasurements(false)}
              className="flex flex-col items-center py-4 rounded-2xl border-2 font-bold transition-all active:scale-95"
              style={!skipMeasurements
                ? {borderColor:'#0D7377', background:'#e8f4f5', color:'#0D7377'}
                : {borderColor:'#E5E7EB', background:'white', color:'#6B7280'}}
            >
              <span className="text-2xl mb-1">📏</span>
              <span className="text-sm font-bold">Biliyorum</span>
            </button>
            <button
              onClick={() => setSkipMeasurements(true)}
              className="flex flex-col items-center py-4 rounded-2xl border-2 font-bold transition-all active:scale-95"
              style={skipMeasurements
                ? {borderColor:'#0D7377', background:'#e8f4f5', color:'#0D7377'}
                : {borderColor:'#E5E7EB', background:'white', color:'#6B7280'}}
            >
              <span className="text-2xl mb-1">🤷</span>
              <span className="text-sm font-bold">Bilmiyorum</span>
            </button>
          </div>
          {!skipMeasurements && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-400 mb-1 font-medium">Boy (cm)</div>
                <input
                  type="number"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 font-semibold outline-none focus:border-teal transition-colors"
                  placeholder="170"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  min="100" max="250"
                />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1 font-medium">Kilo (kg)</div>
                <input
                  type="number"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 font-semibold outline-none focus:border-teal transition-colors"
                  placeholder="70"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  min="30" max="300"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        disabled={!name.trim() || !sex}
        onClick={() => setStep(2)}
        className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-40 active:scale-98"
        style={{background: (!name.trim() || !sex) ? '#9CA3AF' : '#0D7377'}}
      >
        Devam →
      </button>
    </div>
  )

  // ── STEP 2: Disease selection ──────────────────────────────────────────────
  if (step === 2 && subPage === null) {
    const chronicDiseases = DISEASE_LIST.filter(d => !d.group)
    const kanserDiseases  = DISEASE_LIST.filter(d => d.group === 'kanser')
    const selectedCancerCount = kanserDiseases.filter(d => diseases.includes(d.id)).length

    const toggleDisease = id => setDiseases(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

    const handleDiseaseDone = () => {
      setShowConfirmation(true)
      setTimeout(() => {
        setShowConfirmation(false)
        setStep(3)
      }, 1500)
    }

    return (
      <div style={{height:'100dvh', display:'flex', flexDirection:'column', padding:'0 20px', overflow:'hidden', background:'#FAFAF8'}}
        className="page-enter">

        {/* Header */}
        <div style={{paddingTop:40, paddingBottom:8, flexShrink:0}}>
          <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-teal font-semibold text-sm mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Geri
          </button>
          <StepBar current={2} total={3} />
          <h1 className="text-xl font-extrabold text-gray-900 mb-0.5">Sağlık Durumunuz</h1>
          <p className="text-gray-500 text-sm">Birden fazla seçebilirsiniz</p>
        </div>

        {/* Devam — üstte, her zaman görünür */}
        <button
          onClick={handleDiseaseDone}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-base active:scale-98 mb-3"
          style={{background:'linear-gradient(135deg,#0D7377,#14B8A6)', boxShadow:'0 4px 16px rgba(13,115,119,0.3)', flexShrink:0}}
        >
          Devam →
        </button>

        {/* Hiçbiri yok */}
        <button
          onClick={() => { setDiseases([]); handleDiseaseDone() }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-bold text-sm transition-all active:scale-98 mb-3"
          style={{
            borderColor: diseases.length === 0 ? '#0D7377' : '#E5E7EB',
            background: diseases.length === 0 ? '#e8f4f5' : 'white',
            color: diseases.length === 0 ? '#0D7377' : '#6B7280',
            flexShrink: 0,
          }}
        >
          ✓ Aşağıdaki Durumların Hiçbiri Yok
        </button>

        {/* 2-kolon hastalık grid */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, flexShrink:0, marginBottom:8}}>
          {chronicDiseases.map(d => {
            const sel = diseases.includes(d.id)
            return (
              <button
                key={d.id}
                onClick={() => toggleDisease(d.id)}
                className="flex items-center gap-2.5 px-3 py-3 rounded-2xl border-2 font-semibold transition-all active:scale-95 text-left"
                style={sel
                  ? {borderColor:'#0D7377', background:'#e8f4f5', color:'#0D7377'}
                  : {borderColor:'#E5E7EB', background:'white', color:'#374151'}}
              >
                <span className="text-xl shrink-0">{d.icon}</span>
                <span className="text-xs font-bold leading-tight flex-1">{d.label}</span>
                {sel && <span className="text-xs font-black shrink-0" style={{color:'#0D7377'}}>✓</span>}
              </button>
            )
          })}
        </div>

        {/* Ailede Kanser Öyküsü */}
        <button
          onClick={() => setSubPage('cancer')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all active:scale-98"
          style={selectedCancerCount > 0
            ? {borderColor:'#0D7377', background:'#e8f4f5', color:'#0D7377', flexShrink:0}
            : {borderColor:'#E5E7EB', background:'white', color:'#374151', flexShrink:0}}
        >
          <span className="text-xl">🧬</span>
          <div className="flex-1 text-left">
            <div className="font-bold text-sm">Ailede Kanser Öyküsü</div>
            <div className="text-xs mt-0.5" style={{color: selectedCancerCount > 0 ? '#0D7377' : '#9CA3AF'}}>
              {selectedCancerCount > 0 ? `${selectedCancerCount} seçenek işaretlendi ✓` : 'Varsa belirtmek için dokunun'}
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* Confirmation overlay */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 mx-6 text-center shadow-2xl">
              <div className="text-5xl mb-3">✨</div>
              <div className="text-xl font-extrabold text-gray-900 mb-2">Harika!</div>
              <div className="text-gray-500 text-sm">Senin için özel taramalar belirlendi.</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── STEP 2 — CANCER SUB-PAGE ───────────────────────────────────────────────
  if (step === 2 && subPage === 'cancer') {
    const hiddenForSex = sex === 'F'
      ? ['aile_prostat']
      : ['aile_meme_yuksek','aile_meme_orta','aile_yumurtalik']

    const kanserDiseases = DISEASE_LIST
      .filter(d => d.group === 'kanser')
      .filter(d => !hiddenForSex.includes(d.id))

    const toggleDisease = id => setDiseases(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

    const groups = [
      { title: '🎗️ Meme Kanseri',        ids: ['aile_meme_yuksek','aile_meme_orta'] },
      { title: '🟠 Kolorektal Kanser',    ids: ['aile_krc_yuksek','aile_krc_orta','aile_krc_dusuk'] },
      { title: '🔵 Prostat Kanseri',      ids: ['aile_prostat'] },
      { title: '🟣 Yumurtalık Kanseri',   ids: ['aile_yumurtalik'] },
      { title: '🧬 Genetik Mutasyon',     ids: ['brca_lynch'] },
    ].map(g => ({
      ...g,
      items: kanserDiseases.filter(d => g.ids.includes(d.id))
    })).filter(g => g.items.length > 0)

    return (
      <div className="min-h-dvh flex flex-col px-6 py-10 page-enter">
        <button onClick={() => setSubPage(null)} className="text-teal font-semibold text-sm mb-4 self-start">← Geri</button>
        <StepBar current={2} total={3} />
        <div className="mb-1 text-xs font-bold text-teal uppercase tracking-widest">Adım 2 / 4</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Ailede Kanser Öyküsü</h1>
        <div className="mb-6 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800 leading-relaxed">
            Ailenizde kanser öyküsü varsa lütfen aşağıdan ilgili seçenekleri belirtin. Hangi kanser türü ve akrabanızın tanı yaşı önemlidir.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {groups.map(g => (
            <div key={g.title} className="mb-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{g.title}</div>
              <div className="flex flex-col gap-2">
                {g.items.map(d => (
                  <button
                    key={d.id}
                    onClick={() => toggleDisease(d.id)}
                    className="flex items-center gap-3 py-3 px-4 rounded-2xl border-2 font-semibold transition-all active:scale-98 text-left"
                    style={diseases.includes(d.id)
                      ? {borderColor:'#0D7377', background:'#e8f4f5', color:'#0D7377'}
                      : {borderColor:'#E5E7EB', background:'white', color:'#374151'}
                    }
                  >
                    <span className="text-xl shrink-0">{d.icon}</span>
                    <span className="text-sm leading-snug flex-1">{d.label}</span>
                    {diseases.includes(d.id) && (
                      <span className="font-black shrink-0" style={{color:'#0D7377'}}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="mb-6 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              1. derece akraba: anne, baba, kardeş, çocuk<br/>
              2. derece akraba: büyükanne/baba, hala, teyze, dayı, amca
            </p>
          </div>
        </div>
        <button
          onClick={() => setSubPage(null)}
          className="w-full py-4 rounded-2xl text-white font-bold text-base active:scale-98"
          style={{background:'#0D7377'}}
        >
          Kaydet ve Geri Dön
        </button>
      </div>
    )
  }

  // ── STEP 3: Sizin için belirlendi — interaktif doktor + tetkik checklist ─────
  if (step === 3) {
    const fullList = buildScreeningList(diseases, profile)
    const total = fullList.filter(s => !HIDDEN_FROM_SUMMARY.has(s.id)).length

    // Doctor questions (same logic as old Step 4)
    const chronicDiseaseIds = ['hipertansiyon','diyabet','hiperlipidemi','obezite','yagli_karaciger','kalp_damar','kemik_erimesi']
    const doctorQuestions = []
    const seenDoctors = new Set()
    for (const diseaseId of diseases.filter(d => chronicDiseaseIds.includes(d))) {
      const schedules = DISEASE_DOCTOR_SCHEDULE[diseaseId] || []
      if (schedules.length > 0) {
        const primary = schedules[0]
        if (!seenDoctors.has(primary.doctor)) {
          seenDoctors.add(primary.doctor)
          const diseaseLabel = DISEASE_LIST.find(d => d.id === diseaseId)?.label || diseaseId
          doctorQuestions.push({ ...primary, diseaseId, diseaseLabel })
        }
      }
    }

    const DOCTOR_OPTS = [
      { value: 'this_month', label: 'Bu ay' },
      { value: '3m',         label: '3 ay önce' },
      { value: '6m',         label: '6 ay önce' },
      { value: '1y',         label: '1 yıl önce' },
      { value: '2y',         label: '2 yıl önce' },
      { value: 'never',      label: 'Hiç gitmedim' },
    ]
    const SCREENING_OPTS = [
      { value: 'this_month', label: '1 ay önce' },
      { value: '3m',         label: '3 ay önce' },
      { value: '6m',         label: '6 ay önce' },
      { value: '1y',         label: '12 ay önce' },
      { value: '2y',         label: '2 yıl önce' },
      { value: 'older',      label: 'Daha eski' },
      { value: 'unknown',    label: 'Hatırlamıyorum' },
    ]

    // Auto-fill disease screenings when doctor visit marked
    const handleDoctorAnswer = (q, timeValue) => {
      setDoctorAnswers(prev => ({ ...prev, [q.id]: timeValue }))
      if (timeValue === 'never') return
      const diseaseScreenings = DISEASE_SCREENINGS[q.diseaseId]?.screenings || []
      setAnswers(prev => {
        const updated = { ...prev }
        for (const { id } of diseaseScreenings) {
          if (!updated[id]) updated[id] = timeValue
        }
        return updated
      })
    }

    const setAnswer = (id, val) => setAnswers(prev => ({ ...prev, [id]: val }))

    const finishOnboarding = () => {
      const allAnswers = { ...answers }
      for (const s of fullList) {
        if (!allAnswers[s.id]) allAnswers[s.id] = 'unknown'
      }
      const initialDates = buildInitialDates(fullList, allAnswers)
      const initialDoctorDates = {}
      for (const [scheduleId, timeOption] of Object.entries(doctorAnswers)) {
        const date = doctorTimeToDate(timeOption)
        if (date) initialDoctorDates[scheduleId] = date
      }
      completeOnboarding(
        { name, birthYear, sex,
          height: skipMeasurements ? null : (height ? parseInt(height) : null),
          weight: skipMeasurements ? null : (weight ? parseFloat(weight) : null) },
        diseases, initialDates, initialDoctorDates
      )
    }

    const handleFinish = () => {
      setShowConfetti(true)
      setTimeout(finishOnboarding, 1800)
    }

    // Screenings to show (exclude hidden)
    const screeningRows = fullList.filter(s => !HIDDEN_FROM_SUMMARY.has(s.id))

    return (
      <>
      {showConfetti && <Confetti />}
      <div className="min-h-dvh flex flex-col px-5 page-enter" style={{background:'#FAFAF8', paddingBottom:100}}>

        {/* Header */}
        <div style={{paddingTop:40, paddingBottom:12, flexShrink:0}}>
          <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-teal font-semibold text-sm mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Geri — Bilgileri Düzelt
          </button>
          <StepBar current={3} total={3} />
          <h1 className="text-xl font-extrabold text-gray-900 mb-0.5">Sizin İçin Belirlendi</h1>
          <p className="text-sm text-gray-500">
            {name && <span className="font-semibold text-gray-700">{name} · </span>}
            {age} yaş · {sex === 'F' ? 'Kadın' : 'Erkek'} · {total} tarama
          </p>
        </div>

        {/* ── BÖLÜM 1: Gitmeniz Gereken Doktorlar ──────────────────────────── */}
        {doctorQuestions.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🏥</span>
              <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Gitmeniz Gereken Doktorlar</span>
            </div>
            {doctorQuestions.map(q => {
              const ans = doctorAnswers[q.id]
              const went = ans && ans !== 'never'
              return (
                <div key={q.id} className="mb-3 bg-white rounded-2xl border border-gray-100 px-4 py-3.5"
                  style={{boxShadow:'0 1px 6px rgba(0,0,0,0.04)'}}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-xl shrink-0">🏥</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm">{q.doctor}</div>
                      <div className="text-xs text-gray-400">{q.diseaseLabel} · {q.intervalMonths} ayda bir</div>
                    </div>
                  </div>
                  {/* Gittim / Gitmedim */}
                  {!ans && (
                    <div className="flex gap-2">
                      <button onClick={() => handleDoctorAnswer(q, 'this_month')}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold active:scale-95"
                        style={{background:'linear-gradient(135deg,#0D7377,#14919B)', color:'white', border:'none'}}>
                        ✓ Gittim
                      </button>
                      <button onClick={() => handleDoctorAnswer(q, 'never')}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold active:scale-95"
                        style={{background:'#F3F4F6', color:'#6B7280', border:'none'}}>
                        Gitmedim
                      </button>
                    </div>
                  )}
                  {/* Time chips — Gittim seçildiyse */}
                  {went && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-2">Ne zaman gittiniz?</div>
                      <div className="flex flex-wrap gap-2">
                        {DOCTOR_OPTS.filter(o => o.value !== 'never').map(opt => (
                          <button key={opt.value} onClick={() => handleDoctorAnswer(q, opt.value)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold active:scale-95 transition-all"
                            style={ans === opt.value
                              ? {background:'#0D7377', color:'white'}
                              : {background:'#F3F4F6', color:'#374151'}}>
                            {opt.label}
                          </button>
                        ))}
                        <button onClick={() => handleDoctorAnswer(q, 'never')}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold active:scale-95"
                          style={{background:'#FEF2F2', color:'#DC2626'}}>
                          Gitmedim
                        </button>
                      </div>
                      {went && (
                        <p className="text-xs text-teal mt-2">
                          ✓ İlgili tetkikler otomatik dolduruldu
                        </p>
                      )}
                    </div>
                  )}
                  {/* Gitmedim seçildiyse */}
                  {ans === 'never' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleDoctorAnswer(q, 'this_month')}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold active:scale-95"
                        style={{background:'#F3F4F6', color:'#6B7280', border:'none'}}>
                        ✓ Gittim
                      </button>
                      <button className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                        style={{background:'#374151', color:'white', border:'none'}}>
                        ✓ Gitmedim
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── BÖLÜM 2: Yapmanız Gereken Tetkikler ─────────────────────────── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🔬</span>
            <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Yapmanız Gereken Tetkikler</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Bu tetkikleri daha önce yaptırdınız mı? Yaptırdıysanız ne zaman?</p>
          {screeningRows.map(s => {
            const ans = answers[s.id]
            const done = ans && ans !== 'no' && ans !== 'unknown'
            const notDone = ans === 'no' || ans === 'unknown'
            return (
              <div key={s.id} className="mb-2.5 bg-white rounded-2xl border border-gray-100 px-4 py-3"
                style={{boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-lg shrink-0">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm leading-tight">{s.trName}</div>
                    <div className="text-xs text-gray-400">{freqLabel(s.frequencyMonths)}</div>
                  </div>
                </div>
                {/* Yaptım / Yapmadım — initial */}
                {!ans && (
                  <div className="flex gap-2">
                    <button onClick={() => setAnswer(s.id, 'this_month')}
                      className="flex-1 py-2 rounded-xl text-xs font-bold active:scale-95"
                      style={{background:'linear-gradient(135deg,#0D7377,#14919B)', color:'white', border:'none'}}>
                      ✓ Yaptım
                    </button>
                    <button onClick={() => setAnswer(s.id, 'no')}
                      className="flex-1 py-2 rounded-xl text-xs font-bold active:scale-95"
                      style={{background:'#F3F4F6', color:'#6B7280', border:'none'}}>
                      Yapmadım
                    </button>
                  </div>
                )}
                {/* Yapmadım seçildiyse */}
                {notDone && (
                  <div className="flex gap-2">
                    <button onClick={() => setAnswer(s.id, 'this_month')}
                      className="flex-1 py-2 rounded-xl text-xs font-bold active:scale-95"
                      style={{background:'#F3F4F6', color:'#6B7280', border:'none'}}>
                      Yaptım
                    </button>
                    <button className="flex-1 py-2 rounded-xl text-xs font-bold"
                      style={{background:'#374151', color:'white', border:'none'}}>
                      ✓ Yapmadım
                    </button>
                  </div>
                )}
                {/* Yaptım + tarih seçimi */}
                {done && (
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {SCREENING_OPTS.map(opt => (
                        <button key={opt.value} onClick={() => setAnswer(s.id, opt.value)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold active:scale-95 transition-all"
                          style={ans === opt.value
                            ? {background:'#0D7377', color:'white'}
                            : {background:'#F3F4F6', color:'#374151'}}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setAnswer(s.id, 'no')}
                      className="text-xs text-gray-400 underline">
                      Aslında yapmadım
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto px-5 pb-8 pt-4"
        style={{background:'linear-gradient(to top, #FAFAF8 70%, transparent)'}}>
        <button onClick={handleFinish}
          className="w-full py-4 rounded-2xl text-white font-bold text-base active:scale-98"
          style={{background:'linear-gradient(135deg,#0D7377,#14919B)', boxShadow:'0 4px 20px rgba(13,115,119,0.35)'}}>
          Canım'ı Hazırla 🚀
        </button>
      </div>
      </>
    )
  }

  return null
}
// ── Confetti component ─────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#0D7377','#14B8A6','#F59E0B','#EC4899','#8B5CF6','#10B981','#F97316','#06B6D4']

function Confetti() {
  const pieces = useMemo(() => (
    Array.from({ length: 72 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: `${(i / 72) * 100 + (Math.random() - 0.5) * 8}%`,
      delay: `${(Math.random() * 0.7).toFixed(2)}s`,
      dur:   `${(1.6 + Math.random() * 1.4).toFixed(2)}s`,
      size:  `${6 + Math.floor(Math.random() * 8)}px`,
      isCircle: i % 3 === 0,
    }))
  ), [])

  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9999, overflow:'hidden' }}>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            '--dur': p.dur,
            '--delay': p.delay,
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}
