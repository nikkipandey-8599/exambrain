import { useEffect, useState } from 'react'

function Shimmer({ w = '100%', h = 16, radius = 8, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--border-strong) 50%, var(--bg-secondary) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style
    }} />
  )
}

export function QuizSkeleton() {
  return (
    <div style={{ padding: '1.25rem' }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <Shimmer h={38} radius={12} style={{ marginBottom: 16 }} />
      <Shimmer h={44} radius={12} style={{ marginBottom: 12 }} />
      <Shimmer w="60%" h={20} style={{ marginBottom: 24 }} />
      <Shimmer h={20} w="40%" style={{ marginBottom: 16 }} />
      {[1,2,3,4].map(i => (
        <Shimmer key={i} h={52} radius={12} style={{ marginBottom: 10 }} />
      ))}
    </div>
  )
}

export function HomeSkeleton() {
  return (
    <div style={{ padding: '1.25rem' }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <Shimmer w="50%" h={32} style={{ marginBottom: 10 }} />
      <Shimmer w="70%" h={16} style={{ marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[1,2,3].map(i => <Shimmer key={i} h={70} radius={12} />)}
      </div>
      <Shimmer h={44} radius={12} style={{ marginBottom: 12 }} />
      <Shimmer h={200} radius={12} style={{ marginBottom: 12 }} />
      <Shimmer h={52} radius={12} />
    </div>
  )
}
