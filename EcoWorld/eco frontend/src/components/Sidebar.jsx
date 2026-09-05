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
  UserCircle2,
} from 'lucide-react';
import BrandMark from './BrandMark';
import { useAuth } from '../context/AuthContext';

const viewerLinks = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/scanner', label: 'AI Waste Scanner', icon: ScanLine },
  { to: '/report', label: 'Report Waste', icon: FileWarning },
  { to: '/my-impact', label: 'My Impact', icon: UserCircle2 },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bins', label: 'Smart Bins', icon: Trash2 },
  { to: '/prediction', label: 'Waste Prediction', icon: TrendingUp },
];

const adminOnlyLinks = [
  { to: '/collection', label: 'Collection Management', icon: Truck },
  { to: '/dumping-reports', label: 'Dumping Reports', icon: MapPinned },
  { to: '/assistant', label: 'AI Assistant', icon: MessageSquareText },
];

export default function Sidebar({ open, onClose }) {
  const { user, isAdmin } = useAuth();
  const links = user ? [...viewerLinks, ...(isAdmin ? adminOnlyLinks : [])] : [{ to: '/', label: 'Home', icon: Home, end: true }];

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
          {user ? (isAdmin ? 'Admin access · all zones' : 'Viewer access · live data') : 'Sign in for live data'}
        </div>
      </aside>
    </>
  );
}
