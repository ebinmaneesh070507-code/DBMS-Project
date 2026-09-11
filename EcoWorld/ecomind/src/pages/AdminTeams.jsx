import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { api } from '../services/api';

function ZoneManager() {
  const [zones, setZones] = useState(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  const load = () => api.getZones().then(setZones).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);

  const addZone = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.createZone(newName.trim());
      setNewName('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const saveEdit = async (id) => {
    try {
      await api.updateZone(id, editValue.trim());
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeZone = async (id) => {
    try {
      await api.deleteZone(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 32 }}>
      <div className="section-label">Campus zones</div>
      {error && <p style={{ color: 'var(--signal-coral)', fontSize: 12.5, marginBottom: 12 }}>{error}</p>}

      {zones === null ? (
        <div className="skeleton" style={{ height: 120, borderRadius: 10 }} />
      ) : (
        <>
          {zones.map((z) => (
            <div key={z._id} className="list-row">
              {editingId === z._id ? (
                <>
                  <input className="input" value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ flex: 1 }} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => saveEdit(z._id)}><Check size={14} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}><X size={14} /></button>
                  </div>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 13.5 }}>{z.name}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(z._id); setEditValue(z.name); }}>
                      <Pencil size={13} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeZone(z._id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          <form onSubmit={addZone} style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <input
              className="input"
              placeholder="New zone name, e.g. Engineering Block"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" type="submit"><Plus size={14} /> Add</button>
          </form>
        </>
      )}
    </div>
  );
}

export default function AdminTeams() {
  const [teams, setTeams] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTeams().then(setTeams).catch((err) => setError(err.message || 'Could not load response teams.'));
  }, []);

  return (
    <AppLayout title="Response Teams" subtitle="Real activity from every responder account">
      <ZoneManager />

      {error && <p style={{ color: 'var(--signal-coral)', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      <div className="section-label">Responders</div>
      {teams === null ? (
        <div className="grid grid-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 18 }} />)}</div>
      ) : teams.length === 0 ? (
        <div className="card empty-state">
          <Users />
          <strong>No response teams yet</strong>
          <span>They'll appear here once a signed-in user chooses "Response Team" on their first login.</span>
        </div>
      ) : (
        <div className="grid grid-3">
          {teams.map((t) => (
            <div key={t.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div className="avatar-chip-img" style={{ width: 34, height: 34 }}>
                  {t.picture ? <img src={t.picture} alt={t.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : t.name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>{t.email}</div>
                </div>
              </div>
              <div className="grid grid-2" style={{ gap: 10 }}>
                <div>
                  <div className="stat-value" style={{ fontSize: 20 }}>{t.totalClaimed}</div>
                  <div className="stat-label">Claimed</div>
                </div>
                <div>
                  <div className="stat-value" style={{ fontSize: 20 }}>{t.totalResolved}</div>
                  <div className="stat-label">Resolved</div>
                </div>
              </div>
              {t.avgResolutionMinutes !== null && (
                <p style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 12 }}>
                  Avg. resolution: ~{t.avgResolutionMinutes} min
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
