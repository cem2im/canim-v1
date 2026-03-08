import { useState } from 'react'
import useAppStore from '../store/useAppStore'
import { DISEASE_LIST } from '../data/screenings'
import { supabase } from '../lib/supabase'
import { generateHealthReport } from '../utils/generatePdf'
import FeedbackSection from '../components/FeedbackSection'
import Disclaimer from '../components/Disclaimer'
import { TOUR_KEY } from '../components/TourOverlay'

export default function Profile() {
  const profile  = useAppStore(s => s.profile)
  const authUser = useAppStore(s => s.authUser)
  const diseases = useAppStore(s => s.diseases)
  const medications = useAppStore(s => s.medications)
  const emergency = useAppStore(s => s.emergency)
  const visitHistory = useAppStore(s => s.visitHistory)
  const updateProfile  = useAppStore(s => s.updateProfile)
  const updateDiseases = useAppStore(s => s.updateDiseases)
  const updateEmergency = useAppStore(s => s.updateEmergency)
  const addMedication  = useAppStore(s => s.addMedication)
  const removeMedication = useAppStore(s => s.removeMedication)
  const getScreeningCards  = useAppStore(s => s.getScreeningCards)
  const getDoctorVisitCards = useAppStore(s => s.getDoctorVisitCards)
  const getScore = useAppStore(s => s.getScore)

  const [generatingPdf, setGeneratingPdf] = useState(false)

  const handleGeneratePdf = () => {
    setGeneratingPdf(true)
    setTimeout(() => {
      try {
        const score = getScore()
        const scoreLabel = score >= 85 ? 'Harika' : score >= 65 ? 'İyi' : score >= 50 ? 'Dikkat' : 'Acil Eylem'
        generateHealthReport({
          profile,
          diseases,
          screeningCards: getScreeningCards(),
          doctorCards: getDoctorVisitCards(),
          score,
          scoreLabel,
          visitHistory,
        })
      } catch (e) {
        console.error('PDF error:', e)
      }
      setGeneratingPdf(false)
    }, 50)
  }

  const [editingMed, setEditingMed] = useState(null)
  const [medForm, setMedForm] = useState({ name:'', dose:'', timing:'sabah' })

  const saveEmergency = (field, val) => updateEmergency({ [field]: val })

  return (
    <div className="page-enter pb-24 px-5 pt-6">
      <h1 className="text-xl font-extrabold text-gray-900 mb-5">Profilim</h1>

      {/* Personal Info */}
      <Section title="Kişisel Bilgiler">
        <EditField label="Ad" value={profile?.name || ''} onSave={v => updateProfile({ name: v })} />
        <EditField label="Doğum Yılı" value={profile?.birthYear?.toString() || ''} type="number" onSave={v => updateProfile({ birthYear: parseInt(v) })} />
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Cinsiyet</span>
          <div className="flex gap-2">
            {[{v:'F',l:'Kadın'},{v:'M',l:'Erkek'}].map(o => (
              <button key={o.v} onClick={() => updateProfile({ sex: o.v })}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={profile?.sex === o.v ? {background:'#0D7377',color:'white'} : {background:'#f3f4f6',color:'#374151'}}
              >{o.l}</button>
            ))}
          </div>
        </div>
      </Section>

      {/* Diseases — chronic only (cancer history excluded) */}
      <Section title="Hastalıklarım">
        <div className="flex flex-wrap gap-2 py-2">
          {DISEASE_LIST.filter(d => !d.group).map(d => (
            <button key={d.id}
              onClick={() => updateDiseases(
                diseases.includes(d.id) ? diseases.filter(x=>x!==d.id) : [...diseases, d.id]
              )}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={diseases.includes(d.id) ? {background:'#0D7377',color:'white'} : {background:'#f3f4f6',color:'#374151'}}
            >
              {d.icon} {d.label}
            </button>
          ))}
        </div>
        {/* Cancer history indicator — read-only */}
        {diseases.some(d => DISEASE_LIST.find(x => x.id === d)?.group === 'kanser') && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ailede Kanser Öyküsü</div>
            <div className="flex flex-wrap gap-2">
              {diseases
                .map(id => DISEASE_LIST.find(x => x.id === id))
                .filter(d => d?.group === 'kanser')
                .map(d => (
                  <span key={d.id} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{background:'#f3e8ff', color:'#7c3aed'}}>
                    {d.icon} {d.label.split(' — ')[0]}
                  </span>
                ))
              }
            </div>
            <p className="text-xs text-gray-500 mt-2">Değiştirmek için onboarding'i sıfırlayın.</p>
          </div>
        )}
      </Section>

      {/* Medications */}
      <Section title="İlaçlarım" action={{ label:'+ Ekle', onClick:() => { setEditingMed('new'); setMedForm({name:'',dose:'',timing:'sabah'}) } }}>
        {medications.length === 0 && (
          <p className="text-sm text-gray-500 py-2">Henüz ilaç eklenmedi.</p>
        )}
        {medications.map(med => (
          <div key={med.id} className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="font-semibold text-sm text-gray-900">{med.name}</div>
              <div className="text-xs text-gray-500">{med.dose} · {med.timing}</div>
            </div>
            <button onClick={() => removeMedication(med.id)} className="text-red-500 text-sm font-semibold">Sil</button>
          </div>
        ))}
      </Section>

      {/* Emergency */}
      <Section title="Acil Bilgilerim">
        <div className="py-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Kan Grubu</label>
          <div className="flex flex-wrap gap-2">
            {['A+','A-','B+','B-','AB+','AB-','0+','0-','Bilmiyorum'].map(bt => (
              <button key={bt}
                onClick={() => saveEmergency('bloodType', bt)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={emergency.bloodType === bt ? {background:'#0D7377',color:'white'} : {background:'#f3f4f6',color:'#374151'}}
              >{bt}</button>
            ))}
          </div>
        </div>
        <EditField label="Alerjiler" value={emergency.allergies} onSave={v => saveEmergency('allergies', v)} placeholder="Penisilin, Aspirin..." />
        <EditField label="Acil Kişi" value={emergency.contactName} onSave={v => saveEmergency('contactName', v)} placeholder="Ad Soyad" />
        <EditField label="Telefon" value={emergency.contactPhone} onSave={v => saveEmergency('contactPhone', v)} placeholder="05XX XXX XX XX" type="tel" />
      </Section>

      {/* PDF Report + WhatsApp Share */}
      <div className="mb-5 bg-white rounded-2xl border border-gray-100 overflow-hidden p-4" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.04)'}}>
        <h2 className="text-sm font-bold text-gray-700 mb-3">Raporlar & Paylaşım</h2>

        {/* PDF Report */}
        <button
          onClick={handleGeneratePdf}
          disabled={generatingPdf}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all mb-3 disabled:opacity-60"
          style={{background: generatingPdf ? '#6B7280' : 'linear-gradient(135deg, #0D7377, #14919B)'}}
        >
          {generatingPdf ? '⏳ Hazırlanıyor…' : '📄 Sağlık Raporumu İndir (PDF)'}
        </button>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Tarama durumunuzu, doktor takvimini ve uyum puanınızı içeren kişisel rapor. Doktorunuza göstermek için kullanabilirsiniz.
        </p>

        {/* WhatsApp share */}
        <button
          onClick={() => {
            const text = `Canım uygulamasını dene — yaşına ve hastalıklarına göre hangi taramaları ne zaman yaptırman gerektiğini gösteriyor! https://canim.uzunyasa.com/`
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
          }}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
          style={{background:'#25D366'}}
        >
          💬 Arkadaşlarına Öner (WhatsApp)
        </button>
      </div>

      {/* Data save status */}
      <div className="mb-5 px-4 py-4 rounded-2xl flex items-center gap-3"
        style={authUser?.saved
          ? {background:'#e8f4f5', border:'1px solid #b2dfdb'}
          : {background:'#fafafa', border:'1px solid #e5e7eb'}}>
        <span className="text-2xl">{authUser?.saved ? '☁️' : '📱'}</span>
        <div className="flex-1">
          {authUser?.saved ? (
            <>
              <div className="text-sm font-bold" style={{color:'#0D7377'}}>
                @{authUser.username} · Veriler Kaydedildi
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Verileriniz hesabınıza bağlı.
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-bold text-gray-700">Yalnızca Bu Cihazda</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Verileriniz kaydedilmiyor. Cihazı değiştirirseniz kaybolabilir.
              </div>
            </>
          )}
        </div>
        {authUser?.saved && (
          <button
            onClick={async () => { await supabase.auth.signOut() }}
            className="text-xs text-gray-500 font-semibold px-2 py-1 rounded-lg"
            style={{background:'rgba(0,0,0,0.05)'}}
          >Çıkış</button>
        )}
      </div>

      {/* App info */}
      <div className="text-center py-2 text-xs text-gray-500 mb-2">
        <div className="font-bold text-teal text-sm mb-0.5">Canım v3.0</div>
        Prof. Dr. Cem Şimşek tarafından tasarlandı
        <div className="mt-2">
          <button
            onClick={() => { localStorage.removeItem(TOUR_KEY); window.location.reload() }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{background:'rgba(13,115,119,0.1)', color:'#0D7377', border:'none', cursor:'pointer'}}
          >
            🎯 Uygulamayı Tanıtımı Tekrar İzle
          </button>
        </div>
      </div>

      <FeedbackSection page="profile" />
      <Disclaimer />

      {/* Add Medication Modal */}
      {editingMed && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setEditingMed(null)}>
          <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-gray-900 mb-4">İlaç Ekle</h3>
            <div className="mb-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">İlaç Adı</label>
              <input autoFocus className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-teal outline-none font-semibold"
                placeholder="Metformin" value={medForm.name} onChange={e => setMedForm(f=>({...f,name:e.target.value}))} />
            </div>
            <div className="mb-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Doz</label>
              <input className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-teal outline-none font-semibold"
                placeholder="500mg" value={medForm.dose} onChange={e => setMedForm(f=>({...f,dose:e.target.value}))} />
            </div>
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Ne Zaman</label>
              <div className="flex gap-2">
                {['sabah','akşam','her ikisi'].map(t => (
                  <button key={t} onClick={() => setMedForm(f=>({...f,timing:t}))}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={medForm.timing===t ? {background:'#0D7377',color:'white'} : {background:'#f3f4f6',color:'#374151'}}
                  >{t}</button>
                ))}
              </div>
            </div>
            <button
              disabled={!medForm.name}
              onClick={() => {
                addMedication({ id: Date.now().toString(), ...medForm })
                setEditingMed(null)
              }}
              className="w-full py-4 rounded-2xl text-white font-bold disabled:opacity-40"
              style={{background:'#0D7377'}}
            >Kaydet</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children, action }) {
  return (
    <div className="mb-5 bg-white rounded-2xl border border-gray-100 overflow-hidden p-4" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.04)'}}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-700">{title}</h2>
        {action && (
          <button onClick={action.onClick} className="text-xs font-bold text-teal">{action.label}</button>
        )}
      </div>
      {children}
    </div>
  )
}

function EditField({ label, value, onSave, type='text', placeholder='' }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)

  if (editing) return (
    <div className="py-2 border-b border-gray-100">
      <label className="text-xs font-bold text-gray-500 block mb-1">{label}</label>
      <div className="flex gap-2">
        <input autoFocus type={type}
          className="flex-1 px-3 py-2 rounded-xl border-2 border-teal outline-none font-semibold text-sm"
          value={val} onChange={e => setVal(e.target.value)}
          placeholder={placeholder}
        />
        <button onClick={() => { onSave(val); setEditing(false) }}
          className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{background:'#0D7377'}}>✓</button>
      </div>
    </div>
  )

  return (
    <div onClick={() => { setVal(value); setEditing(true) }}
      className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <span className="text-sm text-gray-500">{value || placeholder || 'Ekle →'}</span>
    </div>
  )
}
