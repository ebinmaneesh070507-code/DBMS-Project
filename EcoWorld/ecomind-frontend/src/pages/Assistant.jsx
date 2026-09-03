import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, MessageSquareText } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { PageHead, AIThinking } from '../components/Bits';
import { askAssistant, isAiConfigured } from '../services/aiService';

const suggestions = [
  'Which zone generated the most plastic waste?',
  'Show recycling statistics for this month.',
  'Which bins are likely to overflow tomorrow?',
];

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(question) {
    const q = (question ?? input).trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    const res = await askAssistant(q);
    setMessages((m) => [...m, { role: 'ai', text: res.answer, mock: res.mock }]);
    setLoading(false);
  }

  return (
    <AppLayout title="AI Database Assistant" subtitle="Ask questions about your city's waste data">
      <PageHead title="AI Database Assistant" subtitle="Ask about zones, bins, or categories in plain language." />

      {!isAiConfigured() && (
        <div className="pill amber" style={{ marginBottom: 16 }}>
          Running on mock AI &mdash; add VITE_GEMINI_API_KEY to enable live answers
        </div>
      )}

      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 560, padding: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.length === 0 && (
            <div className="empty-state" style={{ margin: 'auto' }}>
              <MessageSquareText />
              <strong>Ask anything about the waste data</strong>
              <span>Try one of the suggestions below, or type your own question.</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {suggestions.map((s) => (
                  <button key={s} className="btn btn-outline btn-sm" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '78%',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {m.role === 'ai' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--ink-muted)' }}>
                  <Sparkles size={12} color="var(--signal-mint)" /> EcoMind AI
                </div>
              )}
              <div
                style={{
                  padding: '11px 15px',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user' ? 'var(--signal-mint-bg)' : 'var(--bg-surface-raised)',
                  border: `1px solid ${m.role === 'user' ? 'var(--line-strong)' : 'var(--line-faint)'}`,
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: m.role === 'user' ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start' }}>
              <AIThinking label="Querying the waste database…" />
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ borderTop: '1px solid var(--line-faint)', padding: 14, display: 'flex', gap: 10 }}>
          <input
            className="input"
            placeholder="Ask about zones, bins, or recycling…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button className="btn btn-primary" onClick={() => send()} disabled={loading}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
