import { useState } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import InstallBanner from './components/InstallBanner'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Flashcards from './pages/Flashcards'
import Report from './pages/Report'
import History from './pages/History'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const [screen, setScreen] = useState('home')
  const { theme, toggle } = useTheme()

  const pages = {
    home:       <Home setScreen={setScreen} />,
    quiz:       <Quiz />,
    flashcards: <Flashcards />,
    report:     <Report setScreen={setScreen} />,
    history:    <History setScreen={setScreen} />
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', position: 'relative', minHeight: '100dvh', background: 'var(--bg)' }}>
      <Header theme={theme} onToggleTheme={toggle} />
      <InstallBanner />
      <main>{pages[screen] || pages.home}</main>
      <BottomNav screen={screen} setScreen={setScreen} />
    </div>
  )
}
