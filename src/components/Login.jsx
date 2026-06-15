import { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { Smartphone, Mail, Phone } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import logo from '../assets/logo.png';
import DownloadPromo from './DownloadPromo';

// Helper to send email via Vercel Serverless Function
const sendWelcomeEmail = async (email) => {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'New Sign-In to Tumkuru Connect',
        text: 'You have successfully signed in to your Tumkuru Connect account.',
        html: '<strong>Welcome back! You have successfully signed in to your Tumkuru Connect account.</strong>'
      })
    });
  } catch(e) { console.error('Failed to send email', e); }
};

const APK_URL = 'https://github.com/shreyasr8thb-svg/tumkur-autoconnect-web/releases/download/latest-apk/TumkuruConnect.apk';

function AppDownloadBanner({ compact, full }) {
  const [status, setStatus] = useState('idle');
  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.() === true;
  if (isNative) return null;

  const handleDownload = () => {
    window.location.href = '/download';
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
        <Smartphone size={15} color="#ef4444" />
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171' }}>
          📲 Download the Android App — Free
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

  /* ── Phone Auth State ── */
  const [loginMode, setLoginMode] = useState('email'); // 'email' | 'phone'
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [webConfirmation, setWebConfirmation] = useState(null);

  /* ── Email / Password ───────────────────────────────────────────────────── */
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError('');
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      sendWelcomeEmail(cred.user.email);
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

  /* ── Phone Auth ─────────────────────────────────────────────────────────── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) return setError("Invalid phone number");
    setLoading(true); setError('');
    try {
      if (isNativeAndroid()) {
        const FirebaseAuthentication = Capacitor.Plugins.FirebaseAuthentication;
        if (!FirebaseAuthentication) throw new Error("Plugin missing");
        const res = await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber });
        setVerificationId(res.verificationId);
      } else {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
        }
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
        setWebConfirmation(confirmationResult);
      }
      setOtpSent(true);
    } catch (err) {
      setError("Failed to send OTP: " + (err.message || err));
      if (window.recaptchaVerifier) window.recaptchaVerifier.render().then(w => window.recaptchaVerifier.reset(w));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true); setError('');
    try {
      if (isNativeAndroid()) {
        const credential = PhoneAuthProvider.credential(verificationId, otp);
        await signInWithCredential(auth, credential);
      } else {
        await webConfirmation.confirm(otp);
      }
    } catch (err) {
      setError("Invalid OTP: " + (err.message || err));
    } finally {
      setLoading(false);
    }
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
        const cred = await signInWithCredential(auth, credential);
        sendWelcomeEmail(cred.user.email);

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
        const cred = await signInWithPopup(auth, provider);
        sendWelcomeEmail(cred.user.email);
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

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '100px' }}>
        <button onClick={() => setLoginMode('email')} style={{ flex: 1, padding: '8px', borderRadius: '100px', border: 'none', background: loginMode === 'email' ? '#e11d48' : 'transparent', color: loginMode === 'email' ? '#fff' : '#94a3b8', fontWeight: 600, fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
          <Mail size={16} /> Email
        </button>
        <button onClick={() => setLoginMode('phone')} style={{ flex: 1, padding: '8px', borderRadius: '100px', border: 'none', background: loginMode === 'phone' ? '#e11d48' : 'transparent', color: loginMode === 'phone' ? '#fff' : '#94a3b8', fontWeight: 600, fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
          <Phone size={16} /> Phone
        </button>
      </div>

      {loginMode === 'email' ? (
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
        </form>
      ) : (
        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="flex-col gap-3">
          <div id="recaptcha-container"></div>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.83rem', lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          {!otpSent ? (
            <div className="input-group">
              <label className="input-label">Mobile Number</label>
              <input type="tel" className="input-field" placeholder="+91 98765 43210" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
              <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className="input-group">
              <label className="input-label">Enter 6-digit OTP</label>
              <input type="number" className="input-field" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} required />
              <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem', cursor: 'pointer', textDecoration: 'underline' }}>
                Change Phone Number
              </button>
            </div>
          )}
        </form>
      )}

      <div className="flex-col gap-3 mt-3">
        <div className="divider-line"><span>OR</span></div>

        <button type="button" onClick={handleGoogleSignIn} disabled={gLoading} className="btn btn-google">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width: '18px' }} />
          {gLoading ? 'Opening Google...' : 'Sign in with Google'}
        </button>

        <button type="button" onClick={onCreateProfile} className="btn btn-outline-red mt-2">
          Create New Profile
        </button>
      </div>

      <AppDownloadBanner full />

    </div>
  );
}
