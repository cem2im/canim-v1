import { useState } from 'react'
import useAppStore from '../store/useAppStore'
import { DISEASE_LIST } from '../data/screenings'
import { buildScreeningList, buildInitialDates, TIME_OPTIONS } from '../utils/engine'

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState(1970)
  const [sex, setSex] = useState(null)
  const [diseases, setDiseases] = useState([])
  const [answers, setAnswers] = useState({}) // { screeningId: timeOption }
  const [labAnswers, setLabAnswers] = useState({})
  const completeOnboarding = useAppStore(s => s.completeOnboarding)

  const age = new Date().getFullYear() - birthYear
  const profile = { name, birthYear, sex }

  // ── STEP 0: Name + Age + Sex ─────────────────────────────────────────────
  if (step === 0) return (
    <div className="min-h-dvh flex flex-col px-6 py-10 page-enter">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'#0D7377'}}>
          <span className="text-white text-lg font-black">C</span>
        </div>
        <span className="text-xl font-black text-gray-800">Canım</span>
      </div>

      <div className="flex-1">
        <div className="mb-2 text-xs font-bold text-teal uppercase tracking-widest">Adım 1 / 3</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Merhaba! 👋</h1>
        <p className="text-gray-500 text-sm mb-8">Sizi tanıyalım.</p>

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
        <div className="mb-8">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Cinsiyet</label>
          <div className="grid grid-cols-2 gap-3">
            {[{v:'F', label:'Kadın', icon:'👩'}, {v:'M', label:'Erkek', icon:'👨'}].map(opt => (
              <button
                key={opt.v}
                onClick={() => setSex(opt.v)}
                className={`py-5 rounded-2xl border-2 text-center font-bold text-base transition-all active:scale-95 ${
                  sex === opt.v
                    ? 'border-teal bg-teal-pale text-teal'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <div className="text-3xl mb-1">{opt.icon}</div>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        disabled={!name.trim() || !sex}
        onClick={() => setStep(1)}
        className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-40 active:scale-98"
        style={{background: (!name.trim() || !sex) ? '#9CA3AF' : '#0D7377'}}
      >
        Devam →
      </button>
    </div>
  )

  // ── STEP 1: Disease selection ───────────────────────────────────────────────
  if (step === 1) {
    const chronicDiseases = DISEASE_LIST.filter(d => !d.group)
    const kanserDiseases  = DISEASE_LIST.filter(d => d.group === 'kanser')

    const toggleDisease = id => setDiseases(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

    return (
      <div className="min-h-dvh flex flex-col px-6 py-10 page-enter">
        <button onClick={() => setStep(0)} className="text-teal font-semibold text-sm mb-6 self-start">← Geri</button>
        <div className="mb-2 text-xs font-bold text-teal uppercase tracking-widest">Adım 2 / 3</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Sağlık Durumunuz</h1>
        <p className="text-gray-500 text-sm mb-6">Hangi sağlık sorunlarınız var?<br/>Birden fazla seçebilirsiniz.</p>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">

          {/* ── Kronik Hastalıklar ── */}
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
                  diseases.includes(d.id)
                    ? 'border-teal bg-teal-pale text-teal'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <span className="text-2xl">{d.icon}</span>
                <span className="text-xs text-center leading-tight">{d.label}</span>
                {diseases.includes(d.id) && (
                  <span className="text-xs font-black">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Ailede Kanser Öyküsü ── */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-base">🧬</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ailede Kanser Öyküsü</span>
          </div>
          <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700 leading-snug">
              Ailenizde kanser öyküsü varsa lütfen aşağıdan ilgili seçenekleri belirtin. Hangi kanser türü ve akrabanızın tanı yaşı önemlidir.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 mb-6 pl-2">
            {kanserDiseases.map(d => (
              <button
                key={d.id}
                onClick={() => toggleDisease(d.id)}
                className={`flex items-center gap-3 py-3 px-3 rounded-xl border-2 font-semibold transition-all active:scale-98 ${
                  diseases.includes(d.id)
                    ? 'border-teal bg-teal-pale text-teal'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                <span className="text-xl shrink-0">{d.icon}</span>
                <span className="text-xs text-left leading-tight flex-1">{d.label}</span>
                {diseases.includes(d.id) && (
                  <span className="text-xs font-black shrink-0">✓</span>
                )}
              </button>
            ))}
          </div>

        </div>

        <div className="mb-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Hiçbir hastalığınız yoksa boş bırakın — yaş ve cinsiyete göre temel taramalarınız oluşturulur.
          </p>
        </div>

        <button
          onClick={() => setStep(2)}
          className="w-full py-4 rounded-2xl text-white font-bold text-base active:scale-98"
          style={{background:'#0D7377'}}
        >
          Devam →
        </button>
      </div>
    )
  }

  // ── STEP 2: Last checkup dates ─────────────────────────────────────────────
  if (step === 2) {
    const screeningList = buildScreeningList(diseases, profile)
    // Group: lab packages + procedural
    const labItems = screeningList.filter(s => ['kan_sayimi','biyokimya','lipid','hba1c','tsh','vitamin_d','b12','idrar','hepatit'].includes(s.id))
    const procItems = screeningList.filter(s => !['kan_sayimi','biyokimya','lipid','hba1c','tsh','vitamin_d','b12','idrar','hepatit'].includes(s.id))

    const setAnswer = (id, val) => setAnswers(prev => ({...prev, [id]: val}))

    const handleFinish = () => {
      const allAnswers = {...answers}
      for (const s of screeningList) {
        if (!allAnswers[s.id]) allAnswers[s.id] = 'unknown'
      }
      const initialDates = buildInitialDates(screeningList, allAnswers)
      completeOnboarding(profile, diseases, initialDates)
    }

    return (
      <div className="min-h-dvh flex flex-col px-6 py-10 page-enter">
        <button onClick={() => setStep(1)} className="text-teal font-semibold text-sm mb-6 self-start">← Geri</button>
        <div className="mb-2 text-xs font-bold text-teal uppercase tracking-widest">Adım 3 / 3</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Son Kontroller</h1>
        <p className="text-gray-500 text-sm mb-6">Yaklaşık olarak ne zaman yaptırdınız?</p>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">

          {/* Lab packages */}
          {labItems.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-700 mb-3">Kan Testleri</h2>
              {labItems.map(s => (
                <ScreeningQuestion key={s.id} screening={s} answer={answers[s.id]} onChange={val => setAnswer(s.id, val)} />
              ))}
            </div>
          )}

          {/* Procedural tests */}
          {procItems.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-700 mb-3">Testler & Muayeneler</h2>
              {procItems.map(s => (
                <ScreeningQuestion key={s.id} screening={s} answer={answers[s.id]} onChange={val => setAnswer(s.id, val)} />
              ))}
            </div>
          )}
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

function ScreeningQuestion({ screening, answer, onChange }) {
  return (
    <div className="mb-4 p-4 rounded-2xl bg-white border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{screening.icon}</span>
        <span className="font-semibold text-gray-900 text-sm">{screening.trName}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {TIME_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              answer === opt.value
                ? 'text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
            style={answer === opt.value ? {background:'#0D7377'} : {}}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
