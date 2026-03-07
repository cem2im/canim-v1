import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildScreeningList } from '../utils/engine'
import { calcScore } from '../utils/score'

const useAppStore = create(
  persist(
    (set, get) => ({
      // ── ONBOARDING ──────────────────────────────────────────────────────────
      onboardingDone: false,
      profile: null,        // { name, birthYear, sex }
      diseases: [],         // ['hipertansiyon', 'diyabet', ...]
      
      // ── SCREENINGS ──────────────────────────────────────────────────────────
      // { screeningId: { lastDoneDate: 'YYYY-MM-DD' | null, nextDate: 'YYYY-MM-DD', customNextDate: null } }
      screeningDates: {},
      
      // ── LAB RESULTS ────────────────────────────────────────────────────────
      // { testId: [{ value, unit, date, notes }] }
      labResults: {},
      
      // ── MEDICATIONS ────────────────────────────────────────────────────────
      // [{ id, name, dose, timing }]
      medications: [],
      
      // ── EMERGENCY INFO ──────────────────────────────────────────────────────
      emergency: { bloodType: '', allergies: '', contactName: '', contactPhone: '' },

      // ── ACTIVE TAB ──────────────────────────────────────────────────────────
      activeTab: 'today',

      // ─── ACTIONS ────────────────────────────────────────────────────────────

      completeOnboarding: (profile, diseases, initialDates) => set({
        profile,
        diseases,
        screeningDates: initialDates,
        onboardingDone: true,
      }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      // Mark a screening as done
      markDone: (screeningId, date) => {
        const { diseases, profile } = get()
        const list = buildScreeningList(diseases, profile)
        const item = list.find(s => s.id === screeningId)
        if (!item) return
        const nextDate = addMonths(date, item.frequencyMonths)
        set(state => ({
          screeningDates: {
            ...state.screeningDates,
            [screeningId]: {
              lastDoneDate: date,
              nextDate,
              customNextDate: null,
            }
          }
        }))
      },

      // Set custom next date (doctor's suggestion)
      setCustomNextDate: (screeningId, date) => set(state => ({
        screeningDates: {
          ...state.screeningDates,
          [screeningId]: {
            ...(state.screeningDates[screeningId] || {}),
            customNextDate: date,
          }
        }
      })),

      // Add lab result
      addLabResult: (testId, entry) => set(state => ({
        labResults: {
          ...state.labResults,
          [testId]: [...(state.labResults[testId] || []), entry].slice(-20),
        }
      })),

      // Add/update medication
      addMedication: (med) => set(state => ({
        medications: [...state.medications.filter(m => m.id !== med.id), med]
      })),
      removeMedication: (id) => set(state => ({
        medications: state.medications.filter(m => m.id !== id)
      })),

      updateEmergency: (data) => set(state => ({ emergency: { ...state.emergency, ...data } })),

      updateProfile: (data) => set(state => ({ profile: { ...state.profile, ...data } })),

      updateDiseases: (diseases) => set({ diseases }),

      // Computed: get full screening list with status
      getScreeningCards: () => {
        const { diseases, profile, screeningDates } = get()
        if (!profile) return []
        const list = buildScreeningList(diseases, profile)
        const today = new Date()
        return list.map(s => {
          const dates = screeningDates[s.id] || {}
          const nextDate = dates.customNextDate
            ? new Date(dates.customNextDate)
            : dates.nextDate
              ? new Date(dates.nextDate)
              : null
          let status = 'unknown'
          let daysUntil = null
          if (nextDate) {
            daysUntil = Math.round((nextDate - today) / 86400000)
            if (daysUntil < 0)      status = 'overdue'
            else if (daysUntil <= 30) status = 'upcoming'
            else if (daysUntil <= 90) status = 'soon'
            else                       status = 'ok'
          }
          return { ...s, lastDoneDate: dates.lastDoneDate || null, nextDate: nextDate ? nextDate.toISOString().slice(0,10) : null, status, daysUntil }
        }).sort((a, b) => {
          const order = { overdue: 0, upcoming: 1, soon: 2, unknown: 3, ok: 4 }
          return order[a.status] - order[b.status]
        })
      },

      getScore: () => {
        const cards = get().getScreeningCards()
        return calcScore(cards)
      },
    }),
    { name: 'canim-v1' }
  )
)

export default useAppStore

// Helper
function addMonths(dateStr, months) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}
