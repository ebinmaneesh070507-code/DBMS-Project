import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Sparkles } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { PageHead } from '../components/Bits';
import { predictionData } from '../data/mockData';

const chartTextStyle = { fontSize: 11, fill: 'var(--ink-muted)' };

export default function Prediction() {
  const [active, setActive] = useState(predictionData[0].zone);
  const zoneData = predictionData.find((z) => z.zone === active);

  return (
    <AppLayout title="Waste Prediction" subtitle="AI / ML forecasts by zone">
      <PageHead title="Waste Prediction" subtitle="Forecasts are generated from historical collection volume, weather, and seasonal patterns." />

      <div className="filter-row">
        {predictionData.map((z) => (
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
          <div className="stat-value">{zoneData.current.toLocaleString()} kg</div>
          <div className="stat-label">Current weekly waste &middot; {zoneData.zone}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon mint"><Sparkles /></div>
            <span className="stat-delta up">+{zoneData.change}%</span>
          </div>
          <div className="stat-value">{zoneData.predicted.toLocaleString()} kg</div>
          <div className="stat-label">AI prediction for next week</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon amber"><TrendingUp /></div>
          </div>
          <div className="stat-value">{zoneData.change}%</div>
          <div className="stat-label">Expected increase</div>
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
          <strong>AI recommendation.</strong> {zoneData.recommendation}
        </div>
      </div>
    </AppLayout>
  );
}
