import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult
} from 'firebase/auth';
import logo from '../assets/logo.png';
import DownloadPromo from './DownloadPromo';

// Detect Android WebView — Google blocks OAuth here since Jan 2021
const isAndroidWebView = () => {
  const ua = navigator.userAgent;
  return (
    /wv\)/.test(ua) ||             // WebView flag
    /Version\/\d/.test(ua) ||      // Android browser
    window.Capacitor !== undefined  // Capacitor runtime
  );
};

const IN_APP = isAndroidWebView();

export default function Login({ onCreateProfile }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);

  /* Handle redirect result on web (ignored in APK) */
  useEffect(() => {
    if (IN_APP) return;
    getRedirectResult(auth).catch(() => {});
  }, []);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('Account not found. Please create a profile first.');
      } else if (code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment.');
      } else {
        setError(err.message || 'Sign in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen flex-col" style={{ overflowY: 'auto', justifyContent: 'flex-start', paddingTop: '2rem' }}>
      <div className="mb-4 text-center">
        <img src={logo} alt="Tumkuru Connect Logo" style={{ width: '64px', height: '64px', marginBottom: '0.75rem', objectFit: 'contain', borderRadius: '16px' }} />
        <h2 className="text-white">Welcome Back</h2>
        <p>Login to your Tumkuru Connect account</p>
      </div>

      <form onSubmit={handleEmailSignIn} className="flex-col gap-3">
        {error && <div className="error-banner">{error}</div>}

        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input
            type="email"
            className="input-field"
            placeholder="worker@tumkur.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
          {loading ? 'Signing In...' : 'Continue with Email'}
        </button>

        <div className="divider-line"><span>OR</span></div>

        {/* Google Sign-in: works on web browser, shows info banner in APK */}
        {IN_APP ? (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', padding: '0.85rem 1rem',
              cursor: 'pointer'
            }}
            onClick={() => setShowAppInfo(v => !v)}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width: '18px', opacity: 0.5 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>Google Sign-in</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Available on web — tap to learn more</div>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#60a5fa' }}>{showAppInfo ? '▲' : '▼'}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn btn-google"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width: '18px' }} />
            Sign in with Google
          </button>
        )}

        {/* Info banner shown when user taps the disabled Google button in APK */}
        {IN_APP && showAppInfo && (
          <div style={{
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '12px', padding: '0.9rem 1rem',
            fontSize: '0.82rem', color: '#93c5fd', lineHeight: 1.6
          }}>
            <div style={{ fontWeight: 700, marginBottom: '4px', color: '#60a5fa' }}>ℹ️ About Google Sign-in</div>
            Google has restricted OAuth login inside Android apps for security reasons.
            <br /><br />
            ✅ Use <strong>Email + Password</strong> in this app (works perfectly)<br />
            🌐 Use Google sign-in on our <strong>website</strong> at your browser
            <br /><br />
            <strong>Don't have an account?</strong> Tap "Create New Profile" below.
          </div>
        )}

        <button
          type="button"
          onClick={onCreateProfile}
          className="btn btn-outline-red mt-2"
        >
          Create New Profile
        </button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <DownloadPromo />
      </div>
    </div>
  );
}
