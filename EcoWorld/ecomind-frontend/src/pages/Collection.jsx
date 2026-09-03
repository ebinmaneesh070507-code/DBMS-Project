import { Truck, Gauge, Route, ArrowRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { PageHead, Pill, statusTone } from '../components/Bits';
import { vehicles, pickupRequests, collectionRoute } from '../data/mockData';

function capacityTone(cap) {
  if (cap >= 85) return 'coral';
  if (cap >= 60) return 'amber';
  return 'mint';
}

export default function Collection() {
  return (
    <AppLayout title="Collection Management" subtitle="Vehicles, routes, and pickup requests">
      <PageHead title="Smart Collection" subtitle="Track active vehicles, their assigned zones, and how full each truck is right now." />

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-label">Active collection vehicles</div>
          {vehicles.map((v) => (
            <div className="list-row" key={v.id}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{v.id} &middot; {v.zone}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{v.driver} &middot; {v.stops} stops remaining</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 90 }}>
                  <div className="progress-track">
                    <div className={`progress-fill ${capacityTone(v.capacity)}`} style={{ width: `${v.capacity}%` }} />
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, width: 34 }}>{v.capacity}%</span>
                <Pill tone={statusTone(v.status)}>{v.status}</Pill>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-label">Pickup requests</div>
          {pickupRequests.map((r) => (
            <div className="list-row" key={r.id}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, fontFamily: 'var(--font-mono)' }}>{r.id}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{r.type} &middot; {r.zone}</div>
              </div>
              <Pill tone={statusTone(r.status)}>{r.status}</Pill>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-label">Optimized route &middot; EV-14</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          padding: '18px 4px', marginBottom: 18,
        }}>
          {collectionRoute.stops.map((stop, i) => (
            <div key={stop} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-surface-raised)', border: '1px solid var(--line-faint)',
                borderRadius: 'var(--r-pill)', padding: '8px 14px', fontSize: 13, fontWeight: 500,
              }}>
                {i === 0 || i === collectionRoute.stops.length - 1 ? <Route size={14} color="var(--signal-mint)" /> : <Truck size={14} color="var(--ink-muted)" />}
                {stop}
              </div>
              {i < collectionRoute.stops.length - 1 && <ArrowRight size={14} color="var(--ink-faint)" />}
            </div>
          ))}
        </div>
        <div className="grid grid-3">
          <div className="stat-card card-tight">
            <div className="stat-icon mint" style={{ width: 30, height: 30 }}><Gauge size={15} /></div>
            <div className="stat-value" style={{ fontSize: 22 }}>{collectionRoute.optimizationScore}/100</div>
            <div className="stat-label">Optimization score</div>
          </div>
          <div className="stat-card card-tight">
            <div className="stat-icon azure" style={{ width: 30, height: 30 }}><Route size={15} /></div>
            <div className="stat-value" style={{ fontSize: 22 }}>{collectionRoute.distanceSaved}</div>
            <div className="stat-label">Distance saved vs. manual route</div>
          </div>
          <div className="stat-card card-tight">
            <div className="stat-icon amber" style={{ width: 30, height: 30 }}><Truck size={15} /></div>
            <div className="stat-value" style={{ fontSize: 22 }}>{collectionRoute.estTime}</div>
            <div className="stat-label">Estimated route time</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
