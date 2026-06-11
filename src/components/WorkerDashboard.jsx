import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, ShieldCheck, Bus, Car, Search, IndianRupee, CreditCard, ChevronRight, Navigation, User, Settings, Unlink, Link as LinkIcon, MessageSquare, Image, Upload, Menu, X, Home as HomeIcon, Grid, Calendar, LogOut, Plus } from 'lucide-react';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';
import LiveMap from './LiveMap';
import ProfileView from './ProfileView';
import AppFooter from './AppFooter';
import QRCode from 'react-qr-code';
import logo from '../assets/logo.png';

export default function WorkerDashboard({ onSOS }) {
  const { profile, signOut } = useUser();
  const [tab, setTab] = useState('home');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const name = profile?.fullName || profile?.email?.split('@')[0] || 'User';

  return (
    <div className="flex-col" style={{ flex: 1, position: 'relative' }}>
      <TopBar name={name} photo={profile?.photoURL} onProfile={() => setTab('profile')} badge="Worker" onNotif={() => setShowNotifs(true)} onMenu={() => setShowMenu(true)} />
      <div className="screen" style={{ overflowY: 'auto' }}>
        {tab === 'home' && <Home onSOS={onSOS} go={setTab} />}
        {tab === 'passport' && <SkillPassport />}
        {tab === 'salary' && <Salary />}
        {tab === 'bus' && <RideHailing />}
        {tab === 'access' && <SmartAccess />}
        {tab === 'profile' && <ProfileView onNavigate={setTab} />}
        <AppFooter />
      </div>
      <BottomNav tab={tab} setTab={setTab} tabs={[
        { id: 'home', icon: <span style={{ fontSize: '1.2rem' }}>🏠</span>, label: 'Home' },
        { id: 'access', icon: <span style={{ fontSize: '1.2rem' }}>💳</span>, label: 'Access' },
        { id: 'bus', icon: <span style={{ fontSize: '1.2rem' }}>🚕</span>, label: 'Ride' },
        { id: 'profile', icon: <span style={{ fontSize: '1.2rem' }}>👤</span>, label: 'Profile' },
      ]} />

      {/* Notifications Panel */}
      {showNotifs && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}>
          <div className="glass-card flex-col" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '80%', maxWidth: '320px', background: 'rgba(15, 23, 42, 0.95)', borderRadius: '0', animation: 'fadeIn 0.2s' }}>
            <div className="flex justify-between items-center p-4 border-b-dark">
              <h3 style={{ margin: 0 }}>Notifications</h3>
              <X size={24} color="#94a3b8" onClick={() => setShowNotifs(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div className="p-4 flex-col gap-3" style={{ overflowY: 'auto' }}>
              <div className="info-box">System update: Server maintenance at 2 AM.</div>
              <div className="info-box" style={{ borderColor: '#f87171' }}>HR: Action required on your skill passport.</div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Panel */}
      {showMenu && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, animation: 'fadeIn 0.2s' }}>
          <div className="flex-col" style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '85%', maxWidth: '320px', background: '#020617', borderRight: '1px solid rgba(255,255,255,0.05)', animation: 'slideInLeft 0.3s forwards' }}>
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b-dark" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2">
                <div style={{ background: '#e11d48', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>TC</div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>Tumkuru Connect</h3>
              </div>
              <X size={24} color="#94a3b8" onClick={() => setShowMenu(false)} style={{ cursor: 'pointer' }} />
            </div>

            {/* Profile Card */}
            <div className="p-4 border-b-dark" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }} onClick={() => { setShowMenu(false); setTab('profile'); }}>
                <div className="flex items-center gap-3">
                  {profile?.photoURL ? <img src={profile.photoURL} alt="" className="avatar-sm" style={{ objectFit: 'cover', borderRadius: '8px' }} /> : <div className="avatar-sm" style={{ borderRadius: '8px' }}>{name.charAt(0)}</div>}
                  <div className="overflow-hidden" style={{ width: '130px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{profile?.email || 'user@example.com'}</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#64748b" />
              </div>
            </div>

            {/* Create Button */}
            <div className="p-4">
              <button className="btn w-100 flex items-center justify-center gap-2" style={{ padding: '0.9rem', borderRadius: '12px', background: '#e11d48', color: '#fff', boxShadow: 'none' }} onClick={() => { setShowMenu(false); setTab('bus'); }}>
                <Plus size={18} />
                <span>Request New Ride</span>
              </button>
            </div>

            {/* Navigation List */}
            <div className="flex-col gap-1 p-2" style={{ flex: 1, overflowY: 'auto' }}>
              <MenuLink icon={<Bell size={20} />} label="Notifications" onClick={() => { setShowMenu(false); setShowNotifs(true); }} />
              <MenuLink icon={<HomeIcon size={20} />} label="Home" onClick={() => { setShowMenu(false); setTab('home'); }} />
              <MenuLink icon={<Grid size={20} />} label="Skill Passport" onClick={() => { setShowMenu(false); setTab('passport'); }} />
              <MenuLink icon={<Calendar size={20} />} label="Events & Workshops" onClick={() => { setShowMenu(false); alert('Events coming soon!'); }} />
              <MenuLink icon={<IndianRupee size={20} />} label="Salary Info" onClick={() => { setShowMenu(false); setTab('salary'); }} />
            </div>

            {/* Sign Out */}
            <div className="p-4 border-t-dark" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <MenuLink icon={<LogOut size={20} />} label="Sign Out" onClick={signOut} />
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Shared UI ─── */
function TopBar({ name, photo, onProfile, badge, onNotif, onMenu }) {
  return (
    <div className="top-bar">
      <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={onProfile}>
        {photo ? <img src={photo} className="avatar-sm" alt="" style={{ objectFit: 'cover' }} /> : <div className="avatar-sm">{name.charAt(0)}</div>}
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{badge || 'Welcome'}</div>
          <div style={{ fontWeight: 600 }}>{name}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onNotif}>
          <Bell size={22} color="#64748b" />
          <div className="notif-dot" style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }} />
        </div>
        <Menu size={24} color="#f8fafc" style={{ cursor: 'pointer' }} onClick={onMenu} />
      </div>
    </div>
  );
}

function MenuLink({ icon, label, onClick }) {
  return (
    <div className="flex items-center gap-3" style={{ padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer', color: '#cbd5e1', transition: 'background 0.2s' }} onClick={onClick} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      <span style={{ color: '#94a3b8' }}>{icon}</span>
      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{label}</span>
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

/* ─── Home ─── */
function Home({ onSOS, go }) {
  return (
    <div className="flex-col gap-3">
      <div className="sos-card">
        <button onClick={onSOS} className="btn btn-sos">
          <AlertTriangle size={28} />
          <span>EMERGENCY SOS</span>
        </button>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>Tap to alert Factory Security & Police</p>
      </div>
      <h3 style={{ color: '#e2e8f0' }}>Quick Access</h3>
      <div className="grid-2">
        <QCard icon={<ShieldCheck size={24} color="#f87171"/>} title="Skill Passport" sub="Your badges" onClick={() => go('passport')} />
        <QCard icon={<Car size={24} color="#f87171"/>} title="Book Ride" sub="Factory cab" onClick={() => go('bus')} />
        <QCard icon={<IndianRupee size={24} color="#f87171"/>} title="Earnings" sub="Salary details" onClick={() => go('salary')} />
        <QCard icon={<CreditCard size={24} color="#f87171"/>} title="Smart Access" sub="Card & Canteen" onClick={() => go('access')} />
      </div>
    </div>
  );
}

function QCard({ icon, title, sub, onClick }) {
  return (
    <div className="glass-card flex-col gap-2 action-card" style={{ padding: '1rem', cursor: 'pointer' }} onClick={onClick}>
      <div className="icon-box">{icon}</div>
      <strong style={{ fontSize: '0.9rem' }}>{title}</strong>
      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{sub}</span>
    </div>
  );
}

/* ─── Skill Passport ─── */
function SkillPassport() {
  const { profile } = useUser();
  const certRef = useRef(null);
  const [certs, setCerts] = useState([]);

  const handleCert = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setCerts([...certs, r.result]);
      r.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-col gap-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="avatar-md">{(profile?.fullName||'U').charAt(0)}</div>
        <div><h2 style={{ margin: 0 }}>{profile?.fullName || 'User'}</h2><p style={{ margin: 0 }}>ID: {profile?.employeeId} • {profile?.department || 'Dept'}</p></div>
      </div>
      
      <div className="flex justify-between items-center">
        <h3 style={{ margin: 0 }}>Badges & Certs</h3>
        <button className="btn btn-outline-sm flex items-center gap-2" onClick={() => certRef.current?.click()}>
          <Upload size={14} /> Add Cert
        </button>
        <input ref={certRef} type="file" accept="image/*" hidden onChange={handleCert} />
      </div>

      {certs.length === 0 ? (
        <div className="glass-card mt-2 text-center p-3" style={{ color: '#94a3b8' }}>No certificates uploaded yet.</div>
      ) : certs.map((c, i) => (
        <div key={i} className="glass-card flex-col gap-2 p-2 mt-2">
           <div className="flex justify-between items-center px-2">
             <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Uploaded Certificate</span>
             <span className="badge-warning">Pending Auth</span>
           </div>
           <img src={c} alt="cert" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
        </div>
      ))}

      <div className="glass-card mt-2">
        <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Career Path</h3>
        <div className="text-center p-3" style={{ color: '#94a3b8' }}>Update your skills to generate career path.</div>
        <button className="btn btn-outline-red mt-3 w-100">Request Badge Verification</button>
      </div>
    </div>
  );
}

function PathNode({ title, sub, status }) {
  const dotClass = status === 'done' ? 'dot-done' : status === 'current' ? 'dot-current' : 'dot-locked';
  return <div className="path-node"><div className={`path-dot ${dotClass}`} /><strong style={{ color: status === 'locked' ? '#475569' : '#e2e8f0' }}>{title}</strong><span style={{ fontSize: '0.75rem', color: status === 'done' ? '#4ade80' : '#64748b' }}>{sub}</span></div>;
}

/* ─── Salary ─── */
function Salary() {
  const { profile } = useUser();
  const base = Number(profile?.baseSalary) || 0;
  const pf = Number(profile?.pfDeduction) || 0;
  const welfare = Number(profile?.welfareBonus) || 0;
  const takeHome = base - pf + welfare;

  return (
    <div className="flex-col gap-3">
      <div className="text-center mb-2"><h2 style={{ color: '#f87171' }}>Your Earnings</h2></div>
      <div className="glass-card" style={{ borderTop: '3px solid #f87171' }}>
        <h4>Monthly Take Home</h4>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0' }}>₹{takeHome.toLocaleString()}</div>
        <SRow l="Base Salary" v={`₹${base.toLocaleString()}`} />
        <SRow l="PF Deduction" v={`-₹${pf.toLocaleString()}`} c="#f87171" />
        <SRow l="Welfare Bonus" v={`+₹${welfare.toLocaleString()}`} c="#4ade80" />
      </div>
      <div className="highlight-banner" style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem' }}>
        {takeHome > 0 ? 'Your salary details are up to date.' : 'Please update your salary details in Profile.'}
      </div>
    </div>
  );
}
function SRow({ l, v, c }) {
  return <div className="flex justify-between" style={{ marginBottom: 4 }}><span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{l}</span><span style={{ fontSize: '0.78rem', fontWeight: 600, color: c || '#e2e8f0' }}>{v}</span></div>;
}

/* ─── Ride Hailing (Cab) ─── */
function RideHailing() {
  const { user, profile } = useUser();
  const [ride, setRide] = useState(null);
  const [dropoff, setDropoff] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'rides', user.uid), (docRef) => {
      if (docRef.exists()) setRide(docRef.data());
      else setRide(null);
    });
    return () => unsub();
  }, [user]);

  const requestRide = async () => {
    if (!dropoff) return;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await setDoc(doc(db, 'rides', user.uid), {
      workerId: user.uid, workerName: profile?.fullName || 'Worker',
      pickup: 'Current Location', dropoff,
      status: 'pending', driverId: null, driverName: null, otp, timestamp: Date.now()
    });
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, bottom: '60px' }}>
        <LiveMap height="100%" fullScreen={true} showRoute={ride?.status === 'accepted'} />
      </div>

      <div className="driver-bottom-sheet glass-card" style={{ position: 'absolute', bottom: 80, left: 10, right: 10, zIndex: 40, padding: '1.2rem', background: 'rgba(15, 23, 42, 0.95)' }}>
        {!ride ? (
          <div className="flex-col gap-3">
            <h3 style={{ margin: 0 }}>Where to?</h3>
            <div className="input-group mb-0 flex items-center gap-2" style={{ background: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 8 }}>
              <Search size={18} color="#94a3b8" />
              <input style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%' }} placeholder="Search destination (e.g. Factory Sector B)" value={dropoff} onChange={e => setDropoff(e.target.value)} />
            </div>
            <button className="btn btn-primary mt-2" disabled={!dropoff} onClick={requestRide}>Request Factory Cab</button>
          </div>
        ) : ride.status === 'pending' ? (
          <div className="flex-col items-center gap-3 py-2">
            <div className="spinner" style={{ borderColor: '#333', borderTopColor: '#4ade80' }} />
            <h3 style={{ margin: 0 }}>Finding your driver...</h3>
            <button className="btn btn-ghost mt-2" style={{ color: '#f87171' }} onClick={() => deleteDoc(doc(db, 'rides', user.uid))}>Cancel Request</button>
          </div>
        ) : (ride.status === 'accepted' || ride.status === 'in-progress') ? (
          <div className="flex-col gap-3">
            <div className="flex justify-between items-center border-b-dark pb-2">
              <div>
                <h3 style={{ margin: 0, color: '#4ade80' }}>{ride.status === 'in-progress' ? 'Trip in Progress!' : 'Driver Arriving!'}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{ride.driverName} • {ride.vehicleModel || 'Factory Cab'}</p>
              </div>
              {ride.driverPhoto ? (
                <img src={ride.driverPhoto} alt="Driver" className="avatar-sm" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="avatar-sm bg-green-500">{ride.driverName.charAt(0)}</div>
              )}
            </div>
            
            <div className="flex justify-between items-center" style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 15px', borderRadius: 8 }}>
              <div className="flex gap-2 items-center">
                 <Car size={20} color="#94a3b8" />
                 <strong style={{ fontSize: '1.1rem' }}>{ride.vehicleNumber || 'KA-06-TC-1234'}</strong>
              </div>
              {ride.status === 'accepted' && (
                <div className="flex-col items-end">
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>OTP to Start</span>
                  <strong style={{ fontSize: '1.4rem', letterSpacing: 2, color: '#f8fafc' }}>{ride.otp}</strong>
                </div>
              )}
            </div>
            {ride.status === 'in-progress' && (
              <div className="text-center mt-1" style={{ color: '#4ade80', fontSize: '0.85rem' }}>
                Sit back and relax. You are on the way to {ride.dropoff}.
              </div>
            )}
            {ride.status === 'accepted' && (
              <button className="btn btn-ghost mt-1" style={{ color: '#f87171' }} onClick={() => deleteDoc(doc(db, 'rides', user.uid))}>Cancel Ride</button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ─── Smart Access ─── */
function SmartAccess() {
  const { profile, updateProfile } = useUser();
  const [sub, setSub] = useState('log');
  const [amount, setAmount] = useState('');
  const name = profile?.fullName || 'User';

  const handleTopUp = (method) => {
    if (!amount || isNaN(amount) || amount <= 0) return alert('Enter a valid top-up amount');
    const newBal = (profile?.canteenBalance || 0) + Number(amount);
    updateProfile({ canteenBalance: newBal });
    alert(`Successfully topped up ₹${amount} via ${method}`);
    setAmount('');
  };

  return (
    <div className="flex-col gap-3">
      <div className="digital-id-card">
        <div className="flex justify-between mb-3" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex gap-2 items-center"><img src={logo} alt="" style={{ width: 18, height: 18 }} /><span style={{ fontWeight: 600, letterSpacing: 1, fontSize: '0.82rem' }}>TUMKURU CONNECT</span></div>
          <span className="badge-active">ACTIVE</span>
        </div>
        <div className="flex items-center gap-3 mb-3" style={{ position: 'relative', zIndex: 1 }}>
          {profile?.photoURL ? <img src={profile.photoURL} alt="" className="id-photo" /> : <div className="avatar-card">{name.charAt(0)}</div>}
          <div><div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{name}</div><div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{profile?.department || 'Worker'} • {profile?.employeeId}</div></div>
        </div>
        <div className="flex justify-between items-end" style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.7rem', color: '#475569' }}>NFC ENABLED</span>
          <CreditCard size={28} color="#334155" />
        </div>
      </div>
      <div className="tab-bar">
        {['log','canteen','buspass'].map(t => <button key={t} className={`tab-btn ${sub===t?'active':''}`} onClick={() => setSub(t)}>{t==='log'?'Access Log':t==='canteen'?'Canteen':'Bus Pass'}</button>)}
      </div>
      <div className="glass-card" style={{ padding: '1rem' }}>
        {sub === 'log' && <><h4 style={{ color: '#94a3b8' }}>Access Logs</h4><div className="text-center p-3" style={{ color: '#64748b' }}>No recent access logs.</div></>}
        {sub === 'canteen' && <>
          <div className="flex justify-between items-center mb-3">
            <span style={{ color:'#94a3b8' }}>Wallet Balance</span>
            <span style={{ fontSize:'1.4rem', fontWeight:700, color:'#4ade80' }}>₹{profile?.canteenBalance||0}</span>
          </div>
          <div className="input-group mb-3">
            <input type="number" className="input-field" placeholder="Enter Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="flex-col gap-2">
            <button className="btn btn-primary" style={{ padding:'0.7rem' }} onClick={() => handleTopUp('Salary Deduction')}>Top Up from Salary</button>
            <button className="btn btn-outline-red" style={{ padding:'0.7rem' }} onClick={() => handleTopUp('UPI / Cards')}>Top Up via UPI / Card</button>
            <button className="btn btn-ghost mt-2" style={{ padding:'0.7rem' }} onClick={() => alert('Card unlinked successfully')}><Unlink size={14}/> Unlink Card</button>
          </div>
        </>}
        {sub === 'buspass' && <div className="text-center">
          <div className="badge-green" style={{padding:'0.75rem',borderRadius:8, marginBottom: '1rem'}}>Valid Bus Pass — Exp: Nov 2025</div>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, display: 'inline-block' }}>
            <QRCode value={`TMR-${profile?.employeeId || 'DEMO-123'}`} size={150} />
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>Scan at bus terminal</div>
        </div>}
      </div>
    </div>
  );
}
