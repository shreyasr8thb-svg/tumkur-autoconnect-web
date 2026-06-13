import { useState } from 'react';
import { Download, Smartphone, CheckCircle2, Loader2, Factory } from 'lucide-react';

// Always points to the latest auto-built APK from GitHub Actions CI
const APK_DOWNLOAD_URL =
  'https://github.com/shreyasr8thb-svg/tumkur-autoconnect-web/releases/download/latest-apk/TumkuruConnect.apk';

export default function DownloadPromo() {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    const a = document.createElement('a');
    a.href = APK_DOWNLOAD_URL;
    a.download = 'TumkuruConnect.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    }, 1200);
  };

  return (
    <div style={{
      marginTop: '1.5rem',
      marginBottom: '1rem',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '1.4rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    }}>
      {/* App-theme red corner glow */}
      <div style={{
        position: 'absolute', top: -40, right: -30,
        width: 180, height: 180,
        background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Bottom-left subtle glow */}
      <div style={{
        position: 'absolute', bottom: -30, left: -20,
        width: 140, height: 140,
        background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Top row: Icon + Badge ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          {/* App Icon */}
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), #b91c1c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
            flexShrink: 0,
          }}>
            <Factory size={22} color="#fff" />
          </div>

          {/* ALWAYS UP-TO-DATE badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            padding: '4px 10px', borderRadius: '9999px',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--primary)', boxShadow: '0 0 6px var(--primary)',
            }} className="animate-pulse" />
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.06em' }}>
              ALWAYS UP-TO-DATE
            </span>
          </div>
        </div>

        {/* ── Headlines ── */}
        <h2 style={{
          fontSize: '1.7rem', fontWeight: 800, lineHeight: 1.15,
          margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em',
        }}>
          Experience App
        </h2>
        <h2 style={{
          fontSize: '1.7rem', fontWeight: 800, lineHeight: 1.15,
          margin: 0, color: 'var(--primary)', letterSpacing: '-0.02em',
          marginBottom: '0.85rem',
        }}>
          On Your Mobile
        </h2>

        {/* ── Separator ── */}
        <div style={{
          height: '1px', background: 'var(--border)',
          marginBottom: '0.85rem',
        }} />

        {/* ── Description ── */}
        <p style={{
          fontSize: '0.84rem', color: 'var(--text-muted)',
          lineHeight: 1.65, marginBottom: '1.25rem',
        }}>
          Get the full Tumkuru Connect experience with real-time notifications, smoother animations, and offline access. The APK is automatically rebuilt every time the app is updated.
        </p>

        {/* ── Download Button ── */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            width: '100%', padding: '0.9rem 1rem',
            borderRadius: '14px', border: 'none', cursor: downloading ? 'wait' : 'pointer',
            background: downloaded
              ? 'rgba(34,197,94,0.12)'
              : 'var(--primary)',
            color: downloaded ? '#4ade80' : '#fff',
            fontWeight: 700, fontSize: '0.95rem',
            fontFamily: 'var(--font-main)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            border: downloaded ? '1px solid rgba(34,197,94,0.3)' : 'none',
            boxShadow: downloaded
              ? 'none'
              : '0 4px 18px rgba(239,68,68,0.38)',
            transition: 'all 0.3s ease',
            opacity: downloading ? 0.75 : 1,
          }}
        >
          {downloading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
          {!downloading && downloaded && <CheckCircle2 size={18} />}
          {!downloading && !downloaded && <Download size={18} />}
          <span>
            {downloading ? 'Starting Download...' : downloaded ? 'Download Started!' : 'Download APK'}
          </span>
        </button>

        {/* ── Install tip (shown after download) ── */}
        {downloaded && (
          <div style={{
            marginTop: '0.75rem', padding: '0.65rem 0.9rem',
            background: 'rgba(34,197,94,0.07)',
            border: '1px solid rgba(34,197,94,0.18)',
            borderRadius: '10px', fontSize: '0.76rem',
            color: '#6ee7b7', lineHeight: 1.55,
          }}>
            📲 To install: open the APK file on your phone → allow "Install from unknown sources" if prompted.
          </div>
        )}

        {/* ── Feature chips ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '1.1rem', padding: '0.75rem 0.5rem 0',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={13} color="#4ade80" />
            <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)', fontWeight: 600 }}>Safe &amp; Secure</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={13} color="#4ade80" />
            <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)', fontWeight: 600 }}>Auto-updated</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Smartphone size={13} color="#4ade80" />
            <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)', fontWeight: 600 }}>Android 7+</span>
          </div>
        </div>

      </div>
    </div>
  );
}
