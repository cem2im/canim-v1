// DoctorVisitCard — shows a single doctor visit schedule entry
// Props: { schedule, lastVisitDate, nextVisitDate, status, daysUntil, onClick }

const STATUS_CONFIG = {
  overdue: { label: 'Gecikmiş', color: '#EF4444', bg: '#FEF2F2' },
  soon:    { label: 'Yaklaşıyor', color: '#F59E0B', bg: '#FFFBEB' },
  ok:      { label: 'Güncel', color: '#10B981', bg: '#ECFDF5' },
  unknown: { label: 'Bilinmiyor', color: '#9CA3AF', bg: '#F9FAFB' },
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function DoctorVisitCard({ schedule, lastVisitDate, nextVisitDate, status = 'unknown', daysUntil, onClick }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unknown
  const nextLabel = nextVisitDate ? formatDate(nextVisitDate) : 'En kısa zamanda'

  return (
    <div
      onClick={onClick}
      className="mb-3 bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer active:scale-98 transition-transform"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-stretch">
        {/* Left color bar */}
        <div className="w-1.5 flex-shrink-0" style={{ background: cfg.color }} />
        <div className="flex-1 px-4 py-4">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xl">🏥</span>
              <div>
                <div className="font-bold text-gray-900 text-sm">{schedule.doctor}</div>
                <div className="text-xs text-gray-400">Her {schedule.intervalMonths} ayda bir</div>
              </div>
            </div>
            {/* Status badge */}
            <span
              className="ml-2 flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {status === 'overdue' && daysUntil !== null
                ? `${Math.abs(daysUntil)} gün geçti`
                : status === 'soon' && daysUntil !== null
                  ? `${daysUntil} gün kaldı`
                  : cfg.label}
            </span>
          </div>

          {/* Purpose */}
          <div className="text-xs text-gray-500 mt-2 leading-relaxed">{schedule.purpose}</div>

          {/* Next visit */}
          <div className="text-xs mt-2 text-gray-500">
            📅 Sonraki: <strong className={status === 'overdue' ? 'text-red-500' : 'text-gray-700'}>{nextLabel}</strong>
          </div>

          {/* Early trigger warning (collapsed summary) */}
          {schedule.earlyTriggers?.length > 0 && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
              ⚠️ {schedule.earlyTriggers[0]}
              {schedule.earlyTriggers.length > 1 && (
                <span className="text-amber-500"> +{schedule.earlyTriggers.length - 1} durum daha</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
