import { useState } from 'react'

function EyeIcon({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', padding: '20px 0 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      <span style={{ fontSize: 14, fontWeight: 600 }}>Geri</span>
    </button>
  )
}

// Simple local auth — no server, credentials stored in localStorage
const AUTH_KEY = 'canim_local_accounts'

function getAccounts() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || '{}') } catch { return {} }
}
function saveAccount(username, passwordHash) {
  const accounts = getAccounts()
  accounts[username.toLowerCase()] = { username, passwordHash, createdAt: new Date().toISOString() }
  localStorage.setItem(AUTH_KEY, JSON.stringify(accounts))
}
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'canim_salt_v1')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('choice') // 'choice' | 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)

  async function handleRegister() {
    setError('')
    const u = username.trim()
    if (u.length < 3) return setError('Kullanıcı adı en az 3 karakter olmalı.')
    if (password.length < 6) return setError('Şifre en az 6 karakter olmalı.')
    if (password !== password2) return setError('Şifreler eşleşmiyor.')
    const accounts = getAccounts()
    if (accounts[u.toLowerCase()]) return setError('Bu kullanıcı adı zaten kullanımda.')
    setLoading(true)
    try {
      const hash = await hashPassword(password)
      saveAccount(u, hash)
      onAuth({ username: u, type: 'local', saved: true })
    } catch { setError('Bir hata oluştu.') }
    setLoading(false)
  }

  async function handleLogin() {
    setError('')
    const u = username.trim()
    if (!u || !password) return setError('Kullanıcı adı ve şifre gerekli.')
    const accounts = getAccounts()
    const account = accounts[u.toLowerCase()]
    if (!account) return setError('Kullanıcı bulunamadı.')
    setLoading(true)
    try {
      const hash = await hashPassword(password)
      if (hash !== account.passwordHash) {
        setError('Şifre hatalı.')
        setLoading(false)
        return
      }
      onAuth({ username: account.username, type: 'local', saved: true })
    } catch { setError('Bir hata oluştu.') }
    setLoading(false)
  }

  // ── Choice Screen ──────────────────────────────────────────────────────────
  if (mode === 'choice') {
    return (
      <div style={{
        minHeight: '100dvh',
        background: '#FAFAF8',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 20px',
      }}>
        {/* Header */}
        <div style={{ paddingTop: 64, paddingBottom: 32, textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #0D7377, #14B8A6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C16 4 8 9 8 16C8 19.7 11 22.7 14.7 23L14.7 28H17.3V23C21 22.7 24 19.7 24 16C24 9 16 4 16 4Z" fill="white" opacity="0.9"/>
              <path d="M16 13V19M13 16H19" stroke="#0D7377" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
            Hoş geldiniz
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
            Canım'ı nasıl kullanmak istersiniz?
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>

          {/* Create account — PRIMARY / recommended */}
          <button
            onClick={() => { setMode('register'); setError('') }}
            style={{
              background: 'linear-gradient(135deg, #0D7377, #14B8A6)',
              border: 'none',
              borderRadius: 18,
              padding: '20px 20px',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '0 4px 20px rgba(13,115,119,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 26 }}>✨</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Hesap Oluştur</div>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.22)',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.95)',
                  fontWeight: 600,
                  marginTop: 2,
                }}>Önerilen</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5 }}>
              Verilerinizi güvenle saklayın. Yalnızca kullanıcı adı ve şifre gerekir — e-posta sorulmaz.
            </p>
          </button>

          {/* Login */}
          <button
            onClick={() => { setMode('login'); setError('') }}
            style={{
              background: 'white',
              border: '1.5px solid #E5E7EB',
              borderRadius: 18,
              padding: '18px 20px',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>🔑</span>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Giriş Yap</div>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
              Daha önce bir hesap oluşturduysanız giriş yapın.
            </p>
          </button>

          {/* Anonymous — tertiary */}
          <button
            id="tour-auth-anon"
            onClick={() => onAuth(null)}
            style={{
              background: 'white',
              border: '1.5px solid #E5E7EB',
              borderRadius: 18,
              padding: '18px 20px',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>👤</span>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Anonim Devam Et</div>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
              Hesap oluşturmadan başlayın. Verileriniz yalnızca bu cihazda saklanır.
            </p>
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', padding: '24px 0', lineHeight: 1.5 }}>
          Verileriniz cihazınızda güvenli şekilde şifrelenir.
        </p>
      </div>
    )
  }

  // ── Register / Login Form ──────────────────────────────────────────────────
  const isRegister = mode === 'register'

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#FAFAF8',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 20px',
    }}>
      {/* Back button */}
      <BackButton onClick={() => { setMode('choice'); setError(''); setUsername(''); setPassword(''); setPassword2('') }} />

      {/* Header */}
      <div style={{ paddingTop: 16, paddingBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
          {isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
          {isRegister ? 'E-posta gerekmez — sadece kullanıcı adı ve şifre.' : 'Kullanıcı adınız ve şifrenizle giriş yapın.'}
        </p>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Kullanıcı Adı</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="kullanıcıadınız"
            autoCapitalize="none"
            autoCorrect="off"
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 14,
              border: '1.5px solid #E5E7EB', fontSize: 16,
              background: 'white', outline: 'none', boxSizing: 'border-box',
              color: '#111827',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Şifre</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isRegister ? 'En az 6 karakter' : 'Şifreniz'}
              style={{
                width: '100%', padding: '14px 48px 14px 16px', borderRadius: 14,
                border: '1.5px solid #E5E7EB', fontSize: 16,
                background: 'white', outline: 'none', boxSizing: 'border-box',
                color: '#111827',
              }}
            />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}>
              <EyeIcon open={showPwd} />
            </button>
          </div>
        </div>

        {isRegister && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Şifre Tekrar</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd2 ? 'text' : 'password'}
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                placeholder="Şifrenizi tekrar girin"
                style={{
                  width: '100%', padding: '14px 48px 14px 16px', borderRadius: 14,
                  border: '1.5px solid #E5E7EB', fontSize: 16,
                  background: 'white', outline: 'none', boxSizing: 'border-box',
                  color: '#111827',
                }}
              />
              <button type="button" onClick={() => setShowPwd2(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}>
                <EyeIcon open={showPwd2} />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 12, padding: '12px 14px',
            fontSize: 13, color: '#991B1B', fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={isRegister ? handleRegister : handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 14,
            background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #0D7377, #14B8A6)',
            color: 'white', fontWeight: 800, fontSize: 16, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(13,115,119,0.3)',
            marginTop: 4,
          }}
        >
          {loading ? 'Lütfen bekleyin...' : isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
        </button>

        {/* Switch mode */}
        <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
          {isRegister ? 'Zaten hesabınız var mı?' : 'Hesabınız yok mu?'}{' '}
          <button
            onClick={() => { setMode(isRegister ? 'login' : 'register'); setError('') }}
            style={{ background: 'none', border: 'none', color: '#0D7377', fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0 }}
          >
            {isRegister ? 'Giriş Yap' : 'Oluştur'}
          </button>
        </p>

        {/* Anonymous fallback */}
        <button
          onClick={() => onAuth(null)}
          style={{
            background: 'none', border: '1.5px solid #E5E7EB', borderRadius: 12,
            padding: '13px', color: '#6B7280', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', marginTop: 4,
          }}
        >
          Hesap olmadan anonim devam et
        </button>
      </div>
    </div>
  )
}
