import { useState } from 'react'
import { supabase } from '../lib/supabase'
import useAppStore from '../store/useAppStore'

const RATINGS = [
  { score: 1, emoji: '😕', label: 'Kötü' },
  { score: 2, emoji: '😐', label: 'İdare eder' },
  { score: 3, emoji: '🙂', label: 'İyi' },
  { score: 4, emoji: '😊', label: 'Çok iyi' },
  { score: 5, emoji: '🤩', label: 'Harika!' },
]

export default function FeedbackSection({ page }) {
  const profile  = useAppStore(s => s.profile)
  const diseases = useAppStore(s => s.diseases)

  const [open,       setOpen]       = useState(false)
  const [rating,     setRating]     = useState(null)
  const [comment,    setComment]    = useState('')
  const [submitted,  setSubmitted]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)

  const handleSubmit = async () => {
    if (!rating) return
    setSubmitting(true)
    setError(null)
    const { error: sbError } = await supabase.from('feedback').insert({
      rating, comment: comment.trim() || null, page, app_version: 'v3.0',
      user_age: profile?.birthYear ? new Date().getFullYear() - profile.birthYear : null,
      user_sex: profile?.sex || null, disease_count: diseases?.length ?? 0,
    })
    setSubmitting(false)
    if (sbError) { setError('Gönderilemedi.'); return }
    setSubmitted(true)
    setTimeout(() => { setOpen(false); setSubmitted(false); setRating(null); setComment('') }, 2000)
  }

  return (
    <>
      {/* Tiny link button */}
      <div className="flex justify-center py-2">
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-transform"
          style={{ color: '#9CA3AF', background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
          💬 Geri bildirim gönder
        </button>
      </div>

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="flex-1" onClick={() => setOpen(false)} />
          <div className="bg-white rounded-t-3xl"
            style={{ animation: 'slideUp 0.26s cubic-bezier(0.22,1,0.36,1)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="px-5 pt-2 pb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-base font-extrabold text-gray-900">Bu sayfa nasıldı?</div>
                  <div className="text-xs text-gray-400 mt-0.5">Görüşleriniz uygulamayı geliştiriyor</div>
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280' }}>×</button>
              </div>

              {submitted ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">🙏</div>
                  <div className="font-bold text-sm" style={{ color: '#0D7377' }}>Teşekkürler!</div>
                  <div className="text-xs text-gray-400 mt-1">Geri bildiriminiz iletildi.</div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-4">
                    {RATINGS.map(({ score, emoji, label }) => (
                      <button key={score} onClick={() => setRating(score)}
                        className="flex flex-col items-center gap-1 flex-1 py-2.5 rounded-xl transition-all active:scale-90"
                        style={rating === score ? { background: '#e8f4f5', transform: 'scale(1.12)' } : {}}>
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-xs font-semibold"
                          style={{ color: rating === score ? '#0D7377' : '#9CA3AF' }}>{label}</span>
                      </button>
                    ))}
                  </div>
                  {rating !== null && (
                    <div>
                      <textarea
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm outline-none resize-none mb-2 transition-colors"
                        style={{ borderColor: comment ? '#0D7377' : undefined }}
                        rows={2} placeholder="Yorum eklemek ister misiniz? (isteğe bağlı)"
                        value={comment} onChange={e => setComment(e.target.value)}
                      />
                      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                      <button onClick={handleSubmit} disabled={submitting}
                        className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-50"
                        style={{ background: '#0D7377', border: 'none', cursor: 'pointer' }}>
                        {submitting ? 'Gönderiliyor…' : 'Gönder →'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
