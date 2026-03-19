/**
 * Generates an .ics calendar file from upcoming screening cards.
 * Downloads it to the user's device automatically.
 */
export function generateICS(cards) {
  // Take overdue + upcoming (within 12 months), sorted by urgency
  const relevant = cards
    .filter(c =>
      c.status === 'overdue' || c.status === 'unknown' ||
      (c.daysUntil !== null && c.daysUntil <= 365)
    )
    .sort((a, b) => (a.daysUntil ?? -1) - (b.daysUntil ?? -1))
    .slice(0, 25)

  const now = new Date()
  const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Canım//Sağlık Takip//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Canım Sağlık Takvimleri',
    'X-WR-TIMEZONE:Europe/Istanbul',
  ]

  for (const card of relevant) {
    // Use nextDate if exists, otherwise today (overdue)
    const rawDate = card.nextDate || now.toISOString().slice(0, 10)
    const dtstart = rawDate.replace(/-/g, '')
    // End = same day (all-day event)
    const dtend = dtstart

    // Alarm: 3 days before
    const uid = `canim-${card.id}-${dtstart}@canim.uzunyasa.com`

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `SUMMARY:${card.status === 'overdue' || card.status === 'unknown' ? '🔴' : '🟡'} ${card.trName}`,
      `DESCRIPTION:Canım sağlık hatırlatması\\ncanim.uzunyasa.com`,
      `URL:https://canim.uzunyasa.com`,
      'BEGIN:VALARM',
      'TRIGGER:-P3D',
      'ACTION:DISPLAY',
      `DESCRIPTION:${card.trName} zamanı geliyor! — Canım`,
      'END:VALARM',
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')

  const icsContent = lines.join('\r\n')
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'canim-saglik-takvimi.ics'
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Builds a WhatsApp-ready reminder message from screening cards.
 */
export function buildWhatsAppReminder(cards, profileName) {
  const urgent = cards.filter(c =>
    c.status === 'overdue' || c.status === 'unknown' ||
    (c.daysUntil !== null && c.daysUntil <= 30)
  )
  const soon = cards.filter(c =>
    c.daysUntil !== null && c.daysUntil > 30 && c.daysUntil <= 90
  )

  const greet = profileName ? `Merhaba ${profileName}! 👋\n\n` : '👋\n\n'

  let msg = `${greet}📋 *Canım Sağlık Hatırlatmaları*\n`
  msg += `canim.uzunyasa.com\n\n`

  if (urgent.length > 0) {
    msg += `🔴 *Hemen yapılması gerekenler:*\n`
    for (const c of urgent.slice(0, 6)) {
      msg += `• ${c.icon} ${c.trName}\n`
    }
    msg += '\n'
  }

  if (soon.length > 0) {
    msg += `🟡 *Yakında (1-3 ay):*\n`
    for (const c of soon.slice(0, 4)) {
      const weeks = Math.round(c.daysUntil / 7)
      msg += `• ${c.icon} ${c.trName} — ${weeks} hafta sonra\n`
    }
    msg += '\n'
  }

  if (urgent.length === 0 && soon.length === 0) {
    msg += `✅ Tüm taramalarınız güncel! Harika gidiyorsunuz.\n\n`
  }

  msg += `🔗 Detaylar ve tarama işaretleme:\ncanim.uzunyasa.com`
  return msg
}
