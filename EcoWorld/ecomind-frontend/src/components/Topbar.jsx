import { Menu } from 'lucide-react';

export default function Topbar({ title, subtitle, onMenuClick }) {
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
      <div className="topbar-right">
        <div className="avatar-chip">
          <div className="avatar-chip-img">AZ</div>
          <span className="avatar-chip-name">Admin, Zone Ops</span>
        </div>
      </div>
    </header>
  );
}
