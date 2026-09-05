import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { PageHead } from '../components/Bits';
import { api } from '../services/api';

const chartTextStyle = { fontSize: 11, fill: 'var(--ink-muted)' };

export default function Prediction() {
  const [predictions, setPredictions] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .getPredictions()
      .then((res) => {
        if (cancelled) return;
        setPredictions(res.data || []);
        if (res.data?.length) setActive(res.data[0].zone);
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load predictions'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <AppLayout title="Waste Prediction" subtitle="AI / ML forecasts by zone">
        <div className="empty-state" style={{ marginTop: 40 }}>
          <span className="spinner-ring" style={{ margin: '0 auto 10px' }} />
          <strong>Loading predictions…</strong>
        </div>
      </AppLayout>
    );
  }

  if (error || predictions.length === 0) {
    return (
      <AppLayout title="Waste Prediction" subtitle="AI / ML forecasts by zone">
        <div className="card">
          <div className="empty-state">
            <AlertTriangle />
            <strong>{error ? "Couldn't load predictions" : 'No zone data yet'}</strong>
            <span>{error || 'Run the backend seed script to configure zones.'}</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  const zoneData = predictions.find((z) => z.zone === active) || predictions[0];

  return (
    <AppLayout title="Waste Prediction" subtitle="AI / ML forecasts by zone">
      <PageHead title="Waste Prediction" subtitle="Forecasts are generated from each zone's live collection volume and next-week projection." />

      <div className="filter-row">
        {predictions.map((z) => (
          <button
            key={z.zone}
            className={`filter-chip ${active === z.zone ? 'active' : ''}`}
            onClick={() => setActive(z.zone)}
          >
            {z.zone}
          </button>
        ))}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon azure"><TrendingUp /></div>
          </div>
          <div className="stat-value">{zoneData.currentWeeklyWasteKg.toLocaleString()} kg</div>
          <div className="stat-label">Current weekly waste &middot; {zoneData.zone}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon mint"><Sparkles /></div>
            <span className={`stat-delta ${zoneData.expectedChangePercent >= 0 ? 'up' : 'down'}`}>
              {zoneData.expectedChangePercent >= 0 ? '+' : ''}{zoneData.expectedChangePercent}%
            </span>
          </div>
          <div className="stat-value">{zoneData.predictedNextWeekKg.toLocaleString()} kg</div>
          <div className="stat-label">AI prediction for next week</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon amber"><TrendingUp /></div>
          </div>
          <div className="stat-value">{zoneData.expectedChangePercent}%</div>
          <div className="stat-label">Expected change</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-label">Current vs. predicted, by day</div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={zoneData.series}>
              <CartesianGrid stroke="var(--line-faint)" vertical={false} />
              <XAxis dataKey="day" tick={chartTextStyle} axisLine={{ stroke: 'var(--line-faint)' }} tickLine={false} />
              <YAxis tick={chartTextStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f211c', border: '1px solid rgba(150,230,200,0.2)', borderRadius: 10, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="current" name="Current" stroke="#4fb8e6" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#49e6a6" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="insight-card">
        <div className="insight-icon stat-icon mint"><Sparkles size={16} /></div>
        <div className="insight-text">
          <strong>AI recommendation.</strong> {zoneData.aiRecommendation}
        </div>
      </div>
    </AppLayout>
  );
}
