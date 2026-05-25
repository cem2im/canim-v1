/**
 * Karne paylaşım yardımcısı
 * Canvas'ta radar kartı oluşturur, PNG blob döner.
 * axes: [{ label, icon, score }]  — 5 eksen, score 0-100
 * grade: 'A'|'B'|'C'|'D'|'F'
 * overallScore: 0-100
 */
export async function renderKarneCanvas({ axes, grade, overallScore }) {
  const W = 1080, H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0D7377')
  bg.addColorStop(1, '#134E4A')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Subtle dot pattern
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  for (let x = 0; x < W; x += 40) {
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill()
    }
  }

  // Top brand
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fillRect(0, 0, W, 120)
  ctx.fillStyle = 'white'
  ctx.font = 'bold 52px Georgia, serif'
  ctx.textAlign = 'left'
  ctx.fillText('Canım', 60, 78)
  ctx.font = '28px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText('Sağlık Tarama Karnem', 60, 108)

  // Grade badge (top right)
  const gradeColor = overallScore >= 70 ? '#10B981'
    : overallScore >= 55 ? '#F59E0B' : '#EF4444'
  ctx.fillStyle = 'white'
  roundRect(ctx, W - 180, 24, 130, 88, 20)
  ctx.fill()
  ctx.fillStyle = gradeColor
  ctx.font = 'bold 64px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(grade, W - 115, 96)

  // Radar chart
  const cx = W / 2, cy = 570, R = 280
  const N = axes.length
  const angle = (i) => (Math.PI * 2 * i / N) - Math.PI / 2
  const pt = (i, r) => [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))]

  // Grid rings
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1.5
  ;[0.33, 0.66, 1].forEach(r => {
    ctx.beginPath()
    for (let i = 0; i < N; i++) {
      const [x, y] = pt(i, R * r)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath(); ctx.stroke()
  })

  // Axis lines
  axes.forEach((_, i) => {
    const [x, y] = pt(i, R)
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.stroke()
  })

  // Data polygon
  const dataPoints = axes.map((a, i) => pt(i, R * (a.score / 100)))
  ctx.beginPath()
  dataPoints.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
  ctx.closePath()
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fill()
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 3
  ctx.stroke()

  // Data dots
  dataPoints.forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fillStyle = 'white'; ctx.fill()
    ctx.strokeStyle = gradeColor; ctx.lineWidth = 3; ctx.stroke()
  })

  // Axis labels
  axes.forEach((a, i) => {
    const [x, y] = pt(i, R + 50)
    ctx.font = '36px serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.fillText(a.icon, x, y - 8)
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(a.label, x, y + 22)
    ctx.font = 'bold 20px sans-serif'
    ctx.fillStyle = gradeColor
    ctx.fillText(String(a.score), x, y + 48)
  })

  // Score summary (bottom)
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  roundRect(ctx, 60, H - 180, W - 120, 100, 20)
  ctx.fill()
  ctx.fillStyle = 'white'
  ctx.font = 'bold 30px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`Genel Puan: ${overallScore} / 100`, W / 2, H - 120)
  ctx.font = '22px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText('canim.uzunyasa.com', W / 2, H - 80)

  // Watermark date
  const now = new Date()
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '20px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }), W - 60, H - 40)

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/**
 * PDF için data URL döner (async)
 */
export async function renderRadarDataUrl({ axes, grade, overallScore }) {
  const blob = await renderKarneCanvas({ axes, grade, overallScore })
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Paylaş: navigator.share (mobile) → download fallback
 */
export async function shareKarneImage({ axes, grade, overallScore, waMsg }) {
  const blob = await renderKarneCanvas({ axes, grade, overallScore })
  const file = new File([blob], 'canim-karnem.png', { type: 'image/png' })

  // Native share (iOS/Android)
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Sağlık Karnem — Canım',
        text: waMsg,
        files: [file],
      })
      return
    } catch (e) {
      if (e.name === 'AbortError') return // kullanıcı iptal
    }
  }

  // WhatsApp text fallback (masaüstü veya share desteklenmiyorsa)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'canim-karnem.png'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 3000)
}
