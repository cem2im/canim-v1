import { useState } from 'react'
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

// ── Year Input (numpad) ───────────────────────────────────────────────────
function YearPicker({ value, onChange }) {
  const currentYear = new Date().getFullYear()
  const MIN_YEAR = 1930
  const MAX_YEAR = currentYear - 10  // en az 10 yaşında

  const [raw, setRaw] = useState(value ? String(value) : '')

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
    setRaw(digits)
    if (digits.length === 4) {
      const y = parseInt(digits, 10)
      if (y >= MIN_YEAR && y <= MAX_YEAR) {
        onChange(y)
      } else {
        onChange(null)
      }
    } else {
      onChange(null)
    }
  }

  const year = raw.length === 4 ? parseInt(raw, 10) : null
  const isValid = year != null && year >= MIN_YEAR && year <= MAX_YEAR
  const isError = raw.length === 4 && !isValid

  return (
    <div style={{ width: '100%', maxWidth: 280, textAlign: 'center' }}>
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]{4}"
        maxLength={4}
        value={raw}
        onChange={handleChange}
        placeholder="örn. 1985"
        autoFocus
        style={{
          width: '100%',
          fontSize: 56,
          fontWeight: 800,
          textAlign: 'center',
          color: isError ? '#EF4444' : isValid ? '#0D7377' : '#1F2937',
          background: 'transparent',
          border: 'none',
          borderBottom: `3px solid ${isError ? '#EF4444' : isValid ? '#0D7377' : '#D1D5DB'}`,
          outline: 'none',
          letterSpacing: '0.1em',
          padding: '8px 0',
          transition: 'border-color 0.2s, color 0.2s',
        }}
        aria-label="Doğum yılı"
        aria-invalid={isError}
      />
      {isError && (
        <p style={{ color: '#EF4444', fontSize: 14, marginTop: 8 }}>
          {raw && parseInt(raw) > MAX_YEAR ? `En fazla ${MAX_YEAR} olabilir` : `${MIN_YEAR}–${MAX_YEAR} arası bir yıl girin`}
        </p>
      )}
    </div>
  )
}

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

// Gift mode label helpers
function getGiftLabels(forParam) {
  const map = {
    anne:  { isim: 'annen',   isimIn: 'annenin',   sex: 'F', year: 1960 },
    baba:  { isim: 'baban',   isimIn: 'babanın',   sex: 'M', year: 1958 },
    es:    { isim: 'eşin',    isimIn: 'eşinin',    sex: null, year: 1975 },
    cocuk: { isim: 'çocuğun', isimIn: 'çocuğunun', sex: null, year: 2005 },
  }
  return map[forParam] || { isim: 'yakının', isimIn: 'yakınının', sex: null, year: 1970 }
}

export default function OnboardingV2() {
  const completeOnboarding = useAppStoreV2(s => s.completeOnboarding)
  const updatePackYears = useAppStoreV2(s => s.updatePackYears)
  const [step, setStep] = useState(1)

  // Gift mode — read URL param once
  const giftFor = new URLSearchParams(window.location.search).get('for')
  const giftMode = !!giftFor
  const giftLabels = giftMode ? getGiftLabels(giftFor) : null

  // Step 1 state — null until user explicitly scrolls/selects
  const [selectedYear, setSelectedYear] = useState(
    giftMode ? giftLabels.year : null
  )
  const currentYear = new Date().getFullYear()
  const yearNum = selectedYear
  const yearValid = selectedYear != null
  const age = selectedYear ? currentYear - selectedYear : null

  // Step 2 state — pre-select sex in gift mode if known
  const [sex, setSex] = useState(giftMode && giftLabels.sex ? giftLabels.sex : null)

  // Step 3 state
  // diseaseAnswers: { [diseaseRowId]: 'var' | 'yok' } — explicit answer per disease row
  const [diseaseAnswers, setDiseaseAnswers] = useState({})
  const [cancerIds, setCancerIds] = useState([])   // multi-select from CancerSheet
  const [smokingStatus, setSmokingStatus] = useState(null)
  const [packYearsInput, setPackYearsInput] = useState('')  // raw numeric string
  const [showBMISheet, setShowBMISheet] = useState(false)
  const [showCancerSheet, setShowCancerSheet] = useState(false)

  const setDiseaseAnswer = (id, val) =>
    setDiseaseAnswers(prev => ({ ...prev, [id]: val }))

  const handleCancerToggle = (id) =>
    setCancerIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const cancerCount = cancerIds.length

  // Derived: all disease IDs that are 'var' + selected cancer IDs
  const selectedDiseases = [
    ...Object.entries(diseaseAnswers).filter(([, v]) => v === 'var').map(([k]) => k),
    ...cancerIds,
  ]

  const visibleDiseaseRows_count = DISEASE_ROWS.filter(d =>
    d.id === 'obezite' || validDiseaseIds.has(d.id)
  ).length
  const allDiseaseAnswered = visibleDiseaseRows_count > 0 &&
    DISEASE_ROWS.filter(d => d.id === 'obezite' || validDiseaseIds.has(d.id))
      .every(d => diseaseAnswers[d.id] != null)
  const step3Valid = allDiseaseAnswered && !!smokingStatus

  const handleListemiGoster = () => {
    if (!step3Valid) return
    setStep(4)
  }

  // Step 4
  const screeningCount = (() => {
    if (!yearValid || !sex) return 0
    const py = parseFloat(packYearsInput)
    const profile = { birthYear: yearNum, sex, smokingStatus, packYears: isNaN(py) ? null : Math.round(py) }
    const allDiseases = selectedDiseases.filter(d => validDiseaseIds.has(d))
    return buildScreeningList(allDiseases, profile).length
  })()

  const [giftSharing, setGiftSharing] = useState(false)

  const handleComplete = () => {
    if (giftMode) {
      setGiftSharing(true)
      return
    }
    const profile = { birthYear: yearNum, sex }
    const allDiseases = selectedDiseases.filter(d => validDiseaseIds.has(d))
    completeOnboarding(profile, allDiseases, smokingStatus)
    const py = parseFloat(packYearsInput)
    if (!isNaN(py) && py > 0) updatePackYears(Math.round(py))
  }

  const handleGiftWhatsApp = () => {
    const isim = giftLabels.isim
    const msg = `${isim.charAt(0).toUpperCase() + isim.slice(1)} için Canım'da sağlık tarama planı oluşturdum — ${screeningCount} tarama belirlendi. Sen de 2 dakikada kendi karnenizi çıkar: https://canim.uzunyasa.com/app/`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
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
        <div className="flex-1 flex flex-col items-center justify-center px-6 page-enter" style={{gap:0}}>
          <p className="text-gray-500 text-sm mb-3">Adım 1 / 4</p>
          <h1 className="text-3xl font-bold text-center mb-1" style={{color:'#0D7377'}}>
            {giftMode ? `${giftLabels.isimIn.charAt(0).toUpperCase() + giftLabels.isimIn.slice(1)} doğum yılı?` : 'Doğum yılınız?'}
          </h1>
          <p className="text-base mb-8" style={{color: yearValid ? '#0D7377' : '#9CA3AF', fontWeight: yearValid ? 700 : 400}}>
            {yearValid ? `${age} yaşında` : '4 rakam girin'}
          </p>
          <YearPicker value={selectedYear} onChange={setSelectedYear} />
          <button
            onClick={() => setStep(2)}
            disabled={!yearValid}
            className="mt-8 w-full max-w-xs py-4 rounded-2xl text-lg font-bold text-white transition-opacity"
            style={{background:'#0D7377', opacity: yearValid ? 1 : 0.35, cursor: yearValid ? 'pointer' : 'not-allowed'}}
          >Devam →</button>
        </div>
      )}

      {/* ── STEP 2 — Cinsiyet ── */}
      {step === 2 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 page-enter">
          <p className="text-gray-600 text-sm mb-2">Adım 2 / 4</p>
          <h1 className="text-3xl font-bold text-center mb-10" style={{color:'#0D7377'}}>
            {giftMode ? `${giftLabels.isimIn.charAt(0).toUpperCase() + giftLabels.isimIn.slice(1)} cinsiyeti?` : 'Cinsiyetiniz?'}
          </h1>
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
          <div className="px-5 pt-4 pb-2">
            <p className="text-gray-500 text-xs mb-0.5">Adım 3 / 4</p>
            <h1 className="text-xl font-bold" style={{color:'#0D7377'}}>
              {giftMode ? `${giftLabels.isimIn.charAt(0).toUpperCase() + giftLabels.isimIn.slice(1)} sağlık durumu?` : 'Sağlık durumunuz?'}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">Her satır için cevap verin</p>
          </div>

          <div className="flex-1 px-4 pb-2 flex flex-col gap-1 overflow-hidden">
            {visibleDiseaseRows.map(d => {
              const ans = diseaseAnswers[d.id]
              const isObezite = d.id === 'obezite'
              return (
                <div key={d.id} className="flex items-center gap-2 bg-white rounded-2xl px-3"
                  style={{minHeight: 46, border: `2px solid ${ans ? '#0D7377' : '#E5E7EB'}`}}>
                  <span className="text-lg shrink-0">{d.icon}</span>
                  <span className="font-semibold text-gray-900 text-sm flex-1 leading-tight">{d.label}</span>
                  {isObezite && (
                    <button onClick={() => setShowBMISheet(true)}
                      className="text-xs font-bold px-1.5 py-1 rounded-lg shrink-0"
                      style={{color:'#0D7377', background:'#e8f4f5'}}
                      aria-label="BMI hesapla">?</button>
                  )}
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => setDiseaseAnswer(d.id, 'var')}
                      className="rounded-xl text-xs font-bold border-2 transition-all px-3"
                      style={{
                        height: 36, minWidth: 44,
                        background: ans === 'var' ? '#0D7377' : '#fff',
                        color: ans === 'var' ? '#fff' : '#374151',
                        borderColor: ans === 'var' ? '#0D7377' : '#E5E7EB',
                      }}
                      aria-pressed={ans === 'var'}>Var</button>
                    <button onClick={() => setDiseaseAnswer(d.id, 'yok')}
                      className="rounded-xl text-xs font-bold border-2 transition-all px-2"
                      style={{
                        height: 36, minWidth: 44,
                        background: ans === 'yok' ? '#6B7280' : '#fff',
                        color: ans === 'yok' ? '#fff' : '#374151',
                        borderColor: ans === 'yok' ? '#6B7280' : '#E5E7EB',
                      }}
                      aria-pressed={ans === 'yok'}>Yok</button>
                  </div>
                </div>
              )
            })}

            {/* Cancer — compact single row */}
            <button onClick={() => setShowCancerSheet(true)}
              className="flex items-center gap-2 bg-white rounded-2xl px-3 w-full text-left"
              style={{minHeight: 46, border: `2px solid ${cancerCount > 0 ? '#0D7377' : '#E5E7EB'}`}}>
              <span className="text-lg shrink-0">🧬</span>
              <span className="font-semibold text-gray-900 text-sm flex-1 leading-tight">Ailede Kanser Öyküsü</span>
              <span className="text-xs font-bold shrink-0" style={{color: cancerCount > 0 ? '#0D7377' : '#9CA3AF'}}>
                {cancerCount > 0 ? `✓ ${cancerCount} seçili` : 'Planınızı önemli ölçüde değiştirebilir →'}
              </span>
            </button>

            {/* Smoking — compact */}
            <div className="bg-white rounded-2xl px-3 py-2"
              style={{border: `2px solid ${smokingStatus ? '#0D7377' : '#E5E7EB'}`}}>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Sigara kullanıyor musunuz?</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'yes',  label: '🚬 Evet' },
                  { id: 'no',   label: '✓ Hayır' },
                  { id: 'quit', label: '⏳ Bıraktım' },
                ].map(opt => (
                  <button key={opt.id}
                    onClick={() => { setSmokingStatus(opt.id); if (opt.id === 'no') setPackYearsInput('') }}
                    className="rounded-xl text-xs font-bold border-2 transition-all py-2"
                    style={{
                      minHeight: 40,
                      background: smokingStatus === opt.id ? '#0D7377' : '#fff',
                      color: smokingStatus === opt.id ? '#fff' : '#374151',
                      borderColor: smokingStatus === opt.id ? '#0D7377' : '#E5E7EB',
                    }}
                    aria-pressed={smokingStatus === opt.id}>{opt.label}</button>
                ))}
              </div>

              {/* Pack-year — yalnızca içen/bırakanlara, yaş 45+ ise daha vurgulu */}
              {(smokingStatus === 'yes' || smokingStatus === 'quit') && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 flex-1">
                      Paket-yıl <span className="text-gray-400">(günde paket × yıl)</span>
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="örn. 20"
                      value={packYearsInput}
                      onChange={e => setPackYearsInput(e.target.value.replace(/\D/g,''))}
                      className="w-20 border rounded-xl px-2 py-1.5 text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-600"
                      style={{borderColor: packYearsInput ? '#0D7377' : '#E5E7EB'}}
                    />
                  </div>
                  {packYearsInput && parseInt(packYearsInput) >= 20 && (age || 0) >= 45 && (
                    <p className="text-xs mt-1.5 font-semibold" style={{color:'#DC2626'}}>
                      ⚠️ ≥20 paket-yıl → Akciğer BT eklenecek
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-white/80 backdrop-blur shrink-0">
            {!step3Valid && (
              <p className="text-center text-xs text-gray-400 mb-1.5">Tüm soruları yanıtlayın</p>
            )}
            <button onClick={handleListemiGoster}
              disabled={!step3Valid}
              className="w-full py-3.5 rounded-2xl text-base font-bold text-white transition-opacity"
              style={{background:'#0D7377', opacity: step3Valid ? 1 : 0.35, cursor: step3Valid ? 'pointer' : 'not-allowed'}}>
              Karnemi Çıkar →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4 — Hazır / Gift Share ── */}
      {step === 4 && !giftSharing && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 page-enter text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6 animate-[popIn_0.5s_ease-out]"
            style={{background:'linear-gradient(135deg,#0D7377,#14919B)'}}>
            ✓
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{color:'#0D7377'}}>Hazır! 🎉</h1>
          <p className="text-2xl font-semibold text-gray-800 mb-2">
            {giftMode
              ? `${giftLabels.isimIn.charAt(0).toUpperCase() + giftLabels.isimIn.slice(1)} için ${screeningCount} tarama belirlendi`
              : `Senin için ${screeningCount} tarama belirlendi`}
          </p>
          <p className="text-gray-600 text-base max-w-xs">Düzenli takip, hastalıkları erken yakalamanın en etkili yolu.</p>
          <button onClick={handleComplete}
            className="mt-10 w-full max-w-xs py-4 rounded-2xl text-lg font-bold text-white shadow-lg"
            style={{background:'linear-gradient(135deg,#0D7377,#14919B)'}}>
            {giftMode ? `${giftLabels.isimIn.charAt(0).toUpperCase() + giftLabels.isimIn.slice(1)} karnesini gönder →` : 'Karnemi Çıkar →'}
          </button>
        </div>
      )}

      {/* ── GIFT SHARE SCREEN ── */}
      {giftSharing && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 page-enter text-center">
          <div className="text-6xl mb-6">💚</div>
          <h1 className="text-3xl font-bold mb-2" style={{color:'#0D7377'}}>
            {giftLabels.isimIn.charAt(0).toUpperCase() + giftLabels.isimIn.slice(1)} karnesi hazır!
          </h1>
          <p className="text-xl font-semibold text-gray-800 mb-1">{screeningCount} tarama belirlendi</p>
          <p className="text-gray-500 text-sm mb-8 max-w-xs">
            Şimdi {giftLabels.isim}e gönder — 2 dakikada kendi karnesini çıkarsın.
          </p>

          {/* WhatsApp share */}
          <button onClick={handleGiftWhatsApp}
            className="w-full max-w-xs py-4 rounded-2xl text-lg font-bold text-white flex items-center justify-center gap-3 mb-4 shadow-lg"
            style={{background:'#25D366'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            WhatsApp'ta Gönder
          </button>

          <button
            onClick={() => {
              const profile = { birthYear: yearNum, sex }
              const allDiseases = selectedDiseases.filter(d => validDiseaseIds.has(d))
              completeOnboarding(profile, allDiseases, smokingStatus)
              const py = parseFloat(packYearsInput)
              if (!isNaN(py) && py > 0) updatePackYears(Math.round(py))
            }}
            className="w-full max-w-xs py-3 rounded-2xl text-base font-semibold border-2"
            style={{borderColor:'#0D7377', color:'#0D7377', background:'white'}}>
            Benim karnem için de oluştur →
          </button>
        </div>
      )}

      {/* Bottom sheets */}
      {showBMISheet && (
        <BMISheet
          onClose={() => setShowBMISheet(false)}
          onApply={(shouldSelect) => {
            setDiseaseAnswer('obezite', shouldSelect ? 'var' : 'yok')
          }}
          initialSelected={diseaseAnswers['obezite'] === 'var'}
        />
      )}
      {showCancerSheet && (
        <CancerSheet
          sex={sex}
          selectedCancerIds={cancerIds}
          onToggle={handleCancerToggle}
          onClose={() => setShowCancerSheet(false)}
        />
      )}
    </div>
  )
}
