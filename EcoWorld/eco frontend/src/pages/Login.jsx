import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      const dest = location.state?.from?.pathname || '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
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
        <h2 style={{ marginBottom: 4 }}>Welcome back</h2>
        <p style={{ marginBottom: 22, fontSize: 13.5 }}>Log in to report waste, view your impact, or manage the city dashboard.</p>

        {error && (
          <div className="insight-card" style={{ marginBottom: 16 }}>
            <div className="insight-icon stat-icon coral"><AlertCircle size={16} /></div>
            <div className="insight-text">{error}</div>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            <LogIn size={16} /> {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 13, textAlign: 'center' }}>
          Don&rsquo;t have an account? <Link to="/register" style={{ color: 'var(--signal-mint)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
