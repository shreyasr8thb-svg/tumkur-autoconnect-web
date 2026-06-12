import { useState, useEffect, useRef } from 'react';
import { Bus, Car, Search, ArrowLeft, MapPin, Navigation, Phone, Star, X, Clock, Shield, Bike, CarFront, Users, Package } from 'lucide-react';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';
import InAppCall from './InAppCall';
import 'leaflet/dist/leaflet.css';

const TUMKUR = { lat: 13.3379, lng: 77.1173 };
const FACTORIES = [
  { lat: 13.348, lng: 77.128, name: 'Sri Sai Auto' },
  { lat: 13.325, lng: 77.108, name: 'Machining Hub' },
  { lat: 13.355, lng: 77.105, name: 'Precision Parts' },
  { lat: 13.332, lng: 77.135, name: 'KIADB Zone' },
];

function MapView({ userPos, dropoffPos, rideStatus, onMapClick }) {
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

      if (onMapClick) {
        map.on('click', (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }));
      }
      setTimeout(() => map.invalidateSize(), 500);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
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

  useEffect(() => {
    if (!mapInstance.current || !dropoffPos) return;
    import('leaflet').then((L) => {
      const map = mapInstance.current;
      map.eachLayer((layer) => {
        if (layer instanceof L.Polyline || (layer.options.icon && layer.options.icon.options.className === 'dest-icon')) {
          map.removeLayer(layer);
        }
      });
      L.polyline([[userPos.lat, userPos.lng], [dropoffPos.lat, dropoffPos.lng]], {
        color: '#ffffff', weight: 3, opacity: 0.9
      }).addTo(map);
      const destIcon = L.divIcon({
        html: `<div style="background:#fff;width:10px;height:10px;box-shadow:0 0 10px rgba(0,0,0,0.5)"></div>`,
        iconSize: [10, 10], className: 'dest-icon'
      });
      L.marker([dropoffPos.lat, dropoffPos.lng], { icon: destIcon }).addTo(map);
      map.fitBounds([[userPos.lat, userPos.lng], [dropoffPos.lat, dropoffPos.lng]], { padding: [60, 60] });
    });
  }, [dropoffPos, userPos]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

export default function RideHailing({ onBack }) {
  const { user, profile } = useUser();
  const [ride, setRide] = useState(null);
  const [dropoff, setDropoff] = useState('');
  const [step, setStep] = useState('home'); // home | input | options | pending | tracking
  const [selectedVehicle, setSelectedVehicle] = useState('Mini');
  const [userPos, setUserPos] = useState(TUMKUR);
  const [customDropoff, setCustomDropoff] = useState(null);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
  };

  const SUGGESTIONS = [
    { name: 'KIADB Industrial Area', lat: 13.332, lng: 77.135 },
    { name: 'Tumkur Bus Stand', lat: 13.342, lng: 77.100 },
    { name: 'Sira Road Junction', lat: 13.360, lng: 77.120 },
    { name: 'Sri Sai Auto Components', lat: 13.348, lng: 77.128 },
    { name: 'Tumkur Railway Station', lat: 13.325, lng: 77.108 }
  ];
  if (customDropoff) {
    SUGGESTIONS.push({ name: 'Pinned Location', lat: customDropoff.lat, lng: customDropoff.lng });
  }

  const SUGGESTIONS_WITH_DIST = SUGGESTIONS.map(s => ({ ...s, dist: getDistance(userPos.lat, userPos.lng, s.lat, s.lng) }));

  const selectedDropoffObj = SUGGESTIONS_WITH_DIST.find(s => s.name === dropoff);
  const selectedDist = selectedDropoffObj ? parseFloat(selectedDropoffObj.dist) : 5.0;
  const dropoffPos = selectedDropoffObj ? { lat: selectedDropoffObj.lat, lng: selectedDropoffObj.lng } : null;

  const vehicleOptions = [
    { id: 'Bike', name: 'Moto', price: `₹${Math.round(20 + selectedDist * 12)}`, eta: '1 min', seats: '1 seat', icon: <Bike size={28} color="#94a3b8" />, desc: 'Beat the traffic' },
    { id: 'Auto', name: 'Auto', price: `₹${Math.round(30 + selectedDist * 15)}`, eta: '3 min', seats: '3 seats', icon: <Users size={28} color="#f59e0b" />, desc: 'Everyday affordable rides' },
    { id: 'Mini', name: 'TC Mini', price: `₹${Math.round(50 + selectedDist * 22)}`, eta: '2 min', seats: '4 seats', icon: <Car size={28} color="#3b82f6" />, desc: 'Budget-friendly hatchback' },
    { id: 'Sedan', name: 'TC Sedan', price: `₹${Math.round(60 + selectedDist * 28)}`, eta: '4 min', seats: '4 seats', icon: <CarFront size={28} color="#e11d48" />, desc: 'Comfortable sedan ride' },
    { id: 'SUV', name: 'TC SUV', price: `₹${Math.round(80 + selectedDist * 35)}`, eta: '7 min', seats: '6 seats', icon: <Bus size={28} color="#10b981" />, desc: 'Premium spacious SUV' },
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
      else { 
        setRide(null); 
        setStep(prev => (prev === 'pending' || prev === 'tracking' ? 'home' : prev)); 
      }
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
      price: vehicleOptions.find(v => v.id === selectedVehicle)?.price || '₹150',
      status: 'pending',
      driverId: null, driverName: null, driverPhoto: null, otp,
      timestamp: Date.now(),
    });
    setStep('pending');
  };

  const cancelRide = () => deleteDoc(doc(db, 'rides', user.uid));

  if (step === 'home' && !ride) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, background: '#121212', overflowY: 'auto', paddingBottom: '80px' }}>
        {/* Header Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
          {onBack && (
            <div onClick={onBack} style={{ position: 'absolute', left: '1rem', cursor: 'pointer', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={20} color="#fff" />
            </div>
          )}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#fff', cursor: 'pointer' }}>
              <Car size={24} color="#fff" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>TC Ride</span>
              <div style={{ width: '32px', height: 3, background: '#fff', borderRadius: 2, marginTop: 2 }} />
            </div>
          </div>
        </div>

        <div style={{ padding: '1rem' }}>
          {/* Search Pill */}
          <div onClick={() => setStep('input')} style={{ background: '#27272a', borderRadius: '100px', display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px', cursor: 'pointer', marginBottom: '1.5rem' }}>
            <Search size={22} color="#f8fafc" />
            <span style={{ flex: 1, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>Where to? (or tap map)</span>
            <div style={{ background: '#18181b', borderRadius: '100px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#f8fafc" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>Later</span>
            </div>
          </div>

          {/* Saved Places */}
          <div style={{ background: '#1c1c1e', borderRadius: '16px', padding: '0.5rem', marginBottom: '2rem' }}>
            {SUGGESTIONS.slice(0, 2).map((s, i) => (
              <div key={s.name} onClick={() => { setDropoff(s.name); setStep('options'); }} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#7f1d1d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} color="#fca5a5" />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{s.name}, Tumkur District</div>
                  <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px', fontWeight: 600 }}>15% off select trips</div>
                </div>
              </div>
            ))}
          </div>

          {/* For You Grid */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem', marginTop: 0 }}>For you</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { name: 'Trip', icon: <Car size={28} color="#fff" />, promo: '25%' },
              { name: 'Auto', icon: <Users size={28} color="#fcd34d" /> },
              { name: 'Bike Saver', icon: <Bike size={28} color="#cbd5e1" /> },
              { name: 'Reserve', icon: <Clock size={28} color="#fff" />, promo: 'Promo' },
              { name: 'Intercity', icon: <CarFront size={28} color="#fff" /> },
              { name: 'Rentals', icon: <Clock size={28} color="#fff" /> },
              { name: 'Bus tickets', icon: <Bus size={28} color="#60a5fa" />, promo: 'Promo' },
            ].map((item) => (
              <div key={item.name} onClick={() => setStep('input')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {item.promo && (
                    <div style={{ position: 'absolute', top: -6, background: '#dc2626', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '10px', whiteSpace: 'nowrap', zIndex: 2 }}>
                      {item.promo}
                    </div>
                  )}
                  {item.icon}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', textAlign: 'center' }}>{item.name}</span>
              </div>
            ))}
          </div>

          {/* Banner */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>TC Black has arrived</h3>
          <div style={{ background: '#27272a', borderRadius: '16px', overflow: 'hidden', height: 180, position: 'relative', cursor: 'pointer' }} onClick={() => setStep('input')}>
             <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))', zIndex: 1 }} />
             <img src="https://images.unsplash.com/photo-1629897048514-3dd74142ff23?auto=format&fit=crop&q=80&w=800" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Black Cab" />
             <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 2 }}>
               <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Try Black</div>
               <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Premium business class rides</div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Full-screen layout: map behind, bottom sheet on top
  return (
    <div style={{ position: 'fixed', top: 64, left: 0, right: 0, bottom: 0, zIndex: 10, overflow: 'hidden', background: '#0d1117' }}>

      {/* ── Full-screen map ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <MapView userPos={userPos} dropoffPos={dropoffPos} rideStatus={ride?.status} onMapClick={(latlng) => {
          if (!ride && (step === 'input' || step === 'options')) {
            setCustomDropoff(latlng);
            setDropoff('Pinned Location');
            setStep('options');
          }
        }} />
      </div>

      {/* ── Top pill: pickup indicator ── */}
      {!ride && step === 'input' && (
        <>
          <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 20 }}>
            <div onClick={() => setStep('home')} style={{ width: 44, height: 44, borderRadius: '50%', background: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', flexShrink: 0 }}>
              <ArrowLeft size={22} color="#fff" />
            </div>
          </div>
          <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8, zIndex: 20 }}>
            <Navigation size={14} color="#3b82f6" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1' }}>📍 Current Location</span>
          </div>
        </>
      )}

      {/* ── Top Pill: Destination View ── */}
      {step === 'options' && (
        <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', gap: 10, zIndex: 20 }}>
          <div onClick={() => setStep('input')} style={{ width: 44, height: 44, borderRadius: '50%', background: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', flexShrink: 0 }}>
            <ArrowLeft size={22} color="#fff" />
          </div>
          <div style={{ flex: 1, background: '#121212', borderRadius: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '6px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} /> Home</div>
            <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{dropoff}</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>{selectedDist} km • {Math.round(selectedDist * 3)} mins away</div>
          </div>
        </div>
      )}

      {/* ── Bottom Sheet ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderBottom: 'none',
        maxHeight: '75%',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Handle */}
        <div style={{ width: 48, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 4, margin: '14px auto 0', flexShrink: 0 }} />

        <div style={{ padding: '1rem 1.25rem 2rem', overflowY: 'auto', flex: 1 }}>

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
                    <div key={s.name} onClick={() => setDropoff(s.name)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={14} color="#94a3b8" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>{s.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{s.dist} km away</div>
                      </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, margin: '-1rem -1.25rem -2rem', background: '#121212' }}>
              <h3 style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', padding: '1.25rem 0 0.5rem', margin: 0 }}>Choose a trip</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 1rem 1rem' }}>
                {vehicleOptions.map(v => {
                   const isSelected = selectedVehicle === v.id;
                   return (
                  <div key={v.id} onClick={() => setSelectedVehicle(v.id)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 16, marginBottom: '0.5rem',
                    border: `2px solid ${isSelected ? '#fff' : 'transparent'}`,
                    background: isSelected ? '#1c1c1e' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ position: 'relative', width: 60, height: 60 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#27272a', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }} />
                        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{v.icon}</div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                           <span style={{ fontWeight: 600, fontSize: '1rem', color: '#f8fafc' }}>{v.name}</span>
                           <Users size={12} color="#f8fafc" /> <span style={{ fontSize: '0.8rem', color: '#f8fafc' }}>{v.seats.charAt(0)}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                           {new Date(Date.now() + parseInt(v.eta)*60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true}).toLowerCase()} · {v.eta}
                        </div>
                        {v.id === 'Bike' && (
                           <div style={{ background: '#1e3a8a', color: '#60a5fa', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginTop: 4, fontWeight: 600 }}>Cheaper</div>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {v.id === 'Bike' && <div style={{ fontSize: '0.7rem', textDecoration: 'line-through', color: '#94a3b8' }}>{`₹${parseInt(v.price.replace('₹','')) + 15}.93`}</div>}
                      <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                         {v.id === 'Bike' && <span style={{ width: 14, height: 14, background: '#f87171', transform: 'rotate(45deg)', display: 'inline-block', borderRadius: 2 }} />}
                         {v.price}
                      </div>
                    </div>
                  </div>
                )})}
              </div>

              {/* Payment Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#bef264', borderRadius: 6, padding: '4px 6px' }}>
                    <div style={{ width: 18, height: 12, border: '2px solid #166534', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <div style={{ width: 4, height: 4, background: '#166534', borderRadius: '50%' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 600 }}>Cash</span>
                </div>
                <ArrowLeft size={16} color="#f8fafc" style={{ transform: 'rotate(180deg)' }} />
              </div>

              {/* Action Bar */}
              <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', gap: 10 }}>
                <button onClick={requestRide} style={{
                  flex: 1, padding: '1.1rem', borderRadius: 12, background: '#e4e4e7',
                  color: '#18181b', fontWeight: 700, fontSize: '1.05rem', border: 'none', cursor: 'pointer',
                }}>
                  Choose {vehicleOptions.find(v => v.id === selectedVehicle)?.name}
                </button>
                <div style={{ width: 54, height: 54, borderRadius: 12, background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={24} color="#f8fafc" />
                </div>
              </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {ride?.driverPhoto ? (
                    <img src={ride.driverPhoto} alt="Driver" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} color="#f8fafc" />
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.65rem', color: ride?.status === 'in-progress' ? '#4ade80' : '#fbbf24', fontWeight: 700, letterSpacing: '0.06em' }}>
                      {ride?.status === 'in-progress' ? '🟢 TRIP IN PROGRESS' : '🟡 DRIVER EN ROUTE'}
                    </div>
                    <h3 style={{ margin: '2px 0 0', fontSize: '1.1rem', fontWeight: 800 }}>{ride?.driverName || 'Your Driver'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#94a3b8' }}>
                      <Star size={12} color="#fbbf24" fill="#fbbf24" /> 4.9 · {ride?.vehicleNumber || 'KA-00'} · {ride?.vehicleType || selectedVehicle}
                    </div>
                  </div>
                </div>
                <button onClick={() => {
                  import('firebase/firestore').then(({ setDoc, doc }) => {
                    setDoc(doc(db, 'rides', user.uid), {
                      call: { caller: user.uid, status: 'calling', callerCandidates: [], receiverCandidates: [] }
                    }, { merge: true }).catch(e => {
                      console.error("Call signaling error:", e);
                      alert("Network error: Could not connect call. " + e.message);
                    });
                  });
                }} style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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

          {ride?.call && (
            <InAppCall 
              rideId={user.uid}
              isCaller={ride.call.caller === user.uid}
              peerName={ride?.driverName || 'Driver'} 
              peerPhoto={ride?.driverPhoto} 
            />
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
