const nodes = [
  { x: 60, y: 90, r: 5, tone: '#49e6a6', delay: '0s' },
  { x: 180, y: 40, r: 4, tone: '#4fb8e6', delay: '0.4s' },
  { x: 300, y: 110, r: 6, tone: '#49e6a6', delay: '0.9s' },
  { x: 250, y: 220, r: 4, tone: '#f0a83e', delay: '1.3s' },
  { x: 110, y: 260, r: 5, tone: '#49e6a6', delay: '0.2s' },
  { x: 350, y: 260, r: 4, tone: '#a68cf0', delay: '1.6s' },
  { x: 40, y: 190, r: 3.5, tone: '#4fb8e6', delay: '0.7s' },
];

const edges = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 6], [2, 5], [3, 5],
];

export default function HeroVisual() {
  return (
    <div className="hero-visual">
      <svg viewBox="0 0 400 320" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#49e6a6" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#49e6a6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="160" r="190" fill="url(#glow)" />
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="rgba(150,230,200,0.22)"
            strokeWidth="1"
          />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.tone}>
            <animate
              attributeName="opacity"
              values="0.55;1;0.55"
              dur="2.6s"
              begin={n.delay}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
      <div className="hero-visual-card">
        <div className="hv-title">Zone C · Bin 04</div>
        <div className="hv-sub">Fill 88% · pickup dispatched</div>
      </div>
    </div>
  );
}
