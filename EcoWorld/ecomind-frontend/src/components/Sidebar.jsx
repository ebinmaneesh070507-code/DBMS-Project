import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  FileWarning,
  Trash2,
  Truck,
  TrendingUp,
  MapPinned,
  MessageSquareText,
  Home,
} from 'lucide-react';
import BrandMark from './BrandMark';

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/scanner', label: 'AI Waste Scanner', icon: ScanLine },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/report', label: 'Report Waste', icon: FileWarning },
  { to: '/bins', label: 'Smart Bins', icon: Trash2 },
  { to: '/collection', label: 'Collection Management', icon: Truck },
  { to: '/prediction', label: 'Waste Prediction', icon: TrendingUp },
  { to: '/dumping-reports', label: 'Dumping Reports', icon: MapPinned },
  { to: '/assistant', label: 'AI Assistant', icon: MessageSquareText },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="sidebar-scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <BrandMark />
          <div>
            <div className="sidebar-brand-name">EcoMind</div>
            <div className="sidebar-brand-tag">Smart Waste OS</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span className="sidebar-status-dot" />
          Live · 5 zones connected
        </div>
      </aside>
    </>
  );
}
