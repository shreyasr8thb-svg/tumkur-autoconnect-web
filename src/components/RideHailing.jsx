import { useState, useEffect, useRef } from 'react';
import { Bus, Car, Search, ArrowLeft, MapPin, Navigation, Phone, Star, X, Clock, Shield } from 'lucide-react';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';
import 'leaflet/dist/leaflet.css';

const TUMKUR = { lat: 13.3379, lng: 77.1173 };
const FACTORIES = [
  { lat: 13.348, lng: 77.128, name: 'Sri Sai Auto' },
  { lat: 13.325, lng: 77.108, name: 'Machining Hub' },
  { lat: 13.355, lng: 77.105, name: 'Precision Parts' },
  { lat: 13.332, lng: 77.135, name: 'KIADB Zone' },
];

function MapView({ userPos, rideStatus }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    import('leaflet').then((L) => {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true,
        touchZoom: true,
      }).setView([userPos.lat, userPos.lng], 15);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // User location pulse dot
      const userIcon = L.divIcon({
        html: `<div style="position:relative;width:24px;height:24px">
          <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:ripple 1.8s ease-out infinite"></div>
          <div style="position:absolute;inset:5px;border-radius:50%;background:#3b82f6;border:2.5px solid #fff;box-shadow:0 0 8px #3b82f6"></div>
        </div>`,
        iconSize: [24, 24], className: '',
      });
      L.marker([userPos.lat, userPos.lng], { icon: userIcon }).addTo(map).bindPopup('<b>📍 You</b>');

      // Factory/destination markers
      FACTORIES.forEach(f => {
        const ic = L.divIcon({
          html: `<div style="background:#e11d48;color:#fff;padding:3px 7px;border-radius:6px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(225,29,72,0.5)">🏭 ${f.name}</div>`,
          className: '', iconAnchor: [0, 0],
        });
        L.marker([f.lat, f.lng], { icon: ic }).addTo(map).bindPopup(`<b>${f.name}</b><br>Industrial Zone`);
      });

      // Simulated driver markers
      const driverIcon = L.divIcon({
        html: `<div style="background:#22c55e;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 10px rgba(34,197,94,0.5);border:2px solid #fff">🚗</div>`,
        iconSize: [32, 32], className: '',
      });
      [[13.340, 77.120], [13.345, 77.130]].forEach(([lat, lng]) => {
        L.marker([lat, lng], { icon: driverIcon }).addTo(map).bindPopup('<b>Driver Online</b><br>TC Mini • 4.9★');
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstance.current = map;
    });
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

export default function RideHailing() {
  const { user, profile } = useUser();
  const [ride, setRide] = useState(null);
  const [dropoff, setDropoff] = useState('');
  const [step, setStep] = useState('input'); // input | options | pending | tracking
  const [selectedVehicle, setSelectedVehicle] = useState('Mini');
  const [userPos, setUserPos] = useState(TUMKUR);

  const SUGGESTIONS = ['KIADB Industrial Area', 'Tumkur Bus Stand', 'Sira Road Junction', 'Sri Sai Auto Components', 'Tumkur Railway Station'];

  const vehicleOptions = [
    { id: 'Shuttle', name: 'Shared Shuttle', price: '₹20', eta: '5 min', seats: '6 seats', icon: '🚌', desc: 'Cheapest — shared with coworkers' },
    { id: 'Mini', name: 'TC Mini',        price: '₹120', eta: '2 min', seats: '4 seats', icon: '🚗', desc: 'Budget-friendly hatchback' },
    { id: 'Sedan', name: 'TC Sedan',       price: '₹160', eta: '4 min', seats: '4 seats', icon: '🚙', desc: 'Comfortable sedan ride' },
    { id: 'SUV',   name: 'TC SUV',         price: '₹250', eta: '7 min', seats: '6 seats', icon: '🚐', desc: 'Premium spacious SUV' },
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => {}, { timeout: 6000 }
      );
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'rides', user.uid), snap => {
      if (snap.exists()) { setRide(snap.data()); }
      else { setRide(null); setStep('input'); }
    });
    return () => unsub();
  }, [user]);

  const requestRide = async () => {
    if (!dropoff) return;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await setDoc(doc(db, 'rides', user.uid), {
      workerId: user.uid,
      workerName: profile?.fullName || 'Worker',
      pickup: 'Current Location',
      dropoff,
      vehicleType: selectedVehicle,
      status: 'pending',
      driverId: null, driverName: null, otp,
      timestamp: Date.now(),
    });
    setStep('pending');
  };

  const cancelRide = () => deleteDoc(doc(db, 'rides', user.uid));

  // Full-screen layout: map behind, bottom sheet on top
  return (
    <div style={{ position: 'fixed', top: 64, left: 0, right: 0, bottom: 0, zIndex: 10, overflow: 'hidden', background: '#0d1117' }}>

      {/* ── Full-screen map ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <MapView userPos={userPos} rideStatus={ride?.status} />
      </div>

      {/* ── Top pill: pickup indicator ── */}
      {step !== 'pending' && !ride && (
        <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8, zIndex: 20 }}>
          <Navigation size={14} color="#3b82f6" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1' }}>📍 Current Location</span>
        </div>
      )}

      {/* ── Bottom Sheet ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
        background: '#0f172a',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderBottom: 'none',
        maxHeight: '65%',
        overflow: 'hidden',
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '14px auto 0' }} />

        <div style={{ padding: '1rem 1.25rem 2rem', overflowY: 'auto', maxHeight: 'calc(65vh - 30px)' }}>

          {/* ── STEP: Input ── */}
          {!ride && step === 'input' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>Where to?</h3>

              {/* Destination input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 18px' }}>
                <Search size={20} color="#64748b" />
                <input
                  value={dropoff}
                  onChange={e => setDropoff(e.target.value)}
                  placeholder="Search destination..."
                  style={{ background: 'transparent', border: 'none', color: '#f8fafc', outline: 'none', flex: 1, fontSize: '1rem', fontWeight: 500 }}
                />
                {dropoff && <X size={16} color="#64748b" style={{ cursor: 'pointer' }} onClick={() => setDropoff('')} />}
              </div>

              {/* Quick suggestions */}
              {!dropoff && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em', marginBottom: 4 }}>POPULAR DESTINATIONS</div>
                  {SUGGESTIONS.map(s => (
                    <div key={s} onClick={() => setDropoff(s)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={14} color="#94a3b8" />
                      </div>
                      <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => dropoff && setStep('options')}
                style={{ padding: '1rem', borderRadius: 14, background: dropoff ? 'linear-gradient(135deg,#e11d48,#be123c)' : 'rgba(255,255,255,0.08)', color: dropoff ? '#fff' : '#475569', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: dropoff ? 'pointer' : 'not-allowed', boxShadow: dropoff ? '0 4px 16px rgba(225,29,72,0.35)' : 'none', transition: 'all 0.2s' }}
              >
                Find Rides
              </button>
            </div>
          )}

          {/* ── STEP: Vehicle Options ── */}
          {!ride && step === 'options' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setStep('input')}>
                <ArrowLeft size={20} color="#94a3b8" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>DROP-OFF</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>{dropoff}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {vehicleOptions.map(v => (
                  <div key={v.id} onClick={() => setSelectedVehicle(v.id)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: 14,
                    border: `2px solid ${selectedVehicle === v.id ? '#e11d48' : 'rgba(255,255,255,0.06)'}`,
                    background: selectedVehicle === v.id ? 'rgba(225,29,72,0.08)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ fontSize: '1.8rem', width: 40, textAlign: 'center' }}>{v.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>{v.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{v.eta} · {v.seats}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>{v.price}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={requestRide} style={{
                padding: '1.1rem', borderRadius: 14, background: 'linear-gradient(135deg,#e11d48,#be123c)',
                color: '#fff', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(225,29,72,0.35)',
              }}>
                Book {vehicleOptions.find(v => v.id === selectedVehicle)?.icon} {selectedVehicle}
              </button>
            </div>
          )}

          {/* ── STEP: Searching ── */}
          {(ride?.status === 'pending' || (!ride && step === 'pending')) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '1rem 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid rgba(225,29,72,0.2)', borderTopColor: '#e11d48', animation: 'spin 0.9s linear infinite' }} />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800 }}>Finding your driver...</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Matching with nearest {ride?.vehicleType || selectedVehicle}</p>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 16px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>OTP</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#e11d48', letterSpacing: 4 }}>{ride?.otp || '----'}</div>
                </div>
              </div>
              <button onClick={cancelRide} style={{ padding: '0.8rem 2rem', borderRadius: 12, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                Cancel Request
              </button>
            </div>
          )}

          {/* ── STEP: Driver on way ── */}
          {(ride?.status === 'accepted' || ride?.status === 'in-progress') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: ride?.status === 'in-progress' ? '#4ade80' : '#fbbf24', fontWeight: 700, letterSpacing: '0.06em' }}>
                    {ride?.status === 'in-progress' ? '🟢 TRIP IN PROGRESS' : '🟡 DRIVER EN ROUTE'}
                  </div>
                  <h3 style={{ margin: '2px 0 0', fontSize: '1.1rem', fontWeight: 800 }}>{ride?.driverName || 'Your Driver'}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#94a3b8' }}>
                    <Star size={12} color="#fbbf24" fill="#fbbf24" /> 4.9 · {ride?.vehicleType}
                  </div>
                </div>
                <button style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Phone size={18} color="#4ade80" />
                </button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Current Location</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e11d48' }} />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{ride?.dropoff}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={14} color="#e11d48" />
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Share OTP with driver</span>
                </div>
                <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#e11d48', letterSpacing: 3 }}>{ride?.otp}</span>
              </div>

              <button onClick={cancelRide} style={{ padding: '0.75rem', borderRadius: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>
                Cancel Ride
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Ripple animation for user dot */}
      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
