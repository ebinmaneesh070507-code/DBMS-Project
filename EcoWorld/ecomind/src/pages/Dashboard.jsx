import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { AlertTriangle, Clock, Users, Sparkles } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { api } from '../services/api';
import { getAiInsights } from '../services/aiService';

const SEVERITY_COLORS = { Low: '#2dd4bf', Medium: '#4fb8e6', High: '#ffb648', Critical: '#ff5d5d' };
const CHART_GRID = 'rgba(255,255,255,0.08)';
const CHART_TICK = { fill: 'var(--ink-muted)', fontSize: 11 };

function ChartCard({ title, children, empty }) {
  return (
    <div className="card">
      <div className="section-label">{title}</div>
      {empty ? (
        <div className="empty-state" style={{ padding: '32px 12px' }}>
          <span>Not enough data yet — this fills in as incidents come in.</span>
        </div>
      ) : (
        <div style={{ height: 260 }}>{children}</div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getDashboardStats(), api.getDashboardCharts(), getAiInsights()])
      .then(([s, c, i]) => {
        setStats(s);
        setCharts(c);
        setInsights(i);
      })
      .catch((err) => setError(err.message || 'Could not load dashboard data.'));
  }, []);

  return (
    <AppLayout title="Dashboard" subtitle="Live analytics across every campus zone">
      {error && <p style={{ color: 'var(--signal-coral)', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        {stats === null ? (
          [0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 104, borderRadius: 18 }} />)
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon azure"><Sparkles /></div>
              <div className="stat-value">{stats.totalIncidents}</div>
              <div className="stat-label">Total incidents reported</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber"><Clock /></div>
              <div className="stat-value">{stats.openIncidents}</div>
              <div className="stat-label">Currently open</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon coral"><AlertTriangle /></div>
              <div className="stat-value">{stats.criticalOpenIncidents}</div>
              <div className="stat-label">Critical & unresolved</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon mint"><Users /></div>
              <div className="stat-value">{stats.activeResponders}</div>
              <div className="stat-label">Active response teams</div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24, alignItems: 'start' }}>
        <ChartCard title="Incidents by zone" empty={charts && charts.incidentsByZone.length === 0}>
          {charts && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.incidentsByZone}>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="zone" tick={CHART_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={CHART_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#150f28', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="total" fill="#8b7cf6" radius={[6, 6, 0, 0]} name="Total" />
                <Bar dataKey="resolved" fill="#2dd4bf" radius={[6, 6, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Severity breakdown" empty={charts && charts.incidentsBySeverity.every((s) => s.count === 0)}>
          {charts && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.incidentsBySeverity.filter((s) => s.count > 0)}
                  dataKey="count"
                  nameKey="severity"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {charts.incidentsBySeverity.map((s) => (
                    <Cell key={s.severity} fill={SEVERITY_COLORS[s.severity]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#150f28', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24, alignItems: 'start' }}>
        <ChartCard title="14-day incident trend" empty={charts && charts.dailyTrend.every((d) => d.count === 0)}>
          {charts && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.dailyTrend}>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="date" tick={CHART_TICK} axisLine={false} tickLine={false} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={CHART_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#150f28', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#8b7cf6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Waste types detected" empty={charts && charts.incidentsByWasteType.length === 0}>
          {charts && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.incidentsByWasteType} layout="vertical">
                <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                <XAxis type="number" tick={CHART_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="type" tick={CHART_TICK} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ background: '#150f28', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="count" fill="#4fb8e6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="card">
        <div className="section-label">AI Insights</div>
        {insights === null ? (
          <div className="skeleton" style={{ height: 100, borderRadius: 12 }} />
        ) : insights.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 12px' }}><span>No insights yet.</span></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.map((insight, i) => (
              <div key={i} className="insight-card">
                <div className="insight-icon violet" style={{ background: 'var(--signal-violet-bg)', color: 'var(--signal-violet)', fontSize: 15 }}>
                  {insight.icon}
                </div>
                <div className="insight-text">
                  {insight.text}
                  {insight.mock && <span style={{ color: 'var(--ink-faint)', fontSize: 11 }}> · mock (no AI key configured)</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
