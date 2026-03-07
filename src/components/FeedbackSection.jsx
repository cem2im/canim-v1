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
      rating,
      comment:       comment.trim() || null,
      page,
      app_version:   'v3.0',
      user_age:      profile?.birthYear ? new Date().getFullYear() - profile.birthYear : null,
      user_sex:      profile?.sex || null,
      disease_count: diseases?.length ?? 0,
    })

    setSubmitting(false)
    if (sbError) {
      console.error('Feedback error:', sbError)
      setError('Gönderilemedi — internet bağlantınızı kontrol edin.')
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) return (
    <div className="mx-5 mb-2 py-5 px-4 rounded-2xl text-center" style={{background:'#e8f4f5'}}>
      <div className="text-3xl mb-1">🙏</div>
      <div className="font-bold text-sm" style={{color:'#0D7377'}}>Teşekkürler!</div>
      <div className="text-xs text-gray-500 mt-0.5">Geri bildiriminiz iletildi, çok değerli.</div>
    </div>
  )

  return (
    <div className="mx-5 mb-2 bg-white rounded-2xl border border-gray-100 p-5"
      style={{boxShadow:'0 1px 8px rgba(0,0,0,0.04)'}}>
      <div className="text-sm font-bold text-gray-700 mb-0.5">Bu sayfa nasıldı?</div>
      <div className="text-xs text-gray-400 mb-4">
        Görüşleriniz uygulamayı geliştirmemize yardımcı oluyor.
      </div>

      {/* Emoji rating */}
      <div className="flex justify-between mb-3">
        {RATINGS.map(({ score, emoji, label }) => (
          <button
            key={score}
            onClick={() => setRating(score)}
            className="flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all active:scale-90"
            style={rating === score
              ? { background: '#e8f4f5', transform: 'scale(1.15)' }
              : {}}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-xs font-semibold"
              style={{ color: rating === score ? '#0D7377' : '#9CA3AF' }}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Comment + submit — show after rating selected */}
      {rating !== null && (
        <div className="mt-2">
          <textarea
            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm outline-none resize-none transition-colors"
            style={{ borderColor: comment ? '#0D7377' : undefined }}
            rows={2}
            placeholder="Yorum eklemek ister misiniz? (isteğe bağlı)"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-2 w-full py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 active:scale-98"
            style={{ background: '#0D7377' }}
          >
            {submitting ? 'Gönderiliyor…' : 'Gönder →'}
          </button>
        </div>
      )}
    </div>
  )
}
