import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Bus, Car, Search, ArrowLeft, MapPin, Navigation, Phone, Star, X, Clock, Shield, Bike, CarFront, Users, Package, AlertCircle, WifiOff } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { doc, onSnapshot, setDoc, deleteDoc, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';
import InAppCall from './InAppCall';
import MapEngine, { fetchRoute, formatDistance, formatDuration } from './MapEngine';
import tcBlackImg from '../assets/tc-black.png';

const TUMKUR = { lat: 13.3379, lng: 77.1173 };
const FACTORIES = [
  { lat: 13.348, lng: 77.128, name: 'Sri Sai Auto' },
  { lat: 13.325, lng: 77.108, name: 'Machining Hub' },
  { lat: 13.355, lng: 77.105, name: 'Precision Parts' },
  { lat: 13.332, lng: 77.135, name: 'KIADB Zone' },
];

// ── Haversine distance (km) ──
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

// ── Search result cache ──
const searchCache = new Map();

export default function RideHailing({ onBack }) {
  const { user, profile } = useUser();
  const [ride, setRide] = useState(null);
  const [dropoff, setDropoff] = useState('');
  const [step, setStep] = useState('home'); // home | input | options | pending | tracking
  const [selectedVehicle, setSelectedVehicle] = useState('Mini');
  const [userPos, setUserPos] = useState(TUMKUR);
  const [customDropoff, setCustomDropoff] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [queryText, setQueryText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Route from OSRM
  const [routeData, setRouteData] = useState(null); // { waypoints, distance, duration }
  const routeAbortRef = useRef(null);

  // Fetch online drivers
  useEffect(() => {
    const q = query(collection(db, 'users'), where('isOnline', '==', true));
    const unsub = onSnapshot(q, snap => {
      const drivers = [];
      snap.forEach(doc => {
        const d = doc.data();
        if (d.location?.lat && d.location?.lng) {
          drivers.push({ id: doc.id, lat: d.location.lat, lng: d.location.lng, type: d.vehicleType, number: d.vehicleNumber });
        }
      });
      setActiveDrivers(drivers);
    });
    return () => unsub();
  }, []);

  // Push a new step to browser history
  const goToStep = useCallback((nextStep) => {
    window.history.pushState({ rideStep: nextStep }, '');
    setStep(nextStep);
  }, []);

  const goBack = useCallback(() => window.history.back(), []);

  // Handle hardware back button
  useEffect(() => {
    window.history.pushState({ rideStep: 'home' }, '');
    const onPop = () => {
      setStep(prev => {
        if (prev === 'options') return 'input';
        if (prev === 'input') return 'home';
        if (prev === 'pending') return 'home';
        return prev;
      });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const SUGGESTIONS = useMemo(() => {
    const base = [
      { name: 'KIADB Industrial Area', lat: 13.332, lng: 77.135 },
      { name: 'Tumkur Bus Stand', lat: 13.342, lng: 77.100 },
      { name: 'Sira Road Junction', lat: 13.360, lng: 77.120 },
      { name: 'Sri Sai Auto Components', lat: 13.348, lng: 77.128 },
      { name: 'Tumkur Railway Station', lat: 13.325, lng: 77.108 },
    ];
    if (customDropoff) {
      base.push({ name: 'Pinned Location', lat: customDropoff.lat, lng: customDropoff.lng });
    }
    return base.map(s => ({ ...s, dist: getDistance(userPos.lat, userPos.lng, s.lat, s.lng) }));
  }, [userPos.lat, userPos.lng, customDropoff]);

  // ── Search with AbortController + cache ──
  useEffect(() => {
    if (!dropoff || dropoff === 'Pinned Location' || dropoff.length < 3) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    // Check cache
    const cacheKey = dropoff.toLowerCase().trim();
    if (searchCache.has(cacheKey)) {
      setSearchResults(searchCache.get(cacheKey));
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dropoff)}&viewbox=77.05,13.4,77.2,13.2`,
          { signal: controller.signal }
        );
        const data = await res.json();
        const results = data.slice(0, 5).map(d => ({
          name: d.display_name.split(',')[0],
          fullName: d.display_name,
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
          dist: getDistance(userPos.lat, userPos.lng, parseFloat(d.lat), parseFloat(d.lon))
        }));
        searchCache.set(cacheKey, results);
        setSearchResults(results);
        setSearchLoading(false);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error("Search error", e);
          setSearchError('Search failed. Check your connection.');
          setSearchLoading(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [dropoff, userPos.lat, userPos.lng]);

  // ── Get user location ──
  useEffect(() => {
    let mounted = true;
    const checkLoc = async () => {
      try {
        if (window.Capacitor?.isNativePlatform?.()) {
          const perm = await Geolocation.checkPermissions();
          if (perm.location !== 'granted') await Geolocation.requestPermissions();
          const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
          if (mounted) setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (p) => { if (mounted) setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }); },
            () => {},
            { enableHighAccuracy: true, timeout: 10000 }
          );
        }
      } catch {}
    };
    checkLoc();
    return () => { mounted = false; };
  }, []);

  const fetchLoc = useCallback(async () => {
    try {
      if (window.Capacitor?.isNativePlatform?.()) {
        await Geolocation.requestPermissions();
        const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
        setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude });
      } else {
        navigator.geolocation.getCurrentPosition(
          (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
          (err) => alert("Please allow location permissions: " + err.message),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    } catch (e) {
      alert("Could not get location. Check your phone settings.");
    }
  }, []);

  // ── Handle destination selection + fetch OSRM route ──
  const handleSelectDestination = useCallback(async (s) => {
    setDropoff(s.name);
    setSelectedDestination(s);
    goToStep('options');

    // Abort any in-flight route request
    if (routeAbortRef.current) routeAbortRef.current.abort();
    const controller = new AbortController();
    routeAbortRef.current = controller;

    setRouteData(null);
    const result = await fetchRoute(userPos, { lat: s.lat, lng: s.lng }, controller.signal);
    if (result) {
      setRouteData(result);
    }
  }, [userPos, goToStep]);

  const selectedDist = routeData
    ? (routeData.distance / 1000).toFixed(1)
    : selectedDestination
      ? parseFloat(selectedDestination.dist)
      : 5.0;

  const selectedEta = routeData
    ? formatDuration(routeData.duration)
    : `${Math.round(parseFloat(selectedDist) * 3)} min`;

  const dropoffPos = selectedDestination ? { lat: selectedDestination.lat, lng: selectedDestination.lng } : null;

  // Build route prop for MapEngine
  const mapRoute = useMemo(() => {
    if (!dropoffPos) return null;
    return {
      pickup: userPos,
      dropoff: dropoffPos,
      waypoints: routeData?.waypoints || null,
    };
  }, [userPos, dropoffPos, routeData]);

  // For active ride, build route from ride data
  const activeRideRoute = useMemo(() => {
    if (!ride?.pickupPos) return null;
    return {
      pickup: ride.pickupPos,
      dropoff: ride.dropoffPos || null,
      waypoints: null,
    };
  }, [ride]);

  const currentRoute = ride ? activeRideRoute : mapRoute;

  const vehicleOptions = useMemo(() => {
    const dist = parseFloat(selectedDist);
    return [
      { id: 'Bike', name: 'Moto', price: `₹${Math.round(20 + dist * 12)}`, eta: '1 min', seats: '1 seat', icon: <Bike size={28} color="#94a3b8" />, desc: 'Beat the traffic', tag: 'Cheapest' },
      { id: 'Auto', name: 'Auto', price: `₹${Math.round(30 + dist * 15)}`, eta: '3 min', seats: '3 seats', icon: <Users size={28} color="#f59e0b" />, desc: 'Everyday affordable rides' },
      { id: 'SharedBus', name: 'Shared Bus', price: `₹${Math.round(15 + dist * 5)}`, eta: '10 min', seats: '40 seats', icon: <Bus size={28} color="#fb923c" />, desc: 'Affordable shared commute' },
      { id: 'Mini', name: 'TC Mini', price: `₹${Math.round(50 + dist * 22)}`, eta: '2 min', seats: '4 seats', icon: <Car size={28} color="#3b82f6" />, desc: 'Budget-friendly hatchback' },
      { id: 'Sedan', name: 'TC Sedan', price: `₹${Math.round(60 + dist * 28)}`, eta: '4 min', seats: '4 seats', icon: <CarFront size={28} color="#e11d48" />, desc: 'Comfortable sedan ride' },
      { id: 'SUV', name: 'TC SUV', price: `₹${Math.round(80 + dist * 35)}`, eta: '7 min', seats: '6 seats', icon: <Bus size={28} color="#10b981" />, desc: 'Premium spacious SUV' },
    ];
  }, [selectedDist]);

  // ── Ride state listener ──
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'rides', user.uid), snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (Date.now() - data.timestamp > 3600000) {
          deleteDoc(doc(db, 'rides', user.uid));
          setRide(null);
          setStep('home');
        } else {
          setRide(data);
        }
      } else {
        setRide(null);
        setStep(prev => (prev === 'pending' || prev === 'tracking' ? 'home' : prev));
      }
    });
    return () => unsub();
  }, [user]);

  const requestRide = useCallback(async () => {
    if (!dropoff) return;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await setDoc(doc(db, 'rides', user.uid), {
      workerId: user.uid,
      workerName: profile?.fullName || 'Worker',
      pickup: 'Current Location',
      pickupPos: userPos,
      dropoff,
      dropoffPos: dropoffPos,
      vehicleType: selectedVehicle,
      price: vehicleOptions.find(v => v.id === selectedVehicle)?.price || '₹150',
      status: 'pending',
      driverId: null, driverName: null, driverPhoto: null, otp,
      timestamp: Date.now(),
    });
    goToStep('pending');
  }, [dropoff, user, profile, userPos, dropoffPos, selectedVehicle, vehicleOptions, goToStep]);

  const cancelRide = useCallback(() => deleteDoc(doc(db, 'rides', user.uid)), [user]);

  const handleMapClick = useCallback((latlng) => {
    if (!ride && (step === 'home' || step === 'input' || step === 'options')) {
      setCustomDropoff(latlng);
      setDropoff('Pinned Location');
      handleSelectDestination({
        name: 'Pinned Location',
        lat: latlng.lat,
        lng: latlng.lng,
        dist: getDistance(userPos.lat, userPos.lng, latlng.lat, latlng.lng)
      });
    }
  }, [ride, step, userPos, handleSelectDestination]);

  // ── Full-screen layout: map behind, bottom sheet on top ──
  return (
    <div style={{ position: 'fixed', top: 'var(--topbar-h)', left: 0, right: 0, bottom: 0, zIndex: 10, overflow: 'hidden', background: 'var(--bg-dark)' }}>

      {/* ── Full-screen map ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <MapEngine
          height="100%"
          fullScreen
          userPos={userPos}
          drivers={activeDrivers}
          route={currentRoute}
          showFactories={true}
          onMapClick={handleMapClick}
          initialZoom={15}
        />
      </div>

      {/* ── Top pill: pickup indicator ── */}
      {!ride && (step === 'input' || step === 'home') && (
        <>
          <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 20 }}>
            <div onClick={goBack} style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-glass-heavy)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', flexShrink: 0 }}>
              <ArrowLeft size={22} color="var(--text-main)" />
            </div>
          </div>
          <div onClick={fetchLoc} style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-glass-heavy)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', borderRadius: 100, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8, zIndex: 20, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <Navigation size={14} color="#3b82f6" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>📍 Locate Me</span>
          </div>
        </>
      )}

      {/* ── Top Pill: Destination View ── */}
      {step === 'options' && (
        <div style={{ position: 'absolute', top: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 800, padding: '0 14px', pointerEvents: 'auto' }}>
            <div onClick={goBack} style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-glass-heavy)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', flexShrink: 0 }}>
              <ArrowLeft size={22} color="var(--text-main)" />
            </div>
            <div style={{ flex: 1, background: 'var(--bg-glass-heavy)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', borderRadius: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '6px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} /> Pickup</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{dropoff}</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>
                {routeData
                  ? `${formatDistance(routeData.distance)} • ${formatDuration(routeData.duration)}`
                  : `${selectedDist} km • ${selectedEta}`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Search Bar (Floating) ── */}
      {!ride && step === 'home' && (
        <div style={{ position: 'absolute', top: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ width: '100%', maxWidth: 800, padding: '0 14px 0 64px', pointerEvents: 'auto' }}>
            <div onClick={() => setStep('input')} style={{ background: 'var(--bg-glass-heavy)', backdropFilter: 'blur(16px)', border: '1px solid var(--border)', borderRadius: '100px', display: 'flex', alignItems: 'center', padding: '12px 18px', gap: '12px', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
              <Search size={22} color="var(--text-main)" />
              <span style={{ flex: 1, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Where to? (or tap map)</span>
              <div style={{ background: 'var(--bg-glass)', borderRadius: '100px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="var(--text-main)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Now</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Sheet ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 800, zIndex: 30,
        background: 'var(--bg-glass-heavy)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTopLeftRadius: 'clamp(20px, 5vw, 32px)', borderTopRightRadius: 'clamp(20px, 5vw, 32px)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
        border: '1px solid var(--border)',
        borderBottom: 'none',
        maxHeight: step === 'home' ? 'clamp(40%, 45vh, 50%)' : 'clamp(55%, 70vh, 80%)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'max-height 0.3s ease-in-out',
      }}>
        {/* Handle */}
        <div style={{ width: 48, height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 4, margin: '14px auto 0', flexShrink: 0 }} />

        <div style={{ padding: 'clamp(0.75rem, 2.5vw, 1rem) clamp(0.85rem, 3vw, 1.25rem) clamp(1rem, 3vw, 2rem)', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>

          {/* ── STEP: Home Sheet Content ── */}
          {!ride && step === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: 'clamp(0.5rem, 2vw, 1rem)', marginTop: 0 }}>For you</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(60px, 18vw, 80px), 1fr))', gap: 'clamp(0.5rem, 2vw, 1rem)', marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
                {[
                  { name: 'Trip', icon: <Car size={28} color="var(--text-main)" />, promo: '25%' },
                  { name: 'Auto', icon: <Users size={28} color="#fcd34d" /> },
                  { name: 'Bike Saver', icon: <Bike size={28} color="var(--text-main)" /> },
                  { name: 'Shared Bus', icon: <Bus size={28} color="#fb923c" /> },
                  { name: 'Reserve', icon: <Clock size={28} color="var(--text-main)" />, promo: 'Promo' },
                  { name: 'Intercity', icon: <CarFront size={28} color="var(--text-main)" /> },
                  { name: 'Rentals', icon: <Clock size={28} color="var(--text-main)" /> },
                  { name: 'Bus tickets', icon: <Bus size={28} color="#60a5fa" />, promo: 'Promo' },
                ].map((item) => (
                  <div key={item.name} onClick={() => setStep('input')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(4px, 1.5vw, 8px)', cursor: 'pointer' }}>
                    <div style={{ width: 'clamp(44px, 14vw, 60px)', height: 'clamp(44px, 14vw, 60px)', borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'transform 0.15s ease' }}>
                      {item.promo && (
                        <div style={{ position: 'absolute', top: -6, background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '10px', whiteSpace: 'nowrap', zIndex: 2 }}>
                          {item.promo}
                        </div>
                      )}
                      {item.icon}
                    </div>
                    <span style={{ fontSize: 'clamp(0.6rem, 2vw, 0.75rem)', fontWeight: 600, color: 'var(--text-main)', textAlign: 'center', lineHeight: 1.2 }}>{item.name}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Recent Places</div>
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: '16px', padding: '0.5rem', marginBottom: '2rem' }}>
                {SUGGESTIONS.slice(0, 2).map((s, i) => (
                  <div key={s.name} onClick={() => handleSelectDestination(s)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderBottom: i === 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer', borderRadius: 10, transition: 'background 0.15s' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin size={20} color="#f87171" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}, Tumkur District</div>
                      <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px', fontWeight: 600 }}>15% off select trips</div>
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>TC Black has arrived</h3>
              <div style={{ background: 'var(--bg-dark)', borderRadius: '16px', overflow: 'hidden', height: 180, position: 'relative', cursor: 'pointer' }} onClick={() => setStep('input')}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))', zIndex: 1 }} />
                <img src={tcBlackImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="TC Black Cab" />
                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 2 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Try Black</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Premium business class rides</div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: Input ── */}
          {!ride && step === 'input' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Where to?</h3>

              {/* Destination input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', transition: 'border-color 0.2s' }}>
                <Search size={20} color="var(--text-muted)" />
                <input
                  value={dropoff}
                  onChange={e => setDropoff(e.target.value)}
                  placeholder="Search destination..."
                  autoFocus
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', flex: 1, fontSize: '1rem', fontWeight: 500 }}
                />
                {dropoff && <X size={16} color="var(--text-muted)" style={{ cursor: 'pointer', minWidth: 16, minHeight: 16, padding: 2 }} onClick={() => setDropoff('')} />}
              </div>

              {/* Quick suggestions */}
              {!dropoff && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em', marginBottom: 4 }}>POPULAR DESTINATIONS</div>
                  {SUGGESTIONS.map(s => (
                    <div key={s.name} onClick={() => handleSelectDestination(s)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={14} color="var(--text-muted)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{s.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{s.dist} km away</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Results */}
              {dropoff && searchResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 240, overflowY: 'auto' }}>
                  {searchResults.map(s => (
                    <div key={s.fullName} onClick={() => handleSelectDestination(s)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={14} color="#3b82f6" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.fullName} • {s.dist} km</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Search loading / error / empty states */}
              {dropoff && searchResults.length === 0 && (
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                  {searchLoading && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, border: '2.5px solid var(--border)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Searching "{dropoff}"…</span>
                    </div>
                  )}
                  {searchError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: '#f87171', fontSize: '0.85rem' }}>
                      <WifiOff size={16} />
                      <span>{searchError}</span>
                    </div>
                  )}
                  {!searchLoading && !searchError && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No results for "{dropoff}"</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: Vehicle Options ── */}
          {!ride && step === 'options' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, margin: '-1rem -1.25rem -2rem', background: 'var(--bg-dark)' }}>
              <h3 style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', padding: '1.25rem 0 0.5rem', margin: 0 }}>Choose a trip</h3>

              {/* Route info bar */}
              {routeData && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '0 1rem 0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#3b82f6', fontWeight: 700 }}>
                    <MapPin size={14} />
                    {formatDistance(routeData.distance)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                    <Clock size={14} />
                    {formatDuration(routeData.duration)}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 1rem 1rem' }}>
                {vehicleOptions.map(v => {
                  const isSelected = selectedVehicle === v.id;
                  return (
                    <div key={v.id} onClick={() => setSelectedVehicle(v.id)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: 'clamp(8px, 2.5vw, 12px) clamp(10px, 3vw, 14px)', borderRadius: 'clamp(12px, 3vw, 16px)', marginBottom: 'clamp(0.3rem, 1vw, 0.5rem)',
                      border: `2px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
                      background: isSelected ? 'rgba(59,130,246,0.08)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2.5vw, 14px)' }}>
                        <div style={{ position: 'relative', width: 'clamp(40px, 12vw, 56px)', height: 'clamp(40px, 12vw, 56px)' }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border)', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }} />
                          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{v.icon}</div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', color: 'var(--text-main)' }}>{v.name}</span>
                            <Users size={12} color="var(--text-main)" /> <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{v.seats.charAt(0)}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {new Date(Date.now() + parseInt(v.eta) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()} · {v.eta}
                          </div>
                          {v.tag && (
                            <div style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginTop: 4, fontWeight: 600 }}>{v.tag}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)' }}>{v.price}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#bef264', borderRadius: 6, padding: '4px 6px' }}>
                    <div style={{ width: 18, height: 12, border: '2px solid #166534', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 4, height: 4, background: '#166534', borderRadius: '50%' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Cash</span>
                </div>
                <ArrowLeft size={16} color="var(--text-main)" style={{ transform: 'rotate(180deg)' }} />
              </div>

              {/* Action Bar */}
              <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', gap: 10 }}>
                <button onClick={requestRide} className="btn btn-primary" style={{
                  flex: 1, padding: '1.1rem', borderRadius: 12, fontWeight: 700, fontSize: '1.05rem', border: 'none', cursor: 'pointer',
                }}>
                  Choose {vehicleOptions.find(v => v.id === selectedVehicle)?.name}
                </button>
                <div style={{ width: 54, height: 54, borderRadius: 12, background: 'var(--bg-glass)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Clock size={24} color="var(--text-main)" />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: Searching ── */}
          {(ride?.status === 'pending' || (!ride && step === 'pending')) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '1rem 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', animation: 'spin 0.9s linear infinite' }} />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>Finding your driver…</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Matching with nearest {ride?.vehicleType || selectedVehicle}</p>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ textAlign: 'center', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 20px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>YOUR OTP</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3b82f6', letterSpacing: 4, fontFamily: 'monospace' }}>{ride?.otp || '----'}</div>
                </div>
              </div>
              <button onClick={cancelRide} style={{ padding: '0.8rem 2rem', borderRadius: 12, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', minHeight: 44 }}>
                Cancel Request
              </button>
            </div>
          )}

          {/* ── STEP: Driver on way / Trip in progress ── */}
          {(ride?.status === 'accepted' || ride?.status === 'in-progress') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {ride?.driverPhoto ? (
                    <img src={ride.driverPhoto} alt="Driver" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                      {(ride?.driverName || 'D').charAt(0)}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.65rem', color: ride?.status === 'in-progress' ? '#4ade80' : '#fbbf24', fontWeight: 700, letterSpacing: '0.06em' }}>
                      {ride?.status === 'in-progress' ? '🟢 TRIP IN PROGRESS' : '🟡 DRIVER EN ROUTE'}
                    </div>
                    <h3 style={{ margin: '2px 0 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{ride?.driverName || 'Your Driver'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
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
                }} style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <Phone size={18} color="#4ade80" />
                </button>
              </div>

              {/* Route summary card */}
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', border: '2px solid rgba(59,130,246,0.3)' }} />
                    <div style={{ width: 2, height: 20, background: 'var(--border)', borderRadius: 1 }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', border: '2px solid rgba(239,68,68,0.3)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: 14 }}>Current Location</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>{ride?.dropoff}</div>
                  </div>
                </div>
              </div>

              {/* OTP card */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={16} color="#3b82f6" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Share OTP with driver</span>
                </div>
                <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#3b82f6', letterSpacing: 4, fontFamily: 'monospace' }}>{ride?.otp}</span>
              </div>

              <button onClick={cancelRide} style={{ padding: '0.75rem', borderRadius: 12, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem', minHeight: 44 }}>
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

      {/* Shared keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
