import { useState, useEffect } from 'react';
import { AlertOctagon, PhoneCall, MapPin, X } from 'lucide-react';

export default function SOSAlert({ onCancel }) {
  const [countdown, setCountdown] = useState(5);
  const [status, setStatus] = useState('confirming'); // 'confirming' or 'active'

  useEffect(() => {
    if (status === 'confirming' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && status === 'confirming') {
      setStatus('active');
    }
  }, [countdown, status]);

  return (
    <div className="app-container sos-active flex-col" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      
      {/* Flashing border is handled by .sos-active class */}
      
      <div className="flex justify-between items-center p-4">
        <div style={{ color: '#FF0000', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '2px', animation: 'pulse 1s infinite' }}>
          SOS ACTIVE
        </div>
        <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: '#FFF' }}>
          <X size={32} />
        </button>
      </div>

      <div className="flex-col items-center justify-center flex-1 p-4 text-center">
        <AlertOctagon size={100} color="#FF0000" style={{ animation: 'pulse 1s infinite', marginBottom: '2rem' }} />
        
        {status === 'confirming' ? (
          <>
            <h2 className="text-white" style={{ fontSize: '2rem' }}>Confirm Alert</h2>
            <p className="mt-2" style={{ fontSize: '1.1rem' }}>Alerting Industrial Security & Local Police in</p>
            <div style={{ fontSize: '4rem', fontWeight: '800', color: '#FF0000', margin: '1rem 0' }}>
              {countdown}
            </div>
            <button 
              className="btn btn-primary mt-4" 
              style={{ backgroundColor: '#FF0000', padding: '1.5rem', fontSize: '1.25rem' }}
              onClick={() => setStatus('active')}
            >
              SEND IMMEDIATELY
            </button>
            <button 
              className="btn mt-4" 
              style={{ backgroundColor: 'transparent', border: '2px solid #6C757D', color: '#FFF', padding: '1rem' }}
              onClick={onCancel}
            >
              CANCEL
            </button>
          </>
        ) : (
          <>
            <h2 className="text-white" style={{ fontSize: '2rem' }}>Location Shared</h2>
            <p className="mt-2 text-white">Help is on the way.</p>
            
            <div className="card w-100 mt-4" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', borderColor: '#FF0000', width: '100%' }}>
              <div className="flex items-center gap-3 mb-3">
                <div style={{ padding: '10px', backgroundColor: '#FF0000', borderRadius: '50%' }}>
                  <PhoneCall size={24} color="#FFF" />
                </div>
                <div className="text-left">
                  <div style={{ fontWeight: '700', color: '#FFF' }}>Connection Established</div>
                  <div style={{ fontSize: '0.8rem', color: '#ADB5BD' }}>Tumkur Hub Security Room</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #333', borderRadius: '50%' }}>
                  <MapPin size={24} color="#FF0000" />
                </div>
                <div className="text-left">
                  <div style={{ fontWeight: '700', color: '#FFF' }}>Live Location Tracking</div>
                  <div style={{ fontSize: '0.8rem', color: '#28a745', fontWeight: '600' }}>Active</div>
                </div>
              </div>
            </div>

            {/* Simulated Live Map */}
            <div style={{ width: '100%', height: '200px', backgroundColor: '#111', border: '1px solid #FF0000', borderRadius: '16px', marginTop: '2rem', position: 'relative', overflow: 'hidden' }}>
               <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at center, rgba(255,0,0,0.2) 0%, transparent 70%)', animation: 'pulse 2s infinite' }}></div>
               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px', backgroundColor: '#FF0000', borderRadius: '50%', border: '3px solid #FFF', boxShadow: '0 0 20px #FF0000' }}></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
