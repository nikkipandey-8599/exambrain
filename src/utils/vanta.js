// Vanta.js loader utility — loads scripts once, reuses effect
const cache = {}

function loadScript(src) {
  if (cache[src]) return cache[src]
  cache[src] = new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return }
    const s = document.createElement('script')
    s.src = src; s.async = true
    s.onload = res; s.onerror = () => rej(new Error(`Failed: ${src}`))
    document.head.appendChild(s)
  })
  return cache[src]
}

export async function loadVanta() {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
  await loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.birds.min.js')
  await loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.waves.min.js')
  await loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.net.min.js')
}

export function initBirds(el, isDark) {
  if (!window.VANTA?.BIRDS) return null
  return window.VANTA.BIRDS({
    el, THREE: window.THREE,
    mouseControls: true, touchControls: true, gyroControls: false,
    backgroundColor: isDark ? 0x160E02 : 0xFFFDF2,
    color1: isDark ? 0xD97706 : 0x92400E,
    color2: isDark ? 0x8B6B3A : 0xB45309,
    birdSize: 1.1, wingSpan: 26,
    speedLimit: 3.5, separation: 58, alignment: 50, cohesion: 50,
    quantity: 3, scale: 1.0, scaleMobile: 0.85,
  })
}

export function initWaves(el, isDark) {
  if (!window.VANTA?.WAVES) return null
  return window.VANTA.WAVES({
    el, THREE: window.THREE,
    mouseControls: true, touchControls: true,
    color: isDark ? 0x1E1408 : 0xFAF6E4,
    shininess: 35, waveHeight: 12, waveSpeed: 0.6,
    zoom: 0.85,
  })
}

export function initNet(el, isDark) {
  if (!window.VANTA?.NET) return null
  return window.VANTA.NET({
    el, THREE: window.THREE,
    mouseControls: true, touchControls: true,
    color: isDark ? 0xD97706 : 0x92400E,
    backgroundColor: isDark ? 0x160E02 : 0xFFFDF2,
    points: 8, maxDistance: 22, spacing: 17,
    showDots: true,
  })
}
