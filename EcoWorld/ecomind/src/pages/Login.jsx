import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import BrandMark from '../components/BrandMark';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { isAuthenticated, loading, needsRoleChoice } = useAuth();
  const [error, setError] = useState('');

  if (loading) return null;
  if (isAuthenticated && needsRoleChoice) return <Navigate to="/choose-role" replace />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="auth-shell">
      <div className="ambient-bg">
        <div className="ambient-blob b1" />
        <div className="ambient-blob b2" />
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <BrandMark size={28} />
          <span className="auth-brand-name">EcoMind</span>
        </div>

        <h1>Sign in to EcoMind</h1>
        <p className="auth-sub">Report campus incidents, dispatch response teams, and track it all in real time.</p>

        <div className="auth-google-slot">
          <GoogleSignInButton onError={setError} />
        </div>

        {error && (
          <div className="insight-card" style={{ marginTop: 16, textAlign: 'left' }}>
            <div className="insight-icon coral" style={{ background: 'var(--signal-coral-bg)', color: 'var(--signal-coral)' }}>
              <AlertTriangle />
            </div>
            <div className="insight-text">{error}</div>
          </div>
        )}

        <div className="auth-divider">campus accounts only</div>
        <p style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
          First time here? You'll choose whether you're reporting issues or responding to them right after signing in.
        </p>
      </div>
    </div>
  );
}
