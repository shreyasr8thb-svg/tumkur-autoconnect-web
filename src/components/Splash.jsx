import { useEffect } from 'react';
import { Settings } from 'lucide-react';

export default function Splash({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="screen flex-col items-center justify-center" style={{ backgroundColor: '#000000' }}>
      <div className="flex-col items-center justify-center" style={{ animation: 'pulse 2s infinite' }}>
        {/* Placeholder Logo: Geometric cogwheel + digital signal */}
        <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '1.5rem' }}>
          <Settings size={80} color="#DC3545" strokeWidth={1.5} />
          <div style={{ 
            position: 'absolute', 
            top: '50%', left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: '24px', height: '24px',
            borderRadius: '50%',
            backgroundColor: '#000',
            border: '2px solid #DC3545',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#FFFFFF', borderRadius: '50%' }}></div>
          </div>
        </div>
        
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
