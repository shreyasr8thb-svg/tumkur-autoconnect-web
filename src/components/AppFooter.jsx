import React from 'react';

export default function AppFooter() {
  return (
    <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#475569', padding: '2rem 1rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1 }}>
      <span>Designed & crafted by Roaring Thunders with <span className="heart" style={{ color: 'var(--primary)' }}>❤️</span></span>
      <a 
        href="https://roaring-thunders.vercel.app/" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ 
          display: 'inline-block',
          alignSelf: 'center',
          marginTop: '4px',
          padding: '6px 16px', 
          background: 'linear-gradient(135deg, var(--primary, #3b82f6), #8b5cf6)',
          color: 'white', 
          borderRadius: '20px', 
          textDecoration: 'none', 
          fontWeight: '600',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease',
          fontSize: '0.75rem',
          letterSpacing: '0.5px'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        Visit Roaring Thunders Team
      </a>
      <a href="mailto:tumkur.connect@gmail.com" style={{ color: '#475569', textDecoration: 'underline' }}>Help & Support</a>
    </div>
  );
}
