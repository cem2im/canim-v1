import { useState } from 'react'
import useAppStoreV2 from './store/useAppStoreV2'
import OnboardingV2 from './pages/OnboardingV2'
import ScreeningsV2 from './pages/ScreeningsV2'
import ProfileV2 from './pages/ProfileV2'
import KVKKPage from './pages/KVKK'

function CalIcon() {
  return (
    <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function MainAppV2() {
  const [activeTab, setActiveTab] = useState('screenings')
  const [currentPage, setCurrentPage] = useState(null) // null | 'gizlilik' | 'kvkk' | 'kullanim' | 'iletisim'
  const getScreeningCards = useAppStoreV2(s => s.getScreeningCards)
  const wizardDone = useAppStoreV2(s => s.wizardDone)
  const urgentCount = wizardDone
    ? getScreeningCards().filter(c => c.status === 'unknown' || c.status === 'overdue').length
    : 0

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
      <main className="flex-1 overflow-hidden">
        {activeTab === 'screenings' && (
          <div role="tabpanel" id="panel-screenings" aria-labelledby="tab-screenings" className="h-full">
            <ScreeningsV2 />
          </div>
        )}
        {activeTab === 'profile' && (
          <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile" className="h-full">
            <ProfileV2 onNavigate={setCurrentPage} />
          </div>
        )}
      </main>

      {/* Bottom tab bar */}
      <nav aria-label="Ana navigasyon">
        <div className="pb-safe bg-white border-t border-gray-100 flex" role="tablist">
          <button
            id="tab-screenings"
            role="tab"
            aria-selected={activeTab === 'screenings'}
            aria-controls="panel-screenings"
            onClick={() => setActiveTab('screenings')}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors"
            style={{color: activeTab === 'screenings' ? '#0D7377' : '#6B7280', minHeight:56}}>
            <div className="relative">
              <CalIcon />
              {urgentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                  style={{ background: '#DC2626', fontSize: 9 }}>{urgentCount}</span>
              )}
            </div>
            <span className="text-xs font-semibold mt-0.5">
              Taramalarım{urgentCount > 0 ? ` · ${urgentCount}` : ''}
            </span>
          </button>
          <button
            id="tab-profile"
            role="tab"
            aria-selected={activeTab === 'profile'}
            aria-controls="panel-profile"
            onClick={() => setActiveTab('profile')}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors"
            style={{color: activeTab === 'profile' ? '#0D7377' : '#6B7280', minHeight:56}}>
            <UserIcon />
            <span className="text-xs font-semibold mt-0.5">Profilim</span>
          </button>
        </div>
      </nav>
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
