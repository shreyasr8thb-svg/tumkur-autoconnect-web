import { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
} from 'firebase/auth';
import logo from '../assets/logo.png';
import DownloadPromo from './DownloadPromo';

const isNativeAndroid = () =>
  typeof window !== 'undefined' &&
  window.Capacitor?.isNativePlatform?.() === true;

export default function Login({ onCreateProfile }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);

  /* ── Email / Password ───────────────────────────────────────────────────── */
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const c = err.code || '';
      if (c === 'auth/user-not-found' || c === 'auth/invalid-credential')
        setError('Account not found. Please create a profile first.');
      else if (c === 'auth/wrong-password')
        setError('Incorrect password.');
      else if (c === 'auth/too-many-requests')
        setError('Too many attempts. Please wait a moment.');
      else
        setError(err.message || 'Sign in failed.');
    } finally { setLoading(false); }
  };

  /* ── Google Sign-In ─────────────────────────────────────────────────────── */
  const handleGoogleSignIn = async () => {
    setGLoading(true); setError('');

    if (isNativeAndroid()) {
      // ─── Native Android path ───────────────────────────────────────────
      // Uses @capacitor-firebase/authentication which calls the native
      // Google Sign-In SDK directly — no browser redirect needed.
      try {
        const { FirebaseAuthentication } = await import(
          '@capacitor-firebase/authentication'
        );

        // Trigger the native Google account picker.
        // webClientId must be the OAuth 2.0 web client (type 3) from google-services.json
        const result = await FirebaseAuthentication.signInWithGoogle();

        const idToken     = result?.credential?.idToken;
        const accessToken = result?.credential?.accessToken;

        if (!idToken) {
          throw new Error('No ID token returned from native Google Sign-In.');
        }

        // Exchange the native credential for a Firebase web SDK session
        const credential = GoogleAuthProvider.credential(
          idToken,
          accessToken ?? null,
        );
        await signInWithCredential(auth, credential);

      } catch (err) {
        const msg = String(err?.message || err);
        const code = String(err?.code || '');

        // 12501 / CANCELED = user dismissed the account picker — not an error
        if (
          msg.includes('12501') ||
          msg.toLowerCase().includes('cancel') ||
          msg.includes('CANCELED')
        ) {
          // User cancelled — silently ignore
        } else if (msg.includes('12500') || code.includes('12500')) {
          // Developer error: SHA-1 / package name mismatch in Firebase Console
          console.error('[Google Auth] Developer error (12500):', msg);
          setError('Google sign-in configuration error. Please contact support (code: 12500).');
        } else if (msg.includes('10:') || msg.includes('error code: 10')) {
          // Wrong OAuth client ID configured
          console.error('[Google Auth] OAuth client error (10):', msg);
          setError('Google sign-in setup error. Please contact support (code: 10).');
        } else {
          console.error('[Google Auth] Native error:', msg);
          setError('Google sign-in failed. Please try again or use email login.');
        }
      } finally {
        setGLoading(false);
      }

    } else {
      // ─── Web path ──────────────────────────────────────────────────────
      // Standard Firebase popup flow
      try {
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        await signInWithPopup(auth, provider);
      } catch (err) {
        if (
          err.code !== 'auth/popup-closed-by-user' &&
          err.code !== 'auth/cancelled-popup-request'
        ) {
          setError(err.message || 'Google sign in failed.');
        }
      } finally {
        setGLoading(false);
      }
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="screen flex-col" style={{ overflowY: 'auto', justifyContent: 'flex-start', paddingTop: '2rem' }}>
      <div className="mb-4 text-center">
        <img src={logo} alt="Logo" style={{ width: '72px', height: '72px', marginBottom: '0.75rem', objectFit: 'contain', borderRadius: '18px', boxShadow: '0 4px 20px rgba(239,68,68,0.3)' }} />
        <h2 className="text-white">Welcome Back</h2>
        <p>Login to your Tumkuru Connect account</p>
      </div>

      <form onSubmit={handleEmailSignIn} className="flex-col gap-3">
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.83rem', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input type="email" className="input-field" placeholder="worker@tumkur.in" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
          {loading ? 'Signing In...' : 'Continue with Email'}
        </button>

        <div className="divider-line"><span>OR</span></div>

        <button type="button" onClick={handleGoogleSignIn} disabled={gLoading} className="btn btn-google">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width: '18px' }} />
          {gLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <button type="button" onClick={onCreateProfile} className="btn btn-outline-red mt-2">
          Create New Profile
        </button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <DownloadPromo />
      </div>
    </div>
  );
}
