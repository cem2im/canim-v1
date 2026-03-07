import { useState } from 'react'
import useAppStore from '../store/useAppStore'
import { DISEASE_LIST, SCREENINGS, DISEASE_DOCTOR_SCHEDULE } from '../data/screenings'
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
  const map = {1:'Ayda bir',3:'3 ayda bir',6:'6 ayda bir',12:'Yılda bir',
    24:'2 yılda bir',36:'3 yılda bir',60:'5 yılda bir',120:'10 yılda bir'}
  return map[months] || `${months} ayda bir`
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
  const [step, setStep] = useState(0)          // 0=welcome, 1=basicInfo, 2=diseases, 3=screenings, 4=done
  const [subPage, setSubPage] = useState(null) // null | 'cancer'
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Step 1 state
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState(1970)
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

  // ── STEP 0: Welcome ──────────────────────────────────────────────────────
  if (step === 0) return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-10 page-enter" style={{background:'linear-gradient(160deg, #e8f4f5 0%, #FAFAF8 60%)'}}>
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-lg" style={{background:'linear-gradient(135deg, #0D7377, #14919B)'}}>
          <span className="text-white text-3xl font-black">C</span>
        </div>
        <span className="text-3xl font-black text-gray-800 tracking-tight">Canım</span>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
          Taramalarını<br/>Kaçırma
        </h1>
        <p className="text-gray-500 text-base leading-relaxed max-w-xs">
          Yaşına, cinsiyetine ve hastalıklarına göre hangi taramaları ne zaman yaptırman gerektiğini gösteren ücretsiz uygulama.
        </p>
      </div>

      <div className="w-full max-w-xs">
        <button
          onClick={() => setStep(1)}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-98 transition-all"
          style={{background:'linear-gradient(135deg, #0D7377, #14919B)'}}
        >
          Başla →
        </button>
        <p className="text-xs text-gray-400 text-center mt-4">
          Ücretsiz · Kayıt gerekmez · Verileriniz yalnızca cihazınızda
        </p>
      </div>
    </div>
  )

  // ── STEP 1: Basic Info ────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="min-h-dvh flex flex-col px-6 py-10 page-enter">
      <button onClick={() => setStep(0)} className="text-teal font-semibold text-sm mb-6 self-start">← Geri</button>

      <div className="flex-1">
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

        {/* Birth year */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Doğum Yılınız</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setBirthYear(y => y - 1)}
              className="w-14 h-14 rounded-2xl border-2 border-gray-200 bg-white text-2xl font-bold text-gray-700 flex items-center justify-center active:scale-95"
            >−</button>
            <div className="flex-1 text-center">
              <div className="text-3xl font-black text-gray-900">{birthYear}</div>
              <div className="text-sm text-gray-400">{age} yaşında</div>
            </div>
            <button
              onClick={() => setBirthYear(y => Math.min(y + 1, new Date().getFullYear() - 1))}
              className="w-14 h-14 rounded-2xl border-2 border-gray-200 bg-white text-2xl font-bold text-gray-700 flex items-center justify-center active:scale-95"
            >+</button>
          </div>
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

        {/* Height & Weight — optional */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Boy & Kilo (İsteğe Bağlı)</label>
            <button
              onClick={() => setSkipMeasurements(v => !v)}
              className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
              style={skipMeasurements ? {background:'#0D7377', color:'white'} : {background:'#f3f4f6', color:'#6B7280'}}
            >
              {skipMeasurements ? '✓ Şu an bilmiyorum' : 'Şu an bilmiyorum'}
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
      <div className="min-h-dvh flex flex-col px-6 py-10 page-enter">
        <button onClick={() => setStep(1)} className="text-teal font-semibold text-sm mb-6 self-start">← Geri</button>
        <div className="mb-2 text-xs font-bold text-teal uppercase tracking-widest">Adım 2 / 4</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Sağlık Durumunuz</h1>
        <p className="text-gray-500 text-sm mb-6">Hangi sağlık sorunlarınız var?<br/>Birden fazla seçebilirsiniz.</p>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {/* Kronik Hastalıklar */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-base">💊</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Kronik Hastalıklar</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {chronicDiseases.map(d => (
              <button
                key={d.id}
                onClick={() => toggleDisease(d.id)}
                className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border-2 font-semibold transition-all active:scale-95 ${
                  diseases.includes(d.id) ? 'border-teal bg-teal-pale text-teal' : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <span className="text-2xl">{d.icon}</span>
                <span className="text-xs text-center leading-tight">{d.label}</span>
                {diseases.includes(d.id) && <span className="text-xs font-black">✓</span>}
              </button>
            ))}
          </div>

          {/* Ailede Kanser Öyküsü */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-base">🧬</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ailede Kanser Öyküsü</span>
          </div>
          <button
            onClick={() => setSubPage('cancer')}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl border-2 transition-all active:scale-98 mb-6"
            style={selectedCancerCount > 0
              ? {borderColor:'#0D7377', background:'#e8f4f5', color:'#0D7377'}
              : {borderColor:'#E5E7EB', background:'white', color:'#374151'}
            }
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧬</span>
              <div className="text-left">
                <div className="font-bold text-sm">Ailede Kanser Öyküsü</div>
                <div className="text-xs mt-0.5" style={{color: selectedCancerCount > 0 ? '#0D7377' : '#9CA3AF'}}>
                  {selectedCancerCount > 0 ? `${selectedCancerCount} seçenek işaretlendi ✓` : 'Varsa belirtmek için dokunun'}
                </div>
              </div>
            </div>
            <span className="text-gray-400 font-bold text-lg">→</span>
          </button>
        </div>

        {/* Hiçbirinde Yok */}
        <button
          onClick={() => { setDiseases([]); handleDiseaseDone() }}
          className={`w-full flex items-center justify-center gap-3 py-4 px-4 rounded-2xl border-2 font-bold text-sm transition-all active:scale-98 mb-4 ${
            diseases.length === 0
              ? 'border-teal bg-teal-pale text-teal'
              : 'border-gray-200 bg-white text-gray-500'
          }`}
        >
          <span className="text-xl">✓</span>
          <span>Hiçbirinde Yok — Sağlıklıyım</span>
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

        <button
          onClick={handleDiseaseDone}
          className="w-full py-4 rounded-2xl text-white font-bold text-base active:scale-98"
          style={{background:'#0D7377'}}
        >
          Devam →
        </button>
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
        <button onClick={() => setSubPage(null)} className="text-teal font-semibold text-sm mb-6 self-start">← Geri</button>
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

  // ── STEP 3: Smart Summary Screen ─────────────────────────────────────────
  if (step === 3) {
    const screeningList = buildScreeningList(diseases, profile)
    const grouped = {}
    for (const s of screeningList) {
      const cat = SCREENING_CATEGORY[s.id] || 'other'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(s)
    }
    const total = screeningList.length

    return (
      <div className="min-h-dvh flex flex-col px-6 py-10 page-enter">
        <button onClick={() => setStep(2)} className="text-teal font-semibold text-sm mb-6 self-start">← Geri</button>
        <div className="mb-2 text-xs font-bold text-teal uppercase tracking-widest">Adım 3 / 4</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Sizin İçin Belirlendi</h1>
        <p className="text-gray-500 text-sm mb-1">
          {name && <span className="font-semibold text-gray-700">{name}, </span>}
          {age} yaş · {sex === 'F' ? 'Kadın' : 'Erkek'}
          {diseases.length > 0 && <span> · {diseases.length} tanı</span>}
        </p>
        <div className="mb-6 px-4 py-3 rounded-2xl flex items-center gap-3" style={{background:'linear-gradient(135deg,#e8f4f5,#f0fafa)', border:'1px solid #b2dfdb'}}>
          <span className="text-2xl">📋</span>
          <div>
            <div className="font-bold text-gray-900 text-sm">{total} tarama ve kontrol belirlendi</div>
            <div className="text-xs text-gray-500">Yaş, cinsiyet ve sağlık durumunuza göre kişiselleştirildi</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-5 pb-4">
          {CATEGORIES.map(({ key, label, icon }) => {
            const items = grouped[key]
            if (!items || items.length === 0) return null
            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{icon}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'#e8f4f5', color:'#0D7377'}}>{items.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-gray-100">
                      <span className="text-xl shrink-0">{s.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm leading-tight">{s.trName}</div>
                        {s.why && <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{s.why}</div>}
                      </div>
                      <div className="text-xs font-bold shrink-0 px-2 py-1 rounded-xl" style={{background:'#f3f4f6', color:'#6B7280'}}>
                        {freqLabel(s.frequencyMonths)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 mb-3 px-3 py-2 rounded-xl text-center" style={{background:'#fffbeb', border:'1px solid #fde68a'}}>
          <p className="text-xs text-amber-700">Sonraki adımda bu taramaları en son ne zaman yaptırdığınızı soracağız.</p>
        </div>

        <button
          onClick={() => setStep(4)}
          className="w-full py-4 rounded-2xl text-white font-bold text-base active:scale-98"
          style={{background:'#0D7377'}}
        >
          Devam — Tarihleri Belirle →
        </button>
      </div>
    )
  }

  // ── STEP 4: Doctor visit questions → then special screenings ────────────────
  if (step === 4) {
    const screeningList = buildScreeningList(diseases, profile)
    const specialScreenings = screeningList
      .filter(s => s.layer === 2 && s.weight >= 2 && !ROUTINE_IDS.has(s.id))
      .slice(0, 5)

    // Primary doctor entries for each selected disease
    const chronicDiseaseIds = ['hipertansiyon','diyabet','hiperlipidemi','obezite','yagli_karaciger','kalp_damar','kemik_erimesi']
    const doctorQuestions = []
    const seenDoctors = new Set()
    const diseasesToAsk = diseases.filter(d => chronicDiseaseIds.includes(d))
    for (const diseaseId of diseasesToAsk) {
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

    const setDoctorAnswer = (scheduleId, val) => setDoctorAnswers(prev => ({...prev, [scheduleId]: val}))
    const setAnswer = (id, val) => setAnswers(prev => ({...prev, [id]: val}))

    const handleFinish = () => {
      const fullList = buildScreeningList(diseases, profile)
      const allAnswers = {...answers}
      for (const s of fullList) {
        if (!allAnswers[s.id]) allAnswers[s.id] = 'unknown'
      }
      const initialDates = buildInitialDates(fullList, allAnswers)

      // Build doctor visit dates from onboarding answers
      const initialDoctorDates = {}
      for (const [scheduleId, timeOption] of Object.entries(doctorAnswers)) {
        const date = doctorTimeToDate(timeOption)
        if (date) initialDoctorDates[scheduleId] = date
      }

      completeOnboarding(
        { name, birthYear, sex, height: skipMeasurements ? null : (height ? parseInt(height) : null), weight: skipMeasurements ? null : (weight ? parseFloat(weight) : null) },
        diseases,
        initialDates,
        initialDoctorDates
      )
    }

    // If nothing to ask at all, finish immediately
    if (doctorQuestions.length === 0 && specialScreenings.length === 0) {
      handleFinish()
      return null
    }

    // Sub-step 0: Doctor visit date questions
    if (doctorSubStep === 0 && doctorQuestions.length > 0) {
      const DOCTOR_TIME_OPTIONS = [
        { value: 'this_month', label: 'Bu ay' },
        { value: '3m', label: '3 ay önce' },
        { value: '6m', label: '6 ay önce' },
        { value: '1y', label: '1 yıl önce' },
        { value: '2y', label: '2 yıl önce' },
        { value: 'never', label: 'Hiç gitmedim' },
      ]
      return (
        <div className="min-h-dvh flex flex-col px-6 py-10 page-enter">
          <button onClick={() => setStep(3)} className="text-teal font-semibold text-sm mb-6 self-start">← Geri</button>
          <div className="mb-2 text-xs font-bold text-teal uppercase tracking-widest">Adım 4 / 4</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Doktor Ziyaretleriniz</h1>
          <p className="text-gray-500 text-sm mb-6">Hastalıklarınız için en son ne zaman doktora gittiniz?</p>

          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {doctorQuestions.map(q => (
              <div key={q.id} className="mb-5 p-4 rounded-2xl bg-white border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🏥</span>
                  <div>
                    <span className="font-bold text-gray-900 text-sm">{q.doctor}</span>
                    <div className="text-xs text-gray-400">{q.diseaseLabel}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">En son ne zaman gittin?</p>
                <div className="flex flex-wrap gap-2">
                  {DOCTOR_TIME_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDoctorAnswer(q.id, opt.value)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                      style={doctorAnswers[q.id] === opt.value
                        ? {background:'#0D7377', color:'white'}
                        : {background:'#f3f4f6', color:'#374151'}}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              if (specialScreenings.length > 0) {
                setDoctorSubStep(1)
              } else {
                handleFinish()
              }
            }}
            className="w-full py-4 rounded-2xl text-white font-bold text-base mt-4 active:scale-98"
            style={{background:'#0D7377'}}
          >
            {specialScreenings.length > 0 ? 'Devam →' : 'Canım\'ı Hazırla 🚀'}
          </button>
        </div>
      )
    }

    // Sub-step 1 (or 0 if no doctor questions): Special screenings
    if (specialScreenings.length === 0) {
      handleFinish()
      return null
    }

    return (
      <div className="min-h-dvh flex flex-col px-6 py-10 page-enter">
        <button
          onClick={() => doctorQuestions.length > 0 ? setDoctorSubStep(0) : setStep(3)}
          className="text-teal font-semibold text-sm mb-6 self-start"
        >← Geri</button>
        <div className="mb-2 text-xs font-bold text-teal uppercase tracking-widest">Adım 4 / 4</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Son Kontroller</h1>
        <p className="text-gray-500 text-sm mb-2">Bu özel taramaları yaptırdınız mı?</p>
        <div className="mb-6 px-3 py-2 rounded-xl" style={{background:'#eff6ff', border:'1px solid #bfdbfe'}}>
          <p className="text-xs" style={{color:'#1d4ed8'}}>💡 Kan testleri ve kan basıncı gibi rutin taramalar doktorunuz takip ettiğinden burada sorulmaz.</p>
        </div>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {specialScreenings.map(s => (
            <div key={s.id} className="mb-4 p-4 rounded-2xl bg-white border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{s.icon}</span>
                <span className="font-bold text-gray-900 text-sm">{s.trName}</span>
              </div>
              {s.why && <p className="text-xs text-gray-400 mb-3 leading-relaxed">{s.why}</p>}
              <div className="text-xs font-semibold text-gray-500 mb-2">Yaptırdınız mı?</div>
              <div className="flex flex-wrap gap-2">
                {answers[s.id] && answers[s.id] !== 'no' ? (
                  <div className="w-full">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {[
                        { value: 'this_month', label: 'Bu ay' },
                        { value: '6m', label: '6 ay önce' },
                        { value: '1y', label: '1 yıl önce' },
                        { value: '2y', label: '2 yıl önce' },
                        { value: 'older', label: '5+ yıl önce' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setAnswer(s.id, opt.value)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                          style={answers[s.id] === opt.value ? {background:'#0D7377', color:'white'} : {background:'#f3f4f6', color:'#374151'}}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setAnswer(s.id, 'no')}
                      className="text-xs text-gray-400 underline"
                    >Hayır / Hatırlamıyorum</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAnswer(s.id, 'this_month')}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                      style={{background:'#0D7377', color:'white'}}
                    >
                      Evet →
                    </button>
                    <button
                      onClick={() => setAnswer(s.id, 'no')}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 active:scale-95"
                    >
                      Hayır / Hatırlamıyorum
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleFinish}
          className="w-full py-4 rounded-2xl text-white font-bold text-base mt-4 active:scale-98"
          style={{background:'#0D7377'}}
        >
          Canım'ı Hazırla 🚀
        </button>
      </div>
    )
  }

  return null
}
