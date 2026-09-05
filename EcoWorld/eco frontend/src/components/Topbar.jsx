import { useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <div>
          <div className="topbar-title">{title}</div>
          {subtitle && <div className="topbar-sub">{subtitle}</div>}
        </div>
      </div>
      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <>
            <div className="avatar-chip">
              <div className="avatar-chip-img">{initials(user.name)}</div>
              <span className="avatar-chip-name">{user.name}</span>
            </div>
            <span className={`role-badge ${isAdmin ? 'admin' : ''}`}>{isAdmin ? 'Admin' : 'Viewer'}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              <LogOut size={14} /> Log out
            </button>
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
            Log in
          </button>
        )}
      </div>
    </header>
  );
}
