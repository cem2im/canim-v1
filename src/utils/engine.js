import { SCREENINGS, DISEASE_SCREENINGS } from '../data/screenings'

/**
 * Build the personalized screening list for a patient.
 * Merges base (healthy) + disease-specific screenings.
 * Conflict resolution: most frequent wins.
 */
export function buildScreeningList(diseases, profile) {
  if (!profile) return []

  const { birthYear, sex } = profile
  const age = new Date().getFullYear() - birthYear

  // Collect all screenings with their required frequency
  const map = {} // id → min frequencyMonths

  const addSet = (key) => {
    const set = DISEASE_SCREENINGS[key]
    if (!set) return
    for (const item of set.screenings) {
      const def = SCREENINGS[item.id]
      if (!def) continue
      // Age/sex filter
      if (age < def.ageMin || age > def.ageMax) continue
      if (def.sex === 'F' && sex !== 'F') continue
      if (def.sex === 'M' && sex !== 'M') continue
      // Conflict: take most frequent (lowest months)
      if (!map[item.id] || item.months < map[item.id]) {
        map[item.id] = item.months
      }
    }
  }

  // Always add base healthy screenings
  addSet('healthy')

  // Add disease-specific
  for (const d of diseases) {
    addSet(d)
  }

  // Cancer screenings (kolonoskopi, mamografi, pap_smear, prostat) are data-driven:
  // They live in DISEASE_SCREENINGS['healthy'] with age/sex filters on each SCREENINGS entry.
  // No hardcoded additions needed here.

  // Age-based automatic vaccine additions
  if (age >= 50 && !map['asi_zona'])   map['asi_zona']   = 999  // ACIP Grade A ≥50
  if (age >= 65 && !map['asi_pnomoni']) map['asi_pnomoni'] = 999 // ACIP 2022 ≥65

  // Build final list
  return Object.entries(map).map(([id, months]) => ({
    ...SCREENINGS[id],
    frequencyMonths: months,
  }))
}

/**
 * Build initial screening dates object from onboarding answers.
 * lastAnswered: { screeningId: 'this_month' | '3m' | '6m' | '1y' | '2y' | '5y' | 'older' | 'unknown' }
 */
export function buildInitialDates(screeningList, lastAnswered) {
  const today = new Date()
  const result = {}

  for (const s of screeningList) {
    const answer = lastAnswered[s.id] || 'unknown'
    let lastDate = null

    if (answer !== 'unknown') {
      const monthsAgo = {
        'this_month': 0, '3m': 3, '6m': 6, '1y': 12, '2y': 24, '5y': 60, 'older': 84
      }[answer] ?? 0
      lastDate = new Date(today)
      lastDate.setMonth(lastDate.getMonth() - monthsAgo)
      lastDate = lastDate.toISOString().slice(0, 10)
    }

    let nextDate = null
    if (lastDate) {
      const next = new Date(lastDate)
      next.setMonth(next.getMonth() + s.frequencyMonths)
      nextDate = next.toISOString().slice(0, 10)
    }

    result[s.id] = { lastDoneDate: lastDate, nextDate, customNextDate: null }
  }

  return result
}

export const TIME_OPTIONS = [
  { value: 'this_month', label: 'Bu ay' },
  { value: '3m',         label: '3 ay önce' },
  { value: '6m',         label: '6 ay önce' },
  { value: '1y',         label: '1 yıl önce' },
  { value: '2y',         label: '2 yıl önce' },
  { value: '5y',         label: '5 yıl önce' },
  { value: 'older',      label: 'Daha eski' },
  { value: 'unknown',    label: 'Hatırlamıyorum' },
]
