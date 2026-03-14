import { useState } from 'react'
import useAppStore from '../store/useAppStore'
import { SCREENINGS } from '../data/screenings'
import FeedbackSection from '../components/FeedbackSection'
import Disclaimer from '../components/Disclaimer'

const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']

function formatDateLong(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function getMonthLabel(dateStr) {
  const d = new Date(dateStr)
  return `${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function groupByMonth(items) {
  const groups = {}
  for (const item of items) {
    const key = getMonthLabel(item.date)
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  }
  return groups
}

export default function History() {
  const screeningDates = useAppStore(s => s.screeningDates)
  const visitHistory = useAppStore(s => s.visitHistory)
  const setActiveTab = useAppStore(s => s.setActiveTab)

  // Build a flat list of all completed screenings
  const completedItems = []

  // From individual markDone
  for (const [id, dates] of Object.entries(screeningDates)) {
    if (dates.lastDoneDate) {
      const def = SCREENINGS[id]
      completedItems.push({
        id,
        date: dates.lastDoneDate,
        name: def?.trName || id,
        icon: def?.icon || '✅',
        source: null,
      })
    }
  }

  // From visitHistory — avoid duplicates (visits already updated screeningDates)
  // We mark visit source separately
  for (const visit of visitHistory) {
    for (const sid of visit.screeningsCompleted) {
      const existing = completedItems.find(c => c.id === sid && c.date === visit.date)
      if (existing) {
        existing.source = visit.doctor
      } else {
        const def = SCREENINGS[sid]
        completedItems.push({
          id: sid,
          date: visit.date,
          name: def?.trName || sid,
          icon: def?.icon || '✅',
          source: visit.doctor,
        })
      }
    }
  }

  // Sort by date descending
  completedItems.sort((a, b) => new Date(b.date) - new Date(a.date))

  const grouped = groupByMonth(completedItems)
  const monthKeys = Object.keys(grouped)

  const isEmpty = completedItems.length === 0

  return (
    <div className="page-enter pb-24 px-5 pt-6">
      <h1 className="text-xl font-extrabold text-gray-900 mb-1">Geçmişim</h1>
      <p className="text-sm text-gray-500 mb-5">Tamamlanan tarama ve doktor ziyaretleri</p>

      {isEmpty ? (
        <div className="mt-8">
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <div className="font-bold text-gray-700 text-lg mb-2">Henüz tamamlanan tarama yok.</div>
            <div className="text-sm text-gray-500 mb-6">Kontrole gittiğinizde taramalarınızı buraya ekleyin.</div>
            <button
              onClick={() => setActiveTab('screenings')}
              className="px-6 py-3 rounded-2xl text-white font-bold text-sm active:scale-98"
              style={{background:'#0D7377'}}
            >
              📋 Taramalarıma Git →
            </button>
          </div>
        </div>
      ) : (
        <div>
          {monthKeys.map(month => (
            <div key={month} className="mb-6">
              {/* Month header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">📅</span>
                <span className="text-sm font-bold text-gray-700">{month}</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.04)'}}>
                {grouped[month].map((item, idx) => (
                  <div
                    key={`${item.id}-${item.date}-${idx}`}
                    className={`flex items-center gap-3 px-4 py-3.5 ${idx < grouped[month].length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">{item.name}</div>
                      {item.source && (
                        <div className="text-xs text-gray-500">{item.source} viziti</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{formatDateLong(item.date)}</div>
                      <div className="text-xs font-bold mt-0.5" style={{color:'#0D9488'}}>✅</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* CTA to add more */}
          <div className="mt-2 text-center">
            <button
              onClick={() => setActiveTab('screenings')}
              className="text-sm font-semibold text-teal underline"
            >
              📋 Taramalarıma Git
            </button>
          </div>
        </div>
      )}

      <FeedbackSection page="lab" />
      <Disclaimer />
    </div>
  )
}
