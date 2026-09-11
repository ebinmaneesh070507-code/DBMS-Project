import { useEffect, useState } from 'react';
import { MapPin, LayoutGrid } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { api, resolveImageUrl } from '../services/api';

const SEVERITY_TONE = { Low: 'mint', Medium: 'azure', High: 'amber', Critical: 'coral' };
const STATUS_TONE = { Reported: 'azure', Dispatched: 'amber', 'In Progress': 'amber', Resolved: 'mint' };
const STATUSES = ['Reported', 'Dispatched', 'In Progress', 'Resolved'];

export default function AdminIncidents() {
  const [zones, setZones] = useState([]);
  const [incidents, setIncidents] = useState(null);
  const [zoneFilter, setZoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getZones().then(setZones).catch(() => {});
  }, []);

  useEffect(() => {
    setIncidents(null);
    api
      .getIncidents({ zone: zoneFilter || undefined, status: statusFilter || undefined })
      .then(setIncidents)
      .catch((err) => setError(err.message || 'Could not load incidents.'));
  }, [zoneFilter, statusFilter]);

  return (
    <AppLayout title="All Incidents" subtitle="Every reported incident across every zone">
      {error && <p style={{ color: 'var(--signal-coral)', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      <div className="filter-row">
        <button className={`filter-chip ${zoneFilter === '' ? 'active' : ''}`} onClick={() => setZoneFilter('')}>
          All zones
        </button>
        {zones.map((z) => (
          <button
            key={z._id}
            className={`filter-chip ${zoneFilter === z.name ? 'active' : ''}`}
            onClick={() => setZoneFilter(z.name)}
          >
            {z.name}
          </button>
        ))}
      </div>

      <div className="filter-row">
        <button className={`filter-chip ${statusFilter === '' ? 'active' : ''}`} onClick={() => setStatusFilter('')}>
          Any status
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {incidents === null ? (
        <div className="grid grid-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 14 }} />)}
        </div>
      ) : incidents.length === 0 ? (
        <div className="card empty-state">
          <LayoutGrid />
          <strong>No incidents match these filters</strong>
          <span>Try clearing a filter, or check back once reports come in.</span>
        </div>
      ) : (
        <div className="grid grid-3">
          {incidents.map((incident) => (
            <div key={incident._id} className={`ticket sev-${incident.severity.toLowerCase()}`}>
              {incident.imageUrl && (
                <img src={resolveImageUrl(incident.imageUrl)} alt={incident.zone} className="ticket-photo" />
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13.5 }}>
                  <MapPin size={13} /> {incident.zone}
                </div>
                <span className={`pill ${STATUS_TONE[incident.status] || 'neutral'}`}>{incident.status}</span>
              </div>
              <p style={{ fontSize: 12.5, marginBottom: 10, lineHeight: 1.5 }}>{incident.aiReport}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <span className={`pill ${SEVERITY_TONE[incident.severity] || 'azure'}`}>{incident.severity}</span>
                {incident.wasteTypes?.slice(0, 2).map((wt) => (
                  <span key={wt} className="pill neutral">{wt}</span>
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>
                Reported by {incident.reportedBy?.name || 'Unknown'}
                {incident.respondedBy && ` · Claimed by ${incident.respondedBy.name}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
