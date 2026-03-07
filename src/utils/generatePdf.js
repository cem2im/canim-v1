import { jsPDF } from 'jspdf'

// Turkish → ASCII safe mapping for PDF fonts that don't support full Unicode
function tr(str) {
  if (!str) return ''
  return String(str)
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
}

function freqLabel(months) {
  if (!months || months >= 999) return 'Tek seferlik'
  const map = { 1:'Ayda bir', 3:'3 ayda bir', 6:'6 ayda bir',
    12:'Yilda bir', 24:'2 yilda bir', 36:'3 yilda bir',
    60:'5 yilda bir', 120:'10 yilda bir' }
  return map[months] || `${months} ayda bir`
}

const STATUS_TR = {
  overdue: 'GECIKTI', upcoming: 'BU AY', soon: 'YAKINDA',
  ok: 'TAMAMLANDI', unknown: 'BILINMIYOR',
}

const MONTHS_TR = ['Ocak','Subat','Mart','Nisan','Mayis','Haziran',
  'Temmuz','Agustos','Eylul','Ekim','Kasim','Aralik']

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`
}

// ── Main export ──────────────────────────────────────────────────────────────
export function generateHealthReport({ profile, diseases, screeningCards, doctorCards, score, scoreLabel, visitHistory }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, M = 18    // page width, margin
  const CONTENT_W = W - M * 2
  let y = 0               // current y cursor

  const now = new Date()
  const reportDate = `${now.getDate()} ${MONTHS_TR[now.getMonth()]} ${now.getFullYear()}`
  const age = profile?.birthYear ? now.getFullYear() - profile.birthYear : '?'

  // ── Helpers ────────────────────────────────────────────────────────────────
  const newPage = () => {
    doc.addPage()
    y = 18
    drawPageHeader()
    drawPageFooter()
  }

  const checkY = (needed = 12) => {
    if (y + needed > 272) newPage()
  }

  const drawPageHeader = () => {
    // Teal top bar
    doc.setFillColor(13, 115, 119)
    doc.rect(0, 0, 210, 8, 'F')
  }

  const drawPageFooter = () => {
    const pg = doc.internal.getCurrentPageInfo().pageNumber
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.setFont('helvetica', 'normal')
    doc.text('Prof. Dr. Cem Simsek · Hacettepe Universitesi · Canim v3.0', M, 290)
    doc.text(`Sayfa ${pg}`, W - M, 290, { align: 'right' })
    doc.text('Bu rapor bilgilendirme amaclidir, tibbi tavsiye niteliginde degildir.', M, 286)
    // Bottom teal bar
    doc.setFillColor(13, 115, 119)
    doc.rect(0, 293, 210, 4, 'F')
  }

  // ── PAGE 1 ─────────────────────────────────────────────────────────────────
  drawPageHeader()
  drawPageFooter()
  y = 18

  // Title block
  doc.setFillColor(13, 115, 119)
  doc.roundedRect(M, y, CONTENT_W, 42, 4, 4, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('CANIM', M + 8, y + 14)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Kisisel Saglik Tarama Raporu', M + 8, y + 24)

  doc.setFontSize(9)
  doc.setTextColor(200, 240, 240)
  doc.text(`Olusturulma tarihi: ${reportDate}`, M + 8, y + 34)
  doc.text(`Rapor No: CN-${now.getTime().toString().slice(-6)}`, W - M - 8, y + 34, { align: 'right' })

  y += 52

  // Score box
  doc.setFillColor(240, 253, 250)
  doc.setDrawColor(13, 148, 136)
  doc.setLineWidth(0.5)
  doc.roundedRect(M, y, CONTENT_W, 32, 4, 4, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(13, 115, 119)
  doc.text(String(score), M + 14, y + 20)

  doc.setFontSize(11)
  doc.setTextColor(13, 115, 119)
  doc.text(tr(scoreLabel), M + 36, y + 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text('Tarama Uyum Puani (40-100)', M + 36, y + 24)

  // Mini stats on right
  const overdueN  = screeningCards.filter(c => c.status === 'overdue').length
  const okN       = screeningCards.filter(c => c.status === 'ok').length
  const unknownN  = screeningCards.filter(c => c.status === 'unknown').length
  const miniStats = [
    { l: 'Toplam',   v: screeningCards.length },
    { l: 'Tamam',    v: okN },
    { l: 'Gecikti',  v: overdueN },
    { l: 'Belirsiz', v: unknownN },
  ]
  const sw = 32, sx0 = W - M - sw * 4 - 3
  miniStats.forEach(({ l, v }, i) => {
    const sx = sx0 + i * (sw + 1)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(13, 115, 119)
    doc.text(String(v), sx + sw / 2, y + 17, { align: 'center' })
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(l, sx + sw / 2, y + 25, { align: 'center' })
  })

  y += 42

  // ── Patient info ───────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(13, 115, 119)
  doc.text('HASTA BILGILERI', M, y)
  doc.setDrawColor(13, 115, 119)
  doc.setLineWidth(0.3)
  doc.line(M, y + 2, M + CONTENT_W, y + 2)
  y += 8

  const infoRows = [
    ['Ad Soyad',   tr(profile?.name || '-')],
    ['Yas',        String(age)],
    ['Cinsiyet',   profile?.sex === 'F' ? 'Kadin' : profile?.sex === 'M' ? 'Erkek' : '-'],
    ['Boy / Kilo', profile?.height && profile?.weight
      ? `${profile.height} cm / ${profile.weight} kg`
      : '-'],
    ['Tanilar',    diseases.length > 0 ? String(diseases.length) + ' tani' : 'Kronik hastalik yok'],
  ]

  doc.setFontSize(9)
  infoRows.forEach(([label, val]) => {
    checkY(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80)
    doc.text(tr(label) + ':', M, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30)
    doc.text(tr(val), M + 38, y)
    y += 7
  })

  y += 6

  // ── Screenings table ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(13, 115, 119)
  doc.text('TARAMA TAKIBI', M, y)
  doc.line(M, y + 2, M + CONTENT_W, y + 2)
  y += 8

  // Table header
  const COL = { name: M, status: M + 74, next: M + 108, freq: M + 148 }
  doc.setFillColor(13, 115, 119)
  doc.rect(M, y - 4, CONTENT_W, 8, 'F')
  doc.setTextColor(255)
  doc.setFontSize(8)
  doc.text('Tarama Adi', COL.name + 2, y)
  doc.text('Durum', COL.status + 2, y)
  doc.text('Sonraki', COL.next + 2, y)
  doc.text('Siklik', COL.freq + 2, y)
  y += 6

  // Status sort order
  const order = { overdue: 0, upcoming: 1, soon: 2, unknown: 3, ok: 4 }
  const sorted = [...screeningCards].sort((a, b) => (order[a.status] ?? 5) - (order[b.status] ?? 5))

  const STATUS_COLORS = {
    overdue:  [220, 38, 38],
    upcoming: [13, 115, 119],
    soon:     [217, 119, 6],
    ok:       [13, 148, 136],
    unknown:  [107, 114, 128],
  }

  let rowAlt = false
  for (const card of sorted) {
    checkY(8)
    if (rowAlt) {
      doc.setFillColor(249, 250, 251)
      doc.rect(M, y - 4, CONTENT_W, 8, 'F')
    }
    rowAlt = !rowAlt

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30)

    // Name (truncate if too long)
    const nameStr = tr(card.trName || card.id)
    doc.text(nameStr.length > 28 ? nameStr.slice(0, 27) + '…' : nameStr, COL.name + 2, y)

    // Status pill
    const [sr, sg, sb] = STATUS_COLORS[card.status] || [100, 100, 100]
    doc.setFillColor(sr, sg, sb)
    doc.roundedRect(COL.status, y - 3.5, 32, 6, 2, 2, 'F')
    doc.setTextColor(255)
    doc.setFontSize(6.5)
    doc.text(STATUS_TR[card.status] || card.status.toUpperCase(), COL.status + 16, y, { align: 'center' })

    doc.setTextColor(60)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(card.nextDate), COL.next + 2, y)
    doc.text(freqLabel(card.frequencyMonths), COL.freq + 2, y)

    y += 8
  }

  y += 6

  // ── Doctor visit schedule ──────────────────────────────────────────────────
  if (doctorCards && doctorCards.length > 0) {
    checkY(20)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(13, 115, 119)
    doc.text('DOKTOR KONTROL TAKVIMI', M, y)
    doc.line(M, y + 2, M + CONTENT_W, y + 2)
    y += 8

    for (const card of doctorCards) {
      checkY(18)
      doc.setFillColor(240, 253, 250)
      doc.roundedRect(M, y - 2, CONTENT_W, 14, 3, 3, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(13, 115, 119)
      doc.text(tr(card.doctor), M + 4, y + 4)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(80)
      const nextStr = card.nextVisitDate ? `Sonraki: ${formatDate(card.nextVisitDate)}` : 'Henuz gidilmedi'
      doc.text(nextStr, M + 4, y + 10)

      const freqStr = `Her ${card.intervalMonths} ayda bir`
      doc.text(freqStr, W - M - 4, y + 4, { align: 'right' })

      // Status
      const [sr, sg, sb] = STATUS_COLORS[card.status] || [100, 100, 100]
      doc.setFillColor(sr, sg, sb)
      doc.roundedRect(W - M - 36, y + 6, 32, 5.5, 2, 2, 'F')
      doc.setTextColor(255)
      doc.setFontSize(6.5)
      doc.text(STATUS_TR[card.status] || 'BILINMIYOR', W - M - 20, y + 10, { align: 'center' })

      y += 18
    }
    y += 4
  }

  // ── Visit history (last 5) ─────────────────────────────────────────────────
  if (visitHistory && visitHistory.length > 0) {
    checkY(20)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(13, 115, 119)
    doc.text('SON DOKTOR ZIYARETLERI', M, y)
    doc.line(M, y + 2, M + CONTENT_W, y + 2)
    y += 8

    const recent = [...visitHistory].reverse().slice(0, 5)
    for (const visit of recent) {
      checkY(10)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(40)
      doc.text(formatDate(visit.date), M, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80)
      doc.text(tr(visit.doctor) + ` — ${visit.screeningsCompleted.length} tarama`, M + 38, y)
      y += 8
    }
    y += 4
  }

  // Save
  const filename = `Canim-Saglik-Raporu-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.pdf`
  doc.save(filename)
}
