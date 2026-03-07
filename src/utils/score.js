/**
 * Health score calculation (40–100).
 * Weight: cancer=3, organ=2, routine=1
 * Penalty: overdue=0%, soon_due=75%, upcoming=100%, ok=100%, unknown=50%
 */
export function calcScore(screeningCards) {
  if (!screeningCards.length) return 40

  let totalWeight = 0
  let earnedWeight = 0

  for (const card of screeningCards) {
    const w = card.weight || 1
    totalWeight += w

    const multiplier = {
      ok:       1.0,
      upcoming: 1.0,
      soon:     1.0,   // within range — still compliant
      overdue:  0.0,
      unknown:  0.3,   // never done / forgotten — significant penalty
    }[card.status] ?? 0.3

    earnedWeight += w * multiplier
  }

  if (totalWeight === 0) return 40

  const raw = (earnedWeight / totalWeight) * 100
  // Map 0–100 → 40–100
  const score = Math.round(40 + (raw / 100) * 60)
  return Math.max(40, Math.min(100, score))
}

export function scoreColor(score) {
  if (score >= 85) return '#0D9488'  // teal-600 — positive, on-brand
  if (score >= 65) return '#D97706'  // amber-600 — readable, less glaring
  return '#DC2626'                    // red-600 — clear but not alarm-red
}

export function scoreLabel(score) {
  if (score >= 85) return 'Harika'
  if (score >= 65) return 'İyi'
  if (score >= 50) return 'Dikkat'
  return 'Acil Eylem'
}

export function statusColor(status) {
  return {
    overdue:  '#DC2626',  // red-600 — firm but not alarming
    upcoming: '#0D7377',  // teal — on-brand
    soon:     '#D97706',  // amber-600 — readable
    ok:       '#0D9488',  // teal-600 — positive, matches scoreColor
    unknown:  '#6B7280',  // gray-500
  }[status] ?? '#6B7280'
}

export function statusLabel(status, daysUntil) {
  if (status === 'overdue') {
    const days = Math.abs(daysUntil)
    return days < 30 ? `${days} gün gecikmiş` : `${Math.round(days/30)} ay gecikmiş`
  }
  if (status === 'upcoming') return 'Bu ay yapılmalı'
  if (status === 'soon')     return `${Math.round(daysUntil/30)} ay içinde`
  if (status === 'ok')       return 'Tamamlandı ✓'
  return 'Yapılmadı'
}
