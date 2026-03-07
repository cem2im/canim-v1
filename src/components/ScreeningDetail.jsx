import { useState } from 'react'
import useAppStore from '../store/useAppStore'
import { statusColor, statusLabel } from '../utils/score'
import { TIME_OPTIONS } from '../utils/engine'

// Unicode superscript karakterleri (akademik footnote için)
const SUPERSCRIPTS = ['¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹']

export default function ScreeningDetail({ screening, onBack }) {
  const markDone = useAppStore(s => s.markDone)
  const setCustomNextDate = useAppStore(s => s.setCustomNextDate)
  const screeningDates = useAppStore(s => s.screeningDates)

  const [showMarkDone, setShowMarkDone] = useState(false)
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [selectedTime, setSelectedTime] = useState(null)
  const [customDate, setCustomDate] = useState('')
  const [showClinical, setShowClinical] = useState(false)

  const dates = screeningDates[screening.id] || {}
  const color = statusColor(screening.status)
  const sources = screening.sources || []

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
    <div className="min-h-dvh flex flex-col pb-8 page-enter">

      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-bold">
          ←
        </button>
        <span className="font-bold text-gray-900">Detay</span>
      </div>

      {/* Ana Kart */}
      <div className="mx-5 rounded-3xl p-5 bg-white border border-gray-200 mb-4" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>

        {/* Başlık */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{screening.icon}</span>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">{screening.trName}</h1>
            <div className="text-xs text-gray-400">{screening.enName}</div>
          </div>
        </div>

        {/* Durum rozeti + Bilgi butonu */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{background:`${color}18`, color}}>
            {statusLabel(screening.status, screening.daysUntil)}
          </div>
          {(screening.recommendation || sources.length > 0) && (
            <button
              onClick={() => setShowClinical(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={showClinical
                ? {background:'#C8102E', color:'white'}
                : {background:'#f3f4f6', color:'#6B7280', border:'1px solid #E5E7EB'}
              }
            >
              <span>{showClinical ? '✕' : 'ℹ'}</span>
              <span>{showClinical ? 'Kapat' : 'Klinik Bilgi'}</span>
            </button>
          )}
        </div>

        {/* Açıklama */}
        <div className="text-sm text-gray-600 leading-relaxed mb-4">{screening.explanation}</div>

        {/* Klinik Öneri — yalnızca bilgi butonuna basılınca görünür */}
        {showClinical && screening.recommendation && (
          <div className="mb-4 p-4 rounded-2xl" style={{background:'#e8f4f5', border:'1px solid #b2d8da'}}>
            <div className="text-xs font-bold mb-2" style={{color:'#0A5C5F'}}>🩺 Klinik Öneri</div>
            <div className="text-xs leading-relaxed" style={{color:'#0D7377'}}>
              {screening.recommendation}
              {sources.length > 0 && (
                <span className="ml-1">
                  {sources.map((_, i) => (
                    <sup key={i} className="font-extrabold" style={{color:'#C8102E', fontSize:'0.7em', marginLeft:'1px'}}>
                      {SUPERSCRIPTS[i]}
                    </sup>
                  ))}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bilgi kutuları */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <InfoBox label="Tarama Sıklığı" value={`Her ${screening.frequencyMonths} ayda bir`} />
          <InfoBox label="Son Yapılan" value={dates.lastDoneDate ? formatDate(dates.lastDoneDate) : 'Bilinmiyor'} />
        </div>
        <div className="mb-3">
          <InfoBox
            label="Sonraki Kontrol"
            value={screening.nextDate ? formatDate(screening.nextDate) : 'En kısa zamanda'}
            highlight={!screening.nextDate}
          />
        </div>

        {/* Uzman Branşlar — tam genişlik, tüm ilgili branşlar */}
        {screening.doctor && (
          <div className="mt-3 bg-gray-50 rounded-2xl p-3">
            <div className="text-xs text-gray-400 font-semibold mb-2">Hangi uzmana başvurun?</div>
            <div className="flex flex-wrap gap-2">
              {screening.doctor.split(' · ').map((d, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-lg text-xs font-semibold"
                  style={{background:'#0D737718', color:'#0D7377', border:'1px solid #0D737730'}}
                >
                  {d.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Aksiyon butonları */}
      <div className="px-5 flex flex-col gap-3 mb-6">
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

      {/* Yapıldı paneli */}
      {showMarkDone && (
        <div className="mx-5 mb-6 p-5 bg-white rounded-3xl border border-gray-200">
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

      {/* Tarih paneli */}
      {showCustomDate && (
        <div className="mx-5 mb-6 p-5 bg-white rounded-3xl border border-gray-200">
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

      {/* ── FOOTNOTE REFERANS BÖLÜMÜ — yalnızca Klinik Bilgi açıkken görünür ── */}
      {showClinical && sources.length > 0 && (
        <div className="mx-5 mb-6 pt-5" style={{borderTop:'1.5px solid #e5e7eb'}}>

          {/* Başlık çizgisi */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1" style={{background:'#C8102E', opacity:0.3}} />
            <span className="text-xs font-extrabold uppercase tracking-widest" style={{color:'#C8102E'}}>
              Kaynaklar
            </span>
            <div className="h-px flex-1" style={{background:'#C8102E', opacity:0.3}} />
          </div>

          {/* Footnote listesi */}
          <ol className="space-y-3" style={{listStyle:'none', padding:0, margin:0}}>
            {sources.map((src, i) => (
              <li key={i} className="flex gap-3 items-start">
                {/* Numara */}
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5"
                  style={{background:'#C8102E', color:'white', fontSize:'0.6rem', minWidth:'1.25rem'}}
                >
                  {i + 1}
                </span>
                {/* Kaynak bilgisi */}
                <div className="flex-1 min-w-0">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs font-semibold leading-snug mb-0.5"
                    style={{color:'#0D7377', textDecoration:'none'}}
                  >
                    {src.name}
                  </a>
                  <span
                    className="text-xs break-all"
                    style={{color:'#9CA3AF', fontSize:'0.6rem'}}
                  >
                    {src.url}
                  </span>
                </div>
                {/* Dış link oku */}
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-xs font-bold mt-0.5"
                  style={{color:'#E8963E'}}
                >
                  ↗
                </a>
              </li>
            ))}
          </ol>

          {/* Alt not */}
          <p className="text-xs mt-4 leading-relaxed" style={{color:'#9CA3AF'}}>
            Bu öneriler uluslararası kanıta dayalı kılavuzlara dayanmaktadır.
            Bireysel kararlar için doktorunuza danışın.
          </p>
        </div>
      )}

    </div>
  )
}

function InfoBox({ label, value, highlight }) {
  return (
    <div className="rounded-2xl p-3" style={{background: highlight ? '#FFF3CD' : '#F9FAFB'}}>
      <div className="text-xs font-semibold mb-0.5" style={{color: highlight ? '#856404' : '#9CA3AF'}}>{label}</div>
      <div className="text-sm font-bold" style={{color: highlight ? '#664D03' : '#1F2937'}}>{value}</div>
    </div>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}
