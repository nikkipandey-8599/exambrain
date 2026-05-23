import confetti from 'canvas-confetti'

export function fireConfetti(score) {
  if (score >= 100) {
    // Full celebration for perfect score
    const duration = 3000
    const end = Date.now() + duration
    const colors = ['#4f6ef7', '#22c55e', '#f59e0b', '#ef4444', '#a78bfa']
    
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  } else if (score >= 80) {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f6ef7', '#22c55e', '#a78bfa']
    })
  } else if (score >= 60) {
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#4f6ef7', '#f59e0b']
    })
  }
}

export function fireBadgeConfetti() {
  confetti({
    particleCount: 60,
    spread: 80,
    origin: { y: 0.3 },
    colors: ['#f59e0b', '#fbbf24', '#fde68a']
  })
}
