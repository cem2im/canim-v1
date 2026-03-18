import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildScreeningList } from '../utils/engine'
import { calcScore } from '../utils/score'
import { DISEASE_DOCTOR_SCHEDULE } from '../data/screenings'

const useAppStore = create(
  persist(
    (set, get) => ({
      // ── APP PHASE ───────────────────────────────────────────────────────────
      landingSeen: false,   // true after user taps "Başla" on landing page
      authHandled: false,   // true after user completes or skips auth screen
      authUser: null,       // { username, userId, saved } | null

      // ── ONBOARDING ──────────────────────────────────────────────────────────
      onboardingDone: false,
      onboardingCompletedAt: null, // ISO date string
      profile: null,        // { name, birthYear, sex, height, weight }
      diseases: [],         // ['hipertansiyon', 'diyabet', ...]
      
      // ── SCREENINGS ──────────────────────────────────────────────────────────
      // { screeningId: { lastDoneDate: 'YYYY-MM-DD' | null, nextDate: 'YYYY-MM-DD', customNextDate: null } }
      screeningDates: {},

      // ── VISIT HISTORY ───────────────────────────────────────────────────────
      // [{ date, doctor, screeningsCompleted: ['id1','id2',...] }]
      visitHistory: [],
      
      // ── LAB RESULTS ────────────────────────────────────────────────────────
      // { testId: [{ value, unit, date, notes }] }
      labResults: {},
      
      // ── MEDICATIONS ────────────────────────────────────────────────────────
      // [{ id, name, dose, timing }]
      medications: [],
      
      // ── DOCTOR VISIT DATES ──────────────────────────────────────────────────
      // { scheduleId: 'YYYY-MM-DD' } — keyed by DISEASE_DOCTOR_SCHEDULE entry id
      doctorVisitDates: {},

      // ── EMERGENCY INFO ──────────────────────────────────────────────────────
      emergency: { bloodType: '', allergies: '', contactName: '', contactPhone: '' },

      // ── ACTIVE TAB ──────────────────────────────────────────────────────────
      activeTab: 'screenings',

      // ─── ACTIONS ────────────────────────────────────────────────────────────

      setLandingSeen:  ()     => set({ landingSeen: true }),
      setAuthHandled:  (user) => set({ authHandled: true, authUser: user }),

      completeOnboarding: (profile, diseases, initialDates, initialDoctorDates) => set({
        profile,
        diseases,
        screeningDates: initialDates,
        doctorVisitDates: initialDoctorDates || {},
        onboardingDone: true,
        onboardingCompletedAt: new Date().toISOString(),
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

      // Log a doctor visit and bulk-mark screenings as done
      logDoctorVisit: (date, doctorType, screeningIds) => {
        const { diseases, profile } = get()
        const list = buildScreeningList(diseases, profile)
        
        set(state => {
          const newDates = { ...state.screeningDates }
          for (const id of screeningIds) {
            const item = list.find(s => s.id === id)
            const freq = item ? item.frequencyMonths : 12
            newDates[id] = {
              lastDoneDate: date,
              nextDate: addMonths(date, freq),
              customNextDate: null,
            }
          }
          return {
            screeningDates: newDates,
            visitHistory: [
              ...state.visitHistory,
              { date, doctor: doctorType, screeningsCompleted: screeningIds }
            ]
          }
        })
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

      // Save last doctor visit date for a schedule entry
      setDoctorVisitDate: (scheduleId, dateString) => set(state => ({
        doctorVisitDates: { ...state.doctorVisitDates, [scheduleId]: dateString }
      })),

      // Computed: get doctor visit schedule cards with status
      getDoctorVisitCards: () => {
        const { diseases, doctorVisitDates } = get()
        const today = new Date()
        const seen = new Set()
        const cards = []

        const diseasesToCheck = diseases.length > 0 ? diseases : ['healthy']
        for (const diseaseId of diseasesToCheck) {
          const schedules = DISEASE_DOCTOR_SCHEDULE[diseaseId] || []
          for (const schedule of schedules) {
            // Deduplicate by doctor name
            if (seen.has(schedule.doctor)) continue
            seen.add(schedule.doctor)

            const lastVisitDate = doctorVisitDates[schedule.id] || null
            let nextVisitDate = null
            let status = 'unknown'
            let daysUntil = null

            if (lastVisitDate) {
              const last = new Date(lastVisitDate)
              const next = new Date(last)
              next.setMonth(next.getMonth() + schedule.intervalMonths)
              nextVisitDate = next.toISOString().slice(0, 10)
              daysUntil = Math.round((next - today) / 86400000)
              if (daysUntil < 0)       status = 'overdue'
              else if (daysUntil <= 30) status = 'soon'
              else                      status = 'ok'
            }

            cards.push({ ...schedule, lastVisitDate, nextVisitDate, status, daysUntil, diseaseId })
          }
        }

        return cards.sort((a, b) => {
          const order = { overdue: 0, soon: 1, unknown: 2, ok: 3 }
          return order[a.status] - order[b.status]
        })
      },

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

      // complianceScore (renamed from healthScore)
      getScore: () => {
        const cards = get().getScreeningCards()
        return calcScore(cards)
      },

      // Alias for clarity
      complianceScore: () => {
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
