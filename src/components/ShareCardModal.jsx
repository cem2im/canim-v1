import { useEffect, useRef, useState } from 'react'

// Turkish character safe-render for canvas
function t(str) { return str || '' }

// Draw rounded rect helper
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export default function ShareCardModal({ onClose, score, label, name, cards }) {
  const canvasRef = useRef(null)
  const [dataUrl, setDataUrl] = useState(null)
  const [sharing, setSharing] = useState(false)

  const overdueCount  = cards.filter(c => c.status === 'overdue').length
  const upcomingCount = cards.filter(c => c.status === 'upcoming').length
  const okCount       = cards.filter(c => c.status === 'ok').length
  const total         = cards.length

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 600, H = 420
    canvas.width = W
    canvas.height = H

    // ── Background gradient ──────────────────────────────────────────────
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0,   '#0B5E62')
    grad.addColorStop(0.5, '#0D7377')
    grad.addColorStop(1,   '#0E8C91')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Decorative circles
    ctx.save()
    ctx.globalAlpha = 0.08
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(W - 60, -40, 130, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(W - 20, H + 20, 100, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(-30, H - 40, 80, 0, Math.PI * 2); ctx.fill()
    ctx.restore()

    // ── Score ring ───────────────────────────────────────────────────────
    const cx = 148, cy = 175, r = 90
    // Track
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI * 1.5)
    ctx.stroke()
    // Progress
    const pct = (score - 40) / 60
    const endAngle = -Math.PI / 2 + pct * Math.PI * 2
    ctx.strokeStyle = 'rgba(255,255,255,0.88)'
    ctx.lineWidth = 14
    ctx.beginPath()
    ctx.arc(cx, cy, r, -Math.PI / 2, endAngle)
    ctx.stroke()
    // Score number inside ring
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.font = 'bold 52px Inter, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(score), cx, cy - 8)
    ctx.font = '600 16px Inter, Arial, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText('/ 100', cx, cy + 34)

    // ── Right side content ───────────────────────────────────────────────
    const rx = 305

    // App name
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '700 13px Inter, Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('CANIM', rx, 58)

    // "Tarama Uyum Puanım"
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = '600 22px Inter, Arial, sans-serif'
    ctx.fillText('Tarama Uyum', rx, 100)
    ctx.fillText('Puanim', rx, 130)

    // Score label badge
    const labelColors = {
      'Harika': '#14B8A6', 'İyi': '#F59E0B',
      'Dikkat': '#F97316', 'Acil Eylem': '#EF4444'
    }
    const badgeColor = labelColors[label] || '#14B8A6'
    ctx.fillStyle = badgeColor
    roundRect(ctx, rx, 145, ctx.measureText(label).width + 24, 32, 8)
    ctx.fill()
    ctx.fillStyle = 'white'
    ctx.font = 'bold 14px Inter, Arial, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(t(label), rx + 12, 161)

    // Name
    if (name) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = '600 16px Inter, Arial, sans-serif'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(t(name), rx, 225)
    }

    // Date
    const now = new Date()
    const months = ['Ocak','Subat','Mart','Nisan','Mayis','Haziran',
                    'Temmuz','Agustos','Eylul','Ekim','Kasim','Aralik']
    const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '500 13px Inter, Arial, sans-serif'
    ctx.fillText(dateStr, rx, 248)

    // ── Stat boxes ───────────────────────────────────────────────────────
    const stats = [
      { label: 'Tarama', val: total,         color: 'rgba(255,255,255,0.15)' },
      { label: 'Tamam',   val: okCount,       color: 'rgba(13,148,136,0.4)'  },
      { label: 'Bekliyor', val: upcomingCount, color: 'rgba(251,191,36,0.3)'  },
      { label: 'Gecikmi', val: overdueCount,  color: 'rgba(220,38,38,0.3)'   },
    ]
    const boxW = 62, boxH = 68, boxGap = 10
    const startX = rx, startY = 270
    stats.forEach((s, i) => {
      const bx = startX + i * (boxW + boxGap)
      ctx.fillStyle = s.color
      roundRect(ctx, bx, startY, boxW, boxH, 10)
      ctx.fill()
      // Number
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.font = 'bold 26px Inter, Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(s.val), bx + boxW / 2, startY + 30)
      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.65)'
      ctx.font = '500 10px Inter, Arial, sans-serif'
      ctx.fillText(s.label, bx + boxW / 2, startY + 52)
    })

    // ── Branding footer ──────────────────────────────────────────────────
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    // Bottom separator line
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, H - 52); ctx.lineTo(W - 40, H - 52)
    ctx.stroke()

    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '500 12px Inter, Arial, sans-serif'
    ctx.fillText('Prof. Dr. Cem Simsek · Hacettepe Universitesi', 40, H - 28)
    ctx.textAlign = 'right'
    ctx.fillText('cem2im.github.io/canim-v1', W - 40, H - 28)

    setDataUrl(canvas.toDataURL('image/png'))
  }, [score, label, name, cards]) // eslint-disable-line

  const handleShare = async () => {
    if (!dataUrl) return
    setSharing(true)
    try {
      // Convert dataUrl to Blob
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'canim-puanim.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Tarama Uyum Puanım: ${score}/100`,
          text: `Canım uygulamasında tarama uyum puanım ${score}/100! Siz de kontrol edin: https://cem2im.github.io/canim-v1/`,
        })
      } else {
        // Fallback: download
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = 'canim-puanim.png'
        a.click()
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Fallback to download
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = 'canim-puanim.png'
        a.click()
      }
    }
    setSharing(false)
  }

  const handleWhatsApp = () => {
    if (!dataUrl) return
    // On mobile WhatsApp, best we can do is open with text (image needs to be downloaded first)
    const text = `Canım uygulamasında tarama uyum puanım *${score}/100* (${label})! 🏥\n\nSen de kişisel sağlık tarama takvimine bak: https://cem2im.github.io/canim-v1/`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={onClose}>
      <div
        className="w-full max-w-xl mx-auto bg-white rounded-t-3xl overflow-hidden"
        style={{ maxHeight: '95dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-lg font-extrabold text-gray-900">Puanımı Paylaş 📤</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl font-light">×</button>
        </div>

        {/* Canvas preview */}
        <div className="px-5 pb-4 overflow-x-auto">
          <canvas
            ref={canvasRef}
            className="rounded-2xl shadow-lg"
            style={{ width: '100%', maxWidth: 560, display: 'block', margin: '0 auto' }}
          />
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-8 flex flex-col gap-3">
          <button
            onClick={handleShare}
            disabled={!dataUrl || sharing}
            className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0D7377, #14B8A6)' }}
          >
            {sharing ? 'Paylaşılıyor…' : '📤 Paylaş / İndir'}
          </button>
          <button
            onClick={handleWhatsApp}
            className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
            style={{ background: '#25D366' }}
          >
            💬 WhatsApp'ta Paylaş
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-500"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
