import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { DISEASE_LIST } from '../data/screenings'
import { buildScreeningList } from '../utils/engine'
import useAppStoreV2 from '../store/useAppStoreV2'

// Disease IDs we surface (in order), with custom labels/icons
const DISEASE_ROWS = [
  { id: 'hipertansiyon',   label: 'Hipertansiyon',          icon: '🫀' },
  { id: 'diyabet',         label: 'Diyabet',                icon: '🩸' },
  { id: 'hiperlipidemi',   label: 'Yüksek Kolesterol',      icon: '💊' },
  { id: 'yagli_karaciger', label: 'Yağlı Karaciğer',        icon: '🫁' },
  { id: 'kalp_damar',      label: 'Kalp / Damar Hastalığı', icon: '❤️' },
  { id: 'kemik_erimesi',   label: 'Kemik Erimesi',          icon: '🦴' },
  { id: 'bobrek_hastaligi',label: 'Böbrek Hastalığı',       icon: '🫘' },
  { id: 'obezite',         label: 'Obezite / Fazla Kilo',   icon: '⚖️' },
]

// Cancer history IDs in order of display
const CANCER_IDS = [
  { id: 'aile_krc_yuksek',  label: '🟠 Kolorektal — 1. derece akraba, 60 yaş altı', sexFilter: null },
  { id: 'aile_krc_orta',    label: '🟠 Kolorektal — 1. derece akraba, herhangi yaş', sexFilter: null },
  { id: 'aile_meme_yuksek', label: '🩷 Meme Kanseri — 1. derece, 50 yaş altı',       sexFilter: 'F' },
  { id: 'aile_meme_orta',   label: '🩷 Meme Kanseri — 1. derece, 50 yaş ve üstü',    sexFilter: 'F' },
  { id: 'aile_prostat',     label: '🔵 Prostat Kanseri — 1. derece akraba',           sexFilter: 'M' },
  { id: 'aile_yumurtalik',  label: '🟣 Yumurtalık Kanseri',                          sexFilter: 'F' },
  { id: 'aile_pankreas',    label: '🟤 Pankreas Kanseri',                            sexFilter: null },
  { id: 'brca_lynch',       label: '🧬 BRCA/Lynch Mutasyonu',                        sexFilter: null },
]

const validDiseaseIds = new Set(DISEASE_LIST.map(d => d.id))

// BMI Calculator Bottom Sheet
function BMISheet({ onClose, onApply, initialSelected }) {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const bmi = height && weight ? (parseFloat(weight) / ((parseFloat(height) / 100) ** 2)) : null
  const bmiValid = bmi && isFinite(bmi) && bmi > 0

  let bmiLabel = ''
  let bmiColor = ''
  let shouldSelect = false
  if (bmiValid) {
    if (bmi < 25) { bmiLabel = 'Normal kiloda görünüyorsunuz'; bmiColor = 'text-green-700' }
    else if (bmi < 30) { bmiLabel = `Fazla kilo (BMI: ${bmi.toFixed(1)})`; bmiColor = 'text-amber-700'; shouldSelect = true }
    else { bmiLabel = `Obezite (BMI: ${bmi.toFixed(1)})`; bmiColor = 'text-red-700'; shouldSelect = true }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label="BMI Hesaplayıcı">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6 max-h-[70dvh] overflow-y-auto" style={{maxWidth:480,margin:'0 auto'}}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-4">BMI Hesaplayıcı</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="bmi-height" className="block text-sm font-medium text-gray-700 mb-1">Boy (cm)</label>
            <input id="bmi-height" type="text" inputMode="decimal" value={height}
              onChange={e => setHeight(e.target.value)} placeholder="170"
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label htmlFor="bmi-weight" className="block text-sm font-medium text-gray-700 mb-1">Kilo (kg)</label>
            <input id="bmi-weight" type="text" inputMode="decimal" value={weight}
              onChange={e => setWeight(e.target.value)} placeholder="70"
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          {bmiValid && (
            <p className={`text-base font-semibold ${bmiColor}`} role="status">{bmiLabel}</p>
          )}
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-300 text-gray-700 font-semibold">İptal</button>
          <button onClick={() => { onApply(shouldSelect); onClose() }}
            className="flex-1 py-3 rounded-2xl font-semibold text-white"
            style={{background:'#0D7377'}}>Uygula</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Cancer History Bottom Sheet
function CancerSheet({ sex, selectedCancerIds, onToggle, onClose }) {
  const filtered = CANCER_IDS.filter(c => {
    if (!validDiseaseIds.has(c.id)) return false
    if (c.sexFilter && c.sexFilter !== sex) return false
    return true
  })

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label="Ailede Kanser Öyküsü">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6 max-h-[70dvh] overflow-y-auto" style={{maxWidth:480,margin:'0 auto'}}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Ailede Kanser Öyküsü</h2>
        <p className="text-gray-600 text-sm mb-4">Birden fazla seçebilirsiniz</p>
        <div className="flex flex-wrap gap-2">
          {filtered.map(c => {
            const selected = selectedCancerIds.includes(c.id)
            return (
              <button key={c.id} onClick={() => onToggle(c.id)}
                className={`px-3 py-2 rounded-2xl text-sm font-medium border transition-colors ${selected ? 'text-white border-transparent' : 'bg-gray-100 text-gray-800 border-gray-200'}`}
                style={selected ? {background:'#0D7377', minHeight:44} : {minHeight:44}}
                aria-pressed={selected}>{c.label}</button>
            )
          })}
        </div>
        <button onClick={onClose} className="mt-6 w-full py-3 rounded-2xl font-semibold text-white" style={{background:'#0D7377'}}>Tamam</button>
      </div>
    </div>,
    document.body
  )
}

export default function OnboardingV2() {
  const completeOnboarding = useAppStoreV2(s => s.completeOnboarding)
  const [step, setStep] = useState(1)

  // Step 1 state
  const [birthYear, setBirthYear] = useState('')
  const yearInputRef = useRef(null)
  useEffect(() => { if (step === 1 && yearInputRef.current) yearInputRef.current.focus() }, [step])

  const currentYear = new Date().getFullYear()
  const yearNum = parseInt(birthYear)
  const yearValid = !isNaN(yearNum) && yearNum >= 1920 && yearNum <= 2010
  const age = yearValid ? currentYear - yearNum : null

  // Step 2 state
  const [sex, setSex] = useState(null)

  // Step 3 state
  const [selectedDiseases, setSelectedDiseases] = useState([])
  const [smokingStatus, setSmokingStatus] = useState(null)
  const [showBMISheet, setShowBMISheet] = useState(false)
  const [showCancerSheet, setShowCancerSheet] = useState(false)
  const [smokingError, setSmokingError] = useState(false)

  const toggleDisease = (id) => {
    setSelectedDiseases(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const selectedCancerIds = selectedDiseases.filter(d =>
    CANCER_IDS.some(c => c.id === d)
  )
  const cancerCount = selectedCancerIds.length

  const handleCancerToggle = (id) => {
    setSelectedDiseases(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleListemiGoster = () => {
    if (!smokingStatus) { setSmokingError(true); return }
    setSmokingError(false)
    setStep(4)
  }

  // Step 4
  const screeningCount = (() => {
    if (!yearValid || !sex) return 0
    const profile = { birthYear: yearNum, sex }
    const allDiseases = selectedDiseases.filter(d => validDiseaseIds.has(d))
    return buildScreeningList(allDiseases, profile).length
  })()

  const handleComplete = () => {
    const profile = { birthYear: yearNum, sex }
    const allDiseases = selectedDiseases.filter(d => validDiseaseIds.has(d))
    completeOnboarding(profile, allDiseases, smokingStatus)
  }

  // Rows to display (filter out unknown disease IDs)
  const visibleDiseaseRows = DISEASE_ROWS.filter(d => {
    if (d.id === 'obezite') return true // always show
    return validDiseaseIds.has(d.id)
  })

  return (
    <div className="min-h-dvh flex flex-col" style={{background:'#FAFAF8'}}>
      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={4}
          aria-label={`Adım ${step} / 4`}
          className="h-1 transition-all duration-500"
          style={{width:`${(step/4)*100}%`, background:'#0D7377'}}
        />
      </div>

      {/* ── STEP 1 — Doğum Yılı ── */}
      {step === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 page-enter">
          <p className="text-gray-600 text-sm mb-2">Adım 1 / 4</p>
          <h1 className="text-3xl font-bold text-center mb-8" style={{color:'#0D7377'}}>Doğum yılınız?</h1>
          <label htmlFor="birth-year" className="sr-only">Doğum yılı</label>
          <input
            id="birth-year"
            ref={yearInputRef}
            type="text"
            inputMode="numeric"
            value={birthYear}
            onChange={e => setBirthYear(e.target.value.replace(/\D/g,'').slice(0,4))}
            placeholder="1985"
            maxLength={4}
            className="text-center text-5xl font-bold w-48 border-b-4 border-gray-300 bg-transparent focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 py-2 transition-colors"
            style={yearValid ? {borderColor:'#0D7377'} : {}}
            aria-describedby="year-hint"
          />
          <p id="year-hint" className="mt-4 text-xl text-gray-600 min-h-[2rem]">
            {yearValid ? `${age} yaşında` : (birthYear.length === 4 && !yearValid ? <span className="text-red-600" role="alert">Geçerli bir yıl girin (1920–2010)</span> : '')}
          </p>
          <button
            onClick={() => setStep(2)}
            disabled={!yearValid}
            className="mt-10 w-full max-w-xs py-4 rounded-2xl text-lg font-bold text-white transition-all"
            style={yearValid ? {background:'#0D7377'} : {background:'#D1D5DB',color:'#9CA3AF'}}
          >Devam →</button>
        </div>
      )}

      {/* ── STEP 2 — Cinsiyet ── */}
      {step === 2 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 page-enter">
          <p className="text-gray-600 text-sm mb-2">Adım 2 / 4</p>
          <h1 className="text-3xl font-bold text-center mb-10" style={{color:'#0D7377'}}>Cinsiyetiniz?</h1>
          <div className="w-full max-w-xs space-y-4">
            <button onClick={() => { setSex('F'); setStep(3) }}
              className="w-full py-5 rounded-2xl text-2xl font-semibold border-2 transition-all"
              style={{borderColor:'#0D7377',color:'#0D7377',background:'white'}}
              aria-label="Kadın">👩 Kadın</button>
            <button onClick={() => { setSex('M'); setStep(3) }}
              className="w-full py-5 rounded-2xl text-2xl font-semibold border-2 transition-all"
              style={{borderColor:'#0D7377',color:'#0D7377',background:'white'}}
              aria-label="Erkek">👨 Erkek</button>
          </div>
          <button onClick={() => setStep(1)} className="mt-8 text-gray-600 text-sm underline">← Geri</button>
        </div>
      )}

      {/* ── STEP 3 — Sağlık Durumu ── */}
      {step === 3 && (
        <div className="flex-1 flex flex-col px-0 page-enter">
          <div className="px-5 pt-6 pb-2">
            <p className="text-gray-600 text-sm mb-1">Adım 3 / 4</p>
            <h1 className="text-2xl font-bold" style={{color:'#0D7377'}}>Sağlık durumunuz?</h1>
            <p className="text-gray-600 text-sm mt-1">Birden fazla seçebilirsiniz</p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-4">
            <div className="space-y-2 mt-2">
              {visibleDiseaseRows.map(d => {
                const selected = selectedDiseases.includes(d.id)
                const isObezite = d.id === 'obezite'
                return (
                  <div key={d.id}
                    className="flex items-center rounded-2xl border transition-all"
                    style={selected ? {background:'#0D7377',borderColor:'#0D7377',color:'white'} : {background:'white',borderColor:'#E5E7EB',color:'#1F2937'}}>
                    <button
                      className="flex-1 flex items-center gap-3 px-4 py-4 text-left"
                      style={{minHeight:44}}
                      onClick={() => toggleDisease(d.id)}
                      aria-pressed={selected}>
                      <span className="text-2xl">{d.icon}</span>
                      <span className="font-medium text-base">{d.label}</span>
                    </button>
                    {isObezite && (
                      <button onClick={() => setShowBMISheet(true)}
                        className="px-4 py-4 text-sm font-bold rounded-r-2xl"
                        style={{color: selected ? 'white' : '#0D7377', minWidth:44, minHeight:44}}
                        aria-label="BMI hesaplayıcıyı aç">?</button>
                    )}
                  </div>
                )
              })}

              {/* Cancer history row */}
              <div
                className="flex items-center rounded-2xl border bg-white transition-all"
                style={{borderColor:'#E5E7EB'}}>
                <button
                  className="flex-1 flex items-center gap-3 px-4 py-4 text-left"
                  style={{minHeight:44}}
                  onClick={() => setShowCancerSheet(true)}>
                  <span className="text-2xl">🧬</span>
                  <div>
                    <span className="font-medium text-base">Ailede Kanser Öyküsü</span>
                    {cancerCount > 0 && (
                      <p className="text-sm mt-0.5" style={{color:'#0D7377'}}>{cancerCount} seçenek işaretlendi ✓</p>
                    )}
                  </div>
                </button>
                <span className="px-4 text-gray-600 text-lg">›</span>
              </div>
            </div>

            {/* Smoking */}
            <div className="mt-6">
              <p className="font-semibold text-gray-800 mb-3">Sigara kullanıyor musunuz?</p>
              <div className="flex gap-2">
                {[
                  { id: 'yes', label: '🚬 Evet' },
                  { id: 'no',  label: '✓ Hayır' },
                  { id: 'quit',label: '⏳ Bıraktım' },
                ].map(opt => (
                  <button key={opt.id}
                    onClick={() => { setSmokingStatus(opt.id); setSmokingError(false) }}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold border transition-all"
                    style={smokingStatus === opt.id
                      ? {background:'#0D7377',color:'white',borderColor:'#0D7377'}
                      : {background:'white',color:'#374151',borderColor:'#D1D5DB'}}
                    aria-pressed={smokingStatus === opt.id}>{opt.label}</button>
                ))}
              </div>
              {smokingError && (
                <p className="text-red-600 text-sm mt-2" role="alert">Sigara sorusunu yanıtlayın</p>
              )}
            </div>
          </div>

          <div className="px-5 pb-6 pt-2 border-t border-gray-100 bg-white/80 backdrop-blur">
            <button onClick={handleListemiGoster}
              className="w-full py-4 rounded-2xl text-lg font-bold text-white"
              style={{background:'#0D7377'}}>
              Listemi Göster →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4 — Hazır ── */}
      {step === 4 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 page-enter text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6 animate-[popIn_0.5s_ease-out]"
            style={{background:'linear-gradient(135deg,#0D7377,#14919B)'}}>
            ✓
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{color:'#0D7377'}}>Hazır! 🎉</h1>
          <p className="text-2xl font-semibold text-gray-800 mb-2">Senin için {screeningCount} tarama belirlendi</p>
          <p className="text-gray-600 text-base max-w-xs">Düzenli takip, hastalıkları erken yakalamanın en etkili yolu.</p>
          <button onClick={handleComplete}
            className="mt-10 w-full max-w-xs py-4 rounded-2xl text-lg font-bold text-white shadow-lg"
            style={{background:'linear-gradient(135deg,#0D7377,#14919B)'}}>
            Listemi Gör →
          </button>
        </div>
      )}

      {/* Bottom sheets */}
      {showBMISheet && (
        <BMISheet
          onClose={() => setShowBMISheet(false)}
          onApply={(shouldSelect) => {
            if (shouldSelect && !selectedDiseases.includes('obezite')) {
              setSelectedDiseases(prev => [...prev, 'obezite'])
            }
          }}
          initialSelected={selectedDiseases.includes('obezite')}
        />
      )}
      {showCancerSheet && (
        <CancerSheet
          sex={sex}
          selectedCancerIds={selectedCancerIds}
          onToggle={handleCancerToggle}
          onClose={() => setShowCancerSheet(false)}
        />
      )}
    </div>
  )
}
