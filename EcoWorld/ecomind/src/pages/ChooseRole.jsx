import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck } from 'lucide-react';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../context/AuthContext';

export default function ChooseRole() {
  const { user, loading, chooseRole, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const pick = async (role) => {
    setBusy(role);
    setError('');
    try {
      await chooseRole(role);
      navigate(role === 'responder' ? '/respond' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not set your role. Try again.');
      setBusy(null);
    }
  };

  return (
    <div className="auth-shell">
      <div className="ambient-bg">
        <div className="ambient-blob b1" />
        <div className="ambient-blob b3" />
      </div>

      <div className="auth-card auth-card-wide">
        <div className="auth-brand">
          <BrandMark size={28} />
          <span className="auth-brand-name">EcoMind</span>
        </div>

        <h1>How will you be using EcoMind?</h1>
        <p className="auth-sub">
          Welcome, {user.name.split(' ')[0]}. You can switch this anytime from your profile menu — it's fine to try
          both sides of the simulation.
        </p>

        <div className="role-pick-grid">
          <button className="role-pick-card" onClick={() => pick('citizen')} disabled={busy !== null}>
            <div className="role-pick-icon azure" style={{ background: 'var(--signal-azure-bg)', color: 'var(--signal-azure)' }}>
              <Camera />
            </div>
            <h3>Citizen Reporter</h3>
            <p>Photograph messy areas around campus and get an instant AI report. Track your own contributions.</p>
            {busy === 'citizen' && <div className="spinner-ring" style={{ marginTop: 12 }} />}
          </button>

          <button className="role-pick-card" onClick={() => pick('responder')} disabled={busy !== null}>
            <div className="role-pick-icon amber" style={{ background: 'var(--signal-amber-bg)', color: 'var(--signal-amber)' }}>
              <ShieldCheck />
            </div>
            <h3>Response Team</h3>
            <p>See live incident calls across campus, claim them, and mark them resolved once handled.</p>
            {busy === 'responder' && <div className="spinner-ring" style={{ marginTop: 12 }} />}
          </button>
        </div>

        {error && <p style={{ color: 'var(--signal-coral)', fontSize: 12.5, marginTop: 16 }}>{error}</p>}
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={logout}>
  Sign out
</button>
      </div>
    </div>
  );
}
