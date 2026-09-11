import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { api } from '../services/api';

export default function Prediction() {
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPredictions().then(setPredictions).catch((err) => setError(err.message || 'Could not load predictions.'));
  }, []);

  return (
    <AppLayout title="Zone Predictions" subtitle="Real week-over-week trend, computed from actual incident timestamps">
      {error && <p style={{ color: 'var(--signal-coral)', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      {predictions === null ? (
        <div className="grid grid-2">
          {[0, 1].map((i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 18 }} />)}
        </div>
      ) : predictions.length === 0 ? (
        <div className="card empty-state">
          <Sparkles />
          <strong>No zones set up yet</strong>
          <span>An admin needs to add campus zones before predictions can be shown.</span>
        </div>
      ) : (
        <div className="grid grid-2">
          {predictions.map((p) => (
            <div key={p.zone} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16 }}>{p.zone}</h3>
                {!p.insufficientData && (
                  <span className={`pill ${p.changePercent > 0 ? 'amber' : p.changePercent < 0 ? 'mint' : 'neutral'}`}>
                    {p.changePercent > 0 ? <TrendingUp size={12} /> : p.changePercent < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                    {p.changePercent > 0 ? '+' : ''}{p.changePercent}%
                  </span>
                )}
              </div>

              {p.insufficientData ? (
                <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{p.message}</p>
              ) : (
                <>
                  <div className="grid grid-2" style={{ marginBottom: 16 }}>
                    <div>
                      <div className="stat-value" style={{ fontSize: 22 }}>{p.currentWeekIncidents}</div>
                      <div className="stat-label">This week</div>
                    </div>
                    <div>
                      <div className="stat-value" style={{ fontSize: 22 }}>{p.projectedNextWeekIncidents}</div>
                      <div className="stat-label">Projected next week</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--ink-secondary)' }}>{p.recommendation}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
