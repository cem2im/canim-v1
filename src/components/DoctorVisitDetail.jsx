import { useState } from 'react'
import useAppStore from '../store/useAppStore'
import { SCREENINGS } from '../data/screenings'

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

export default function DoctorVisitDetail({ schedule, lastVisitDate, onBack }) {
  const setDoctorVisitDate = useAppStore(s => s.setDoctorVisitDate)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(lastVisitDate || new Date().toISOString().slice(0, 10))
  const [saved, setSaved] = useState(false)
  const [showAllTriggers, setShowAllTriggers] = useState(false)

  const nextVisitDate = lastVisitDate ? addMonths(lastVisitDate, schedule.intervalMonths) : null
  const today = new Date()
  const isOverdue = nextVisitDate && new Date(nextVisitDate) < today

  const handleSave = () => {
    setDoctorVisitDate(schedule.id, selectedDate)
    setSaved(true)
    setShowDatePicker(false)
    setTimeout(() => {
      setSaved(false)
      onBack()
    }, 1200)
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white page-enter">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3 border-b border-gray-100">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-95"
        >
          ←
        </button>
        <h1 className="font-bold text-gray-800 text-base">Doktor Kontrolü</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Doctor name + frequency */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">🏥</span>
            <div>
              <div className="text-xl font-extrabold text-gray-900">{schedule.doctor}</div>
              <div className="text-sm text-gray-500">Her <strong>{schedule.intervalMonths}</strong> ayda bir</div>
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-3 leading-relaxed">{schedule.purpose}</div>
        </div>

        {/* What happens at this visit */}
        {schedule.screenings?.length > 0 && (
          <div className="mb-5 p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Bu kontrolde yapılacaklar</div>
            <ul className="space-y-1.5">
              {schedule.screenings.map(sid => {
                const s = SCREENINGS[sid]
                return (
                  <li key={sid} className="flex items-center gap-2 text-sm text-blue-800">
                    <span>{s?.icon || '🔬'}</span>
                    <span>{s?.trName || sid}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Last visit / Next visit */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Son Ziyaret</div>
            <div className="text-sm font-bold text-gray-700">{lastVisitDate ? formatDate(lastVisitDate) : 'Bilinmiyor'}</div>
          </div>
          <div
            className="p-3 rounded-2xl border"
            style={isOverdue
              ? { background: '#FEF2F2', borderColor: '#FCA5A5' }
              : { background: '#F0FDF4', borderColor: '#A7F3D0' }}
          >
            <div className="text-xs mb-1" style={isOverdue ? { color: '#B91C1C' } : { color: '#065F46' }}>
              Sonraki Kontrol
            </div>
            <div className="text-sm font-bold" style={isOverdue ? { color: '#DC2626' } : { color: '#047857' }}>
              {nextVisitDate ? formatDate(nextVisitDate) : 'En kısa zamanda'}
              {isOverdue && ' ⚠️'}
            </div>
          </div>
        </div>

        {/* Early triggers */}
        {schedule.earlyTriggers?.length > 0 && (
          <div className="mb-5 rounded-2xl border border-amber-200 overflow-hidden">
            <button
              onClick={() => setShowAllTriggers(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 active:bg-amber-100"
            >
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="text-sm font-bold text-amber-800">Erken gitmeniz gerekebilir</span>
              </div>
              <span className="text-amber-600 text-xs">{showAllTriggers ? '▲' : '▼'}</span>
            </button>
            {showAllTriggers && (
              <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 space-y-2">
                {schedule.earlyTriggers.map((trigger, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                    <span className="text-sm text-amber-800 leading-relaxed">{trigger}</span>
                  </div>
                ))}
              </div>
            )}
            {!showAllTriggers && (
              <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
                <span className="text-xs text-amber-700">{schedule.earlyTriggers[0]}</span>
                {schedule.earlyTriggers.length > 1 && (
                  <span className="text-xs text-amber-500"> +{schedule.earlyTriggers.length - 1} durum daha (görmek için dokun)</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Guideline */}
        {schedule.guideline && (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-500 mb-0.5">Kılavuz Kaynağı</div>
            <div className="text-xs text-gray-600 font-medium">{schedule.guideline}</div>
          </div>
        )}
      </div>

      {/* Bottom: Save visit button */}
      <div className="px-5 pb-8 pt-3 border-t border-gray-100">
        {saved ? (
          <div className="w-full py-4 rounded-2xl text-white font-bold text-base text-center" style={{ background: '#10B981' }}>
            ✓ Kaydedildi!
          </div>
        ) : showDatePicker ? (
          <div>
            <div className="text-sm font-bold text-gray-700 mb-2">Ziyaret tarihi:</div>
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-teal-400 bg-white text-gray-900 font-semibold outline-none mb-3 text-base"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowDatePicker(false)}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm active:scale-98"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-2xl text-white font-bold text-sm active:scale-98"
                style={{ background: '#0D7377' }}
              >
                Kaydet
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDatePicker(true)}
            className="w-full py-4 rounded-2xl text-white font-bold text-base active:scale-98"
            style={{ background: 'linear-gradient(135deg, #0D7377, #14919B)' }}
          >
            🏥 Ziyareti Kaydet
          </button>
        )}
      </div>
    </div>
  )
}
