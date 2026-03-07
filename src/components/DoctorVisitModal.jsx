import { useState } from 'react'
import useAppStore from '../store/useAppStore'
import { DOCTOR_SCREENING_MAP, SCREENINGS } from '../data/screenings'

const DATE_OPTIONS = [
  { value: 'today', label: 'Bugün' },
  { value: 'week', label: 'Bu hafta' },
  { value: 'month', label: 'Bu ay' },
  { value: 'custom', label: 'Başka tarih' },
]

function getDateFromOption(option, customDate) {
  const today = new Date()
  if (option === 'today') return today.toISOString().slice(0,10)
  if (option === 'week') {
    // Use today as the date — user was there this week, today is close enough
    return today.toISOString().slice(0,10)
  }
  if (option === 'month') {
    const d = new Date(today)
    d.setDate(15)
    return d.toISOString().slice(0,10)
  }
  if (option === 'custom') return customDate || today.toISOString().slice(0,10)
  return today.toISOString().slice(0,10)
}

export default function DoctorVisitModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [checkedScreenings, setCheckedScreenings] = useState({})
  const [dateOption, setDateOption] = useState('today')
  const [customDate, setCustomDate] = useState(new Date().toISOString().slice(0,10))

  const getScreeningCards = useAppStore(s => s.getScreeningCards)
  const logDoctorVisit = useAppStore(s => s.logDoctorVisit)

  const patientScreeningIds = new Set(getScreeningCards().map(c => c.id))
  // Only show doctors that have ≥1 screening the patient is actually tracking
  const doctorTypes = Object.keys(DOCTOR_SCREENING_MAP).filter(doctor =>
    (DOCTOR_SCREENING_MAP[doctor] || []).some(id => patientScreeningIds.has(id))
  )

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
    // Pre-check all relevant screenings that patient tracks
    const mapped = DOCTOR_SCREENING_MAP[doctor] || []
    const relevant = mapped.filter(id => patientScreeningIds.has(id))
    const initial = {}
    relevant.forEach(id => { initial[id] = true })
    setCheckedScreenings(initial)
    setStep(2)
  }

  const toggleScreening = (id) => {
    setCheckedScreenings(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSave = () => {
    const date = getDateFromOption(dateOption, customDate)
    const completedIds = Object.entries(checkedScreenings)
      .filter(([, checked]) => checked)
      .map(([id]) => id)
    logDoctorVisit(date, selectedDoctor, completedIds)
    onClose()
  }

  const relevantScreenings = selectedDoctor
    ? (DOCTOR_SCREENING_MAP[selectedDoctor] || []).filter(id => patientScreeningIds.has(id))
    : []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div
        className="w-full max-w-xl mx-auto bg-white rounded-t-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{maxHeight:'85dvh'}}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Kontrole Gittim 🏥</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {step === 1 ? 'Hangi doktora gittiğinizi seçin'
                  : step === 2 ? 'Hangi taramalar yapıldı?'
                  : 'Ne zaman gittiniz?'}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 text-2xl font-light leading-none">×</button>
          </div>
          {/* Step indicator */}
          <div className="flex gap-1 mt-3">
            {[1,2,3].map(s => (
              <div key={s} className="h-1 flex-1 rounded-full transition-all"
                style={{background: s <= step ? '#0D7377' : '#E5E7EB'}}/>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto" style={{maxHeight:'calc(85dvh - 200px)'}}>

          {/* STEP 1: Doctor selection */}
          {step === 1 && (
            <div className="px-6 py-4">
              {doctorTypes.map(doctor => (
                <button
                  key={doctor}
                  onClick={() => handleDoctorSelect(doctor)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 border-gray-100 bg-white mb-2 text-left active:scale-98 transition-transform hover:border-teal"
                >
                  <span className="font-semibold text-gray-900 text-sm">{doctor}</span>
                  <span className="text-gray-400">→</span>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: Screening checklist */}
          {step === 2 && (
            <div className="px-6 py-4">
              <div className="mb-3 px-3 py-2 rounded-xl" style={{background:'#e8f4f5', border:'1px solid #c0e0e2'}}>
                <p className="text-xs font-medium" style={{color:'#0D7377'}}>
                  Sadece sizinle ilgili taramalar listeleniyor. Yapılmayanların işaretini kaldırın.
                </p>
              </div>
              {relevantScreenings.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-3xl mb-2">🤷</div>
                  <p className="text-gray-500 text-sm">Bu doktor için takip ettiğiniz tarama yok.</p>
                </div>
              ) : (
                relevantScreenings.map(id => {
                  const s = SCREENINGS[id]
                  if (!s) return null
                  return (
                    <div
                      key={id}
                      onClick={() => toggleScreening(id)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 mb-2 cursor-pointer active:scale-98 transition-all"
                      style={checkedScreenings[id]
                        ? {borderColor:'#0D7377', background:'#e8f4f5'}
                        : {borderColor:'#E5E7EB', background:'white'}}
                    >
                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={checkedScreenings[id]
                          ? {borderColor:'#0D7377', background:'#0D7377'}
                          : {borderColor:'#D1D5DB', background:'white'}}>
                        {checkedScreenings[id] && <span className="text-white text-xs font-black">✓</span>}
                      </div>
                      <span className="text-xl">{s.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">{s.trName}</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* STEP 3: Date selection */}
          {step === 3 && (
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {DATE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDateOption(opt.value)}
                    className="py-3 rounded-2xl border-2 text-sm font-semibold transition-all active:scale-95"
                    style={dateOption === opt.value
                      ? {borderColor:'#0D7377', background:'#e8f4f5', color:'#0D7377'}
                      : {borderColor:'#E5E7EB', background:'white', color:'#374151'}}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {dateOption === 'custom' && (
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Tarih Seçin</label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={e => setCustomDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-teal outline-none font-semibold"
                    max={new Date().toISOString().slice(0,10)}
                  />
                </div>
              )}
              {/* Summary */}
              <div className="px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Özet</div>
                <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Doktor:</span> {selectedDoctor}</div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Taramalar:</span>{' '}
                  {Object.entries(checkedScreenings).filter(([,v])=>v).length} tarama işaretlendi
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-6 pb-8 pt-4 border-t border-gray-100">
          {step === 1 && (
            <button onClick={onClose}
              className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-500">
              İptal
            </button>
          )}
          {step === 2 && (
            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-500">
                ← Geri
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={relevantScreenings.length === 0}
                className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold disabled:opacity-40"
                style={{background:'#0D7377'}}>
                Devam →
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-500">
                ← Geri
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold"
                style={{background:'#0D7377'}}>
                Kaydet ✓
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
