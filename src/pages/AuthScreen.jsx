import { useState } from 'react'
import { supabase } from '../lib/supabase'

// ── helpers ───────────────────────────────────────────────────────────────────
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function validateUsername(u) {
  if (!u || u.length < 3)  return 'En az 3 karakter olmalı'
  if (u.length > 20)        return 'En fazla 20 karakter olabilir'
  if (!/^[a-z0-9_]+$/.test(u)) return 'Sadece harf (küçük), rakam ve _ kullanın'
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AuthScreen({ onAuth }) {
  const [tab,        setTab]        = useState('new')   // 'new' | 'login'
  const [username,   setUsername]   = useState('')
  const [password,   setPassword]   = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [showPass,   setShowPass]   = useState(false)

  const emailFake = `${username.trim().toLowerCase()}@canim.local`

  const handleSubmit = async () => {
    setError(null)
    const unErr = validateUsername(username.trim().toLowerCase())
    if (unErr) return setError(unErr)
    if (!password || password.length < 6) return setError('Şifre en az 6 karakter olmalı')

    setLoading(true)
    try {
      if (tab === 'new') {
        const { data, error: sbErr } = await supabase.auth.signUp({
          email: emailFake,
          password,
          options: { data: { username: username.trim().toLowerCase() } },
        })
        if (sbErr) {
          if (sbErr.message?.includes('already registered')) {
            setError('Bu kullanıcı adı alınmış. Farklı bir ad deneyin veya "Giriş Yap" sekmesine geçin.')
          } else {
            setError(sbErr.message || 'Hesap oluşturulamadı.')
          }
          setLoading(false)
          return
        }
        onAuth({ username: username.trim().toLowerCase(), userId: data?.user?.id || null, saved: true })

      } else {
        const { data, error: sbErr } = await supabase.auth.signInWithPassword({
          email: emailFake,
          password,
        })
        if (sbErr) {
          setError('Kullanıcı adı veya şifre hatalı.')
          setLoading(false)
          return
        }
        onAuth({ username: username.trim().toLowerCase(), userId: data?.user?.id || null, saved: true })
      }
    } catch (e) {
      setError('Bağlantı hatası. İnternet bağlantınızı kontrol edin.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 py-10 page-enter" style={{background:'#FAFAF8'}}>
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{background:'linear-gradient(135deg,#0D7377,#14919B)'}}>
          <span className="text-white text-3xl font-black">C</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Verilerinizi Koruyun</h1>
        <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
          Hesap oluşturarak taramalarınızı kaydedin ve her cihazdan erişin.
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
        {[{key:'new',label:'Yeni Hesap'},{key:'login',label:'Giriş Yap'}].map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setError(null) }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={tab === t.key ? {background:'white', color:'#0D7377', boxShadow:'0 1px 4px rgba(0,0,0,0.1)'} : {color:'#6B7280'}}
          >{t.label}</button>
        ))}
      </div>

      {/* Privacy notice */}
      <div className="mb-5 px-4 py-3 rounded-2xl flex items-start gap-2.5"
        style={{background:'#fffbeb', border:'1px solid #fde68a'}}>
        <span className="text-base mt-0.5">⚠️</span>
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Gizliliğinizi koruyun:</strong> Gerçek adınızı, TC kimlik numaranızı veya sizi tanımlayan bilgileri kullanmayın. Takma ad veya rastgele bir kullanıcı adı kullanın.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
            Kullanıcı Adı
          </label>
          <input
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 font-semibold outline-none focus:border-teal transition-colors"
            placeholder="örn: hasta42 veya ay_cicegi"
            value={username}
            onChange={e => { setUsername(e.target.value.toLowerCase()); setError(null) }}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
          <p className="text-xs text-gray-400 mt-1 ml-1">Küçük harf, rakam, alt çizgi (_) — 3-20 karakter</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
            Şifre
          </label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 font-semibold outline-none focus:border-teal transition-colors pr-12"
              placeholder="En az 6 karakter"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null) }}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold"
            >{showPass ? 'Gizle' : 'Göster'}</button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm text-red-700" style={{background:'#fef2f2', border:'1px solid #fecaca'}}>
            {error}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="mt-8 space-y-3">
        <button
          onClick={handleSubmit}
          disabled={loading || !username || !password}
          className="w-full py-4 rounded-2xl text-white font-bold text-base active:scale-98 transition-all disabled:opacity-40"
          style={{background:'#0D7377'}}
        >
          {loading ? 'Lütfen bekleyin…' : tab === 'new' ? 'Hesap Oluştur →' : 'Giriş Yap →'}
        </button>

        {/* Skip */}
        <button
          onClick={() => onAuth({ username: null, userId: null, saved: false })}
          className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-500 bg-white active:scale-98"
        >
          Kaydetmeden Devam Et
        </button>
        <p className="text-xs text-gray-400 text-center leading-relaxed px-2">
          Hesap oluşturmazsanız verileriniz yalnızca bu cihazda saklanır. Cihazı değiştirirseniz veya tarayıcı geçmişini silerseniz verileriniz kaybolabilir.
        </p>
      </div>
    </div>
  )
}
