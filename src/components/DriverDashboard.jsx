import { useState, useEffect } from 'react';
import { Truck, Navigation, Users, User, AlertTriangle, Power, MessageSquare, Check, Menu, X, Bell, Scan, Car } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';
import LiveMap from './LiveMap';
import ProfileView from './ProfileView';
import AppFooter from './AppFooter';
import NotificationsPanel from './NotificationsPanel';
import RideHailing from './RideHailing';

export default function DriverDashboard() {
  const { profile, signOut } = useUser();
  const [tab, setTab] = useState('drive');
  const [active, setActive] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const name = profile?.fullName || profile?.email?.split('@')[0] || 'Driver';

  return (
    <div className="flex-col" style={{ flex: 1, position: 'relative' }}>
      {tab !== 'drive' && <TopBar name={name} photo={profile?.photoURL} onProfile={() => setTab('profile')} active={active} onNotif={() => setShowNotifs(true)} onMenu={() => setShowMenu(true)} />}
      
      <div className={`screen ${tab === 'drive' ? 'p-0' : ''}`} style={{ overflowY: 'auto', paddingBottom: '90px' }}>
        {tab === 'drive' && <DriveMode active={active} setActive={setActive} />}
        {tab === 'passengers' && <Passengers />}
        {tab === 'bus' && <RideHailing />}
        {tab === 'profile' && <div className="p-4"><ProfileView onNavigate={setTab} /></div>}
        {tab !== 'drive' && tab !== 'bus' && <AppFooter />}
      </div>
      
      <BottomNav tab={tab} setTab={setTab} tabs={[
        { id: 'drive', icon: <Navigation size={20}/>, label: 'Drive' },
        { id: 'passengers', icon: <Users size={20}/>, label: 'Trips' },
        { id: 'bus', icon: <Car size={20}/>, label: 'Book Ride' },
        { id: 'profile', icon: <User size={20}/>, label: 'Profile' },
      ]} />

      {/* Notifications Panel */}
      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}

      {/* Menu Panel */}
      {showMenu && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}>
          <div className="glass-card flex-col" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '70%', maxWidth: '280px', background: 'rgba(15, 23, 42, 0.95)', borderRadius: '0', animation: 'fadeIn 0.2s' }}>
            <div className="flex justify-between items-center p-4 border-b-dark">
              <h3 style={{ margin: 0 }}>Menu</h3>
              <X size={24} color="#94a3b8" onClick={() => setShowMenu(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div className="p-4 flex-col gap-4">
              <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => { setShowMenu(false); setTab('profile'); }}><User size={20} color="#94a3b8" /> <span>Profile</span></div>
              <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => { setShowMenu(false); setTab('drive'); }}><Navigation size={20} color="#94a3b8" /> <span>Drive Mode</span></div>
              <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => { setShowMenu(false); setTab('passengers'); }}><Users size={20} color="#94a3b8" /> <span>Trips</span></div>
              <div className="flex items-center gap-3" style={{ cursor: 'pointer', color: '#f87171', marginTop: 'auto' }} onClick={signOut}><AlertTriangle size={20} color="#f87171" /> <span>Logout</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TopBar({ name, photo, onProfile, active, onNotif, onMenu }) {
  return (
    <div className="top-bar">
      <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={onProfile}>
        {photo ? <img src={photo} className="avatar-sm" alt="" style={{ objectFit: 'cover' }} /> : <div className="avatar-sm">{name.charAt(0)}</div>}
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bus Driver</div>
          <div style={{ fontWeight: 600 }}>{name}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`badge-${active ? 'green' : 'gray'}`}>{active ? 'ONLINE' : 'OFFLINE'}</div>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onNotif}>
          <Bell size={22} color="#64748b" />
        </div>
        <Menu size={24} color="#f8fafc" style={{ cursor: 'pointer' }} onClick={onMenu} />
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab, tabs }) {
  return (
    <div className="bottom-nav">
      {tabs.map(t => (
        <div key={t.id} className={`nav-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
          {t.icon}<span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

function DriveMode({ active, setActive }) {
  const { user, profile, showToast } = useUser();
  const [pendingRides, setPendingRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [otpInput, setOtpInput] = useState('');

  useEffect(() => {
    if (!active) { setPendingRides([]); return; }
    const q = query(collection(db, 'rides'), where('status', '==', 'pending'));
    const unsub = onSnapshot(q, (snap) => {
      setPendingRides(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [active]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'rides'), where('driverId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setActiveRide({ id: docSnap.id, ...docSnap.data() });
      } else {
        setActiveRide(null);
      }
    });
    return () => unsub();
  }, [user]);

  const acceptRide = async (ride) => {
    await updateDoc(doc(db, 'rides', ride.id), {
      status: 'accepted', 
      driverId: user.uid, 
      driverName: profile?.fullName || 'Driver',
      driverPhoto: profile?.photoURL || '',
      vehicleModel: profile?.vehicleModel || 'Industrial Shuttle',
      vehicleNumber: profile?.vehicleNumber || 'KA-XX-XXXX'
    });
  };

  const startTrip = async () => {
    if (otpInput === activeRide.otp) {
      await updateDoc(doc(db, 'rides', activeRide.id), { status: 'in-progress' });
      showToast('Trip Started!');
      setOtpInput('');
    } else {
      showToast('Invalid OTP');
    }
  };

  const completeRide = async () => {
    if (!activeRide) return;
    await deleteDoc(doc(db, 'rides', activeRide.id));
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Full Screen Map */}
      <div style={{ position: 'absolute', inset: 0, bottom: '60px' }}>
        <LiveMap height="100%" showRoute={!!activeRide} fullScreen={true} />
      </div>

      {/* Floating Status Bar at Top */}
      <div style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 40 }} className="flex justify-between items-start">
        <div className="glass-card flex items-center gap-2 px-4 py-2" style={{ borderRadius: 30, background: 'rgba(2, 6, 23, 0.85)' }}>
           <div className={`status-dot ${active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} style={{ width:10, height:10, borderRadius:'50%' }}></div>
           <strong style={{ fontSize: '0.85rem' }}>{active ? (activeRide ? 'ON TRIP' : 'ONLINE') : 'OFFLINE'}</strong>
        </div>
        {active && (
          <div className="glass-card flex-col items-center p-2" style={{ borderRadius: 16, background: 'rgba(2, 6, 23, 0.85)' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Earnings</span>
            <strong style={{ color: '#4ade80' }}>₹840</strong>
          </div>
        )}
      </div>

      {/* Incoming Ride Requests Overlay */}
      {active && !activeRide && pendingRides.length > 0 && (
        <div style={{ position: 'absolute', top: 80, left: 10, right: 10, zIndex: 50, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pendingRides.map(r => (
            <div key={r.id} className="glass-card flex justify-between items-center" style={{ background: 'rgba(15, 23, 42, 0.95)', border: '2px solid #3b82f6' }}>
              <div>
                <strong style={{ fontSize: '1.1rem', color: '#f8fafc' }}>{r.workerName}</strong>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>To: {r.dropoff}</div>
              </div>
              <button className="btn btn-primary flex items-center gap-2" style={{ background: '#3b82f6', border: 'none' }} onClick={() => acceptRide(r)}>
                <Check size={16} /> Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Sheet Overlay */}
      <div className="driver-bottom-sheet glass-card" style={{ 
        position: 'absolute', bottom: 80, left: 10, right: 10, 
        zIndex: 40, padding: '1.5rem', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)' 
      }}>
        {!active ? (
          <div className="flex-col items-center gap-4">
            <h2 style={{ margin: 0 }}>You're Offline</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>Go online to start receiving passenger ride requests.</p>
            <button 
              className="btn btn-primary w-100" 
              style={{ padding: '1.2rem', fontSize: '1.1rem', borderRadius: 30, background: 'linear-gradient(135deg, #16a34a, #22c55e)', border: 'none' }}
              onClick={() => setActive(true)}
            >
              GO ONLINE
            </button>
          </div>
        ) : activeRide ? (
          <div className="flex-col gap-4">
            <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
               <div>
                 <h3 style={{ margin: 0, color: '#f8fafc' }}>Pick Up {activeRide.workerName}</h3>
                 <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Dropoff: {activeRide.dropoff}</p>
               </div>
               <div className="flex items-center justify-center bg-red-500" style={{ width: 45, height: 45, borderRadius: '50%' }}>
                 <Navigation size={24} color="#fff" />
               </div>
            </div>
            
            {activeRide.status === 'accepted' ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="input-field flex-1 text-center" 
                  placeholder="Enter 4-digit OTP" 
                  maxLength={4}
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  style={{ fontSize: '1.2rem', letterSpacing: 4, background: 'rgba(0,0,0,0.3)' }}
                />
                <button className="btn btn-primary" style={{ padding: '0 1.5rem', background: '#3b82f6', border: 'none' }} onClick={startTrip}>
                  Start Trip
                </button>
              </div>
            ) : (
              <button className="btn btn-primary w-100" style={{ padding: '1rem', borderRadius: 30, background: '#22c55e', border: 'none' }} onClick={completeRide}>
                Complete Trip
              </button>
            )}
          </div>
        ) : (
           <div className="flex-col items-center gap-3">
             <div className="spinner" style={{ borderColor: '#333', borderTopColor: '#3b82f6' }}></div>
             <p style={{ margin: 0, color: '#94a3b8' }}>Finding passengers...</p>
             <button 
              className="btn btn-ghost w-100 mt-2" 
              style={{ padding: '1rem', borderRadius: 30, border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171' }}
              onClick={() => setActive(false)}
            >
              GO OFFLINE
            </button>
           </div>
        )}
      </div>
    </div>
  );
}

function Passengers() {
  const [scanMode, setScanMode] = useState(false);
  const [scans, setScans] = useState([
    { id: '1', name: "Ramesh K.", passId: "TMR-4492", time: "07:46 AM" },
    { id: '2', name: "Suresh M.", passId: "TMR-1123", time: "07:45 AM" },
    { id: '3', name: "Kiran J.", passId: "TMR-8891", time: "07:32 AM" }
  ]);

  const handleSimulateScan = () => {
    setScans([{ 
      id: Date.now().toString(), 
      name: "Verified User", 
      passId: "TMR-1234", 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    }, ...scans]);
    setScanMode(false);
  };

  return (
    <div className="flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h2 style={{ margin: 0 }}>Trip Logs</h2>
        <div className="badge-outline">Today</div>
      </div>
      <div className="grid-2">
         <div className="glass-card flex-col items-center p-3">
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Trips</span>
            <strong style={{ fontSize: '1.5rem', color: '#f8fafc' }}>4</strong>
         </div>
         <div className="glass-card flex-col items-center p-3">
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Passengers</span>
            <strong style={{ fontSize: '1.5rem', color: '#f8fafc' }}>{142 + scans.length - 3}</strong>
         </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <h3 style={{ margin: 0 }}>Recent Scans (Route T-04)</h3>
        <button className="btn btn-outline-sm flex items-center gap-2" onClick={() => setScanMode(true)}>
          <Scan size={14} /> Scan Pass
        </button>
      </div>
      
      {scanMode && (
        <div className="glass-card flex-col items-center gap-3">
           <div style={{ width: '100%', height: 200, background: '#000', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Camera Viewfinder Active</span>
           </div>
           <button className="btn btn-primary w-100 flex items-center justify-center gap-2" onClick={handleSimulateScan}>
              <Check size={16} /> Simulate Scan Success
           </button>
           <button className="btn btn-ghost w-100" onClick={() => setScanMode(false)}>Cancel</button>
        </div>
      )}

      <div className="glass-card flex-col gap-2">
         {scans.map(s => (
           <ScanRow key={s.id} name={s.name} id={s.passId} time={s.time} />
         ))}
      </div>
    </div>
  );
}

function ScanRow({ name, id, time }) {
  return (
    <div className="flex justify-between items-center pb-2 border-b-dark" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div>
        <strong style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{name}</strong>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {id}</div>
      </div>
      <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>✓ {time}</span>
    </div>
  );
}
