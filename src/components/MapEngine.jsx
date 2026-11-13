/**
 * MapEngine — Unified, lazy-loaded, high-performance Leaflet map component.
 *
 * Replaces the duplicated map logic previously in LiveMap.jsx and RideHailing.jsx.
 * - Lazy-loads Leaflet (truly code-split)
 * - Retina-ready dark/light tiles (CartoDB)
 * - Canvas renderer for GPU-composited markers
 * - ResizeObserver instead of setTimeout for invalidateSize
 * - Stable refs, imperative marker updates, no unnecessary re-renders
 * - Respects prefers-reduced-motion
 * - Skeleton placeholder while loading
 */
import { useEffect, useRef, useState, useCallback, memo, useMemo } from 'react';
import { Navigation, Locate } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ── Tile layer URLs (free, no API key) ──
const TILES_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILES_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

// ── Reduced-motion detection ──
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ── SVG marker icons (crisp at any DPI, no DOM nodes for Canvas renderer) ──
const MARKER_SVGS = {
  user: (color = '#3b82f6') => `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="13" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="6" fill="${color}" stroke="#fff" stroke-width="2.5"/>
    </svg>`,
  pickup: () => `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#3b82f6"/>
      <circle cx="16" cy="15" r="7" fill="#fff"/>
      <circle cx="16" cy="15" r="3.5" fill="#3b82f6"/>
    </svg>`,
  dropoff: () => `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#ef4444"/>
      <rect x="10" y="9" width="12" height="12" rx="2" fill="#fff"/>
      <rect x="13" y="12" width="6" height="6" rx="1" fill="#ef4444"/>
    </svg>`,
  vehicle: (heading = 0) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="17" fill="#22c55e" fill-opacity="0.15" stroke="#22c55e" stroke-width="1"/>
      <g transform="rotate(${heading}, 18, 18)">
        <path d="M18 6 L26 28 L18 22 L10 28 Z" fill="#22c55e" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
      </g>
    </svg>`,
  factory: () => `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <rect x="2" y="2" width="24" height="24" rx="6" fill="#e11d48" fill-opacity="0.9"/>
      <text x="14" y="19" text-anchor="middle" font-size="14" fill="#fff">🏭</text>
    </svg>`,
  bus: () => `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <rect x="2" y="2" width="24" height="24" rx="6" fill="#f59e0b" fill-opacity="0.9"/>
      <text x="14" y="19" text-anchor="middle" font-size="14" fill="#fff">🚌</text>
    </svg>`,
};

function svgToDataUrl(svgString) {
  return `data:image/svg+xml;base64,${btoa(svgString.trim())}`;
}

// ── Skeleton component ──
function MapSkeleton({ height, borderRadius }) {
  return (
    <div
      style={{
        width: '100%',
        height,
        borderRadius,
        background: 'var(--bg-glass)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, var(--bg-glass-heavy) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Locate size={20} style={{ opacity: 0.3, color: 'var(--text-muted)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Loading map…</span>
      </div>
    </div>
  );
}

// ── Interpolation helper for smooth vehicle movement ──
function interpolateLatLng(from, to, t) {
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
}

function calcHeading(from, to) {
  const dLng = (to.lng - from.lng) * Math.PI / 180;
  const lat1 = from.lat * Math.PI / 180;
  const lat2 = to.lat * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

// ══════════════════════════════════════════════════════════
// MapEngine Component
// ══════════════════════════════════════════════════════════
const MapEngine = memo(function MapEngine({
  height = '300px',
  fullScreen = false,
  userPos,
  // Markers arrays: [{ id, lat, lng, type, label, popup }]
  markers = [],
  // Active drivers: [{ id, lat, lng, type, number, heading }]
  drivers = [],
  // Route: { pickup: {lat,lng}, dropoff: {lat,lng}, waypoints: [[lat,lng],...] }
  route = null,
  // Show factory/zone markers
  showFactories = false,
  showBuses = false,
  // Event handlers
  onMapClick = null,
  onRecenter = null,
  // Map interaction config
  interactive = true,
  initialZoom = 14,
  // Geo-error flag
  geoError = false,
  geoErrorMessage = '📍 Showing Tumkur, KA (location unavailable)',
}) {
  const { isDark } = useTheme();
  const containerRef = useRef(null);
  const leafletRef = useRef(null);    // L module
  const mapRef = useRef(null);        // map instance
  const tileLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const driversLayerRef = useRef(null);
  const driverMarkersRef = useRef(new Map()); // id -> { marker, prevPos }
  const routeLayerRef = useRef(null);
  const factoryLayerRef = useRef(null);
  const animFrameRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const onMapClickRef = useRef(onMapClick);
  const [loaded, setLoaded] = useState(false);

  // Keep onMapClick ref current without re-initing the map
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

  // ── Initialize map (runs once) ──
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return;
      // Also load the CSS
      import('leaflet/dist/leaflet.css');

      leafletRef.current = L.default || L;
      const Lf = leafletRef.current;

      const reduced = prefersReducedMotion();

      const map = Lf.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        dragging: interactive,
        touchZoom: interactive,
        zoomAnimation: !reduced,
        markerZoomAnimation: !reduced,
        fadeAnimation: !reduced,
        // Use canvas renderer for better performance
        preferCanvas: true,
      }).setView([userPos.lat, userPos.lng], initialZoom);

      // Tile layer (theme-aware)
      const tileUrl = isDark ? TILES_DARK : TILES_LIGHT;
      const tileLayer = Lf.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: TILE_ATTR,
        // Retina support: requests @2x tiles on high-DPI screens
        detectRetina: true,
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Zoom control (bottom-right)
      Lf.control.zoom({ position: 'bottomright' }).addTo(map);

      // Map click handler
      map.on('click', (e) => {
        if (onMapClickRef.current) {
          onMapClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });

      // User location marker
      const userIcon = Lf.icon({
        iconUrl: svgToDataUrl(MARKER_SVGS.user()),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      userMarkerRef.current = Lf.marker([userPos.lat, userPos.lng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup('<b>📍 Your Location</b>');

      // Layer groups for drivers, routes, factories
      driversLayerRef.current = Lf.layerGroup().addTo(map);
      routeLayerRef.current = Lf.featureGroup().addTo(map);
      factoryLayerRef.current = Lf.layerGroup().addTo(map);

      // ResizeObserver instead of setTimeout
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserverRef.current = new ResizeObserver(() => {
          map.invalidateSize({ animate: false });
        });
        resizeObserverRef.current.observe(containerRef.current);
      } else {
        // Fallback for older browsers
        setTimeout(() => map.invalidateSize(), 300);
      }

      mapRef.current = map;
      setLoaded(true);
    });

    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // intentionally empty — map inits once

  // ── Switch tile layer when theme changes ──
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current || !leafletRef.current) return;
    const Lf = leafletRef.current;
    const tileUrl = isDark ? TILES_DARK : TILES_LIGHT;
    tileLayerRef.current.setUrl(tileUrl);
  }, [isDark]);

  // ── Update user marker position (imperative, no re-render) ──
  useEffect(() => {
    if (!userMarkerRef.current || !mapRef.current) return;
    const reduced = prefersReducedMotion();
    userMarkerRef.current.setLatLng([userPos.lat, userPos.lng]);
    // Only fly if no route is shown (otherwise fitBounds handles viewport)
    if (!route) {
      if (reduced) {
        mapRef.current.setView([userPos.lat, userPos.lng], mapRef.current.getZoom());
      } else {
        mapRef.current.flyTo([userPos.lat, userPos.lng], mapRef.current.getZoom(), { duration: 0.8 });
      }
    }
  }, [userPos.lat, userPos.lng, route]);

  // ── Update driver markers with smooth animation ──
  useEffect(() => {
    if (!mapRef.current || !driversLayerRef.current || !leafletRef.current) return;
    const Lf = leafletRef.current;
    const reduced = prefersReducedMotion();
    const existingIds = new Set();

    drivers.forEach((d) => {
      existingIds.add(d.id);
      const existing = driverMarkersRef.current.get(d.id);

      if (existing) {
        // Animate existing marker to new position
        const prev = existing.prevPos;
        const target = { lat: d.lat, lng: d.lng };
        const heading = calcHeading(prev, target);

        if (reduced) {
          existing.marker.setLatLng([target.lat, target.lng]);
        } else {
          // Smooth interpolation over 1 second
          let start = null;
          const duration = 1000;
          const animate = (ts) => {
            if (!start) start = ts;
            const t = Math.min((ts - start) / duration, 1);
            const eased = t * (2 - t); // ease-out quad
            const pos = interpolateLatLng(prev, target, eased);
            existing.marker.setLatLng([pos.lat, pos.lng]);
            if (t < 1) animFrameRef.current = requestAnimationFrame(animate);
          };
          animFrameRef.current = requestAnimationFrame(animate);
        }

        // Update icon with heading
        const newIcon = Lf.icon({
          iconUrl: svgToDataUrl(MARKER_SVGS.vehicle(calcHeading(prev, target))),
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        existing.marker.setIcon(newIcon);
        existing.prevPos = { lat: d.lat, lng: d.lng };
      } else {
        // Create new driver marker
        const icon = Lf.icon({
          iconUrl: svgToDataUrl(MARKER_SVGS.vehicle(0)),
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        const marker = Lf.marker([d.lat, d.lng], { icon })
          .addTo(driversLayerRef.current)
          .bindPopup(`<b>${d.type || 'Driver'}</b><br>${d.number || 'TC Vehicle'}`);
        driverMarkersRef.current.set(d.id, { marker, prevPos: { lat: d.lat, lng: d.lng } });
      }
    });

    // Remove markers for drivers that are no longer in the list
    for (const [id, { marker }] of driverMarkersRef.current) {
      if (!existingIds.has(id)) {
        driversLayerRef.current.removeLayer(marker);
        driverMarkersRef.current.delete(id);
      }
    }
  }, [drivers]);

  // ── Update route polyline ──
  useEffect(() => {
    if (!mapRef.current || !routeLayerRef.current || !leafletRef.current) return;
    const Lf = leafletRef.current;
    const reduced = prefersReducedMotion();

    routeLayerRef.current.clearLayers();

    if (!route) return;

    const { pickup, dropoff, waypoints } = route;

    // Pickup marker
    if (pickup) {
      const pickupIcon = Lf.icon({
        iconUrl: svgToDataUrl(MARKER_SVGS.pickup()),
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
      });
      Lf.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
        .addTo(routeLayerRef.current)
        .bindPopup('<b>Pickup</b>');
    }

    // Dropoff marker
    if (dropoff) {
      const dropoffIcon = Lf.icon({
        iconUrl: svgToDataUrl(MARKER_SVGS.dropoff()),
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
      });
      Lf.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon })
        .addTo(routeLayerRef.current)
        .bindPopup(`<b>Drop-off</b>`);
    }

    // Route polyline
    const points = waypoints && waypoints.length > 0
      ? waypoints
      : [pickup && [pickup.lat, pickup.lng], dropoff && [dropoff.lat, dropoff.lng]].filter(Boolean);

    if (points.length >= 2) {
      // Styled route line
      // Shadow line for depth
      Lf.polyline(points, {
        color: 'rgba(0,0,0,0.3)',
        weight: 8,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeLayerRef.current);

      // Main line
      Lf.polyline(points, {
        color: '#3b82f6',
        weight: 5,
        lineCap: 'round',
        lineJoin: 'round',
        opacity: 0.9,
      }).addTo(routeLayerRef.current);

      // Fit bounds
      const bounds = Lf.latLngBounds(points);
      mapRef.current.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 16,
        animate: !reduced,
        duration: 0.6,
      });
    }
  }, [route]);

  // ── Factory & bus markers ──
  useEffect(() => {
    if (!mapRef.current || !factoryLayerRef.current || !leafletRef.current) return;
    const Lf = leafletRef.current;

    factoryLayerRef.current.clearLayers();

    if (showFactories || showBuses) {
      const FACTORIES = [
        { lat: 13.348, lng: 77.128, name: 'Sri Sai Auto Components', type: 'factory' },
        { lat: 13.325, lng: 77.108, name: 'Tumkur Machining Hub', type: 'factory' },
        { lat: 13.355, lng: 77.105, name: 'Precision Parts Ltd', type: 'factory' },
        { lat: 13.332, lng: 77.135, name: 'KIADB Industrial Area', type: 'zone' },
      ];

      if (showFactories) {
        FACTORIES.forEach((f) => {
          const icon = Lf.icon({
            iconUrl: svgToDataUrl(MARKER_SVGS.factory()),
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          Lf.marker([f.lat, f.lng], { icon })
            .addTo(factoryLayerRef.current)
            .bindPopup(`<b>${f.name}</b><br><span style="color:#94a3b8">Industrial Zone, Tumkur</span>`);
        });
      }

      if (showBuses) {
        const BUSES = [
          { lat: 13.342, lng: 77.122, label: 'T-04', capacity: '32/40' },
          { lat: 13.329, lng: 77.132, label: 'T-07', capacity: '28/40' },
          { lat: 13.351, lng: 77.112, label: 'T-02', capacity: '35/40' },
        ];
        BUSES.forEach((b) => {
          const icon = Lf.icon({
            iconUrl: svgToDataUrl(MARKER_SVGS.bus()),
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          Lf.marker([b.lat, b.lng], { icon })
            .addTo(factoryLayerRef.current)
            .bindPopup(`<b>Bus ${b.label}</b><br>Passengers: ${b.capacity}<br><span style="color:#10b981">▶ En Route</span>`);
        });
      }
    }
  }, [showFactories, showBuses]);

  // ── Recenter button handler ──
  const handleRecenter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (mapRef.current) {
      const reduced = prefersReducedMotion();
      if (reduced) {
        mapRef.current.setView([userPos.lat, userPos.lng], 15);
      } else {
        mapRef.current.flyTo([userPos.lat, userPos.lng], 15, { duration: 0.6 });
      }
    }
    onRecenter?.();
  }, [userPos.lat, userPos.lng, onRecenter]);

  const borderRadius = fullScreen ? 0 : 16;

  return (
    <div
      style={{
        position: 'relative',
        height,
        width: '100%',
        borderRadius,
        overflow: 'hidden',
        border: fullScreen ? 'none' : '1px solid var(--border)',
        contain: 'layout style paint',
      }}
    >
      {/* Skeleton shown until Leaflet loads */}
      {!loaded && <MapSkeleton height={height} borderRadius={borderRadius} />}

      {/* Map container */}
      <div
        ref={containerRef}
        style={{
          height: '100%',
          width: '100%',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Recenter button */}
      <button
        onClick={handleRecenter}
        aria-label="Recenter on my location"
        style={{
          position: 'absolute',
          bottom: fullScreen ? 120 : 80,
          right: 10,
          zIndex: 400,
          background: 'var(--bg-glass-heavy)',
          backdropFilter: 'blur(8px)',
          color: '#3b82f6',
          border: '1px solid var(--border)',
          borderRadius: '50%',
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <Navigation size={20} />
      </button>

      {/* Geo-error banner */}
      {geoError && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-glass-heavy)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: 9999,
            zIndex: 20,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {geoErrorMessage}
        </div>
      )}
    </div>
  );
});

export default MapEngine;

// ── Utility: fetch route from OSRM (free) ──
export async function fetchRoute(from, to, signal) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return null;

    const route = data.routes[0];
    const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    return {
      waypoints: coords,
      distance: route.distance, // meters
      duration: route.duration, // seconds
    };
  } catch (e) {
    if (e.name === 'AbortError') return null;
    console.warn('OSRM route fetch failed:', e);
    return null;
  }
}

// ── Utility: format distance and ETA ──
export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m`;
}
