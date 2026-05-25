import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { DISEASE_LIST } from '../data/screenings'
import useAppStoreV2 from '../store/useAppStoreV2'

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

const CANCER_IDS = [
  { id: 'aile_krc_yuksek',  label: '🟠 Kolorektal — 1. derece, 60 yaş altı', sexFilter: null },
  { id: 'aile_krc_orta',    label: '🟠 Kolorektal — 1. derece, herhangi yaş', sexFilter: null },
  { id: 'aile_meme_yuksek', label: '🩷 Meme — 1. derece, 50 yaş altı',        sexFilter: 'F' },
  { id: 'aile_meme_orta',   label: '🩷 Meme — 1. derece, 50 yaş ve üstü',     sexFilter: 'F' },
  { id: 'aile_prostat',     label: '🔵 Prostat — 1. derece akraba',            sexFilter: 'M' },
  { id: 'aile_yumurtalik',  label: '🟣 Yumurtalık',                           sexFilter: 'F' },
  { id: 'brca_lynch',       label: '🧬 BRCA/Lynch Mutasyonu',                  sexFilter: null },
]

const validDiseaseIds = new Set(DISEASE_LIST.map(d => d.id))

function CancerSheet({ sex, selectedCancerIds, onToggle, onClose }) {
  const [showInfo, setShowInfo] = useState(false)
  const filtered = CANCER_IDS.filter(c => {
    if (!validDiseaseIds.has(c.id)) return false
    if (c.sexFilter && c.sexFilter !== sex) return false
    return true
  })
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label="Ailede Kanser Öyküsü">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6 max-h-[75dvh] overflow-y-auto" style={{maxWidth:480,margin:'0 auto'}}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Ailede Kanser Öyküsü</h2>
        {/* Birinci derece akraba açıklaması */}
        <button
          onClick={() => setShowInfo(v => !v)}
          className="flex items-center gap-1.5 text-sm mb-3 font-medium"
          style={{color:'#0D7377', minHeight:36}}>
          <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0"
            style={{borderColor:'#0D7377', color:'#0D7377'}}>ℹ</span>
          "Birinci derece akraba" kimdir?
        </button>
        {showInfo && (
          <div className="mb-4 p-3 rounded-2xl text-sm leading-relaxed"
            style={{background:'#F0FDFA', color:'#134E4A', border:'1px solid #99F6E4'}}>
            <p className="font-bold mb-1">Birinci derece akraba:</p>
            <p>Anne, baba, kardeş veya çocuğunuzu kapsar. Büyükanne/büyükbaba, amca/teyze gibi uzak akrabalar bu kategoriye <strong>girmez</strong>.</p>
            <p className="mt-2">Akrabada kanser varsa; kaç yaşında teşhis konduğu tarama başlangıç yaşını ve sıklığını değiştirir.</p>
          </div>
        )}
        <p className="text-gray-600 text-sm mb-4">Birden fazla seçebilirsiniz</p>
        <div className="flex flex-wrap gap-2">
          {filtered.map(c => {
            const selected = selectedCancerIds.includes(c.id)
            return (
              <button key={c.id} onClick={() => onToggle(c.id)}
                className={`px-3 py-2 rounded-2xl text-sm font-medium border transition-colors ${selected ? 'text-white border-transparent' : 'bg-gray-100 text-gray-800 border-gray-200'}`}
                style={selected ? {background:'#0D7377',minHeight:44} : {minHeight:44}}
                aria-pressed={selected}>{c.label}</button>
            )
          })}
        </div>
        <button onClick={onClose} className="mt-6 w-full py-3 rounded-2xl font-semibold text-white" style={{background:'#0D7377',minHeight:44}}>Tamam</button>
      </div>
    </div>,
    document.body
  )
}

export default function ProfileV2({ onNavigate }) {
  const profile = useAppStoreV2(s => s.profile)
  const diseases = useAppStoreV2(s => s.diseases)
  const smokingStatus = useAppStoreV2(s => s.smokingStatus)
  const packYears = useAppStoreV2(s => s.packYears)
  const updateProfile = useAppStoreV2(s => s.updateProfile)
  const updateDiseases = useAppStoreV2(s => s.updateDiseases)
  const updateSmokingStatus = useAppStoreV2(s => s.updateSmokingStatus)
  const updatePackYears = useAppStoreV2(s => s.updatePackYears)
  const resetAll = useAppStoreV2(s => s.resetAll)

  // Inline edit states
  const [editingYear, setEditingYear] = useState(false)
  const [yearInput, setYearInput] = useState(profile?.birthYear?.toString() || '')
  const [editingBodyStats, setEditingBodyStats] = useState(false)
  const [heightInput, setHeightInput] = useState(profile?.height?.toString() || '')
  const [weightInput, setWeightInput] = useState(profile?.weight?.toString() || '')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCancerSheet, setShowCancerSheet] = useState(false)

  // Pack-year calculation helpers
  // packYears stored as single number; we derive packsPerDay/smokingYears from it only if not yet split
  // For simplicity: store as flat number in store; UI shows two inputs, multiplies on save
  const [editingPackYears, setEditingPackYears] = useState(false)
  const [packsInput, setPacksInput] = useState('')
  const [yearsInput, setYearsInput] = useState('')
  const startPackYearEdit = () => {
    setPacksInput('')
    setYearsInput('')
    setEditingPackYears(true)
  }
  const savePackYears = () => {
    const p = parseFloat(packsInput)
    const y = parseFloat(yearsInput)
    if (!isNaN(p) && !isNaN(y) && p > 0 && y > 0) {
      updatePackYears(Math.round(p * y))
    }
    setEditingPackYears(false)
  }

  const currentYear = new Date().getFullYear()

  const handleSaveYear = () => {
    const y = parseInt(yearInput)
    if (!isNaN(y) && y >= 1920 && y <= 2010) {
      updateProfile({ birthYear: y })
      setEditingYear(false)
    }
  }

  const handleSaveBodyStats = () => {
    const h = parseFloat(heightInput)
    const w = parseFloat(weightInput)
    updateProfile({
      height: isNaN(h) ? undefined : h,
      weight: isNaN(w) ? undefined : w,
    })
    setEditingBodyStats(false)
  }

  const toggleDisease = (id) => {
    if (diseases.includes(id)) {
      updateDiseases(diseases.filter(d => d !== id))
    } else {
      updateDiseases([...diseases, id])
    }
  }

  const visibleDiseaseRows = DISEASE_ROWS.filter(d => validDiseaseIds.has(d.id))

  return (
    <>
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-bold" style={{color:'#0D7377'}}>Profilim</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        {/* Section 1 — Kişisel Bilgiler */}
        <div className="mt-4 mx-4 bg-white rounded-2xl overflow-hidden border border-gray-100">
          <div className="px-5 py-3 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Kişisel Bilgiler</p>
          </div>

          {/* Doğum Yılı */}
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Doğum Yılı</p>
              {!editingYear ? (
                <button onClick={() => { setYearInput(profile?.birthYear?.toString() || ''); setEditingYear(true) }}
                  className="text-base font-semibold" style={{color:'#0D7377', minHeight:44, minWidth:44}}>
                  {profile?.birthYear || '—'} <span className="text-xs text-gray-600">Düzenle</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <label htmlFor="year-edit" className="sr-only">Doğum yılı</label>
                  <input id="year-edit" type="text" inputMode="numeric"
                    value={yearInput} onChange={e => setYearInput(e.target.value.replace(/\D/g,'').slice(0,4))}
                    className="w-24 border border-gray-300 rounded-xl px-3 py-2 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600"
                    style={{borderColor:'#0D7377'}} autoFocus />
                  <button onClick={handleSaveYear} className="px-3 py-2 rounded-xl text-white text-sm font-semibold" style={{background:'#0D7377',minHeight:44}}>✓</button>
                  <button onClick={() => setEditingYear(false)} className="px-3 py-2 rounded-xl text-gray-600 text-sm" style={{minHeight:44}}>✕</button>
                </div>
              )}
            </div>
            {profile?.birthYear && (
              <p className="text-sm text-gray-500 mt-1">{currentYear - profile.birthYear} yaşında</p>
            )}
          </div>

          {/* Cinsiyet */}
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-sm text-gray-600 mb-2">Cinsiyet</p>
            <div className="flex gap-2">
              {[{id:'F',label:'👩 Kadın'},{id:'M',label:'👨 Erkek'}].map(opt => (
                <button key={opt.id} onClick={() => updateProfile({ sex: opt.id })}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold border transition-all"
                  style={profile?.sex === opt.id
                    ? {background:'#0D7377',color:'white',borderColor:'#0D7377'}
                    : {background:'white',color:'#374151',borderColor:'#D1D5DB'}}
                  aria-pressed={profile?.sex === opt.id}>{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Boy / Kilo */}
          <div className="px-5 py-4">
            {!editingBodyStats ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Boy / Kilo</p>
                <button onClick={() => setEditingBodyStats(true)}
                  className="text-base font-semibold" style={{color:'#0D7377',minHeight:44}}>
                  {profile?.height && profile?.weight
                    ? `${profile.height} cm / ${profile.weight} kg`
                    : <span>Boy & Kilo ekle →</span>}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-3">Boy / Kilo</p>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1">
                    <label htmlFor="height-edit" className="text-xs text-gray-500 mb-1 block">Boy (cm)</label>
                    <input id="height-edit" type="text" inputMode="decimal"
                      value={heightInput} onChange={e => setHeightInput(e.target.value)}
                      placeholder="170" className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600" />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="weight-edit" className="text-xs text-gray-500 mb-1 block">Kilo (kg)</label>
                    <input id="weight-edit" type="text" inputMode="decimal"
                      value={weightInput} onChange={e => setWeightInput(e.target.value)}
                      placeholder="70" className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveBodyStats} className="flex-1 py-2 rounded-xl text-white text-sm font-semibold" style={{background:'#0D7377',minHeight:44}}>Kaydet</button>
                  <button onClick={() => setEditingBodyStats(false)} className="py-2 px-4 rounded-xl border border-gray-300 text-gray-600 text-sm" style={{minHeight:44}}>İptal</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2 — Sağlık Bilgileri */}
        <div className="mt-4 mx-4 bg-white rounded-2xl overflow-hidden border border-gray-100">
          <div className="px-5 py-3 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sağlık Bilgileri</p>
          </div>

          {/* Hastalıklar */}
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-sm text-gray-600 mb-3">Hastalıklarım</p>
            <div className="space-y-2">
              {visibleDiseaseRows.map(d => {
                const selected = diseases.includes(d.id)
                return (
                  <button key={d.id} onClick={() => toggleDisease(d.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all"
                    style={selected ? {background:'#0D7377',borderColor:'#0D7377',color:'white'} : {background:'white',borderColor:'#E5E7EB',color:'#1F2937'}}
                    aria-pressed={selected}>
                    <span className="text-xl">{d.icon}</span>
                    <span className="font-medium text-sm">{d.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Kanser öyküsü */}
          <div className="px-5 py-4 border-b border-gray-50">
            {(() => {
              const selectedCancerIds = diseases.filter(d => CANCER_IDS.some(c => c.id === d))
              return (
                <button onClick={() => setShowCancerSheet(true)}
                  className="w-full flex items-center justify-between"
                  style={{minHeight:44}}>
                  <p className="text-sm text-gray-600">🧬 Ailede Kanser Öyküsü</p>
                  <span className="text-sm font-semibold" style={{color:'#0D7377'}}>
                    {selectedCancerIds.length > 0 ? `${selectedCancerIds.length} seçili ›` : 'Ekle ›'}
                  </span>
                </button>
              )
            })()}
          </div>

          {/* Sigara */}
          <div className={`px-5 py-4 ${(smokingStatus === 'yes' || smokingStatus === 'quit') ? 'border-b border-gray-50' : ''}`}>
            <p className="text-sm text-gray-600 mb-3">Sigara</p>
            <div className="flex gap-2">
              {[{id:'yes',label:'🚬 Evet'},{id:'no',label:'✓ Hayır'},{id:'quit',label:'⏳ Bıraktım'}].map(opt => (
                <button key={opt.id} onClick={() => { updateSmokingStatus(opt.id); if (opt.id === 'no') updatePackYears(null) }}
                  className="flex-1 py-3 rounded-2xl text-xs font-semibold border transition-all"
                  style={smokingStatus === opt.id
                    ? {background:'#0D7377',color:'white',borderColor:'#0D7377'}
                    : {background:'white',color:'#374151',borderColor:'#D1D5DB'}}
                  aria-pressed={smokingStatus === opt.id}>{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Paket-Yıl — yalnızca sigara içen/bırakanlar için */}
          {(smokingStatus === 'yes' || smokingStatus === 'quit') && (
            <div className="px-5 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Paket-Yıl</p>
                  <p className="text-xs text-gray-400 mt-0.5">Günde kaç paket × kaç yıl</p>
                </div>
                {!editingPackYears ? (
                  <button onClick={startPackYearEdit}
                    className="text-base font-semibold text-right"
                    style={{color:'#0D7377', minHeight:44}}>
                    {packYears ? `${packYears} paket-yıl ✎` : 'Ekle →'}
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Günde paket</label>
                        <input type="text" inputMode="decimal" placeholder="1"
                          value={packsInput} onChange={e => setPacksInput(e.target.value.replace(/[^\d.]/g,''))}
                          className="w-20 border border-gray-300 rounded-xl px-2 py-2 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                          autoFocus />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Kaç yıl</label>
                        <input type="text" inputMode="numeric" placeholder="10"
                          value={yearsInput} onChange={e => setYearsInput(e.target.value.replace(/\D/g,''))}
                          className="w-20 border border-gray-300 rounded-xl px-2 py-2 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm" />
                      </div>
                    </div>
                    {packsInput && yearsInput && (
                      <p className="text-xs text-teal-700 font-semibold">
                        = {Math.round(parseFloat(packsInput||0) * parseFloat(yearsInput||0))} paket-yıl
                        {parseFloat(packsInput||0) * parseFloat(yearsInput||0) >= 20 && (
                          <span className="ml-1 text-red-600">⚠️ Akciğer BT önerilir</span>
                        )}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button onClick={savePackYears}
                        className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
                        style={{background:'#0D7377', minHeight:36}}>Kaydet</button>
                      <button onClick={() => setEditingPackYears(false)}
                        className="px-3 py-2 rounded-xl text-gray-600 text-sm border border-gray-300"
                        style={{minHeight:36}}>✕</button>
                    </div>
                  </div>
                )}
              </div>
              {packYears && packYears >= 20 && !editingPackYears && (
                <p className="text-xs mt-2 font-semibold" style={{color:'#DC2626'}}>
                  ⚠️ ≥20 paket-yıl → Yıllık Akciğer BT önerilir (USPSTF)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Section 3 — Uygulama */}
        <div className="mt-4 mx-4 bg-white rounded-2xl overflow-hidden border border-gray-100">
          <div className="px-5 py-3 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Uygulama</p>
          </div>

          {!showResetConfirm ? (
            <div className="px-5 py-4 border-b border-gray-50">
              <button onClick={() => setShowResetConfirm(true)}
                className="w-full py-3 rounded-2xl border-2 font-semibold text-red-600 text-sm"
                style={{borderColor:'#EF4444',minHeight:44}}>
                🗑 Taramalarımı Sıfırla
              </button>
            </div>
          ) : (
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="text-sm text-gray-700 mb-3 font-medium">Tüm veriler silinecek. Emin misiniz?</p>
              <div className="flex gap-2">
                <button onClick={resetAll}
                  className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm"
                  style={{background:'#EF4444',minHeight:44}}>Evet, Sıfırla</button>
                <button onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-300 text-gray-600 font-semibold text-sm"
                  style={{minHeight:44}}>İptal</button>
              </div>
            </div>
          )}

          <div className="px-5 py-4 text-center">
            <p className="text-sm text-gray-600 font-medium">Canım v3.0 · Prof. Dr. Cem Şimşek</p>
            <div className="flex justify-center gap-3 mt-2 flex-wrap">
              <button onClick={() => onNavigate('gizlilik')} className="text-xs underline" style={{color:'#0D7377',minHeight:44}}>Gizlilik Politikası</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => onNavigate('kvkk')} className="text-xs underline" style={{color:'#0D7377',minHeight:44}}>KVKK</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => onNavigate('kullanim')} className="text-xs underline" style={{color:'#0D7377',minHeight:44}}>Kullanım Koşulları</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {showCancerSheet && (
      <CancerSheet
        sex={profile?.sex}
        selectedCancerIds={diseases.filter(d => CANCER_IDS.some(c => c.id === d))}
        onToggle={(id) => {
          if (diseases.includes(id)) updateDiseases(diseases.filter(d => d !== id))
          else updateDiseases([...diseases, id])
        }}
        onClose={() => setShowCancerSheet(false)}
      />
    )}
    </>
  )
}
