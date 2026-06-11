import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

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

export default function LiveMap({ height = '300px', showBuses = false, showRoute = false, fullScreen = false }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [userPos, setUserPos] = useState(TUMKUR);
  const [geoError, setGeoError] = useState(false);

  // Get user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setGeoError(true),
        { timeout: 8000 }
      );
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
      }).setView([userPos.lat, userPos.lng], 14);

      // Professional Dark Theme Map
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://carto.com/">CARTO</a>',
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
  }, [userPos]);

  return (
    <div style={{ position: 'relative', height, width: '100%', borderRadius: fullScreen ? 0 : 16, overflow: 'hidden', border: fullScreen ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
      {/* Ripple CSS */}
      <style>{`@keyframes ripple{0%{transform:scale(1);opacity:0.8}100%{transform:scale(3);opacity:0}}`}</style>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {geoError && (
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,23,42,0.9)', color: 'var(--text-muted)', fontSize: '0.72rem', padding: '4px 12px', borderRadius: '9999px', zIndex: 20 }}>
          📍 Showing Tumkur, KA (location denied)
        </div>
      )}
    </div>
  );
}
