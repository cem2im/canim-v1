import { useState } from 'react'
import { createPortal } from 'react-dom'
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

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => { setRating(null); setComment(''); setError(null); setSubmitted(false) }, 300)
  }

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
    setTimeout(handleClose, 2200)
  }

  return (
    <>
      {/* Trigger button */}
      <div className="flex justify-center py-2">
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-transform"
          style={{ color: '#9CA3AF', background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
          💬 Geri bildirim gönder
        </button>
      </div>

      {/* Floating modal — portaled to body */}
      {open && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.48)', zIndex: 9999 }}
          onClick={e => e.target === e.currentTarget && handleClose()}>
          <div
            className="bg-white rounded-3xl w-full shadow-2xl"
            style={{
              maxWidth: 360,
              animation: 'popIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-extrabold text-gray-900">Bu sayfa nasıldı?</div>
                  <div className="text-xs text-gray-400 mt-0.5">Görüşleriniz uygulamayı geliştiriyor</div>
                </div>
                <button onClick={handleClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-2"
                  style={{ background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280' }}>
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              {submitted ? (
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">🙏</div>
                  <div className="font-bold text-base" style={{ color: '#0D7377' }}>Teşekkürler!</div>
                  <div className="text-sm text-gray-400 mt-1">Geri bildiriminiz iletildi.</div>
                </div>
              ) : (
                <>
                  {/* Emoji ratings */}
                  <div className="flex justify-between mb-4">
                    {RATINGS.map(({ score, emoji, label }) => (
                      <button key={score} onClick={() => setRating(score)}
                        className="flex flex-col items-center gap-1 flex-1 py-2.5 rounded-xl transition-all active:scale-90"
                        style={rating === score
                          ? { background: '#e8f4f5', transform: 'scale(1.12)' }
                          : {}}>
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-xs font-semibold"
                          style={{ color: rating === score ? '#0D7377' : '#9CA3AF' }}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Comment + submit */}
                  {rating !== null && (
                    <>
                      <textarea
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm outline-none resize-none mb-3 transition-colors"
                        style={{ borderColor: comment ? '#0D7377' : undefined }}
                        rows={2}
                        placeholder="Yorum eklemek ister misiniz? (isteğe bağlı)"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                      />
                      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                      <button onClick={handleSubmit} disabled={submitting}
                        className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-50"
                        style={{ background: '#0D7377', border: 'none', cursor: 'pointer' }}>
                        {submitting ? 'Gönderiliyor…' : 'Gönder →'}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </>
  )
}
