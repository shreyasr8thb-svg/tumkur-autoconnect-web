/**
 * DriverDashboard – Driver Portal
 * - Full-screen drive mode with map, ride requests, OTP verification
 * - Trip logs, Community Feed, Chat via DashboardShell
 */
import { useState, useEffect } from 'react';
import { Navigation, Users, User, AlertTriangle, Check, Scan, Car, MapPin, ClipboardList } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';
import DashboardShell from './DashboardShell';
import ProfileView from './ProfileView';
import LiveMap from './LiveMap';

export default function DriverDashboard() {
  const { profile, signOut } = useUser();
  const [tab, setTab] = useState('drive');
  const [active, setActive] = useState(false);

  const tabs = [
    { id: 'drive',      label: 'Drive Mode', icon: <Car size={18} /> },
    { id: 'trips',      label: 'Trip Logs',  icon: <ClipboardList size={18} /> },
    { id: 'profile',   label: 'Profile',    icon: <User size={18} /> },
  ];

  return (
    <>
      {tab === 'drive' && <DriveMode active={active} setActive={setActive} onMenu={() => setTab('trips')} />}
      {tab !== 'drive' && (
        <DashboardShell role="Driver" title="Driver Portal" tabs={tabs} activeTab={tab} setActiveTab={setTab}>
          {tab === 'trips'   && <TripLogs />}
          {tab === 'profile' && <ProfileView onNavigate={setTab} />}
        </DashboardShell>
      )}
    </>
  );
}

/* ── Drive Mode (full screen) ── */
function DriveMode({ active, setActive, onMenu }) {
  const { user, profile, showToast } = useUser();
  const [pendingRides, setPendingRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [otpInput, setOtpInput] = useState('');

  useEffect(() => {
    if (!active) { setPendingRides([]); return; }
    const q = query(collection(db, 'rides'), where('status', '==', 'pending'));
    return onSnapshot(q, snap => setPendingRides(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [active]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'rides'), where('driverId', '==', user.uid));
    return onSnapshot(q, snap => {
      if (!snap.empty) setActiveRide({ id: snap.docs[0].id, ...snap.docs[0].data() });
      else setActiveRide(null);
    });
  }, [user]);

  const acceptRide = async (ride) => {
    await updateDoc(doc(db, 'rides', ride.id), {
      status: 'accepted',
      driverId: user.uid,
      driverName: profile?.fullName || 'Driver',
      vehicleModel: profile?.vehicleModel || 'Industrial Shuttle',
      vehicleNumber: profile?.vehicleNumber || 'KA-00-0000',
    });
  };

  const startTrip = async () => {
    if (otpInput === activeRide?.otp) {
      await updateDoc(doc(db, 'rides', activeRide.id), { status: 'in-progress' });
      setOtpInput('');
    } else { showToast?.('Invalid OTP — ask passenger for their code'); }
  };

  const completeRide = async () => {
    if (activeRide) await deleteDoc(doc(db, 'rides', activeRide.id));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10, background: '#0d1117' }}>
      {/* Map */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <LiveMap height="100%" showRoute={!!activeRide} fullScreen />
      </div>

      {/* Top bar overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 30, background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: active ? '#22c55e' : '#64748b', boxShadow: active ? '0 0 8px #22c55e' : 'none' }} />
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>{active ? (activeRide ? 'ON TRIP' : 'ONLINE') : 'OFFLINE'}</span>
        </div>
        <button onClick={onMenu} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f8fafc', padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ClipboardList size={14} /> Trips
        </button>
      </div>

      {/* Incoming requests (when online, no active ride) */}
      {active && !activeRide && pendingRides.length > 0 && (
        <div style={{ position: 'absolute', top: 70, left: 12, right: 12, zIndex: 40, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pendingRides.slice(0, 3).map(r => (
            <div key={r.id} style={{ background: 'rgba(10,20,40,0.95)', border: '2px solid #3b82f6', borderRadius: 16, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>{r.workerName}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {r.dropoff}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{r.vehicleType}</div>
              </div>
              <button onClick={() => acceptRide(r)} style={{ background: '#3b82f6', border: 'none', borderRadius: 12, padding: '10px 18px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Sheet */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30, background: '#0f172a', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '1.25rem', boxShadow: '0 -6px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none' }}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 16px' }} />

        {!active && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingBottom: 8 }}>
            <h3 style={{ margin: 0 }}>You're Offline</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>Go online to start receiving ride requests from workers.</p>
            <button onClick={() => setActive(true)} style={{ width: '100%', padding: '1rem', borderRadius: 14, background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(34,197,94,0.35)' }}>
              GO ONLINE
            </button>
          </div>
        )}

        {active && !activeRide && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingBottom: 8 }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(59,130,246,0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Waiting for ride requests…</p>
            <button onClick={() => setActive(false)} style={{ width: '100%', padding: '0.85rem', borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontWeight: 700, cursor: 'pointer' }}>
              GO OFFLINE
            </button>
          </div>
        )}

        {activeRide && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 700, letterSpacing: '0.06em' }}>ACTIVE TRIP</div>
              <h3 style={{ margin: '2px 0' }}>Passenger: {activeRide.workerName}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Drop-off: {activeRide.dropoff}</p>
            </div>
            {activeRide.status === 'accepted' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text" maxLength={4} value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  placeholder="Enter OTP"
                  style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', padding: '0.75rem', fontSize: '1.2rem', letterSpacing: 4, fontWeight: 700, textAlign: 'center' }}
                />
                <button onClick={startTrip} style={{ padding: '0 1.5rem', background: '#3b82f6', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                  Start Trip
                </button>
              </div>
            ) : (
              <button onClick={completeRide} style={{ padding: '1rem', borderRadius: 14, background: '#22c55e', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Check size={18} /> Complete Trip
              </button>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}

/* ── Trip Logs ── */
function TripLogs() {
  const { user } = useUser();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    // Listen for completed trips (deleted from rides, but can track in a trips collection)
    // For now show empty state — trips are removed from rides doc on completion
    setTrips([]);
  }, []);

  return (
    <div className="flex-col gap-3">
      <h3 style={{ margin: 0 }}>Trip History</h3>
      <div className="grid-2">
        <div className="glass-card flex-col items-center">
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>0</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>TODAY'S TRIPS</div>
        </div>
        <div className="glass-card flex-col items-center">
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>₹0</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>TODAY'S EARNINGS</div>
        </div>
      </div>
      <div className="glass-card text-center" style={{ color: 'var(--text-muted)', padding: '2rem' }}>
        No trips completed yet.<br />
        <span style={{ fontSize: '0.78rem' }}>Go online in Drive Mode to start accepting rides.</span>
      </div>
    </div>
  );
}
