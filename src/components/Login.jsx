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

const isCapacitor = () =>
  typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();

export default function Login({ onCreateProfile }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setGLoading(true); setError('');

    if (isCapacitor()) {
      // ── Native Android Google Sign-In ──────────────────────────────────────
      // Uses @capacitor-firebase/authentication v8 (Capacitor 8 native plugin)
      // No browser opens – native Google account picker appears inside app
      try {
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');

        const result = await FirebaseAuthentication.signInWithGoogle();

        // Get the ID token and sign into Firebase web SDK
        const idToken = result.credential?.idToken;
        if (!idToken) throw new Error('No ID token received from Google.');

        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        // onAuthStateChanged in UserContext picks up the session automatically
      } catch (err) {
        // Error code 12501 = user cancelled (not an error)
        if (!String(err).includes('12501') && !String(err).includes('cancelled')) {
          setError('Google sign-in failed: ' + (err?.message || String(err)));
        }
      } finally { setGLoading(false); }

    } else {
      // ── Web: standard popup ────────────────────────────────────────────────
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (err) {
        if (err.code !== 'auth/popup-closed-by-user')
          setError(err.message || 'Google sign in failed.');
      } finally { setGLoading(false); }
    }
  };

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
