import { useState, useEffect, useRef, useCallback } from 'react'
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

// ── Year Picker (drum / scroll wheel) ────────────────────────────────────
// value=null → no selection yet (wheel positioned at 1975 but nothing highlighted)
function YearPicker({ value, onChange }) {
  const YEARS = Array.from({ length: 2006 - 1940 + 1 }, (_, i) => 1940 + i)
  const ITEM_H = 60
  const VISIBLE = 5
  const containerH = ITEM_H * VISIBLE
  const padding = containerH / 2 - ITEM_H / 2

  const scrollRef = useRef(null)
  const debounceRef = useRef(null)

  // Scroll to value on mount; if null, start at 1975 (middle) without selecting
  useEffect(() => {
    const startYear = value ?? 1975
    const idx = YEARS.indexOf(startYear)
    if (idx !== -1 && scrollRef.current) {
      scrollRef.current.scrollTop = idx * ITEM_H
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = useCallback(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!scrollRef.current) return
      const idx = Math.round(scrollRef.current.scrollTop / ITEM_H)
      const clamped = Math.max(0, Math.min(idx, YEARS.length - 1))
      scrollRef.current.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' })
      onChange(YEARS[clamped])
    }, 120)
  }, [onChange, YEARS])

  const scrollTo = (y) => {
    const idx = YEARS.indexOf(y)
    if (idx !== -1) scrollRef.current?.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' })
    onChange(y)
  }

  return (
    <div style={{ position: 'relative', width: 220, height: containerH }}>
      {/* Top fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: padding + ITEM_H * 0.6,
        background: 'linear-gradient(to bottom, #FAFAF8 40%, transparent)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: padding + ITEM_H * 0.6,
        background: 'linear-gradient(to top, #FAFAF8 40%, transparent)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      {/* Selection highlight box — only visible after user has selected */}
      <div style={{
        position: 'absolute', top: '50%', left: 20, right: 20,
        height: ITEM_H, transform: 'translateY(-50%)',
        border: `2.5px solid ${value != null ? '#0D7377' : '#D1D5DB'}`,
        borderRadius: 18,
        pointerEvents: 'none', zIndex: 2,
        transition: 'border-color 0.2s',
      }} />
      {/* Scrollable list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="year-picker-scroll"
        style={{
          height: '100%', overflowY: 'scroll', overflowX: 'hidden',
          scrollSnapType: 'y mandatory',
          paddingTop: padding, paddingBottom: padding,
          WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
        }}
      >
        {YEARS.map(y => {
          const sel = value != null && y === value
          return (
            <div key={y}
              onClick={() => scrollTo(y)}
              style={{
                height: ITEM_H, scrollSnapAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: sel ? 44 : 24, fontWeight: sel ? 800 : 400,
                color: sel ? '#0D7377' : '#9CA3AF',
                transition: 'font-size 0.15s, color 0.15s, font-weight 0.15s',
                cursor: 'pointer', userSelect: 'none',
              }}
            >{y}</div>
          )
        })}
      </div>
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

  const [giftSharing, setGiftSharing] = useState(false)

  const handleComplete = () => {
    if (giftMode) {
      setGiftSharing(true)
      return
    }
    const profile = { birthYear: yearNum, sex }
    const allDiseases = selectedDiseases.filter(d => validDiseaseIds.has(d))
    completeOnboarding(profile, allDiseases, smokingStatus)
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
          <p className="text-base mb-6" style={{color: yearValid ? '#6B7280' : '#9CA3AF'}}>
            {yearValid ? `${age} yaşında` : 'Kaydırarak seçin ↕'}
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
          <div className="px-5 pt-6 pb-2">
            <p className="text-gray-600 text-sm mb-1">Adım 3 / 4</p>
            <h1 className="text-2xl font-bold" style={{color:'#0D7377'}}>
              {giftMode ? `${giftLabels.isimIn.charAt(0).toUpperCase() + giftLabels.isimIn.slice(1)} sağlık durumu?` : 'Sağlık durumunuz?'}
            </h1>
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
            {giftMode ? `${giftLabels.isimIn.charAt(0).toUpperCase() + giftLabels.isimIn.slice(1)} karnesini gönder →` : 'Listemi Gör →'}
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
