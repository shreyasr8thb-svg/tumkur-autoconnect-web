import { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, User } from 'lucide-react';

export default function InAppCall({ peerName, peerPhoto, onEndCall }) {
  const [callStatus, setCallStatus] = useState('Calling...');
  const [timer, setTimer] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const streamRef = useRef(null);
  
  useEffect(() => {
    let interval;
    // Request microphone access from the device
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        streamRef.current = stream;
        setCallStatus('Ringing...');
        
        // Simulate connecting after 3 seconds for demo purposes
        setTimeout(() => {
          setCallStatus('Connected');
          interval = setInterval(() => setTimer(t => t + 1), 1000);
        }, 3000);
      })
      .catch(err => {
        console.error(err);
        setCallStatus('Microphone Access Denied');
        setTimeout(onEndCall, 3000);
      });
      
    return () => {
      clearInterval(interval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onEndCall]);

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setMicMuted(!micMuted);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Avatar */}
      <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid rgba(59,130,246,0.3)', marginBottom: '1.5rem', overflow: 'hidden', position: 'relative' }}>
        {peerPhoto ? <img src={peerPhoto} alt="Caller" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={48} color="#f8fafc" />}
        {callStatus === 'Ringing...' && (
          <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid #3b82f6', animation: 'ripple 1.5s infinite ease-out' }} />
        )}
      </div>

      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{peerName || 'Unknown Caller'}</h2>
      <p style={{ margin: 0, fontSize: '1rem', color: callStatus === 'Connected' ? '#4ade80' : '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>
        {callStatus === 'Connected' ? formatTime(timer) : callStatus}
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '4rem' }}>
        <button onClick={toggleMic} style={{ width: 64, height: 64, borderRadius: '50%', background: micMuted ? '#fff' : 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
          {micMuted ? <MicOff size={28} color="#0f172a" /> : <Mic size={28} color="#f8fafc" />}
        </button>
        
        <button onClick={onEndCall} style={{ width: 64, height: 64, borderRadius: '50%', background: '#e11d48', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 20px rgba(225,29,72,0.4)', transition: 'all 0.2s' }}>
          <PhoneOff size={28} color="#fff" />
        </button>

        <button onClick={() => setSpeakerMuted(!speakerMuted)} style={{ width: 64, height: 64, borderRadius: '50%', background: speakerMuted ? '#fff' : 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
          {speakerMuted ? <VolumeX size={28} color="#0f172a" /> : <Volume2 size={28} color="#f8fafc" />}
        </button>
      </div>

      <style>{`
        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
