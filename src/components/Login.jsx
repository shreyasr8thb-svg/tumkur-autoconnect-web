import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import logo from '../assets/logo.png';
import DownloadPromo from './DownloadPromo';

// Detect if running inside Android Capacitor WebView
const isCapacitor = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor !== undefined || /wv\)/.test(navigator.userAgent));

export default function Login({ onCreateProfile }) {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const IN_APP = isCapacitor();

  // When the app returns from Chrome after Google auth,
  // Firebase auth state listener in UserContext picks it up automatically.
  // No extra handler needed.

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

  /* ─── Google Sign-in (web browser only) ─── */
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign in failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  /* ─── Open website in Chrome for Google sign-in (APK only) ─── */
  const handleGoogleInApp = () => {
    // Open the live Tumkuru Connect website in Chrome where Google auth works
    const webUrl = 'https://tumkur-autoconnect-web.vercel.app';
    // window.open with _system opens Chrome on Android (not WebView)
    window.open(webUrl, '_system');
    setError('');
    // Show helpful info
    setError('Opening website in Chrome... Sign in with Google there, then come back to the app and sign in with email.');
  };

  return (
    <div className="screen flex-col" style={{ overflowY: 'auto', justifyContent: 'flex-start', paddingTop: '2rem' }}>
      <div className="mb-4 text-center">
        <img
          src={logo}
          alt="Tumkuru Connect Logo"
          style={{ width: '72px', height: '72px', marginBottom: '0.75rem', objectFit: 'contain', borderRadius: '18px', boxShadow: '0 4px 20px rgba(239,68,68,0.3)' }}
        />
        <h2 className="text-white">Welcome Back</h2>
        <p>Login to your Tumkuru Connect account</p>
      </div>

      <form onSubmit={handleEmailSignIn} className="flex-col gap-3">
        {error && (
          <div style={{
            background: error.includes('Opening') ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${error.includes('Opening') ? 'rgba(59,130,246,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: error.includes('Opening') ? '#93c5fd' : '#f87171',
            padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.83rem', lineHeight: 1.5
          }}>
            {error}
          </div>
        )}

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

        {/* Web browser: full Google popup */}
        {!IN_APP && (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="btn btn-google"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width: '18px' }} />
            {googleLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        )}

        {/* APK: open website in Chrome for Google auth */}
        {IN_APP && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={handleGoogleInApp}
              className="btn btn-google"
              style={{ opacity: 0.9 }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width: '18px' }} />
              Sign in with Google (opens Chrome)
            </button>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.4 }}>
              🌐 Google sign-in opens in Chrome for security.
              After signing in, return here and use email login.
            </div>
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
