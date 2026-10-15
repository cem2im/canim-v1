// Draws the doctor page as a PNG on the phone itself; nothing is uploaded.

const C = { kagit: '#FAF5EA', kart: '#FFFDF7', murekkep: '#231A14', ikincil: '#4A3D33', nar: '#8E2F1C', cini: '#1C3F6E', cizgi: '#D9CCB8' }
const W = 1080
const PAD = 72

function wrap(ctx, text, maxW) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const t = line ? `${line} ${w}` : w
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line)
      line = w
    } else line = t
  }
  if (line) lines.push(line)
  return lines
}

function layout(ctx, { meta, items, footer }, draw) {
  let y = 0
  const text = (str, font, color, x, maxW, lh) => {
    ctx.font = font
    for (const l of wrap(ctx, str, maxW)) {
      y += lh
      if (draw) {
        ctx.fillStyle = color
        ctx.fillText(l, x, y)
      }
    }
  }
  if (draw) {
    ctx.fillStyle = C.kagit
    ctx.fillRect(0, 0, W, ctx.canvas.height)
    ctx.fillStyle = C.nar
    ctx.fillRect(0, 0, W, 14)
  }
  y = 40
  ctx.textBaseline = 'alphabetic'
  text('Canım', 'italic 600 52px Literata', C.nar, PAD, 600, 64)
  y += 24
  text('Sayın Doktor,', '500 36px CanimDigits, "Atkinson Hyperlegible Next"', C.ikincil, PAD, W - 2 * PAD, 48)
  text('Bu kontrolleri sizinle konuşmak istiyorum', '700 58px Literata', C.murekkep, PAD, W - 2 * PAD, 70)
  y += 8
  text(meta, '500 34px CanimDigits, "Atkinson Hyperlegible Next"', C.ikincil, PAD, W - 2 * PAD, 46)
  y += 24
  items.forEach((it, i) => {
    if (draw) {
      ctx.fillStyle = C.cizgi
      ctx.fillRect(PAD, y, W - 2 * PAD, 3)
    }
    y += 8
    const top = y
    text(it.doctor, '600 42px Literata', C.murekkep, PAD + 90, W - 2 * PAD - 90, 56)
    if (it.doctorSub) text(it.doctorSub, '500 32px CanimDigits, "Atkinson Hyperlegible Next"', C.ikincil, PAD + 90, W - 2 * PAD - 90, 44)
    text(it.tag, '700 28px CanimDigits, "Atkinson Hyperlegible Next"', C.cini, PAD + 90, W, 42)
    if (draw) {
      ctx.font = '700 64px Literata'
      ctx.fillStyle = C.nar
      ctx.fillText(String(i + 1), PAD + 8, top + 58)
    }
    y += 22
  })
  y += 20
  text(footer, '500 28px CanimDigits, "Atkinson Hyperlegible Next"', C.ikincil, PAD, W - 2 * PAD, 40)
  return y + 60
}

export async function saveDoctorImage(data) {
  const fonts = ['italic 600 52px Literata', '700 58px Literata', '600 42px Literata', '500 34px CanimDigits, "Atkinson Hyperlegible Next"', '700 28px CanimDigits, "Atkinson Hyperlegible Next"']
  await Promise.all(fonts.map((f) => document.fonts.load(f, 'Canım ğüşıöç 0123')))
  const c = document.createElement('canvas')
  c.width = W
  c.height = 100
  const h = layout(c.getContext('2d'), data, false)
  c.height = h
  layout(c.getContext('2d'), data, true)
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'))
  const file = new File([blob], 'canim-doktor-sayfasi.png', { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Doktora gösterilecek sayfa' })
      return
    } catch (e) {
      if (e?.name === 'AbortError') return
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}
