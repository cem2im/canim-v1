import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildScreeningList } from '../utils/engine'

function addMonths(dateStr, months) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

const useAppStoreV2 = create(
  persist(
    (set, get) => ({
      // Onboarding
      onboardingDone: false,

      // Wizard
      wizardDone: false,

      // Profile
      profile: null, // { birthYear, sex, height?, weight? }
      diseases: [],  // string[]
      smokingStatus: null, // 'yes' | 'no' | 'quit'
      packYears: null, // number — paket-yıl (günde paket × yıl sayısı)
      lifestyleAnswers: {}, // { hareket, uyku, beslenme, zihin } — wizard'dan gelir

      // Screening dates
      screeningDates: {}, // { screeningId: { lastDoneDate, nextDate } }

      // Actions
      completeOnboarding: (profile, diseases, smokingStatus) => set({
        profile,
        diseases,
        smokingStatus,
        onboardingDone: true,
      }),

      markDone: (screeningId, lastDoneDate) => {
        const { diseases, profile, smokingStatus, packYears } = get()
        const list = buildScreeningList(diseases, { ...profile, smokingStatus, packYears })
        const item = list.find(s => s.id === screeningId)
        const freq = item ? item.frequencyMonths : 12
        const nextDate = addMonths(lastDoneDate, freq)
        set(state => ({
          screeningDates: {
            ...state.screeningDates,
            [screeningId]: { lastDoneDate, nextDate },
          }
        }))
      },

      updateProfile: (data) => set(state => ({
        profile: { ...state.profile, ...data }
      })),

      updateDiseases: (diseases) => set({ diseases }),

      updateSmokingStatus: (status) => set({ smokingStatus: status }),

      updatePackYears: (py) => set({ packYears: py }),

      setLifestyleAnswers: (answers) => set({ lifestyleAnswers: answers }),

      setWizardDone: () => set({ wizardDone: true }),

      applyWizardAnswers: (answers) => {
        // answers = { screeningId: 'this_month' | '6m' | '1y' | '2y' | 'unknown' }
        const { diseases, profile, smokingStatus, packYears } = get()
        const list = buildScreeningList(diseases, { ...profile, smokingStatus, packYears })
        const today = new Date()
        const newDates = {}
        for (const s of list) {
          const ans = answers[s.id]
          if (!ans || ans === 'unknown') continue
          const monthsAgo = { 'this_month': 0, '1m': 1, '6m': 6, '1y': 12, '2y': 24, '5y': 60 }[ans] ?? 0
          const lastDate = new Date(today)
          lastDate.setMonth(lastDate.getMonth() - monthsAgo)
          const lastDoneDate = lastDate.toISOString().slice(0, 10)
          const nextDate = new Date(lastDate)
          nextDate.setMonth(nextDate.getMonth() + s.frequencyMonths)
          newDates[s.id] = { lastDoneDate, nextDate: nextDate.toISOString().slice(0, 10) }
        }
        set(state => ({ screeningDates: { ...state.screeningDates, ...newDates } }))
      },

      resetAll: () => set({
        onboardingDone: false,
        wizardDone: false,
        profile: null,
        diseases: [],
        smokingStatus: null,
        packYears: null,
        lifestyleAnswers: {},
        screeningDates: {},
      }),

      // Computed
      getScreeningCards: () => {
        const { diseases, profile, screeningDates, smokingStatus, packYears } = get()
        if (!profile) return []
        const enriched = { ...profile, smokingStatus, packYears }
        const list = buildScreeningList(diseases, enriched)
        const today = new Date()
        return list.map(s => {
          const dates = screeningDates[s.id] || {}
          const nextDate = dates.nextDate ? new Date(dates.nextDate) : null
          let status = 'unknown'
          let daysUntil = null
          if (nextDate) {
            daysUntil = Math.round((nextDate - today) / 86400000)
            if (daysUntil < 0)        status = 'overdue'
            else if (daysUntil <= 30) status = 'upcoming'
            else if (daysUntil <= 90) status = 'soon'
            else                       status = 'ok'
          }
          return {
            ...s,
            lastDoneDate: dates.lastDoneDate || null,
            nextDate: nextDate ? nextDate.toISOString().slice(0, 10) : null,
            status,
            daysUntil,
          }
        })
      },
    }),
    { name: 'canim-v2' }
  )
)

export default useAppStoreV2
