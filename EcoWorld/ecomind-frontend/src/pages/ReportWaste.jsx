import { useState } from 'react';
import { UploadCloud, CheckCircle2, FileWarning } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { PageHead } from '../components/Bits';
import { zones, wasteCategories } from '../data/mockData';

const priorities = ['Low', 'Medium', 'High'];

export default function ReportWaste() {
  const [form, setForm] = useState({
    type: '',
    description: '',
    zone: '',
    priority: 'Medium',
  });
  const [imageName, setImageName] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');

  function submit(e) {
    e.preventDefault();
    setReportId(`WR-${Math.floor(1000 + Math.random() * 9000)}`);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AppLayout title="Report Waste" subtitle="Report a waste-related issue in your area">
        <div className="card" style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center', padding: '40px 28px' }}>
          <div className="stat-icon mint" style={{ margin: '0 auto 18px', width: 48, height: 48 }}>
            <CheckCircle2 size={22} />
          </div>
          <h2 style={{ marginBottom: 8 }}>Report submitted</h2>
          <p style={{ marginBottom: 22 }}>
            Reference <span className="mono" style={{ color: 'var(--signal-mint)' }}>{reportId}</span> has been logged
            and routed to the {form.zone || 'assigned'} collection team.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSubmitted(false);
              setForm({ type: '', description: '', zone: '', priority: 'Medium' });
              setImageName(null);
            }}
          >
            Submit another report
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Report Waste" subtitle="Report a waste-related issue in your area">
      <PageHead
        title="Report Waste"
        subtitle="Spotted an overflowing bin, illegal dumping, or missed pickup? Let the collection team know."
      />

      <div className="grid" style={{ gridTemplateColumns: '1.3fr 0.9fr', alignItems: 'start' }}>
        <form className="card" onSubmit={submit}>
          <div className="field">
            <label>Waste type</label>
            <select
              className="select"
              required
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="" disabled>Select a category</option>
              {wasteCategories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              className="textarea"
              placeholder="Describe what you're seeing and where exactly it is"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Zone / area</label>
            <select
              className="select"
              required
              value={form.zone}
              onChange={(e) => setForm({ ...form, zone: e.target.value })}
            >
              <option value="" disabled>Select a zone</option>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Upload image</label>
            <label className="dropzone" style={{ display: 'block' }}>
              <UploadCloud style={{ margin: '0 auto' }} />
              <div>{imageName || 'Click to attach a photo (optional)'}</div>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImageName(e.target.files?.[0]?.name || null)}
              />
            </label>
          </div>

          <div className="field">
            <label>Priority</label>
            <div className="radio-row">
              {priorities.map((p) => (
                <button
                  type="button"
                  key={p}
                  className={`radio-chip ${form.priority === p ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, priority: p })}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            <FileWarning size={16} /> Submit Report
          </button>
        </form>

        <div className="card">
          <div className="section-label">Before you submit</div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <li className="insight-card">
              <div className="insight-icon stat-icon azure"><FileWarning size={16} /></div>
              <div className="insight-text">Be specific about the location &mdash; a landmark or cross-street helps crews find it faster.</div>
            </li>
            <li className="insight-card">
              <div className="insight-icon stat-icon amber"><FileWarning size={16} /></div>
              <div className="insight-text">Mark <strong>High</strong> priority only for hazards, blocked paths, or health risks.</div>
            </li>
            <li className="insight-card">
              <div className="insight-icon stat-icon mint"><FileWarning size={16} /></div>
              <div className="insight-text">A photo lets the AI assistant pre-tag the waste category automatically.</div>
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
