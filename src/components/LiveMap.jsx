import { useEffect, useRef, useState } from 'react';
import { Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { Geolocation } from '@capacitor/geolocation';

const TUMKUR = { lat: 13.3379, lng: 77.1173 };

// Nearby industrial zones around Tumkur
const FACTORIES = [
  { lat: 13.348, lng: 77.128, name: 'Sri Sai Auto Components', type: 'factory' },
  { lat: 13.325, lng: 77.108, name: 'Tumkur Machining Hub', type: 'factory' },
  { lat: 13.355, lng: 77.105, name: 'Precision Parts Ltd', type: 'factory' },
  { lat: 13.332, lng: 77.135, name: 'KIADB Industrial Area', type: 'zone' },
];

const BUSES = [
  { lat: 13.342, lng: 77.122, label: 'T-04', capacity: '32/40' },
  { lat: 13.329, lng: 77.132, label: 'T-07', capacity: '28/40' },
  { lat: 13.351, lng: 77.112, label: 'T-02', capacity: '35/40' },
];

export default function LiveMap({ height = '300px', showBuses = false, showRoute = false, fullScreen = false, activeRide = null }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [userPos, setUserPos] = useState(TUMKUR);
  const [geoError, setGeoError] = useState(false);

  // Get user geolocation
  useEffect(() => {
    const fetchLoc = async () => {
      try {
        if (window.Capacitor?.isNativePlatform?.()) {
          const perm = await Geolocation.checkPermissions();
          if (perm.location !== 'granted') {
            await Geolocation.requestPermissions();
          }
          const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
          setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGeoError(false);
        } else {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setGeoError(false);
              },
              () => setGeoError(true),
              { enableHighAccuracy: true, timeout: 10000 }
            );
          } else {
            setGeoError(true);
          }
        }
      } catch (e) {
        setGeoError(true);
      }
    };
    fetchLoc();
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
      }).setView([userPos.lat, userPos.lng], 14);

      // High-Visibility Modern Map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Zoom controls (bottom-right)
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Fix for map graying out or zooming to entire world on initialization
      setTimeout(() => {
        map.invalidateSize();
      }, 500);

      // ── User location marker (pulsing blue dot) ──
      const userIcon = L.divIcon({
        html: `<div style="position:relative;width:22px;height:22px">
          <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.3);animation:ripple 1.5s ease-out infinite"></div>
          <div style="position:absolute;inset:4px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 10px #3b82f6"></div>
        </div>`,
        iconSize: [22, 22],
        className: '',
      });
      markerRef.current = L.marker([userPos.lat, userPos.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>📍 Your Location</b>');

      // ── Factory markers ──
      FACTORIES.forEach(f => {
        const icon = L.divIcon({
          html: `<div style="background:#e11d48;color:#fff;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(225,29,72,0.5)">${f.type === 'zone' ? '🏭' : '🔧'} ${f.name.split(' ')[0]}</div>`,
          className: '',
          iconAnchor: [0, 0],
        });
        L.marker([f.lat, f.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${f.name}</b><br><span style="color:#94a3b8">Industrial Zone, Tumkur</span>`);
      });

      // ── Bus markers ──
      if (showBuses) {
        BUSES.forEach(b => {
          const icon = L.divIcon({
            html: `<div style="background:#f59e0b;color:#000;padding:4px 8px;border-radius:20px;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(245,158,11,0.5)">🚌 ${b.label}</div>`,
            className: '',
          });
          L.marker([b.lat, b.lng], { icon })
            .addTo(map)
            .bindPopup(`<b>Bus ${b.label}</b><br>Passengers: ${b.capacity}<br><span style="color:#10b981">▶ En Route</span>`);
        });
      }

      // ── Route polyline ──
      if (showRoute) {
        L.polyline([
          [userPos.lat, userPos.lng],
          [userPos.lat + 0.005, userPos.lng + 0.008],
          [FACTORIES[0].lat, FACTORIES[0].lng],
        ], { color: 'var(--primary)', weight: 4, dashArray: '10,6', opacity: 0.85 }).addTo(map);
      }

      mapInstance.current = map;
      setTimeout(() => map.invalidateSize(), 300);
    });

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []);

  // Update User Marker
  useEffect(() => {
    if (markerRef.current && mapInstance.current) {
      markerRef.current.setLatLng([userPos.lat, userPos.lng]);
    }
  }, [userPos]);

  // Handle Active Ride UI (Pickup / Dropoff / Route)
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    
    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
    } else {
      routeLayerRef.current = L.featureGroup().addTo(map);
    }

    if (activeRide && activeRide.pickupPos) {
      const pickupIcon = L.divIcon({
        html: `<div style="background:#3b82f6;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 0 10px #3b82f6;border:2px solid #fff;font-weight:bold;">P</div>`,
        iconSize: [24, 24], className: '',
      });
      L.marker([activeRide.pickupPos.lat, activeRide.pickupPos.lng], { icon: pickupIcon })
        .addTo(routeLayerRef.current).bindPopup('<b>Passenger Location</b>');
      
      const routePoints = [
        [userPos.lat, userPos.lng],
        [activeRide.pickupPos.lat, activeRide.pickupPos.lng]
      ];

      if (activeRide.dropoffPos) {
        const dropoffIcon = L.divIcon({
          html: `<div style="background:#e11d48;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 0 10px #e11d48;border:2px solid #fff;font-weight:bold;">D</div>`,
          iconSize: [24, 24], className: '',
        });
        L.marker([activeRide.dropoffPos.lat, activeRide.dropoffPos.lng], { icon: dropoffIcon })
          .addTo(routeLayerRef.current).bindPopup(`<b>Dropoff:</b> ${activeRide.dropoff}`);
        
        routePoints.push([activeRide.dropoffPos.lat, activeRide.dropoffPos.lng]);
      }

      L.polyline(routePoints, { color: '#3b82f6', weight: 4, opacity: 0.8 }).addTo(routeLayerRef.current);
      
      const bounds = L.latLngBounds(routePoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [activeRide, userPos]);

  return (
    <div style={{ position: 'relative', height, width: '100%', borderRadius: fullScreen ? 0 : 16, overflow: 'hidden', border: fullScreen ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
      {/* Ripple CSS */}
      <style>{`@keyframes ripple{0%{transform:scale(1);opacity:0.8}100%{transform:scale(3);opacity:0}}`}</style>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      <button 
        onClick={(e) => {
          e.preventDefault();
          if (mapInstance.current) {
            mapInstance.current.setView([userPos.lat, userPos.lng], 15, { animate: true });
          }
        }}
        style={{ position: 'absolute', bottom: 100, right: 10, zIndex: 400, background: '#fff', color: '#3b82f6', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', cursor: 'pointer' }}
      >
        <Navigation size={20} />
      </button>
      {geoError && (
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,23,42,0.9)', color: 'var(--text-muted)', fontSize: '0.72rem', padding: '4px 12px', borderRadius: '9999px', zIndex: 20 }}>
          📍 Showing Tumkur, KA (location denied)
        </div>
      )}
    </div>
  );
}
