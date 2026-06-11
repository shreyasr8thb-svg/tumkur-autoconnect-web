import React from 'react';
import { Download, CheckCircle2, Circle } from 'lucide-react';

export default function DownloadPromo() {
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
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px #e11d48' }} className="animate-pulse" />
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.5px' }}>LATEST VERSION AVAILABLE</span>
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
          Get the full Tumkuru Connect experience with real-time notifications, smoother animations, and offline access. Join the community of innovators anytime, anywhere.
        </p>

        {/* Button */}
        <button className="btn btn-primary w-100 flex items-center justify-center gap-2" style={{
          background: 'var(--primary)',
          padding: '0.85rem',
          borderRadius: '12px',
          fontSize: '0.95rem',
          fontWeight: 700,
          boxShadow: '0 4px 15px rgba(225, 29, 72, 0.4)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer'
        }}>
          <Download size={18} />
          <span>Download APK</span>
        </button>

        {/* Checkmarks */}
        <div className="flex items-center justify-between mt-4" style={{ padding: '0 0.5rem' }}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} color="#10b981" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Safe & Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} color="#10b981" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>v1.2.4 (Latest)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
