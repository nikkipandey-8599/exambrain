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
import { useStreak } from './hooks/useStreak'
import { useAuth } from './hooks/useAuth'

// Force light theme always — remove dark mode
document.documentElement.setAttribute('data-theme', 'light')

export default function App() {
  const [view, setView] = useState('landing')
  const [screen, setScreen] = useState('home')
  const [showAuth, setShowAuth] = useState(false)
  const [showSyncBanner, setShowSyncBanner] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [unseenReplies, setUnseenReplies] = useState(0)

  const { streak, newBadge, recordStudy } = useStreak()
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    if (localStorage.getItem('exambrain-visited')) setView('app')
  }, [])

  // Mandatory sign-in wall
  useEffect(() => {
    if (view === 'app' && !loading && !user) {
      setShowAuth(true)
    }
  }, [view, loading, user])

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

      {/* Auth wall */}
      {showAuth && <Auth onBack={() => {}} mandatory={true} />}

      {user && (
        <>
          <Header
            streak={streak}
            onGoHome={() => setView('landing')}
            user={user}
            onSignOut={signOut}
            onShowAuth={() => setShowAuth(true)}
          />
          <InstallBanner />
          <BadgeToast badge={newBadge} />
          {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
          {showSyncBanner && <SyncBanner user={user} onMigrate={() => setShowSyncBanner(false)} />}

          <main>
            <div key={screen} className="tab-page">
              {screen === 'home'       && <Home setScreen={s => setScreen(s)} user={user} />}
              {screen === 'quiz'       && <Quiz setScreen={s => setScreen(s)} />}
              {screen === 'flashcards' && <Flashcards setScreen={s => setScreen(s)} />}
              {screen === 'report'     && <Report setScreen={s => setScreen(s)} onRecordStudy={recordStudy} user={user} />}
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
