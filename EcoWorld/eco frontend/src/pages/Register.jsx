import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <BrandMark />
          <span style={{ fontWeight: 700, fontSize: 17 }}>EcoMind</span>
        </div>
        <h2 style={{ marginBottom: 4 }}>Create your account</h2>
        <p style={{ marginBottom: 22, fontSize: 13.5 }}>
          Sign up to report waste in your area and track your recycling impact.
        </p>

        {error && (
          <div className="insight-card" style={{ marginBottom: 16 }}>
            <div className="insight-icon stat-icon coral"><AlertCircle size={16} /></div>
            <div className="insight-text">{error}</div>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="field">
            <label>Full name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            <UserPlus size={16} /> {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 13, textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--signal-mint)' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
