import { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
} from 'firebase/auth';
import { Smartphone } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import logo from '../assets/logo.png';
import DownloadPromo from './DownloadPromo';

const APK_URL = 'https://github.com/shreyasr8thb-svg/tumkur-autoconnect-web/releases/download/latest-apk/TumkuruConnect.apk';

function AppDownloadBanner({ compact, full }) {
  const [status, setStatus] = useState('idle');
  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.() === true;
  if (isNative) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = APK_URL + '?t=' + Date.now();
    a.download = 'TumkuruConnect.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStatus('done');
    setTimeout(() => setStatus('idle'), 5000);
  };

  if (compact) return (
    <button
      onClick={handleDownload}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '0.6rem 1rem', marginBottom: '1rem',
        background: status === 'done' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${status === 'done' ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
        borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Smartphone size={15} color={status === 'done' ? '#4ade80' : '#ef4444'} />
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: status === 'done' ? '#4ade80' : '#f87171' }}>
          {status === 'done' ? '✓ Download started! Check your files' : '📲 Download the Android App — Free'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '9999px', padding: '2px 8px' }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} className="animate-pulse" />
        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#4ade80' }}>LATEST</span>
      </div>
    </button>
  );

  if (full) return <DownloadPromo />;
  return null;
}

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
      // ─── Native Android WebView path ───────────────────────────────────
      try {
        const FirebaseAuthentication = Capacitor.Plugins.FirebaseAuthentication;
        if (!FirebaseAuthentication) throw new Error("Plugin not loaded");
        
        // Pass the Web Client ID explicitly. We use the default Credential Manager flow (recommended).
        const result = await FirebaseAuthentication.signInWithGoogle({
          clientId: '726402748544-oofc0ql6fa05v4u7f210pbgis72u4mp2.apps.googleusercontent.com'
        });

        const idToken = result?.credential?.idToken;
        const accessToken = result?.credential?.accessToken;

        if (!idToken) throw new Error('No ID token returned.');

        const credential = GoogleAuthProvider.credential(idToken, accessToken ?? null);
        await signInWithCredential(auth, credential);

      } catch (err) {
        const msg = String(err?.message || err);
        const code = String(err?.code || '');
        console.error('[Google Auth] Native error details:', { msg, code, err });

        if (msg.includes('12501') || msg.toLowerCase().includes('cancel') || msg.includes('CANCELED')) {
          // User cancelled
        } else if (msg.includes('12500') || code.includes('12500')) {
          setError('Google Auth failed (12500). If you built this locally, your local SHA-1 is not in Firebase. Please use the APK from the website or use Email Login.');
        } else if (msg.includes('10:') || msg.includes('error code: 10') || code === '10') {
          // Fallback to Web Browser Auth
          setError('Native Google Sign-In unavailable. Opening secure browser login...');
          import('@capacitor/browser').then(({ Browser }) => {
            Browser.open({ url: 'https://tumkur-autoconnect-web.vercel.app/native-login' });
          }).catch(err => {
            setError('Could not open browser fallback. Please use Email Login.');
          });
        } else {
          setError(`Google sign-in unavailable: ${msg}. Please use Email Login.`);
        }
      } finally {
        setGLoading(false);
      }
    } else {
      // ─── Web browser: popup flow works fine ───────────────────────────
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      try {
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
    <div className="screen flex-col" style={{ overflowY: 'auto', justifyContent: 'flex-start', padding: '1.25rem' }}>

      <AppDownloadBanner compact />

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
          {gLoading ? 'Opening Google...' : 'Sign in with Google'}
        </button>

        <button type="button" onClick={onCreateProfile} className="btn btn-outline-red mt-2">
          Create New Profile
        </button>
      </form>

      <AppDownloadBanner full />

    </div>
  );
}
