import { NavLink } from 'react-router-dom';
import {
  Home, Camera, FileText, Radio, LayoutDashboard, TrendingUp, ScanLine,
  MessageSquareText, LayoutGrid, Users, X,
} from 'lucide-react';
import BrandMark from './BrandMark';
import { useAuth } from '../context/AuthContext';

function Section({ label, children }) {
  return (
    <>
      <div className="sidebar-section-label">{label}</div>
      {children}
    </>
  );
}

function Item({ to, icon: Icon, children, onClose }) {
  return (
    <NavLink to={to} onClick={onClose} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <Icon /> {children}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user, isAdmin, isResponder, isCitizen } = useAuth();

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <BrandMark size={28} />
        <div>
          <div className="sidebar-brand-name">EcoMind</div>
          <div className="sidebar-brand-tag">Campus incident response</div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', display: open ? 'inline-flex' : 'none' }} onClick={onClose}>
          <X size={15} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <Section label="General">
          <Item to="/" icon={Home} onClose={onClose}>Home</Item>
          <Item to="/dashboard" icon={LayoutDashboard} onClose={onClose}>Dashboard</Item>
          <Item to="/prediction" icon={TrendingUp} onClose={onClose}>Zone Predictions</Item>
          <Item to="/scanner" icon={ScanLine} onClose={onClose}>AI Waste Scanner</Item>
          <Item to="/assistant" icon={MessageSquareText} onClose={onClose}>AI Assistant</Item>
        </Section>

        {(isCitizen || isAdmin) && (
          <Section label="Reporting">
            <Item to="/report" icon={Camera} onClose={onClose}>Report an Area</Item>
            <Item to="/my-reports" icon={FileText} onClose={onClose}>My Contributions</Item>
          </Section>
        )}

        {(isResponder || isAdmin) && (
          <Section label="Response">
            <Item to="/respond" icon={Radio} onClose={onClose}>Response Board</Item>
          </Section>
        )}

        {isAdmin && (
          <Section label="Admin">
            <Item to="/admin/incidents" icon={LayoutGrid} onClose={onClose}>All Incidents</Item>
            <Item to="/admin/teams" icon={Users} onClose={onClose}>Response Teams</Item>
          </Section>
        )}
      </nav>

      <div className="sidebar-foot">
        <span className="sidebar-status-dot" /> Signed in as {user?.role || '—'}
      </div>
    </aside>
  );
}
