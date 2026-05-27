import { useState, useEffect } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import InstallBanner from './components/InstallBanner'
import BadgeToast from './components/BadgeToast'
import Onboarding from './components/Onboarding'
import SyncBanner from './components/SyncBanner'
import { ToastProvider } from './components/Toast'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Flashcards from './pages/Flashcards'
import Report from './pages/Report'
import History from './pages/History'
import Auth from './pages/Auth'
import ReviewSection from './components/ReviewSection'
import { useTheme } from './hooks/useTheme'
import { useStreak } from './hooks/useStreak'
import { useAuth } from './hooks/useAuth'
import { cloudSaveSession, cloudSaveResults } from './services/supabase'

export default function App() {
  const [view, setView] = useState('landing') // 'landing' | 'app'
  const [screen, setScreen] = useState('home')
  const [showAuth, setShowAuth] = useState(false)
  const [showSyncBanner, setShowSyncBanner] = useState(false)
  const { theme, toggle } = useTheme()
  const { streak, newBadge, recordStudy } = useStreak()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { user, loading, signOut } = useAuth()
  const [unseenReplies, setUnseenReplies] = useState(0)

  useEffect(() => {
    const visited = localStorage.getItem('exambrain-visited')
    if (visited) setView('app')
  }, [])

  // Show sync banner when user logs in and has local sessions
  useEffect(() => {
    if (user) {
      setShowAuth(false)
      setShowSyncBanner(true)
    }
  }, [user])

  function enterApp() {
    localStorage.setItem('exambrain-visited', '1')
    setView('app')
    const onboarded = localStorage.getItem('exambrain-onboarded')
    if (!onboarded) setShowOnboarding(true)
  }

  function navigate(s) { setScreen(s) }

  // Cloud-sync results when saving
  async function handleRecordStudy(sessions, score) {
    const streak = recordStudy(sessions, score)
    return streak
  }

  if (view === 'landing') {
    return (
      <>
        <ToastProvider />
        {showAuth && <Auth onBack={() => setShowAuth(false)} />}
        <Landing onEnterApp={enterApp} onShowAuth={() => setShowAuth(true)} />
      </>
    )
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', position: 'relative', minHeight: '100dvh', background: 'var(--bg)' }}>
      <ToastProvider />
      <Header
        theme={theme}
        onToggleTheme={toggle}
        streak={streak}
        onGoHome={() => setView('landing')}
        user={user}
        onSignOut={signOut}
        onShowAuth={() => setShowAuth(true)}
      />
      <InstallBanner />
      <BadgeToast badge={newBadge} />
      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
      {showAuth && <Auth onBack={() => setShowAuth(false)} />}
      {user && showSyncBanner && (
        <SyncBanner user={user} onMigrate={() => setShowSyncBanner(false)} />
      )}

      <main>
        <div key={screen} className="tab-page">
          {screen === 'home'       && <Home setScreen={navigate} user={user} />}
          {screen === 'quiz'       && <Quiz setScreen={navigate} />}
          {screen === 'flashcards' && <Flashcards setScreen={navigate} />}
          {screen === 'report'     && <Report setScreen={navigate} onRecordStudy={handleRecordStudy} user={user} />}
          {screen === 'history'    && <History setScreen={navigate} user={user} />}
          {screen === 'reviews'    && <ReviewSection user={user} onUnseenChange={setUnseenReplies} />}
        </div>
      </main>
      <BottomNav screen={screen} setScreen={navigate} unseenReplies={unseenReplies} />
    </div>
  )
}
