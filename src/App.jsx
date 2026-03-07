import useAppStore from './store/useAppStore'
import Onboarding from './pages/Onboarding'
import Today from './pages/Today'
import Screenings from './pages/Screenings'
import Lab from './pages/Lab'
import Profile from './pages/Profile'

const TABS = [
  { id:'today',      label:'Bugün',      icon: HomeIcon },
  { id:'screenings', label:'Taramalar',  icon: CalIcon },
  { id:'lab',        label:'Lab',        icon: FlaskIcon },
  { id:'profile',    label:'Profil',     icon: UserIcon },
]

export default function App() {
  const onboardingDone = useAppStore(s => s.onboardingDone)
  const activeTab      = useAppStore(s => s.activeTab)
  const setActiveTab   = useAppStore(s => s.setActiveTab)

  if (!onboardingDone) return <Onboarding />

  return (
    <div className="relative" style={{background:'#FAFAF8', minHeight:'100dvh'}}>
      {/* Page */}
      <div className="overflow-y-auto" style={{minHeight:'100dvh'}}>
        {activeTab === 'today'      && <Today />}
        {activeTab === 'screenings' && <Screenings />}
        {activeTab === 'lab'        && <Lab />}
        {activeTab === 'profile'    && <Profile />}
      </div>

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto pb-safe"
        style={{background:'rgba(250,250,248,0.92)', backdropFilter:'blur(12px)', borderTop:'1px solid #E5E7EB'}}>
        <div className="flex">
          {TABS.map(tab => {
            const active = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all"
              >
                <Icon active={active} />
                <span className="text-xs font-bold" style={{color: active ? '#0D7377' : '#9CA3AF'}}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── TAB ICONS ──────────────────────────────────────────────────────────────────
function HomeIcon({ active }) {
  const c = active ? '#0D7377' : '#9CA3AF'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3l9 9" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 21V12h6v9" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 12v9h18v-9" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0"/>
    </svg>
  )
}

function CalIcon({ active }) {
  const c = active ? '#0D7377' : '#9CA3AF'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="3" stroke={c} strokeWidth="2"/>
      <path d="M8 2v4M16 2v4M3 10h18" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      {active && <circle cx="9" cy="16" r="1.5" fill={c}/>}
      {active && <circle cx="15" cy="16" r="1.5" fill={c}/>}
    </svg>
  )
}

function FlaskIcon({ active }) {
  const c = active ? '#0D7377' : '#9CA3AF'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M9 3h6M9 3v6L4 19a1 1 0 001 1h14a1 1 0 001-1L15 9V3" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {active && <path d="M6 17h12" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>}
    </svg>
  )
}

function UserIcon({ active }) {
  const c = active ? '#0D7377' : '#9CA3AF'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
