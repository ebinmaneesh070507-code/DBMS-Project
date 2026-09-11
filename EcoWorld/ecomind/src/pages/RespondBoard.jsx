import { useCallback, useEffect, useState } from 'react';
import { Radio, UserCheck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { api, resolveImageUrl } from '../services/api';

const SEVERITY_TONE = { Low: 'mint', Medium: 'azure', High: 'amber', Critical: 'coral' };

function TicketCard({ incident, children }) {
  return (
    <div className={`ticket sev-${incident.severity.toLowerCase()}`}>
      {incident.imageUrl && <img src={resolveImageUrl(incident.imageUrl)} alt={incident.zone} className="ticket-photo" />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13.5 }}>
          <MapPin size={13} /> {incident.zone}
        </div>
        <span className={`pill ${SEVERITY_TONE[incident.severity] || 'azure'}`}>{incident.severity}</span>
      </div>
      <p style={{ fontSize: 12.5, marginBottom: 10, lineHeight: 1.5 }}>{incident.aiReport}</p>
      <div className="radio-row" style={{ marginBottom: 12 }}>
        {incident.wasteTypes?.map((wt) => <span key={wt} className="radio-chip selected">{wt}</span>)}
      </div>
      {children}
    </div>
  );
}

export default function RespondBoard() {
  const [open, setOpen] = useState(null);
  const [mine, setMine] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [openIncidents, myIncidents] = await Promise.all([
        api.getOpenIncidents(),
        api.getIncidents({ assignedToMe: 'true' }),
      ]);
      setOpen(openIncidents);
      setMine(myIncidents);
    } catch (err) {
      setError(err.message || 'Could not load the incident board.');
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000); // light live-refresh
    return () => clearInterval(interval);
  }, [load]);

  const claim = async (id) => {
    setBusyId(id);
    try {
      await api.respondToIncident(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const advance = async (id, status) => {
    setBusyId(id);
    try {
      await api.updateIncidentStatus(id, status);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const activeMine = mine?.filter((i) => i.status !== 'Resolved') || [];

  return (
    <AppLayout title="Response Board" subtitle="Live incident calls across campus">
      {error && <p style={{ color: 'var(--signal-coral)', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      <div style={{ marginBottom: 36 }}>
        <div className="page-head" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pill-dot live" style={{ color: 'var(--signal-coral)' }} />
            <h2 style={{ fontSize: 17 }}>Open calls</h2>
          </div>
        </div>

        {open === null ? (
          <div className="grid grid-3">
            {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 14 }} />)}
          </div>
        ) : open.length === 0 ? (
          <div className="card empty-state">
            <Radio />
            <strong>No open calls right now</strong>
            <span>New incidents will show up here the moment someone reports them.</span>
          </div>
        ) : (
          <div className="grid grid-3">
            {open.map((incident) => (
              <TicketCard key={incident._id} incident={incident}>
                <button
                  className="btn btn-amber btn-block btn-sm"
                  onClick={() => claim(incident._id)}
                  disabled={busyId === incident._id}
                >
                  <UserCheck size={14} /> {busyId === incident._id ? 'Claiming...' : 'Claim this call'}
                </button>
              </TicketCard>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="page-head" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 17 }}>My assignments</h2>
        </div>

        {mine === null ? (
          <div className="skeleton" style={{ height: 120, borderRadius: 14 }} />
        ) : activeMine.length === 0 ? (
          <div className="card empty-state">
            <Clock />
            <strong>Nothing assigned yet</strong>
            <span>Claim a call above to start working it.</span>
          </div>
        ) : (
          <div className="grid grid-3">
            {activeMine.map((incident) => (
              <TicketCard key={incident._id} incident={incident}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {incident.status === 'Dispatched' && (
                    <button
                      className="btn btn-outline btn-sm btn-block"
                      onClick={() => advance(incident._id, 'In Progress')}
                      disabled={busyId === incident._id}
                    >
                      Mark in progress
                    </button>
                  )}
                  {incident.status !== 'Resolved' && (
                    <button
                      className="btn btn-primary btn-sm btn-block"
                      onClick={() => advance(incident._id, 'Resolved')}
                      disabled={busyId === incident._id}
                    >
                      <CheckCircle2 size={13} /> Resolve
                    </button>
                  )}
                </div>
              </TicketCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
