import React, { useState } from 'react';
import { Download, CheckCircle2, Zap, Bell, Smartphone, ChevronLeft } from 'lucide-react';
import mockup from '../assets/mockup.png';

const APK_URL = 'https://github.com/shreyasr8thb-svg/tumkur-autoconnect-web/releases/download/latest-apk/TumkuruConnect.apk';

export default function DownloadPage({ onBack }) {
  const [status, setStatus] = useState('idle');

  const handleDownload = () => {
    setStatus('loading');
    window.location.href = APK_URL;
    setTimeout(() => setStatus('done'), 1500);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div style={{ background: '#09090b', minHeight: '100%', color: '#fff', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      {/* Background glow effects */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '50%', background: 'radial-gradient(circle, rgba(225,29,72,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '50%', height: '60%', background: 'radial-gradient(circle, rgba(225,29,72,0.1) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      {/* Navigation */}
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 10 }}>
        <button onClick={handleBack} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
          <ChevronLeft size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.5)', padding: '6px 16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
          <div style={{ width: 28, height: 28, background: '#e11d48', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>TC</div>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.02em' }}>Tumkuru Connect</span>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>
        
        {/* Hero Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center', marginBottom: '6rem' }}>
          
          {/* Text Content */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)', padding: '6px 14px', borderRadius: '100px', marginBottom: '1.5rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e11d48', boxShadow: '0 0 8px #e11d48' }} className="animate-pulse" />
              <span style={{ color: '#e11d48', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>LATEST VERSION AVAILABLE</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, margin: 0, letterSpacing: '-0.02em' }}>
              Experience <br />
              <span style={{ color: '#e11d48' }}>Tumkuru Connect</span><br />
              On Your Mobile
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#a1a1aa', lineHeight: 1.6, marginTop: '1.5rem', marginBottom: '2.5rem', maxWidth: '480px' }}>
              Get the full Tumkuru Connect experience with real-time notifications, smoother animations, and offline access. Join the community anytime, anywhere.
            </p>

            <button 
              onClick={handleDownload}
              style={{
                background: status === 'done' ? '#10b981' : '#e11d48',
                color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '14px',
                fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                boxShadow: status === 'done' ? '0 10px 25px rgba(16,185,129,0.3)' : '0 10px 25px rgba(225,29,72,0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: status === 'loading' ? 'scale(0.98)' : 'scale(1)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {status === 'loading' ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : (status === 'done' ? <CheckCircle2 size={22} /> : <Download size={22} />)}
              {status === 'loading' ? 'Starting Download...' : (status === 'done' ? 'Download Started!' : 'Download APK')}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Safe & Secure
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> v1.0.3 (Latest)
              </div>
            </div>
          </div>

          {/* Mockup Image */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: '#e11d48', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%' }} />
            <img src={mockup} alt="App Mockup" style={{ width: '100%', maxWidth: '380px', transform: 'rotate(5deg) scale(1.05)', filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.5))' }} />
          </div>
        </div>

        {/* Features Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '6rem' }}>
          {[
            { icon: <Zap size={24} color="#e11d48" />, title: 'Blazing Fast', desc: 'Native performance and optimized assets ensure the app runs smoothly even on older devices.' },
            { icon: <Bell size={24} color="#e11d48" />, title: 'Push Notifications', desc: 'Never miss an update. Get notified instantly about new rides, messages, and team requests.' },
            { icon: <Smartphone size={24} color="#e11d48" />, title: 'Native UI', desc: 'An interface designed specifically for mobile users, with gesture support and haptic feedback.' }
          ].map((feature, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem', transition: 'transform 0.3s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(225,29,72,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(225,29,72,0.2)' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.75rem', color: '#fff' }}>{feature.title}</h3>
              <p style={{ color: '#a1a1aa', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* How to Install Timeline */}
        <div style={{ textAlign: 'center', padding: '4rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 3rem' }}>How to Install</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
            {[
              { step: '1', title: 'Download APK', desc: 'Click the download button above.' },
              { step: '2', title: 'Allow Unknown Sources', desc: 'Enable installation in your browser settings.' },
              { step: '3', title: 'Install & Open', desc: 'Open the file and follow instructions.' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#a1a1aa', flexShrink: 0 }}>
                  {item.step}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#fff' }}>{item.title}</h4>
                  <p style={{ color: '#71717a', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
