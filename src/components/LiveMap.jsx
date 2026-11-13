/**
 * LiveMap — Thin wrapper around MapEngine.
 * Used by CompanyBus, DriverDashboard, and anywhere a general-purpose map is needed.
 * Handles geolocation and passes props to MapEngine.
 */
import { useEffect, useState, useRef, useMemo } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import MapEngine, { fetchRoute } from './MapEngine';

const TUMKUR = { lat: 13.3379, lng: 77.1173 };

export default function LiveMap({
  height = '300px',
  showBuses = false,
  showRoute = false,
  fullScreen = false,
  activeRide = null,
}) {
  const [userPos, setUserPos] = useState(TUMKUR);
  const [geoError, setGeoError] = useState(false);

  // ── Get user geolocation on mount ──
  useEffect(() => {
    let mounted = true;
    const fetchLoc = async () => {
      try {
        if (window.Capacitor?.isNativePlatform?.()) {
          const perm = await Geolocation.checkPermissions();
          if (perm.location !== 'granted') {
            await Geolocation.requestPermissions();
          }
          const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
          if (mounted) {
            setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setGeoError(false);
          }
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (mounted) {
                setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setGeoError(false);
              }
            },
            () => { if (mounted) setGeoError(true); },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          if (mounted) setGeoError(true);
        }
      } catch {
        if (mounted) setGeoError(true);
      }
    };
    fetchLoc();
    return () => { mounted = false; };
  }, []);

  // ── Fetch real road route if activeRide has pickup & dropoff ──
  const [routeWaypoints, setRouteWaypoints] = useState(null);
  const routeAbortRef = useRef(null);

  useEffect(() => {
    if (activeRide?.pickupPos && activeRide?.dropoffPos) {
      if (routeAbortRef.current) routeAbortRef.current.abort();
      const controller = new AbortController();
      routeAbortRef.current = controller;

      fetchRoute(activeRide.pickupPos, activeRide.dropoffPos, controller.signal).then(res => {
        if (res?.waypoints) setRouteWaypoints(res.waypoints);
      });
      return () => controller.abort();
    } else {
      setRouteWaypoints(null);
    }
  }, [activeRide?.pickupPos?.lat, activeRide?.pickupPos?.lng, activeRide?.dropoffPos?.lat, activeRide?.dropoffPos?.lng]);

  // ── Build route prop for MapEngine ──
  const route = useMemo(() => {
    if (activeRide?.pickupPos) {
      return {
        pickup: activeRide.pickupPos,
        dropoff: activeRide.dropoffPos || null,
        waypoints: routeWaypoints,
      };
    }
    if (showRoute) {
      return {
        pickup: userPos,
        dropoff: { lat: 13.348, lng: 77.128 }, // Default factory
        waypoints: null,
      };
    }
    return null;
  }, [activeRide, routeWaypoints, showRoute, userPos]);

  return (
    <MapEngine
      height={height}
      fullScreen={fullScreen}
      userPos={userPos}
      route={route}
      showFactories={true}
      showBuses={showBuses}
      geoError={geoError}
    />
  );
}
