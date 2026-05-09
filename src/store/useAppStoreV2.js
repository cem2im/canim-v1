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

      // Profile
      profile: null, // { birthYear, sex, height?, weight? }
      diseases: [],  // string[]
      smokingStatus: null, // 'yes' | 'no' | 'quit'

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
        const { diseases, profile } = get()
        const list = buildScreeningList(diseases, profile)
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

      resetAll: () => set({
        onboardingDone: false,
        profile: null,
        diseases: [],
        smokingStatus: null,
        screeningDates: {},
      }),

      // Computed
      getScreeningCards: () => {
        const { diseases, profile, screeningDates } = get()
        if (!profile) return []
        const list = buildScreeningList(diseases, profile)
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
