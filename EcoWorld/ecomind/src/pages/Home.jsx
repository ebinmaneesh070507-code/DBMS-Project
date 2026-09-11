import { Link, useNavigate } from 'react-router-dom';
import {
  Camera,
  Radio,
  LayoutDashboard,
  Sparkles,
  ScanLine,
  Users,
  TrendingUp,
  MessageSquareText,
  ArrowRight,
} from 'lucide-react';
import BrandMark from '../components/BrandMark';
import HeroVisual from '../components/HeroVisual';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: Camera,
    tone: 'azure',
    title: 'Photo-First Reporting',
    desc: 'See a mess? Photograph it and pick a zone. No forms, no manual categorizing.',
  },
  {
    icon: Sparkles,
    tone: 'violet',
    title: 'Gemini-Powered Triage',
    desc: 'AI reads the photo and decides waste types, severity, and whether a team needs to be dispatched.',
  },
  {
    icon: Radio,
    tone: 'amber',
    title: 'Live Response Board',
    desc: 'Response teams see every open call in real time and claim the ones they can handle.',
  },
  {
    icon: TrendingUp,
    tone: 'mint',
    title: 'Real Zone Trends',
    desc: 'Predictions are computed from actual incident timestamps — never a made-up number.',
  },
  {
    icon: ScanLine,
    tone: 'azure',
    title: 'AI Waste Scanner',
    desc: 'Scan a single item to instantly learn its category and how to dispose of it.',
  },
  {
    icon: MessageSquareText,
    tone: 'violet',
    title: 'AI Database Assistant',
    desc: 'Ask questions about campus incident data in plain language and get grounded answers.',
  },
];

const flow = [
  { title: 'Spot it', desc: 'A student or staff member photographs a messy area and picks the zone.' },
  { title: 'AI triages it', desc: 'Gemini reads the photo — waste types, severity, and whether to dispatch a team.' },
  { title: 'A team claims it', desc: 'The nearest available response team claims the call from the live board.' },
  { title: 'It gets resolved', desc: 'The team marks it in progress, then resolved — visible to everyone in real time.' },
];

export default function Home() {
  const { isAuthenticated, isAdmin, isResponder, needsRoleChoice } = useAuth();
  const navigate = useNavigate();

  const goOrLogin = (path) => {
    if (!isAuthenticated) return navigate('/login');
    if (needsRoleChoice) return navigate('/choose-role');
    navigate(path);
  };

  const primaryPath = isResponder ? '/respond' : '/report';
  const primaryLabel = isResponder ? 'Open Response Board' : 'Report an Area';

  return (
    <div className="home">
      <div className="ambient-bg">
        <div className="ambient-blob b1" />
        <div className="ambient-blob b2" />
        <div className="ambient-blob b3" />
      </div>

      <nav className="home-nav">
        <div className="home-nav-brand">
          <BrandMark />
          <span className="home-nav-brand-name">EcoMind</span>
        </div>
        <div className="home-nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
        </div>
        <div className="home-nav-cta">
          {isAuthenticated ? (
            <button className="btn btn-primary btn-sm" onClick={() => goOrLogin('/dashboard')}>
              <LayoutDashboard size={15} /> Dashboard
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign in</Link>
          )}
        </div>
      </nav>

      <section className="hero">
        <div>
          <span className="hero-eyebrow-pill">
            <span className="sidebar-status-dot" /> Live at Christ University, Kengari Campus
          </span>
          <h1>
            See a mess. <span className="accent">Snap it.</span> Get it handled.
          </h1>
          <p className="hero-desc">
            EcoMind turns a single photo into an AI-triaged incident report and puts it in front of a live response
            team — no forms, no manual sorting, no waiting for a scheduled round.
          </p>
          <div className="hero-cta-row">
            <button className="btn btn-primary" onClick={() => goOrLogin(primaryPath)}>
              <Camera size={16} /> {primaryLabel}
            </button>
            <button className="btn btn-outline" onClick={() => goOrLogin('/dashboard')}>
              <LayoutDashboard size={16} /> View Dashboard
            </button>
            {isAdmin && (
              <button className="btn btn-ghost" onClick={() => navigate('/admin/teams')}>
                <Users size={16} /> Response Teams
              </button>
            )}
          </div>
          <p className="hero-role-hint">
            {isAuthenticated
              ? 'Signed in — pick up right where you left off.'
              : 'Sign in with your campus Google account to report an issue or join a response team.'}
          </p>
        </div>
        <HeroVisual />
      </section>

      <section className="home-section" id="how-it-works">
        <div className="home-section-head">
          <h2>From photo to resolved, in one flow</h2>
          <p>Every step is real — reports, AI output, and responder claims are all live data, not a demo dataset.</p>
        </div>
        <div className="flow-row">
          {flow.map((step, i) => (
            <div className="flow-step" key={step.title}>
              <span className="flow-step-num">0{i + 1}</span>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section" id="features">
        <div className="home-section-head">
          <h2>One system, every part of the response loop</h2>
          <p>Reporting, AI triage, dispatch, and analytics — connected end to end.</p>
        </div>
        <div className="feature-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className={`feature-icon stat-icon ${f.tone}`}>
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
            <h2>See what's happening on campus right now.</h2>
            <p style={{ marginTop: 8, fontSize: 13.5 }}>Live incidents, response activity, and AI insights — no setup required.</p>
          </div>
          <button className="btn btn-primary" onClick={() => goOrLogin('/dashboard')}>
            View Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <footer className="home-footer">
        <div>&copy; 2026 EcoMind &middot; Campus Incident Response System</div>
        <div>Built for Christ University, Kengari Campus</div>
      </footer>
    </div>
  );
}
