export default function EmptyState({ icon, title, desc, action, actionLabel }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 6 }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 260 }}>
          {desc}
        </p>
      </div>
      {action && (
        <button onClick={action} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.75rem', marginTop: 4 }}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
