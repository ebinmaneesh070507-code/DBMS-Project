import { useEffect, useState } from 'react';
import { Truck, Gauge, Route, ArrowRight, AlertTriangle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { PageHead, Pill, statusTone } from '../components/Bits';
import { api } from '../services/api';

function capacityTone(pct) {
  if (pct >= 85) return 'coral';
  if (pct >= 60) return 'amber';
  return 'mint';
}

export default function Collection() {
  const [vehicles, setVehicles] = useState([]);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getVehicles(), api.getAllReports({ status: 'Assigned' })])
      .then(([vehicleRes, reportRes]) => {
        if (cancelled) return;
        setVehicles(vehicleRes.data || []);
        setPickupRequests(reportRes.data || []);
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load collection data'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <AppLayout title="Collection Management" subtitle="Vehicles, routes, and pickup requests">
        <div className="empty-state" style={{ marginTop: 40 }}>
          <span className="spinner-ring" style={{ margin: '0 auto 10px' }} />
          <strong>Loading fleet data…</strong>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Collection Management" subtitle="Vehicles, routes, and pickup requests">
        <div className="card">
          <div className="empty-state">
            <AlertTriangle />
            <strong>Couldn't load fleet data</strong>
            <span>{error}</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  const topVehicle = vehicles[0];

  return (
    <AppLayout title="Collection Management" subtitle="Vehicles, routes, and pickup requests">
      <PageHead title="Smart Collection" subtitle="Vehicles are auto-assigned the moment a citizen files a report — no manual dispatching needed." />

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-label">Active collection vehicles</div>
          {vehicles.length === 0 ? (
            <div className="empty-state"><span>No vehicles yet — one is created automatically the first time a report is dispatched.</span></div>
          ) : (
            vehicles.map((v) => {
              const capacityPct = v.capacityKg ? Math.round((v.currentLoadKg / v.capacityKg) * 100) : 0;
              return (
                <div className="list-row" key={v._id}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{v.vehicleId} &middot; {v.assignedZone}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{(v.route?.length || 1) - 1} stops on route</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 90 }}>
                      <div className="progress-track">
                        <div className={`progress-fill ${capacityTone(capacityPct)}`} style={{ width: `${capacityPct}%` }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, width: 34 }}>{capacityPct}%</span>
                    <Pill tone={statusTone(v.status)}>{v.status}</Pill>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="card">
          <div className="section-label">Pickup requests (currently assigned)</div>
          {pickupRequests.length === 0 ? (
            <div className="empty-state"><span>No active pickup requests right now.</span></div>
          ) : (
            pickupRequests.map((r) => (
              <div className="list-row" key={r._id}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, fontFamily: 'var(--font-mono)' }}>{r._id.slice(-6).toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{r.wasteType} &middot; {r.zone}</div>
                </div>
                <Pill tone={statusTone(r.status)}>{r.status}</Pill>
              </div>
            ))
          )}
        </div>
      </div>

      {topVehicle && (
        <div className="card">
          <div className="section-label">Optimized route &middot; {topVehicle.vehicleId}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '18px 4px', marginBottom: 18 }}>
            {(topVehicle.route || ['Depot']).map((stop, i, arr) => (
              <div key={`${stop}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg-surface-raised)', border: '1px solid var(--line-faint)',
                  borderRadius: 'var(--r-pill)', padding: '8px 14px', fontSize: 13, fontWeight: 500,
                }}>
                  {i === 0 || i === arr.length - 1 ? <Route size={14} color="var(--signal-mint)" /> : <Truck size={14} color="var(--ink-muted)" />}
                  {stop}
                </div>
                {i < arr.length - 1 && <ArrowRight size={14} color="var(--ink-faint)" />}
              </div>
            ))}
          </div>
          <div className="grid grid-3">
            <div className="stat-card card-tight">
              <div className="stat-icon mint" style={{ width: 30, height: 30 }}><Gauge size={15} /></div>
              <div className="stat-value" style={{ fontSize: 22 }}>{topVehicle.optimizationScore ?? '—'}/100</div>
              <div className="stat-label">Optimization score</div>
            </div>
            <div className="stat-card card-tight">
              <div className="stat-icon azure" style={{ width: 30, height: 30 }}><Route size={15} /></div>
              <div className="stat-value" style={{ fontSize: 22 }}>{topVehicle.distanceSavedKm ?? 0} km</div>
              <div className="stat-label">Distance saved vs. manual route</div>
            </div>
            <div className="stat-card card-tight">
              <div className="stat-icon amber" style={{ width: 30, height: 30 }}><Truck size={15} /></div>
              <div className="stat-value" style={{ fontSize: 22 }}>{topVehicle.currentLoadKg}/{topVehicle.capacityKg} kg</div>
              <div className="stat-label">Current load / capacity</div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
