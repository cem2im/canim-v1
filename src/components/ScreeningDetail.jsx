import { useState } from 'react'
import { createPortal } from 'react-dom'
import useAppStore from '../store/useAppStore'
import { statusColor, statusLabel } from '../utils/score'
import { TIME_OPTIONS } from '../utils/engine'

const SUPERSCRIPTS = ['¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹']

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function freqLabel(months) {
  if (!months || months >= 999) return 'Bir kez'
  const map = { 1:'Ayda bir', 3:'3 ayda bir', 6:'6 ayda bir', 12:'Yılda bir',
    24:'2 yılda bir', 36:'3 yılda bir', 60:'5 yılda bir', 120:'10 yılda bir' }
  return map[months] || `${months} ayda bir`
}

// ── "Ne Zaman Yapıldı?" bottom sheet ─────────────────────────────────────────
function MarkDoneSheet({ onClose, onSave }) {
  const [selected, setSelected] = useState(null)
  return createPortal(
    <div className="fixed inset-0 flex flex-col" style={{background:'rgba(0,0,0,0.45)', zIndex:9999}}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex-1" onClick={onClose} />
      <div className="bg-white rounded-t-3xl px-5 pt-4"
        style={{animation:'slideUp 0.24s cubic-bezier(0.22,1,0.36,1)', paddingBottom:'max(env(safe-area-inset-bottom, 0px), 32px)'}}>
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <h3 className="font-extrabold text-gray-900 text-base mb-4">Ne zaman yapıldı?</h3>
        <div className="flex flex-wrap gap-2 mb-5">
          {TIME_OPTIONS.filter(o => o.value !== 'unknown').map(opt => (
            <button key={opt.value} onClick={() => setSelected(opt.value)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={selected === opt.value
                ? {background:'#0D7377', color:'white'}
                : {background:'#F3F4F6', color:'#374151'}}>
              {opt.label}
            </button>
          ))}
        </div>
        <button disabled={!selected} onClick={() => onSave(selected)}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-40 active:scale-98"
          style={{background:'#0D7377'}}>
          Kaydet
        </button>
      </div>
    </div>
  , document.body)
}

// ── Klinik Bilgi bottom sheet ─────────────────────────────────────────────────
function ClinicalSheet({ screening, onClose }) {
  const sources = screening.sources || []
  return createPortal(
    <div className="fixed inset-0 flex flex-col" style={{background:'rgba(0,0,0,0.45)', zIndex:9999}}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex-1" onClick={onClose} />
      <div className="bg-white rounded-t-3xl flex flex-col"
        style={{animation:'slideUp 0.24s cubic-bezier(0.22,1,0.36,1)', maxHeight:'70dvh'}}>
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 shrink-0 border-b border-gray-100">
          <span className="font-extrabold text-gray-900">Klinik Bilgi</span>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{background:'#E5E7EB', fontSize:20, color:'#374151', fontWeight:700}}>×</button>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0 px-5 py-4" style={{paddingBottom:80}}>
          {screening.recommendation && (
            <div className="p-4 rounded-2xl mb-4" style={{background:'#e8f4f5', border:'1px solid #b2d8da'}}>
              <div className="text-xs font-bold mb-2" style={{color:'#0A5C5F'}}>🩺 Klinik Öneri</div>
              <div className="text-xs leading-relaxed" style={{color:'#0D7377'}}>
                {screening.recommendation}
                {sources.length > 0 && sources.map((_, i) => (
                  <sup key={i} className="font-extrabold ml-0.5"
                    style={{color:'#C8102E', fontSize:'0.7em'}}>{SUPERSCRIPTS[i]}</sup>
                ))}
              </div>
            </div>
          )}
          {sources.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1" style={{background:'#C8102E', opacity:0.3}} />
                <span className="text-xs font-extrabold uppercase tracking-widest" style={{color:'#C8102E'}}>Kaynaklar</span>
                <div className="h-px flex-1" style={{background:'#C8102E', opacity:0.3}} />
              </div>
              <ol style={{listStyle:'none', padding:0, margin:0}} className="space-y-3">
                {sources.map((src, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5"
                      style={{background:'#C8102E', color:'white', fontSize:'0.6rem', minWidth:'1.25rem'}}>{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <a href={src.url} target="_blank" rel="noopener noreferrer"
                        className="block text-xs font-semibold leading-snug mb-0.5"
                        style={{color:'#0D7377', textDecoration:'none'}}>{src.name}</a>
                      <span className="text-xs break-all" style={{color:'#9CA3AF', fontSize:'0.6rem'}}>{src.url}</span>
                    </div>
                    <a href={src.url} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 text-xs font-bold mt-0.5" style={{color:'#E8963E'}}>↗</a>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
        <div className="px-5 pt-2 shrink-0"
          style={{paddingBottom:'max(env(safe-area-inset-bottom, 0px), 32px)'}}>
          <button onClick={onClose}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm"
            style={{background:'#0D7377'}}>Kapat</button>
        </div>
      </div>
    </div>
  , document.body)
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────
export default function ScreeningDetail({ screening, onBack }) {
  const markDone = useAppStore(s => s.markDone)
  const screeningDates = useAppStore(s => s.screeningDates)

  const [showMarkDone, setShowMarkDone] = useState(false)
  const [showClinical, setShowClinical] = useState(false)

  const dates = screeningDates[screening.id] || {}
  const color = statusColor(screening.status)
  const sources = screening.sources || []
  const hasClinical = !!(screening.recommendation || sources.length > 0)

  const handleSaveDone = (selectedTime) => {
    const monthsAgo = { 'this_month':0, '3m':3, '6m':6, '1y':12, '2y':24, '5y':60, 'older':84 }[selectedTime] ?? 0
    const d = new Date()
    d.setMonth(d.getMonth() - monthsAgo)
    markDone(screening.id, d.toISOString().slice(0,10))
    setShowMarkDone(false)
    onBack()
  }

  const doctors = screening.doctor
    ? screening.doctor.split(' · ').map(d => d.trim())
    : []

  return (
    <div style={{height:'100dvh', display:'flex', flexDirection:'column', background:'#FAFAF8', overflow:'hidden'}}
      className="page-enter">

      {/* Header — compact */}
      <div style={{padding:'14px 16px 8px', flexShrink:0, display:'flex', alignItems:'center', gap:10}}>
        <button onClick={onBack}
          className="w-9 h-9 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
          ←
        </button>
        <span className="font-bold text-gray-900 text-sm">Detay</span>
        {hasClinical && (
          <button onClick={() => setShowClinical(true)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{background:'#f3f4f6', color:'#6B7280', border:'1px solid #E5E7EB'}}>
            ℹ Klinik Bilgi
          </button>
        )}
      </div>

      {/* Ana kart — esnek yükseklik */}
      <div style={{flex:1, padding:'0 14px', overflow:'hidden', display:'flex', flexDirection:'column'}}>
        <div style={{background:'white', borderRadius:20, border:'1px solid #E5E7EB',
          boxShadow:'0 2px 12px rgba(0,0,0,0.06)', padding:'14px 16px',
          display:'flex', flexDirection:'column', flex:1, overflow:'hidden'}}>

          {/* Başlık + status */}
          <div style={{display:'flex', alignItems:'flex-start', gap:10, marginBottom:10}}>
            <span style={{fontSize:28, flexShrink:0}}>{screening.icon}</span>
            <div style={{flex:1, minWidth:0}}>
              <h1 style={{fontSize:16, fontWeight:800, color:'#111827', lineHeight:1.2, margin:0}}>
                {screening.trName}
              </h1>
            </div>
            <div style={{flexShrink:0, padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700,
              background:`${color}18`, color}}>
              {statusLabel(screening.status, screening.daysUntil)}
            </div>
          </div>

          {/* Açıklama — 2 satır max */}
          <p style={{fontSize:12, color:'#4B5563', lineHeight:1.5, margin:'0 0 12px',
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
            {screening.explanation || screening.why}
          </p>

          {/* Info kutuları — 3'lü kompakt satır */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12}}>
            <div style={{background:'#F9FAFB', borderRadius:12, padding:'8px 10px'}}>
              <div style={{fontSize:10, color:'#9CA3AF', marginBottom:3, fontWeight:600}}>Sıklık</div>
              <div style={{fontSize:11, fontWeight:700, color:'#1F2937'}}>{freqLabel(screening.frequencyMonths)}</div>
            </div>
            <div style={{background:'#F9FAFB', borderRadius:12, padding:'8px 10px'}}>
              <div style={{fontSize:10, color:'#9CA3AF', marginBottom:3, fontWeight:600}}>Son Yapılan</div>
              <div style={{fontSize:11, fontWeight:700, color:'#1F2937'}}>
                {dates.lastDoneDate ? formatDate(dates.lastDoneDate) : 'Bilinmiyor'}
              </div>
            </div>
            <div style={{
              background: !screening.nextDate ? '#FFF3CD' : '#F9FAFB',
              borderRadius:12, padding:'8px 10px'}}>
              <div style={{fontSize:10, color: !screening.nextDate ? '#856404' : '#9CA3AF', marginBottom:3, fontWeight:600}}>
                Sonraki
              </div>
              <div style={{fontSize:11, fontWeight:700, color: !screening.nextDate ? '#664D03' : '#1F2937'}}>
                {screening.nextDate ? formatDate(screening.nextDate) : 'Hemen'}
              </div>
            </div>
          </div>

          {/* Doktorlar — kompakt */}
          {doctors.length > 0 && (
            <div style={{background:'#F9FAFB', borderRadius:14, padding:'10px 12px'}}>
              <div style={{fontSize:10, color:'#9CA3AF', fontWeight:600, marginBottom:6}}>Başvurun</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                {doctors.map((d, i) => (
                  <span key={i} style={{
                    background:'#0D737718', color:'#0D7377', border:'1px solid #0D737730',
                    borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600}}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Yapıldı butonu — sabitlemiş altta */}
      <div style={{padding:'12px 14px 20px', flexShrink:0}}>
        <button
          onClick={() => setShowMarkDone(true)}
          className="w-full rounded-2xl text-white font-bold text-base active:scale-98 transition-all"
          style={{padding:'14px', background:'linear-gradient(135deg,#0D7377,#14919B)',
            boxShadow:'0 4px 16px rgba(13,115,119,0.3)'}}>
          ✓ Yapıldı — İşaretle
        </button>
      </div>

      {/* "Ne zaman yapıldı?" bottom sheet */}
      {showMarkDone && (
        <MarkDoneSheet
          onClose={() => setShowMarkDone(false)}
          onSave={handleSaveDone}
        />
      )}

      {/* Klinik Bilgi bottom sheet */}
      {showClinical && (
        <ClinicalSheet
          screening={screening}
          onClose={() => setShowClinical(false)}
        />
      )}
    </div>
  )
}
