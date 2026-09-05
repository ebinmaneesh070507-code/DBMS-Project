import { useEffect, useRef, useState } from 'react';
import { UploadCloud, ScanLine, CheckCircle2, XCircle, RotateCcw, AlertCircle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { PageHead, AIThinking } from '../components/Bits';
import { api } from '../services/api';

export default function Scanner() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | analyzing | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    api.getScanCategories().then((res) => setCategories(res.data || [])).catch(() => setCategories([]));
  }, []);

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setResult(null);
      setStatus('idle');
      setError('');
    };
    reader.readAsDataURL(f);
  }

  async function analyze() {
    if (!file) return;
    setStatus('analyzing');
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.analyzeWaste(formData);
      setResult(res.data);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Analysis failed');
      setStatus('error');
    }
  }

  function reset() {
    setPreview(null);
    setFile(null);
    setResult(null);
    setStatus('idle');
    setError('');
  }

  return (
    <AppLayout title="AI Waste Scanner" subtitle="Upload a photo to classify a waste item">
      <PageHead
        title="AI Waste Scanner"
        subtitle="Upload an image of an item and EcoMind will identify its category, recyclability, and how to dispose of it."
      />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="section-label">Upload image</div>

          {!preview ? (
            <div
              className={`dropzone ${drag ? 'drag' : ''}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
            >
              <UploadCloud style={{ margin: '0 auto' }} />
              <div style={{ fontWeight: 600, color: 'var(--ink-secondary)', marginBottom: 4 }}>
                Drag & drop an image, or click to browse
              </div>
              <div>JPG, PNG, or WEBP</div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          ) : (
            <div>
              <img
                src={preview}
                alt="Uploaded waste item preview"
                style={{ width: '100%', borderRadius: 'var(--r-md)', maxHeight: 320, objectFit: 'cover', border: '1px solid var(--line-faint)' }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                {status !== 'analyzing' && (
                  <button className="btn btn-primary btn-block" onClick={analyze}>
                    <ScanLine size={16} /> Analyze Waste
                  </button>
                )}
                <button className="btn btn-ghost" onClick={reset}>
                  <RotateCcw size={16} />
                </button>
              </div>
              {status === 'analyzing' && (
                <div style={{ marginTop: 14 }}>
                  <AIThinking label="EcoMind AI is analyzing the image…" />
                </div>
              )}
            </div>
          )}

          {categories.length > 0 && (
            <>
              <div className="divider" />
              <div className="section-label">Recognized categories</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((c) => (
                  <span key={c} className="pill neutral">{c}</span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="section-label">Analysis result</div>

          {error && (
            <div className="insight-card" style={{ marginBottom: 16 }}>
              <div className="insight-icon stat-icon coral"><AlertCircle size={16} /></div>
              <div className="insight-text">{error}</div>
            </div>
          )}

          {!result && status !== 'analyzing' && !error && (
            <div className="empty-state">
              <ScanLine />
              <strong>No item analyzed yet</strong>
              <span>Upload an image and click Analyze Waste to see the AI classification here.</span>
            </div>
          )}
          {status === 'analyzing' && (
            <div className="empty-state">
              <span className="spinner-ring" style={{ width: 28, height: 28, borderWidth: 3, margin: '0 auto 10px' }} />
              <strong>Analyzing image…</strong>
              <span>The AI model is identifying the item and checking disposal guidance.</span>
            </div>
          )}
          {result && status === 'done' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 19 }}>{result.detectedItem}</h3>
                {result.recyclable ? (
                  <span className="pill mint"><CheckCircle2 size={12} /> Recyclable</span>
                ) : (
                  <span className="pill coral"><XCircle size={12} /> Not recyclable</span>
                )}
              </div>

              <div className="list-row">
                <span style={{ color: 'var(--ink-muted)', fontSize: 13 }}>Category</span>
                <span className="pill azure">{result.category}</span>
              </div>
              <div className="list-row">
                <span style={{ color: 'var(--ink-muted)', fontSize: 13 }}>AI Confidence</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{result.confidence}%</span>
              </div>
              <div style={{ marginTop: 4, marginBottom: 18 }}>
                <div className="progress-track">
                  <div className="progress-fill mint" style={{ width: `${result.confidence}%` }} />
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon stat-icon mint"><CheckCircle2 size={16} /></div>
                <div className="insight-text">
                  <strong>Disposal recommendation.</strong> {result.disposalRecommendation}
                </div>
              </div>

              {result.source === 'mock' && (
                <div style={{ marginTop: 14, fontSize: 11.5, color: 'var(--ink-faint)' }}>
                  Mock AI response &mdash; the backend has no GEMINI_API_KEY configured yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
