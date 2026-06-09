import { useEffect } from 'react';
import logo from '../assets/logo.png';

export default function Splash() {
  return (
    <div className="screen flex-col items-center justify-center" style={{ backgroundColor: '#000000' }}>
      <div className="flex-col items-center justify-center" style={{ animation: 'pulse 2s infinite' }}>
        <img src={logo} alt="Tumkuru Connect Logo" style={{ width: '80px', height: '80px', marginBottom: '1.5rem', objectFit: 'contain' }} />
        <h1 className="text-white" style={{ fontSize: '2rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>
          Tumkuru Connect
        </h1>
        <p className="text-center" style={{ color: '#ADB5BD', fontSize: '0.9rem', maxWidth: '80%' }}>
          A Phygital Platform for a Stronger Tumkur.
        </p>
      </div>
    </div>
  );
}
