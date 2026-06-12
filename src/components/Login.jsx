import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

  // ── On mount: capture the result when Firebase redirects back to the app ──
  // This fires after a signInWithRedirect() completes and the WebView reloads.
  useEffect(() => {
    if (!IN_APP) return; // Only needed inside Capacitor/WebView

    setGoogleLoading(true);
    getRedirectResult(auth)
      .then((result) => {
        // result is null if no redirect was pending — that's fine.
        if (result?.user) {
          // Auth state listener in UserContext will pick this up automatically.
          console.log('Google redirect sign-in success:', result.user.email);
        }
      })
      .catch((err) => {
        // Ignore "popup closed" or "no redirect" — only show real errors
        if (err.code && err.code !== 'auth/no-current-user') {
          setError('Google sign-in failed: ' + (err.message || err.code));
        }
      })
      .finally(() => setGoogleLoading(false));
  }, [IN_APP]);

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

  /* ─── Google Sign-in: popup for web, redirect for APK ─── */
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();

    if (IN_APP) {
      // In Capacitor WebView: use redirect (popup is blocked by WebView)
      try {
        await signInWithRedirect(auth, provider);
        // App will reload after redirect; getRedirectResult() above handles the result.
      } catch (err) {
        setError('Could not start Google sign-in: ' + (err.message || err.code));
        setGoogleLoading(false);
      }
    } else {
      // In normal browser: use popup
      try {
        await signInWithPopup(auth, provider);
      } catch (err) {
        if (err.code !== 'auth/popup-closed-by-user') {
          setError(err.message || 'Google sign in failed.');
        }
      } finally {
        setGoogleLoading(false);
      }
    }
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
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171',
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

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="btn btn-google"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width: '18px' }} />
          {googleLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>

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
