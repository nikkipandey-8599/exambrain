export function haptic(type = 'light') {
  if (!navigator.vibrate) return
  const patterns = {
    light: [10],
    success: [15, 50, 15],
    error: [30, 40, 30],
    heavy: [50]
  }
  navigator.vibrate(patterns[type] || [10])
}
