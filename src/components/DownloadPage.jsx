import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, ChevronLeft, Smartphone, Apple, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import mockup from '../assets/mockup.png';

const APP_URL = 'https://tumkur-autoconnect-web.vercel.app';
const APP_NAME = 'Tumkuru Connect';
const APP_ID = 'com.tumkuruconnect.app';

export default function DownloadPage({ onBack }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [apkStatus, setApkStatus] = useState('idle'); // idle | loading | done | error
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !window.MSStream);
    setIsAndroid(/Android/.test(ua));
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Actual APK Download from Vercel Public Folder
  const handleAndroidDownload = async () => {
    // Try native PWA install prompt first
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') { setDeferredPrompt(null); return; }
    }

    // Direct APK Download
    setApkStatus('loading');
    setTimeout(() => {
      try {
        const timestamp = new Date().getTime();
        const apkUrl = `/TumkuruConnect.apk?v=${timestamp}`;
        const a = document.createElement('a');
        a.href = apkUrl;
        a.download = 'TumkuruConnect.apk';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setApkStatus('done');
      } catch (err) {
        setApkStatus('error');
      }
    }, 800);
  };

  // iOS: show instructions (iOS doesn't allow direct install)
  const iOSInstructions = [
    { step: '1', text: 'Tap the Share icon at the bottom of Safari' },
    { step: '2', text: 'Scroll down and tap "Add to Home Screen"' },
    { step: '3', text: 'Tap "Add" in the top right corner' },
  ];

  const features = [
    'Real-time ride booking',
    'Offline access',
    'Push notifications',
    'Biometric login',
    'Community feed & chat',
  ];

  return (
    <div style={{ background: 'var(--bg-dark)', minHeight: '100%', color: 'var(--text-main)', position: 'relative' }}>
      {onBack && (
        <button onClick={onBack} style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '12px', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <ChevronLeft size={22} />
        </button>
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.25rem', paddingTop: onBack ? '4rem' : '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '9999px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.05em' }}>
            MOBILE APP
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
            Get Tumkuru Connect<br />
            <span style={{ color: 'var(--primary)' }}>On Your Device</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', maxWidth: '520px', margin: '0.75rem auto 0', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Install the app for offline access, push notifications, and the full native experience.
          </p>
        </div>

        {/* Two-column layout on desktop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>

          {/* Android Card */}
          <div style={{ width: '100%', maxWidth: '440px', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg,#4ade80,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Android APK</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Direct install · v1.0</div>
              </div>
            </div>

            <button
              onClick={handleAndroidDownload}
              disabled={apkStatus === 'loading'}
              style={{
                width: '100%', padding: '0.9rem', borderRadius: '12px',
                background: apkStatus === 'done' ? '#22c55e' : apkStatus === 'error' ? '#f59e0b' : 'var(--primary)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                border: 'none', cursor: apkStatus === 'loading' ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: apkStatus === 'loading' ? 0.8 : 1,
                boxShadow: '0 4px 15px rgba(239,68,68,0.35)',
                transition: 'all 0.3s',
              }}
            >
              {apkStatus === 'loading' && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
              {apkStatus === 'done' && <CheckCircle2 size={18} />}
              {apkStatus === 'error' && <ExternalLink size={18} />}
              {apkStatus === 'idle' && <Download size={18} />}
              {apkStatus === 'idle' && 'Download APK'}
              {apkStatus === 'loading' && 'Downloading... please wait'}
              {apkStatus === 'done' && 'Download Started!'}
              {apkStatus === 'error' && 'Download Failed'}
            </button>

            {apkStatus === 'loading' && (
              <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                Downloading APK directly...
              </p>
            )}
            {apkStatus === 'error' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', padding: '0.75rem', fontSize: '0.78rem', color: '#fbbf24' }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>Download failed. Please try again or check your internet connection.</span>
              </div>
            )}

            <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>After downloading:</strong>
              Open the APK file → Allow installation from unknown sources → Install
            </div>
          </div>

          {/* iOS Card */}
          <div style={{ width: '100%', maxWidth: '440px', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg,#818cf8,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Apple size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>iPhone / iPad</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Add to Home Screen</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {iOSInstructions.map(item => (
                <div key={item.step} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#818cf8', flexShrink: 0 }}>{item.step}</div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingTop: '3px' }}>{item.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => window.open(APP_URL, '_blank')}
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.9rem', borderRadius: '12px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <ExternalLink size={16} /> Open in Safari
            </button>
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center' }}>
          {features.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9999px', padding: '5px 12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={13} color="#4ade80" /> {f}
            </div>
          ))}
        </div>

        {/* Mockup Image (desktop) */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src={mockup} alt="Tumkuru Connect Mobile App" style={{ maxWidth: '260px', width: '100%', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', opacity: 0.9 }} />
        </div>

      </div>
    </div>
  );
}
