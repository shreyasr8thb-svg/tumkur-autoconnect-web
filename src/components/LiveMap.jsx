import { useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import 'leaflet/dist/leaflet.css';

export default function LiveMap({ height = '300px', showBuses = false, showRoute = false, fullScreen = false }) {
  const { location } = useUser();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    import('leaflet').then((L) => {
      const center = location || { lat: 13.3379, lng: 77.1173 };
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([center.lat, center.lng], 14);

      L.tileLayer('https://maps.geoapify.com/v1/tile/dark-matter/{z}/{x}/{y}.png?apiKey=4bb73b465f696d9ed3b830e4c408b93e', {
        maxZoom: 20,
        attribution: '© Geoapify'
      }).addTo(map);

      // User marker
      const userIcon = L.divIcon({
        html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px #3b82f6"></div>',
        iconSize: [16, 16], className: ''
      });
      markerRef.current = L.marker([center.lat, center.lng], { icon: userIcon }).addTo(map);

      if (showBuses) {
        const busIcon = L.divIcon({
          html: '<div style="width:28px;height:28px;background:#DC3545;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;box-shadow:0 0 10px #DC3545">🚌</div>',
          iconSize: [28, 28], className: ''
        });
        // Simulated bus positions near Tumkur
        const buses = [
          { lat: center.lat + 0.008, lng: center.lng + 0.005, label: 'T-04' },
          { lat: center.lat - 0.005, lng: center.lng + 0.012, label: 'T-07' },
          { lat: center.lat + 0.012, lng: center.lng - 0.008, label: 'T-02' },
        ];
        buses.forEach(b => {
          L.marker([b.lat, b.lng], { icon: busIcon })
            .bindPopup(`<b>Route ${b.label}</b><br>Capacity: 32/40<br>ETA: 5 min`)
            .addTo(map);
        });
      }

      if (showRoute) {
        const points = [
          [center.lat, center.lng],
          [center.lat + 0.004, center.lng + 0.003],
          [center.lat + 0.008, center.lng + 0.005],
        ];
        L.polyline(points, { color: '#DC3545', weight: 4, dashArray: '8,8' }).addTo(map);
      }

      mapInstance.current = map;
      setTimeout(() => map.invalidateSize(), 500);
    });

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []);

  // Update user position
  useEffect(() => {
    if (location && markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lng]);
    }
  }, [location]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height, 
        width: '100%',
        borderRadius: fullScreen ? 0 : 16, 
        overflow: 'hidden', 
        border: fullScreen ? 'none' : '1px solid #1e293b',
        zIndex: 10
      }} 
    />
  );
}
