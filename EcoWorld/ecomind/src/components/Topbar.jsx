import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, Repeat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
      <div className="topbar-right" style={{ position: 'relative' }} ref={ref}>
        <button className="avatar-chip" onClick={() => setMenuOpen((o) => !o)}>
          <div className="avatar-chip-img">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              initials || '?'
            )}
          </div>
          <span className="avatar-chip-name">{user?.name || 'Account'}</span>
        </button>

        {menuOpen && (
          <div className="topbar-menu">
            <div style={{ padding: '6px 10px 10px', fontSize: 11.5, color: 'var(--ink-faint)' }}>
              {user?.email} · <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
            {!isAdmin && (
              <button className="topbar-menu-item" onClick={() => { setMenuOpen(false); navigate('/choose-role'); }}>
                <Repeat /> Switch role
              </button>
            )}
            <button className="topbar-menu-item" onClick={() => { setMenuOpen(false); logout(); navigate('/'); }}>
              <LogOut /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
