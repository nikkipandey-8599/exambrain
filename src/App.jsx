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

export default function App() {
  const [view, setView] = useState('landing')
  const [screen, setScreen] = useState('home')
  const [showAuth, setShowAuth] = useState(false)
  const [showSyncBanner, setShowSyncBanner] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [unseenReplies, setUnseenReplies] = useState(0)

  const { theme, toggle } = useTheme()
  const { streak, newBadge, recordStudy } = useStreak()
  const { user, loading, signOut } = useAuth()

  // Auto-enter app if already visited
  useEffect(() => {
    if (localStorage.getItem('exambrain-visited')) setView('app')
  }, [])

  // Mandatory sign-in: show auth wall when entering app if not signed in
  useEffect(() => {
    if (view === 'app' && !loading && !user) {
      setShowAuth(true)
    }
  }, [view, loading, user])

  // When user signs in
  useEffect(() => {
    if (user) {
      setShowAuth(false)
      setShowSyncBanner(true)
    }
  }, [user])

  function enterApp() {
    localStorage.setItem('exambrain-visited', '1')
    setView('app')
    if (!localStorage.getItem('exambrain-onboarded')) setShowOnboarding(true)
  }

  async function handleRecordStudy(sessions, score) {
    return recordStudy(sessions, score)
  }

  if (view === 'landing') {
    return (
      <>
        <ToastProvider />
        <Landing onEnterApp={enterApp} />
      </>
    )
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', position: 'relative', minHeight: '100dvh', background: 'var(--bg)' }}>
      <ToastProvider />

      {/* Mandatory auth wall */}
      {showAuth && <Auth onBack={() => {}} mandatory={true} />}

      {user && (
        <>
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
          {showSyncBanner && (
            <SyncBanner user={user} onMigrate={() => setShowSyncBanner(false)} />
          )}

          <main>
            <div key={screen} className="tab-page">
              {screen === 'home'       && <Home setScreen={s => setScreen(s)} user={user} />}
              {screen === 'quiz'       && <Quiz setScreen={s => setScreen(s)} />}
              {screen === 'flashcards' && <Flashcards setScreen={s => setScreen(s)} />}
              {screen === 'report'     && <Report setScreen={s => setScreen(s)} onRecordStudy={handleRecordStudy} user={user} />}
              {screen === 'history'    && <History setScreen={s => setScreen(s)} user={user} />}
              {screen === 'reviews'    && <ReviewSection user={user} onUnseenChange={setUnseenReplies} />}
            </div>
          </main>

          <BottomNav screen={screen} setScreen={s => setScreen(s)} unseenReplies={unseenReplies} />
        </>
      )}
    </div>
  )
}
