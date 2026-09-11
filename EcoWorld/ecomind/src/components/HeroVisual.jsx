import { useEffect, useState } from 'react';
import { Camera, Sparkles, UserCheck, CheckCircle2 } from 'lucide-react';

// A small looping preview of the actual reporting -> AI triage -> claim ->
// resolve flow. This is illustrative/demo content on the public landing
// page (clearly labeled "Live preview"), not real data — the one
// orchestrated motion moment for the whole page.
const STEPS = [
  {
    key: 'reported',
    icon: Camera,
    tone: 'azure',
    title: 'Photo reported',
    sub: 'Centre of Excellence · just now',
  },
  {
    key: 'triaged',
    icon: Sparkles,
    tone: 'violet',
    title: 'AI triage complete',
    sub: 'Mixed waste · High severity · dispatch recommended',
  },
  {
    key: 'claimed',
    icon: UserCheck,
    tone: 'amber',
    title: 'Response team claimed it',
    sub: 'Team Aarav · en route',
  },
  {
    key: 'resolved',
    icon: CheckCircle2,
    tone: 'mint',
    title: 'Resolved',
    sub: 'Cleared in 11 minutes',
  },
];

export default function HeroVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 2200);
    return () => clearInterval(id);
  }, []);

  const active = STEPS[step];
  const Icon = active.icon;

  return (
    <div className="hero-console">
      <div className="hero-console-head">
        <span className="pill-dot live" style={{ color: 'var(--signal-coral)' }} />
        <span>Live preview</span>
      </div>

      <div className={`hero-console-ticket sev-${active.tone}`}>
        <div className={`hero-console-icon ${active.tone}`}>
          <Icon />
        </div>
        <div>
          <div className="hero-console-title">{active.title}</div>
          <div className="hero-console-sub">{active.sub}</div>
        </div>
      </div>

      <div className="hero-console-steps">
        {STEPS.map((s, i) => (
          <span key={s.key} className={`hero-console-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
        ))}
      </div>
    </div>
  );
}
