import { useState } from 'react';
import { MapPinned, Calendar, Image as ImageIcon } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { PageHead, Pill, statusTone, priorityTone, EmptyState } from '../components/Bits';
import { dumpingReports, zones } from '../data/mockData';

const statuses = ['Pending', 'Under Review', 'Assigned', 'Resolved'];

export default function DumpingReports() {
  const [zoneFilter, setZoneFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = dumpingReports.filter(
    (r) => (zoneFilter === 'All' || r.zone === zoneFilter) && (statusFilter === 'All' || r.status === statusFilter)
  );

  return (
    <AppLayout title="Illegal Dumping Reports" subtitle="Citizen-reported incidents across the city">
      <PageHead title="Illegal Dumping Reports" subtitle="Track incident status from first report through resolution." />

      <div className="filter-row">
        {['All', ...zones].map((z) => (
          <button key={z} className={`filter-chip ${zoneFilter === z ? 'active' : ''}`} onClick={() => setZoneFilter(z)}>
            {z}
          </button>
        ))}
      </div>
      <div className="filter-row">
        {['All', ...statuses].map((s) => (
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
            <div className="card" key={r.id}>
              <div style={{
                height: 130, borderRadius: 'var(--r-md)', marginBottom: 14,
                background: 'linear-gradient(135deg, var(--bg-surface-raised), var(--bg-base))',
                border: '1px solid var(--line-faint)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-faint)',
              }}>
                <ImageIcon size={22} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13.5 }}>{r.id}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Pill tone={priorityTone(r.priority)}>{r.priority}</Pill>
                  <Pill tone={statusTone(r.status)}>{r.status}</Pill>
                </div>
              </div>
              <p style={{ fontSize: 13, marginBottom: 12 }}>{r.description}</p>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPinned size={13} /> {r.zone}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} /> {r.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
