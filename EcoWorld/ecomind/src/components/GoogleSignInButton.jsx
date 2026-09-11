import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_ID = 'google-identity-services';

function loadGsiScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function GoogleSignInButton({ onError }) {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!GOOGLE_CLIENT_ID) {
      setScriptError(true);
      return;
    }

    loadGsiScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              await loginWithGoogle(response.credential);
            } catch (err) {
              onError?.(err.message || 'Google sign-in failed');
            }
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          width: 320,
        });
      })
      .catch(() => setScriptError(true));

    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, onError]);

  if (scriptError || !GOOGLE_CLIENT_ID) {
    return (
      <div className="empty-state" style={{ padding: '18px 12px' }}>
        <span>
          Google Sign-In isn't configured yet. Set <code className="mono">VITE_GOOGLE_CLIENT_ID</code> in the
          frontend .env.
        </span>
      </div>
    );
  }

  return <div ref={buttonRef} />;
}
