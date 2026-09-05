import { Link } from 'react-router-dom';
import {
  ScanLine,
  FileWarning,
  LayoutDashboard,
  Recycle,
  Truck,
  TrendingUp,
  MessageSquareText,
  Sparkles,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import BrandMark from '../components/BrandMark';
import HeroVisual from '../components/HeroVisual';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: ScanLine,
    tone: 'mint',
    title: 'AI Waste Classification',
    desc: 'Point a camera at any item and get its category, recyclability, and disposal steps in seconds.',
  },
  {
    icon: Truck,
    tone: 'azure',
    title: 'Smart Collection',
    desc: 'Routes and vehicle assignments update automatically as bins fill and requests come in.',
  },
  {
    icon: TrendingUp,
    tone: 'amber',
    title: 'Waste Prediction',
    desc: 'Forecast next week\u2019s volume by zone so crews are never caught off guard.',
  },
  {
    icon: Recycle,
    tone: 'violet',
    title: 'Recycling Analytics',
    desc: 'Track diversion rates by category and zone, and see exactly where they\u2019re improving.',
  },
  {
    icon: MessageSquareText,
    tone: 'mint',
    title: 'AI Database Assistant',
    desc: 'Ask questions about your city\u2019s waste data in plain language and get instant answers.',
  },
  {
    icon: Sparkles,
    tone: 'azure',
    title: 'Live Insights',
    desc: 'Standing alerts flag overflow risk, unusual spikes, and recycling wins as they happen.',
  },
];

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="home">
      <nav className="home-nav">
        <div className="home-nav-brand">
          <BrandMark />
          <span className="home-nav-brand-name">EcoMind</span>
        </div>
        <div className="home-nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/bins">Smart Bins</Link>
          <Link to="/prediction">Prediction</Link>
          {user && <Link to="/my-impact">My Impact</Link>}
        </div>
        <div className="home-nav-cta">
          {user ? (
            <>
              <Link to="/report" className="btn btn-ghost btn-sm">Report Waste</Link>
              <Link to="/dashboard" className="btn btn-primary btn-sm">View Dashboard</Link>
              <button className="btn btn-outline btn-sm" onClick={logout}>
                <LogOut size={14} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <div>
          <span className="hero-eyebrow-pill">
            <span className="sidebar-status-dot" /> Live, AI-powered waste tracking
          </span>
          <h1>Smarter Waste Management Through AI</h1>
          <p className="hero-desc">
            EcoMind reads bins, routes, and reports through AI and data analytics to
            improve how a city classifies, collects, recycles, and predicts its waste
            &mdash; before problems reach the street.
          </p>
          <div className="hero-cta-row">
            <Link to="/scanner" className="btn btn-primary">
              <ScanLine size={16} /> Scan Waste
            </Link>
            <Link to="/report" className="btn btn-outline">
              <FileWarning size={16} /> Report Waste
            </Link>
            <Link to="/dashboard" className="btn btn-ghost">
              <LayoutDashboard size={16} /> View Dashboard
            </Link>
          </div>
          <div className="hero-stats-row">
            <div>
              <div className="hero-stat-num">AI</div>
              <div className="hero-stat-label">Every photo classified by Gemini</div>
            </div>
            <div>
              <div className="hero-stat-num">GPS</div>
              <div className="hero-stat-label">Reports pinpointed to a real zone</div>
            </div>
            <div>
              <div className="hero-stat-num">Auto</div>
              <div className="hero-stat-label">Collection teams dispatched instantly</div>
            </div>
          </div>
        </div>
        <HeroVisual />
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <h2>One system, every part of the waste pipeline</h2>
          <p>From the bin on the corner to the report on your desk, EcoMind connects classification, collection, and prediction into a single view.</p>
        </div>
        <div className="feature-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className={`feature-icon ${f.tone === 'mint' ? 'stat-icon mint' : f.tone === 'azure' ? 'stat-icon azure' : f.tone === 'amber' ? 'stat-icon amber' : 'stat-icon violet'}`}>
                <f.icon />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section" style={{ paddingTop: 0 }}>
        <div className="cta-band">
          <div>
            <h2>See what your zones are doing right now.</h2>
            <p style={{ marginTop: 8, fontSize: 13.5 }}>Open the dashboard for live stats, bin status, and AI insights &mdash; no setup required.</p>
          </div>
          <Link to="/dashboard" className="btn btn-primary">
            View Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <div>&copy; 2026 EcoMind &middot; Smart Waste Management System</div>
        <div>Built for smart-city waste operations</div>
      </footer>
    </div>
  );
}
