import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle2, RefreshCw } from 'lucide-react';

// This URL always points to the latest auto-built APK from GitHub Actions.
// When a new build is pushed to main, this file is automatically updated.
const APK_DOWNLOAD_URL =
  'https://github.com/shreyasr8thb-svg/tumkur-autoconnect-web/releases/download/latest-apk/TumkuruConnect.apk';

export default function DownloadPromo() {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    // Trigger browser download
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
    }, 1500);
  };

  return (
    <div className="flex-col gap-4 mt-4 mb-4" style={{
      background: 'linear-gradient(135deg, rgba(2, 6, 23, 0.95), rgba(15, 23, 42, 0.98))',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '24px',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Decorative Glow */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(225, 29, 72, 0.15) 0%, transparent 70%)',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(225, 29, 72, 0.1)',
          border: '1px solid rgba(225, 29, 72, 0.2)',
          padding: '4px 12px',
          borderRadius: '9999px',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--primary)', boxShadow: '0 0 8px #e11d48'
          }} className="animate-pulse" />
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.5px' }}>
            ALWAYS UP-TO-DATE
          </span>
        </div>

        {/* Headlines */}
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.2, margin: 0, color: 'var(--text-main)' }}>
          Experience App
        </h2>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.2, margin: 0, color: 'var(--primary)', marginBottom: '1rem' }}>
          On Your Mobile
        </h2>

        {/* Text */}
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Get the full Tumkuru Connect experience with real-time notifications, smoother animations, and offline access. The APK is automatically rebuilt every time the app is updated.
        </p>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn btn-primary w-100 flex items-center justify-center gap-2"
          style={{
            background: downloaded ? '#10b981' : 'var(--primary)',
            padding: '0.85rem',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: 700,
            boxShadow: downloaded
              ? '0 4px 15px rgba(16,185,129,0.4)'
              : '0 4px 15px rgba(225, 29, 72, 0.4)',
            border: 'none',
            color: '#fff',
            cursor: downloading ? 'wait' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {downloading ? (
            <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : downloaded ? (
            <CheckCircle2 size={18} />
          ) : (
            <Download size={18} />
          )}
          <span>
            {downloading ? 'Starting Download...' : downloaded ? 'Download Started!' : 'Download APK'}
          </span>
        </button>

        {/* Install tip */}
        {downloaded && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.6rem 0.9rem',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '10px',
            fontSize: '0.75rem',
            color: '#6ee7b7',
            lineHeight: 1.5
          }}>
            📲 To install: open the APK file on your phone → allow "Install from unknown sources" if prompted.
          </div>
        )}

        {/* Checkmarks */}
        <div className="flex items-center justify-between mt-4" style={{ padding: '0 0.5rem' }}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} color="#10b981" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Safe & Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} color="#10b981" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Auto-updated</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone size={14} color="#10b981" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Android 7+</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
