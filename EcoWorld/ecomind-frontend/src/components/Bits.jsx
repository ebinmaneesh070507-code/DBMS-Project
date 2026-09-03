export function PageHead({ title, subtitle, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div style={{ display: 'flex', gap: 10 }}>{children}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="empty-state">
      {Icon && <Icon />}
      <strong>{title}</strong>
      {description && <span>{description}</span>}
    </div>
  );
}

export function Pill({ tone = 'neutral', children }) {
  return (
    <span className={`pill ${tone}`}>
      <span className="pill-dot" />
      {children}
    </span>
  );
}

export function AIThinking({ label = 'EcoMind AI is analyzing…' }) {
  return (
    <div className="thinking-row">
      <span className="spinner-ring" />
      <span>{label}</span>
      <span className="thinking-dots">
        <span></span><span></span><span></span>
      </span>
    </div>
  );
}

export function statusTone(status) {
  const map = {
    Critical: 'coral',
    High: 'amber',
    Medium: 'azure',
    Normal: 'mint',
    Pending: 'amber',
    'Under Review': 'azure',
    Assigned: 'violet',
    Resolved: 'mint',
    'En Route': 'azure',
    'Nearly Full': 'coral',
    Returning: 'neutral',
  };
  return map[status] || 'neutral';
}

export function priorityTone(priority) {
  const map = { High: 'coral', Medium: 'amber', Low: 'mint' };
  return map[priority] || 'neutral';
}
