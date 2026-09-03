import { useState } from 'react';
import { Trash2, Sparkles } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { PageHead, Pill, statusTone } from '../components/Bits';
import { smartBins, zones } from '../data/mockData';

function fillTone(fill) {
  if (fill >= 85) return 'coral';
  if (fill >= 60) return 'amber';
  if (fill >= 35) return 'azure';
  return 'mint';
}

export default function SmartBins() {
  const [zoneFilter, setZoneFilter] = useState('All');
  const filtered = zoneFilter === 'All' ? smartBins : smartBins.filter((b) => b.zone === zoneFilter);

  return (
    <AppLayout title="Smart Bin Monitoring" subtitle="Live fill levels across every zone">
      <PageHead title="Smart Bin Monitoring" subtitle="Fill levels update from IoT sensors in each bin, with AI predictions for time-to-capacity." />

      <div className="filter-row">
        {['All', ...zones].map((z) => (
          <button
            key={z}
            className={`filter-chip ${zoneFilter === z ? 'active' : ''}`}
            onClick={() => setZoneFilter(z)}
          >
            {z}
          </button>
        ))}
      </div>

      <div className="grid grid-3">
        {filtered.map((bin) => (
          <div className="card" key={bin.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 15 }}>{bin.id}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-muted)' }}>{bin.type} &middot; {bin.zone}</div>
              </div>
              <Pill tone={statusTone(bin.status)}>{bin.status}</Pill>
            </div>

            <div style={{ margin: '18px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700 }}>{bin.fill}%</span>
              <span style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>fill level</span>
            </div>
            <div className="progress-track">
              <div className={`progress-fill ${fillTone(bin.fill)}`} style={{ width: `${bin.fill}%` }} />
            </div>

            <div className="insight-card" style={{ marginTop: 16 }}>
              <div className="insight-icon stat-icon violet"><Sparkles size={14} /></div>
              <div className="insight-text" style={{ fontSize: 12.5 }}>
                Predicted to reach full capacity in <strong>{bin.predicted}</strong>.
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <Trash2 />
            <strong>No bins in this zone</strong>
            <span>Try selecting a different zone filter.</span>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
