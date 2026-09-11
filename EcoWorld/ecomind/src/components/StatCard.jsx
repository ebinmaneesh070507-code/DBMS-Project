export default function StatCard({ icon: Icon, tone = 'mint', label, value, delta, up }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className={`stat-icon ${tone}`}>
          <Icon />
        </div>
        {delta && <span className={`stat-delta ${up ? 'up' : 'down'}`}>{delta}</span>}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
