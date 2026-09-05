import { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Award, Recycle, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { PageHead, Pill, statusTone, priorityTone } from '../components/Bits';
import StatCard from '../components/StatCard';
import { api, resolveImageUrl } from '../services/api';

const CHART_COLORS = ['#4fb8e6', '#49e6a6', '#f0a83e', '#a68cf0', '#8fa79c', '#ff6f61', '#ff4d4d', '#5d7a6f'];

export default function MyImpact() {
  const [impact, setImpact] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [impactRes, reportsRes] = await Promise.all([api.getMyImpact(), api.getMyReports()]);
        if (cancelled) return;
        setImpact(impactRes.data);
        setReports(reportsRes.data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load your impact data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <AppLayout title="My Impact" subtitle="Your contributions to a cleaner city">
        <div className="empty-state" style={{ marginTop: 60 }}>
          <span className="spinner-ring" style={{ margin: '0 auto 10px' }} />
          <strong>Loading your impact…</strong>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="My Impact" subtitle="Your contributions to a cleaner city">
        <div className="card">
          <div className="empty-state">
            <AlertTriangle />
            <strong>Couldn't load your data</strong>
            <span>{error}</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="My Impact" subtitle="Your contributions to a cleaner city">
      <PageHead title="My Impact" subtitle="A personal look at what you've reported and its outcome. Only visible to you." />

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard icon={Award} tone="mint" label="Reports Filed" value={impact.totalReports} />
        <StatCard icon={Recycle} tone="azure" label="Estimated Weight Reported" value={`${impact.totalWeightKg} kg`} />
        <StatCard icon={CheckCircle2} tone="violet" label="Resolved" value={impact.resolvedCount} />
        <StatCard icon={Clock} tone="amber" label="Pending / In progress" value={impact.pendingCount} />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-label">Your reports by category</div>
          {impact.byCategory.length === 0 ? (
            <div className="empty-state">
              <span>You haven't filed any reports yet — head to Report Waste to get started.</span>
            </div>
          ) : (
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={impact.byCategory} dataKey="count" nameKey="category" innerRadius={58} outerRadius={88} paddingAngle={2}>
                    {impact.byCategory.map((c, i) => (
                      <Cell key={c.category} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="var(--bg-surface)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f211c', border: '1px solid rgba(150,230,200,0.2)', borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-label">Recyclable vs. non-recyclable</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 40, fontWeight: 700, color: 'var(--signal-mint)' }}>
              {impact.totalReports ? Math.round((impact.recyclableCount / impact.totalReports) * 100) : 0}%
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-muted)' }}>of what you reported was recyclable</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-label">Your recent reports</div>
        {reports.length === 0 ? (
          <div className="empty-state"><span>Nothing here yet.</span></div>
        ) : (
          reports.map((r) => (
            <div className="list-row" key={r._id}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {r.imageUrl && (
                  <img src={resolveImageUrl(r.imageUrl)} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.wasteType} &middot; {r.zone}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Pill tone={priorityTone(r.priority)}>{r.priority}</Pill>
                <Pill tone={statusTone(r.status)}>{r.status}</Pill>
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
