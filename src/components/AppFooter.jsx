import React from 'react';

export default function AppFooter() {
  return (
    <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#475569', padding: '2rem 1rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1 }}>
      <span>Designed & crafted by Roaring Thunders with <span className="heart" style={{ color: 'var(--primary)' }}>❤️</span></span>
      <a href="mailto:tumkuru.contact@gmail.com" style={{ color: '#475569', textDecoration: 'underline' }}>Help & Support</a>
    </div>
  );
}
