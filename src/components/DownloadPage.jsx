import React from 'react';
import { Download, CheckCircle2, ChevronLeft } from 'lucide-react';
import mockup from '../assets/mockup.png';

export default function DownloadPage({ onBack }) {
  return (
    <div className="flex-col" style={{
      background: '#020617', // Match dark theme
      minHeight: '100%',
      color: '#f8fafc',
      padding: '2rem',
      position: 'relative'
    }}>
      {onBack && (
        <button onClick={onBack} className="btn btn-ghost" style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, padding: '0.5rem', color: '#94a3b8' }}>
          <ChevronLeft size={24} />
        </button>
      )}

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '3rem',
        paddingTop: onBack ? '3rem' : '1rem'
      }} className="download-container">

        <style>{`
          @media (min-width: 768px) {
            .download-container {
              flex-direction: row !important;
              align-items: center;
              justify-content: space-between;
              padding-top: 5rem !important;
            }
            .download-text-content {
              flex: 1;
              max-width: 500px;
            }
            .download-image-content {
              flex: 1;
              display: flex;
              justify-content: flex-end;
            }
          }
          .download-image-content img {
            max-width: 100%;
            height: auto;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            transition: transform 0.3s ease;
          }
          .download-image-content img:hover {
            transform: translateY(-5px);
          }
        `}</style>

        {/* Text Content */}
        <div className="download-text-content flex-col gap-4">
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
            Experience Tumkuru Connect
            <br />
            <span style={{ color: '#e11d48' }}>On Your Mobile</span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6, marginTop: '1rem', marginBottom: '2rem' }}>
            Get the full Tumkuru Connect experience with real-time notifications, location tracking, smoother animations, and offline access. Stay connected with the entire industrial ecosystem anytime, anywhere.
          </p>

          <div>
            <button className="btn btn-primary flex items-center justify-center gap-2" style={{
              background: '#e11d48',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 700,
              boxShadow: '0 4px 15px rgba(225, 29, 72, 0.4)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex'
            }} onClick={() => { window.open('/tumkuru-connect.apk', '_blank'); }}>
              <Download size={22} />
              <span>Download APK</span>
            </button>
          </div>

          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} color="#10b981" />
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Safe & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} color="#10b981" />
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>v1.2.4 (Latest)</span>
            </div>
          </div>
        </div>

        {/* Image Content */}
        <div className="download-image-content">
          <img src={mockup} alt="Tumkuru Connect Mobile App" />
        </div>

      </div>
    </div>
  );
}
