import { useState, useRef } from 'react';
import { Bell, AlertTriangle, ShieldCheck, Bus, IndianRupee, CreditCard, ChevronRight, Navigation, User, Settings, Unlink, Link as LinkIcon, MessageSquare, Image, Upload } from 'lucide-react';
import { useUser } from '../context/UserContext';
import LiveMap from './LiveMap';
import ProfileView from './ProfileView';
import Feed from './Feed';
import logo from '../assets/logo.png';

export default function WorkerDashboard({ onSOS }) {
  const { profile } = useUser();
  const [tab, setTab] = useState('home');
  const name = profile?.fullName || profile?.email?.split('@')[0] || 'User';

  return (
    <div className="flex-col" style={{ flex: 1 }}>
      <TopBar name={name} photo={profile?.photoURL} onProfile={() => setTab('profile')} badge="Worker" />
      <div className="screen" style={{ overflowY: 'auto' }}>
        {tab === 'home' && <Home onSOS={onSOS} go={setTab} />}
        {tab === 'passport' && <SkillPassport />}
        {tab === 'salary' && <Salary />}
        {tab === 'bus' && <BusTracking />}
        {tab === 'access' && <SmartAccess />}
        {tab === 'feed' && <Feed />}
        {tab === 'profile' && <ProfileView onNavigate={setTab} />}
      </div>
      <BottomNav tab={tab} setTab={setTab} tabs={[
        { id: 'home', icon: <ShieldCheck size={20}/>, label: 'Home' },
        { id: 'access', icon: <CreditCard size={20}/>, label: 'Access' },
        { id: 'feed', icon: <MessageSquare size={20}/>, label: 'Feed' },
        { id: 'bus', icon: <Bus size={20}/>, label: 'Bus' },
        { id: 'profile', icon: <User size={20}/>, label: 'Profile' },
      ]} />
    </div>
  );
}

/* ─── Shared UI ─── */
function TopBar({ name, photo, onProfile, badge }) {
  return (
    <div className="top-bar">
      <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={onProfile}>
        {photo ? <img src={photo} className="avatar-sm" alt="" style={{ objectFit: 'cover' }} /> : <div className="avatar-sm">{name.charAt(0)}</div>}
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{badge || 'Welcome'}</div>
          <div style={{ fontWeight: 600 }}>{name}</div>
        </div>
      </div>
      <div style={{ position: 'relative' }}><Bell size={22} color="#64748b" /><div className="notif-dot" /></div>
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
        <QCard icon={<Bus size={24} color="#f87171"/>} title="Live Bus" sub="Track shuttle" onClick={() => go('bus')} />
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

      <div className="glass-card flex gap-3 items-center" style={{ borderLeft: '4px solid #f87171' }}>
        <div className="icon-box"><Settings size={22} color="#f87171" /></div>
        <div><strong>Lathe Master</strong><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Verified by: Govt. ITI Tumkur</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Oct 2024</div></div>
      </div>
      
      {certs.map((c, i) => (
        <div key={i} className="glass-card flex-col gap-2 p-2">
           <div className="flex justify-between items-center px-2">
             <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Uploaded Certificate</span>
             <span className="badge-warning">Pending Auth</span>
           </div>
           <img src={c} alt="cert" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
        </div>
      ))}

      <div className="glass-card mt-2">
        <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Career Path</h3>
        <div className="career-path">
          <PathNode title="Lathe Master" sub="✓ Achieved" status="done" />
          <PathNode title="CNC Programmer" sub="G-Code, Safety Cert II" status="current" />
          <PathNode title="Floor Supervisor" sub="Leadership Basics" status="locked" />
        </div>
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
  return (
    <div className="flex-col gap-3">
      <div className="text-center mb-2"><h2 style={{ color: '#f87171' }}>Why Tumkur Works</h2><p>Your advantage over gig work.</p></div>
      <div className="grid-2">
        <div className="glass-card" style={{ borderTop: '3px solid #f87171' }}>
          <h4>Tumkur Factory</h4><div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0' }}>₹21,000</div>
          <SRow l="Wage" v="₹16,000" /><SRow l="PF" v="₹2,500" /><SRow l="Welfare" v="+₹2,500" c="#4ade80" />
        </div>
        <div className="glass-card" style={{ borderTop: '3px solid #475569', opacity: 0.7 }}>
          <h4 style={{ color: '#94a3b8' }}>B'lore Gig</h4><div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0', color: '#94a3b8' }}>₹18,500</div>
          <SRow l="Gross" v="₹25,000" d /><SRow l="Fuel" v="-₹4,000" c="#f87171" d /><SRow l="Rent" v="-₹2,500" c="#f87171" d />
        </div>
      </div>
      <div className="highlight-banner">Take Home More in Tumkur. Build a Career.</div>
    </div>
  );
}
function SRow({ l, v, c, d }) {
  return <div className="flex justify-between" style={{ marginBottom: 4 }}><span style={{ fontSize: '0.78rem', color: d ? '#475569' : '#94a3b8' }}>{l}</span><span style={{ fontSize: '0.78rem', fontWeight: 600, color: c || (d ? '#475569' : '#e2e8f0') }}>{v}</span></div>;
}

/* ─── Bus Tracking ─── */
function BusTracking() {
  return (
    <div className="flex-col gap-3" style={{ height: '100%' }}>
      <div className="flex justify-between items-center">
        <h2>Live Shuttle</h2>
        <div className="flex items-center gap-2"><div className="live-dot" /><span style={{ fontSize: '0.8rem', color: '#4ade80' }}>Live GPS</span></div>
      </div>
      <LiveMap height="300px" showBuses showRoute />
      <div className="glass-card">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <div className="icon-box"><Navigation size={22} color="#f87171" /></div>
            <div><strong>Route T-04</strong><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>32/40 Seats</div></div>
          </div>
          <div className="text-right"><div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171' }}>5 min</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ETA</div></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Smart Access ─── */
function SmartAccess() {
  const { profile } = useUser();
  const [sub, setSub] = useState('log');
  const name = profile?.fullName || 'User';
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
        {sub === 'log' && <><h4 style={{ color: '#94a3b8' }}>Today</h4><LogRow t="Main Gate (In)" s="Sector A" time="08:14" /><LogRow t="Machining Floor" s="Zone 3" time="08:22" /></>}
        {sub === 'canteen' && <><div className="flex justify-between items-center mb-2"><span style={{ color:'#94a3b8' }}>Balance</span><span style={{ fontSize:'1.2rem', fontWeight:700, color:'#f87171' }}>₹{profile?.canteenBalance||0}</span></div><div className="flex gap-2"><button className="btn btn-primary" style={{flex:1,padding:'0.7rem'}}>Top Up</button><button className="btn btn-ghost" style={{flex:1,padding:'0.7rem'}}><Unlink size={14}/> Unlink</button></div></>}
        {sub === 'buspass' && <div className="text-center"><div className="badge-green" style={{padding:'0.75rem',borderRadius:8}}>Valid Bus Pass — Exp: Nov 2025</div><div className="flex gap-2 mt-3"><button className="btn btn-ghost" style={{flex:1}}>Digital Pass</button><button className="btn btn-outline-red" style={{flex:1}}><LinkIcon size={14}/> Link New</button></div></div>}
      </div>
    </div>
  );
}
function LogRow({ t, s, time }) {
  return <div className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid #1e293b' }}><div><strong style={{ fontSize: '0.9rem' }}>{t}</strong><div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s}</div></div><span style={{ fontWeight: 600 }}>{time}</span></div>;
}
