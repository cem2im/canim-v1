import { useState } from 'react'
import useAppStoreV2 from './store/useAppStoreV2'
import OnboardingV2 from './pages/OnboardingV2'
import ScreeningsV2 from './pages/ScreeningsV2'
import ProfileV2 from './pages/ProfileV2'
import KVKKPage from './pages/KVKK'

function CalIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function MainAppV2() {
  const [activeTab, setActiveTab] = useState('screenings')
  const [currentPage, setCurrentPage] = useState(null) // null | 'gizlilik' | 'kvkk' | 'kullanim' | 'iletisim'

  if (currentPage) {
    return (
      <div className="h-dvh flex flex-col">
        <KVKKPage page={currentPage} onBack={() => setCurrentPage(null)} />
      </div>
    )
  }

  return (
    <div className="h-dvh flex flex-col" style={{background:'#FAFAF8'}}>
      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'screenings' && <ScreeningsV2 />}
        {activeTab === 'profile' && <ProfileV2 onNavigate={setCurrentPage} />}
      </div>

      {/* Bottom tab bar */}
      <div className="pb-safe bg-white border-t border-gray-100 flex">
        <button
          onClick={() => setActiveTab('screenings')}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors"
          style={{color: activeTab === 'screenings' ? '#0D7377' : '#6B7280', minHeight:56}}
          aria-label="Taramalarım" aria-selected={activeTab === 'screenings'}>
          <CalIcon />
          <span className="text-xs font-semibold mt-0.5">Taramalarım</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors"
          style={{color: activeTab === 'profile' ? '#0D7377' : '#6B7280', minHeight:56}}
          aria-label="Profilim" aria-selected={activeTab === 'profile'}>
          <UserIcon />
          <span className="text-xs font-semibold mt-0.5">Profilim</span>
        </button>
      </div>
    </div>
  )
}

export default function AppV2() {
  const onboardingDone = useAppStoreV2(s => s.onboardingDone)

  if (!onboardingDone) {
    return <OnboardingV2 />
  }

  return <MainAppV2 />
}
