import { useEffect, useState } from 'react';
import { FileText, CheckCircle2, Clock, MapPin } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { api, resolveImageUrl } from '../services/api';

const SEVERITY_TONE = { Low: 'mint', Medium: 'azure', High: 'amber', Critical: 'coral' };
const STATUS_TONE = { Reported: 'azure', Dispatched: 'amber', 'In Progress': 'amber', Resolved: 'mint' };

export default function MyContributions() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getMyStats()
      .then(async (s) => {
        setStats(s);
        if (s.mode === 'citizen') {
          const r = await api.getIncidents();
          setReports(r);
        }
      })
      .catch((err) => setError(err.message || 'Could not load your contributions.'));
  }, []);

  const isResponderShaped = stats?.mode !== 'citizen';

  return (
    <AppLayout title="My Contributions" subtitle="Everything you've reported and its status">
      {error && <p style={{ color: 'var(--signal-coral)', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      <div className="grid grid-3" style={{ marginBottom: 32 }}>
        {stats === null ? (
          [0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 96, borderRadius: 18 }} />)
        ) : isResponderShaped ? (
          <>
            <div className="stat-card">
              <div className="stat-icon azure"><FileText /></div>
              <div className="stat-value">{stats.totalClaimed}</div>
              <div className="stat-label">Incidents claimed</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon mint"><CheckCircle2 /></div>
              <div className="stat-value">{stats.totalResolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber"><Clock /></div>
              <div className="stat-value">{stats.activeAssignments}</div>
              <div className="stat-label">Active assignments</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon azure"><FileText /></div>
              <div className="stat-value">{stats.totalReported}</div>
              <div className="stat-label">Total reports filed</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon mint"><CheckCircle2 /></div>
              <div className="stat-value">{stats.totalResolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber"><Clock /></div>
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Still pending</div>
            </div>
          </>
        )}
      </div>

      {isResponderShaped ? (
        <div className="card empty-state">
          <FileText />
          <strong>This view is for citizen reports</strong>
          <span>As an admin/responder your claimed work shows on the Response Board instead.</span>
        </div>
      ) : (
        <>
          <div className="section-label">Your reports</div>
          {reports === null ? (
            <div className="skeleton" style={{ height: 200, borderRadius: 18 }} />
          ) : reports.length === 0 ? (
            <div className="card empty-state">
              <FileText />
              <strong>No reports yet</strong>
              <span>Head to "Report an Area" to file your first one — it only takes a photo.</span>
            </div>
          ) : (
            <div className="grid grid-3">
              {reports.map((incident) => (
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
                  <span className={`pill ${SEVERITY_TONE[incident.severity] || 'azure'}`}>{incident.severity}</span>
                  {incident.respondedBy && (
                    <p style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 10 }}>
                      Responder: {incident.respondedBy.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
