import { useState } from 'react'
import useAppStore from '../store/useAppStore'

const LAB_PANELS = [
  {
    id: 'kolesterol', label: 'Kolesterol Paneli',
    tests: [
      { id: 'total_kol', label: 'Total Kolesterol', unit: 'mg/dL', ref: '<200', low: 0, high: 200 },
      { id: 'ldl',       label: 'LDL',              unit: 'mg/dL', ref: '<100', low: 0, high: 100 },
      { id: 'hdl',       label: 'HDL',              unit: 'mg/dL', ref: '>40(E) >50(K)', low: 40, high: 999 },
      { id: 'tg',        label: 'Trigliserid',      unit: 'mg/dL', ref: '<150', low: 0, high: 150 },
    ]
  },
  {
    id: 'seker', label: 'Şeker Testleri',
    tests: [
      { id: 'aks', label: 'Açlık Kan Şekeri', unit: 'mg/dL', ref: '70–99', low: 70, high: 99 },
      { id: 'hba1c', label: 'HbA1c',          unit: '%',     ref: '<5.7', low: 0, high: 5.7 },
    ]
  },
  {
    id: 'bobrek', label: 'Böbrek Testleri',
    tests: [
      { id: 'kreatinin', label: 'Kreatinin', unit: 'mg/dL', ref: '0.6–1.2', low: 0.6, high: 1.2 },
      { id: 'egfr',      label: 'eGFR',      unit: 'mL/dk', ref: '>60',    low: 60, high: 999 },
      { id: 'ure',       label: 'Üre',       unit: 'mg/dL', ref: '10–50',  low: 10, high: 50 },
    ]
  },
  {
    id: 'karaciger', label: 'Karaciğer Testleri',
    tests: [
      { id: 'alt', label: 'ALT (SGPT)', unit: 'U/L', ref: '<40',  low: 0, high: 40 },
      { id: 'ast', label: 'AST (SGOT)', unit: 'U/L', ref: '<40',  low: 0, high: 40 },
      { id: 'ggt', label: 'GGT',        unit: 'U/L', ref: '<50',  low: 0, high: 50 },
    ]
  },
  {
    id: 'tiroid', label: 'Tiroid',
    tests: [
      { id: 'tsh',  label: 'TSH', unit: 'mIU/L', ref: '0.4–4.0', low: 0.4, high: 4.0 },
    ]
  },
  {
    id: 'vitaminler', label: 'Vitaminler',
    tests: [
      { id: 'vit_d', label: 'D Vitamini (25-OH)', unit: 'ng/mL', ref: '30–80', low: 30, high: 80 },
      { id: 'b12',   label: 'B12',                unit: 'pg/mL', ref: '200–900', low: 200, high: 900 },
    ]
  },
]

export default function Lab() {
  const labResults = useAppStore(s => s.labResults)
  const addLabResult = useAppStore(s => s.addLabResult)
  const [adding, setAdding] = useState(null) // { panelId, testId }
  const [value, setValue] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))

  const handleSave = () => {
    if (!value || !adding) return
    addLabResult(adding.testId, {
      value: parseFloat(value),
      date,
      notes: ''
    })
    setAdding(null)
    setValue('')
  }

  return (
    <div className="page-enter pb-24 px-5 pt-6">
      <h1 className="text-xl font-extrabold text-gray-900 mb-1">Laboratuvar</h1>
      <p className="text-sm text-gray-400 mb-5">Tahlil sonuçlarınızı takip edin</p>

      {LAB_PANELS.map(panel => {
        const hasData = panel.tests.some(t => (labResults[t.id] || []).length > 0)
        return (
          <div key={panel.id} className="mb-5">
            <h2 className="text-sm font-bold text-gray-700 mb-2">{panel.label}</h2>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.04)'}}>
              {panel.tests.map((test, idx) => {
                const results = labResults[test.id] || []
                const latest = results[results.length - 1]
                const inRange = latest ? latest.value >= test.low && latest.value <= test.high : null
                return (
                  <div
                    key={test.id}
                    className={`flex items-center px-4 py-3 cursor-pointer ${idx < panel.tests.length-1 ? 'border-b border-gray-50' : ''}`}
                    onClick={() => { setAdding({ panelId: panel.id, testId: test.id }); setValue('') }}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">{test.label}</div>
                      <div className="text-xs text-gray-400">Referans: {test.ref}</div>
                    </div>
                    {latest ? (
                      <div className="text-right">
                        <div className={`font-black text-base ${inRange ? 'text-green-500' : 'text-red-500'}`}>
                          {latest.value} <span className="text-xs font-normal text-gray-400">{test.unit}</span>
                        </div>
                        <div className="text-xs text-gray-400">{formatDate(latest.date)}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-teal font-semibold">+ Ekle</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Add result modal */}
      {adding && (() => {
        const panel = LAB_PANELS.find(p => p.id === adding.panelId)
        const test = panel?.tests.find(t => t.id === adding.testId)
        if (!test) return null
        return (
          <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setAdding(null)}>
            <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
              <h3 className="font-extrabold text-gray-900 mb-1">{test.label}</h3>
              <p className="text-xs text-gray-400 mb-4">Referans: {test.ref} {test.unit}</p>
              <div className="mb-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Değer ({test.unit})</label>
                <input
                  autoFocus
                  type="number"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-lg font-bold focus:border-teal outline-none"
                  placeholder={`örn: ${test.low}`}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Tarih</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-teal outline-none font-semibold"
                />
              </div>
              <button
                disabled={!value}
                onClick={handleSave}
                className="w-full py-4 rounded-2xl text-white font-bold disabled:opacity-40"
                style={{background:'#0D7377'}}
              >
                Kaydet
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}
