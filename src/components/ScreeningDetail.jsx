import { useState } from 'react'
import useAppStore from '../store/useAppStore'
import { statusColor, statusLabel } from '../utils/score'
import { TIME_OPTIONS } from '../utils/engine'

export default function ScreeningDetail({ screening, onBack }) {
  const markDone = useAppStore(s => s.markDone)
  const setCustomNextDate = useAppStore(s => s.setCustomNextDate)
  const screeningDates = useAppStore(s => s.screeningDates)

  const [showMarkDone, setShowMarkDone] = useState(false)
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [selectedTime, setSelectedTime] = useState(null)
  const [customDate, setCustomDate] = useState('')

  const dates = screeningDates[screening.id] || {}
  const color = statusColor(screening.status)

  const handleMarkDone = () => {
    if (!selectedTime) return
    const monthsAgo = { 'this_month':0, '3m':3, '6m':6, '1y':12, '2y':24, '5y':60, 'older':84 }[selectedTime] ?? 0
    const d = new Date()
    d.setMonth(d.getMonth() - monthsAgo)
    markDone(screening.id, d.toISOString().slice(0,10))
    setShowMarkDone(false)
    onBack()
  }

  const handleCustomDate = () => {
    if (!customDate) return
    setCustomNextDate(screening.id, customDate)
    setShowCustomDate(false)
    onBack()
  }

  return (
    <div className="min-h-dvh flex flex-col pb-24 page-enter">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-bold">
          ←
        </button>
        <span className="font-bold text-gray-900">Detay</span>
      </div>

      {/* Card */}
      <div className="mx-5 rounded-3xl p-5 bg-white border border-gray-200 mb-4" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{screening.icon}</span>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">{screening.trName}</h1>
            <div className="text-xs text-gray-400">{screening.enName}</div>
          </div>
        </div>
        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{background:`${color}18`, color}}>
          {statusLabel(screening.status, screening.daysUntil)}
        </div>
        <div className="text-sm text-gray-600 leading-relaxed mb-4">{screening.explanation}</div>
        <div className="grid grid-cols-2 gap-3">
          <InfoBox label="Sıklık" value={`Her ${screening.frequencyMonths} ayda bir`} />
          <InfoBox label="Son Yapılan" value={dates.lastDoneDate ? formatDate(dates.lastDoneDate) : 'Bilinmiyor'} />
          <InfoBox label="Sonraki Kontrol" value={screening.nextDate ? formatDate(screening.nextDate) : 'Belirsiz'} />
          <InfoBox label="Uzman" value={screening.doctor || '—'} />
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 flex flex-col gap-3">
        <button
          onClick={() => { setShowMarkDone(true); setShowCustomDate(false) }}
          className="w-full py-4 rounded-2xl text-white font-bold text-base"
          style={{background:'#0D7377'}}
        >
          ✓ Yapıldı — İşaretle
        </button>
        <button
          onClick={() => { setShowCustomDate(true); setShowMarkDone(false) }}
          className="w-full py-4 rounded-2xl border-2 font-bold text-base"
          style={{borderColor:'#0D7377', color:'#0D7377', background:'white'}}
        >
          📅 Doktorum farklı tarih önerdi
        </button>
      </div>

      {/* Mark done sheet */}
      {showMarkDone && (
        <div className="mx-5 mt-4 p-5 bg-white rounded-3xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3">Ne zaman yapıldı?</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {TIME_OPTIONS.filter(o => o.value !== 'unknown').map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedTime(opt.value)}
                className="px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                style={selectedTime === opt.value
                  ? {background:'#0D7377', color:'white'}
                  : {background:'#f3f4f6', color:'#374151'}
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            disabled={!selectedTime}
            onClick={handleMarkDone}
            className="w-full py-3 rounded-xl text-white font-bold disabled:opacity-40"
            style={{background:'#0D7377'}}
          >
            Kaydet
          </button>
        </div>
      )}

      {/* Custom date sheet */}
      {showCustomDate && (
        <div className="mx-5 mt-4 p-5 bg-white rounded-3xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3">Sonraki kontrol tarihi</h3>
          <input
            type="date"
            value={customDate}
            onChange={e => setCustomDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-900 font-semibold mb-4 focus:border-teal outline-none"
          />
          <button
            disabled={!customDate}
            onClick={handleCustomDate}
            className="w-full py-3 rounded-xl text-white font-bold disabled:opacity-40"
            style={{background:'#0D7377'}}
          >
            Kaydet
          </button>
        </div>
      )}
    </div>
  )
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3">
      <div className="text-xs text-gray-400 font-semibold mb-0.5">{label}</div>
      <div className="text-sm font-bold text-gray-800">{value}</div>
    </div>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}
