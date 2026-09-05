import { useEffect, useMemo, useState } from 'react';
import { MapPinned, Calendar, AlertTriangle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { PageHead, Pill, statusTone, priorityTone, EmptyState } from '../components/Bits';
import { api, resolveImageUrl } from '../services/api';

const STATUSES = ['Pending', 'Under Review', 'Assigned', 'Resolved'];

export default function DumpingReports() {
  const [reports, setReports] = useState([]);
  const [zoneFilter, setZoneFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .getAllDumpingReports()
      .then((res) => { if (!cancelled) setReports(res.data || []); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load reports'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const zones = useMemo(() => [...new Set(reports.map((r) => r.zone))].sort(), [reports]);

  const filtered = reports.filter(
    (r) => (zoneFilter === 'All' || r.zone === zoneFilter) && (statusFilter === 'All' || r.status === statusFilter)
  );

  async function markStatus(id, status) {
    try {
      const res = await api.updateDumpingStatus(id, status);
      setReports((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  }

  return (
    <AppLayout title="Illegal Dumping Reports" subtitle="Citizen-reported incidents across the city">
      <PageHead title="Illegal Dumping Reports" subtitle="Track incident status from first report through resolution. Admin/staff only." />

      {loading ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <span className="spinner-ring" style={{ margin: '0 auto 10px' }} />
          <strong>Loading reports…</strong>
        </div>
      ) : error ? (
        <div className="card">
          <div className="empty-state">
            <AlertTriangle />
            <strong>Couldn't load reports</strong>
            <span>{error}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="filter-row">
            {['All', ...zones].map((z) => (
              <button key={z} className={`filter-chip ${zoneFilter === z ? 'active' : ''}`} onClick={() => setZoneFilter(z)}>
                {z}
              </button>
            ))}
          </div>
          <div className="filter-row">
            {['All', ...STATUSES].map((s) => (
              <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card">
              <EmptyState icon={MapPinned} title="No reports match these filters" description="Try widening the zone or status filter." />
            </div>
          ) : (
            <div className="grid grid-2">
              {filtered.map((r) => (
                <div className="card" key={r._id}>
                  {r.imageUrl ? (
                    <img
                      src={resolveImageUrl(r.imageUrl)}
                      alt="Reported dumping"
                      style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 'var(--r-md)', marginBottom: 14, border: '1px solid var(--line-faint)' }}
                    />
                  ) : (
                    <div style={{
                      height: 130, borderRadius: 'var(--r-md)', marginBottom: 14,
                      background: 'linear-gradient(135deg, var(--bg-surface-raised), var(--bg-base))',
                      border: '1px solid var(--line-faint)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-faint)',
                    }}>
                      <MapPinned size={22} />
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13.5 }}>{r._id.slice(-6).toUpperCase()}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Pill tone={priorityTone(r.priority)}>{r.priority}</Pill>
                      <Pill tone={statusTone(r.status)}>{r.status}</Pill>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, marginBottom: 12 }}>{r.description}</p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-muted)', marginBottom: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPinned size={13} /> {r.zone}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} /> {new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <select
                    className="select"
                    value={r.status}
                    onChange={(e) => markStatus(r._id, e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
