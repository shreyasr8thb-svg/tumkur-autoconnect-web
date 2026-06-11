import { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, User } from 'lucide-react';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

export default function InAppCall({ rideId, isCaller, peerName, peerPhoto, onEndCall }) {
  const [callStatus, setCallStatus] = useState(isCaller ? 'Calling...' : 'Incoming Call...');
  const [timer, setTimer] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [accepted, setAccepted] = useState(isCaller); // Receiver needs to accept
  
  const streamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pcRef = useRef(null);
  const rideRef = useRef(doc(db, 'rides', rideId));
  
  // Hang up logic
  const hangup = async () => {
    if (pcRef.current) pcRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    
    // Clear call state in Firestore
    await updateDoc(rideRef.current, { call: null }).catch(e => console.error(e));
    if (onEndCall) onEndCall();
  };

  useEffect(() => {
    let interval;
    if (callStatus === 'Connected') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  useEffect(() => {
    // We only initialize RTCPeerConnection if accepted
    if (!accepted) return;

    const servers = {
      iceServers: [
        { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
      ]
    };
    
    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    // Stream remote audio
    pc.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    // Gather ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateType = isCaller ? 'callerCandidates' : 'receiverCandidates';
        updateDoc(rideRef.current, {
          [`call.${candidateType}`]: arrayUnion(event.candidate.toJSON())
        }).catch(e => console.error(e));
      }
    };

    const startCall = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           setCallStatus('Audio Unavailable (HTTP)');
           return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await updateDoc(rideRef.current, {
            'call.offer': { type: offer.type, sdp: offer.sdp }
          });
          setCallStatus('Ringing...');
        }
      } catch (err) {
        console.error('Mic access denied', err);
        setCallStatus('Mic Access Denied');
        setTimeout(hangup, 3000);
      }
    };

    startCall();

    // Listen for signaling data
    const unsub = onSnapshot(rideRef.current, async (docSnap) => {
      const data = docSnap.data();
      if (!data || !data.call) {
        // The other person hung up
        if (callStatus !== 'Incoming Call...' && callStatus !== 'Calling...') {
          hangup();
        }
        return;
      }

      const callData = data.call;

      if (!isCaller && callData.offer && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await updateDoc(rideRef.current, {
          'call.answer': { type: answer.type, sdp: answer.sdp }
        });
        setCallStatus('Connected');
      }

      if (isCaller && callData.answer && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(callData.answer));
        setCallStatus('Connected');
      }

      // Add ICE Candidates
      if (isCaller && callData.receiverCandidates) {
        callData.receiverCandidates.forEach(candidate => {
          pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => {});
        });
      } else if (!isCaller && callData.callerCandidates) {
        callData.callerCandidates.forEach(candidate => {
          pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => {});
        });
      }
    });

    return () => {
      unsub();
      pc.close();
    };
  }, [accepted]);

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => { track.enabled = !track.enabled; });
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
      <audio ref={remoteAudioRef} autoPlay muted={speakerMuted} />
      
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
        {!accepted ? (
          <>
            <button onClick={() => setAccepted(true)} style={{ width: 64, height: 64, borderRadius: '50%', background: '#22c55e', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 20px rgba(34,197,94,0.4)', transition: 'all 0.2s' }}>
              <PhoneOff size={28} color="#fff" style={{ transform: 'rotate(225deg)' }} />
            </button>
            <button onClick={hangup} style={{ width: 64, height: 64, borderRadius: '50%', background: '#e11d48', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 20px rgba(225,29,72,0.4)', transition: 'all 0.2s' }}>
              <PhoneOff size={28} color="#fff" />
            </button>
          </>
        ) : (
          <>
            <button onClick={toggleMic} style={{ width: 64, height: 64, borderRadius: '50%', background: micMuted ? '#fff' : 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              {micMuted ? <MicOff size={28} color="#0f172a" /> : <Mic size={28} color="#f8fafc" />}
            </button>
            <button onClick={hangup} style={{ width: 64, height: 64, borderRadius: '50%', background: '#e11d48', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 20px rgba(225,29,72,0.4)', transition: 'all 0.2s' }}>
              <PhoneOff size={28} color="#fff" />
            </button>
            <button onClick={() => setSpeakerMuted(!speakerMuted)} style={{ width: 64, height: 64, borderRadius: '50%', background: speakerMuted ? '#fff' : 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              {speakerMuted ? <VolumeX size={28} color="#0f172a" /> : <Volume2 size={28} color="#f8fafc" />}
            </button>
          </>
        )}
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
