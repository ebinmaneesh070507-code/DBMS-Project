import { useState } from 'react';
import { UploadCloud, CheckCircle2, FileWarning, MapPin, Truck, Sparkles, AlertCircle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { PageHead } from '../components/Bits';
import { api, resolveImageUrl } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function LocationMap({ lat, lng }) {
  if (GOOGLE_MAPS_KEY) {
    return (
      <div className="location-map-frame">
        <iframe
          title="Report location"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_KEY}&center=${lat},${lng}&zoom=16`}
        />
      </div>
    );
  }
  // No Google Maps key configured — free OpenStreetMap embed, no key required.
  const d = 0.01;
  const bbox = `${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}`;
  return (
    <div className="location-map-frame">
      <iframe
        title="Report location"
        loading="lazy"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`}
      />
    </div>
  );
}

export default function ReportWaste() {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { report, dispatch }
  const { coords, status: geoStatus, error: geoError, locate } = useGeolocation();

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please attach a photo of the waste — the AI needs it to classify the item.');
      return;
    }
    if (!coords) {
      setError('Please share your location so we can dispatch the right zone\u2019s collection team.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('description', description);
      formData.append('lat', coords.lat);
      formData.append('lng', coords.lng);

      const res = await api.submitReport(formData);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setResult(null);
    setDescription('');
    setFile(null);
    setPreview(null);
    setError('');
  }

  if (result) {
    const { data: report, dispatch } = result;
    return (
      <AppLayout title="Report Waste" subtitle="Report a waste-related issue in your area">
        <div className="card" style={{ maxWidth: 560, margin: '48px auto', padding: '36px 30px' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div className="stat-icon mint" style={{ margin: '0 auto 14px', width: 48, height: 48 }}>
              <CheckCircle2 size={22} />
            </div>
            <h2 style={{ marginBottom: 6 }}>Report submitted &amp; team dispatched</h2>
            <p style={{ fontSize: 13.5 }}>
              Reference <span className="mono" style={{ color: 'var(--signal-mint)' }}>{report._id.slice(-8).toUpperCase()}</span> is now being handled.
            </p>
          </div>

          <div className="insight-card" style={{ marginBottom: 12 }}>
            <div className="insight-icon stat-icon azure"><Sparkles size={16} /></div>
            <div className="insight-text">
              <strong>AI identified:</strong> {report.aiAnalysis?.detectedItem} &middot; {report.aiAnalysis?.category} ({report.aiAnalysis?.confidence}% confidence)
              {report.aiAnalysis?.source === 'mock' && <span style={{ color: 'var(--ink-faint)' }}> &mdash; mock AI (no GEMINI_API_KEY set on the backend)</span>}
            </div>
          </div>

          <div className="insight-card" style={{ marginBottom: 12 }}>
            <div className="insight-icon stat-icon mint"><CheckCircle2 size={16} /></div>
            <div className="insight-text">{report.aiAnalysis?.disposalRecommendation}</div>
          </div>

          <div className="insight-card" style={{ marginBottom: 20 }}>
            <div className="insight-icon stat-icon violet"><Truck size={16} /></div>
            <div className="insight-text">
              <strong>Dispatched:</strong> vehicle {dispatch?.vehicleId} is now servicing <strong>{report.zone}</strong>. Status: {dispatch?.status}.
            </div>
          </div>

          {report.imageUrl && (
            <img
              src={resolveImageUrl(report.imageUrl)}
              alt="Submitted waste"
              style={{ width: '100%', borderRadius: 'var(--r-md)', maxHeight: 260, objectFit: 'cover', marginBottom: 20, border: '1px solid var(--line-faint)' }}
            />
          )}

          <button className="btn btn-primary btn-block" onClick={reset}>
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
        subtitle="Upload a photo of what you found and your location — EcoMind's AI classifies it and dispatches a collection team automatically."
      />

      <div className="grid" style={{ gridTemplateColumns: '1.3fr 0.9fr', alignItems: 'start' }}>
        <form className="card" onSubmit={submit}>
          {error && (
            <div className="insight-card" style={{ marginBottom: 16 }}>
              <div className="insight-icon stat-icon coral"><AlertCircle size={16} /></div>
              <div className="insight-text">{error}</div>
            </div>
          )}

          <div className="field">
            <label>Photo of the waste</label>
            <label className="dropzone" style={{ display: 'block' }}>
              {preview ? (
                <img src={preview} alt="Preview" style={{ maxHeight: 200, borderRadius: 'var(--r-md)', margin: '0 auto' }} />
              ) : (
                <>
                  <UploadCloud style={{ margin: '0 auto' }} />
                  <div>Click to attach a photo (required — the AI needs it)</div>
                </>
              )}
              <input type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
            </label>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              className="textarea"
              placeholder="Describe what you're seeing and where exactly it is"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Your location</label>
            {!coords ? (
              <button type="button" className="btn btn-outline btn-block" onClick={locate} disabled={geoStatus === 'locating'}>
                <MapPin size={16} /> {geoStatus === 'locating' ? 'Getting your location…' : 'Share my current location'}
              </button>
            ) : (
              <>
                <div className="location-box">
                  <MapPin size={16} color="var(--signal-mint)" />
                  <span>
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} &middot; accuracy ~{Math.round(coords.accuracy)}m
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={locate}>
                    Refresh
                  </button>
                </div>
                <LocationMap lat={coords.lat} lng={coords.lng} />
              </>
            )}
            {geoError && <div className="field-hint" style={{ color: 'var(--signal-coral, #ff6f61)' }}>{geoError}</div>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting} style={{ marginTop: 6 }}>
            <FileWarning size={16} /> {submitting ? 'Analyzing & dispatching…' : 'Submit Report'}
          </button>
        </form>

        <div className="card">
          <div className="section-label">How this works</div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <li className="insight-card">
              <div className="insight-icon stat-icon azure"><Sparkles size={16} /></div>
              <div className="insight-text">Your photo is analyzed by EcoMind's AI model to identify the item, category, and whether it's recyclable.</div>
            </li>
            <li className="insight-card">
              <div className="insight-icon stat-icon amber"><MapPin size={16} /></div>
              <div className="insight-text">Your location is used to determine the zone and route the right collection team &mdash; it's only used for dispatch.</div>
            </li>
            <li className="insight-card">
              <div className="insight-icon stat-icon mint"><Truck size={16} /></div>
              <div className="insight-text">A vehicle is automatically dispatched the moment you submit &mdash; no manual triage needed.</div>
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
