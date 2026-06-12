import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
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

  /* ─── Google Sign-In ─── */
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    if (IN_APP) {
      // ── Native Android Google Sign-In (no browser opens) ──────────────────
      // Uses @codetrix-studio/capacitor-google-auth which calls the native
      // Android Google Sign-In SDK, returning an idToken we pass to Firebase.
      try {
        // Dynamically import to avoid errors on web where the native plugin isn't available
        const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');

        // Initialize the plugin (reads serverClientId from capacitor.config.json)
        await GoogleAuth.initialize({
          clientId: '726402748544-oofc0ql6fa05v4u7f210pbgis72u4mp2.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });

        // This shows the native Google account picker — no Chrome, stays in app
        const googleUser = await GoogleAuth.signIn();

        if (!googleUser?.authentication?.idToken) {
          throw new Error('No ID token returned from Google Sign-In.');
        }

        // Exchange the native ID token for a Firebase credential
        const credential = GoogleAuthProvider.credential(
          googleUser.authentication.idToken
        );
        await signInWithCredential(auth, credential);
        // onAuthStateChanged in UserContext will pick up the user automatically
      } catch (err) {
        if (err.message?.includes('12501') || err.message?.includes('cancelled')) {
          // User cancelled — don't show an error
        } else {
          setError('Google sign-in failed: ' + (err.message || String(err)));
        }
      } finally {
        setGoogleLoading(false);
      }
    } else {
      // ── Web browser: standard popup ────────────────────────────────────────
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
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
            alt="G"
            style={{ width: '18px' }}
          />
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
