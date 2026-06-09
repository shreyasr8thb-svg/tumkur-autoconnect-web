import { useState } from 'react';
import { Truck, Navigation, Users, User, AlertTriangle, Power, MessageSquare } from 'lucide-react';
import { useUser } from '../context/UserContext';
import LiveMap from './LiveMap';
import ProfileView from './ProfileView';
import Feed from './Feed';

export default function DriverDashboard() {
  const { profile } = useUser();
  const [tab, setTab] = useState('drive');
  const [active, setActive] = useState(false);
  const name = profile?.fullName || profile?.email?.split('@')[0] || 'Driver';

  return (
    <div className="flex-col" style={{ flex: 1, position: 'relative' }}>
      {tab !== 'drive' && <TopBar name={name} photo={profile?.photoURL} onProfile={() => setTab('profile')} active={active} />}
      
      <div className={`screen ${tab === 'drive' ? 'p-0' : ''}`} style={{ overflowY: 'auto', paddingBottom: '90px' }}>
        {tab === 'drive' && <DriveMode active={active} setActive={setActive} />}
        {tab === 'passengers' && <Passengers />}
        {tab === 'feed' && <div className="p-4"><Feed /></div>}
        {tab === 'profile' && <div className="p-4"><ProfileView onNavigate={setTab} /></div>}
      </div>
      
      <BottomNav tab={tab} setTab={setTab} tabs={[
        { id: 'drive', icon: <Navigation size={20}/>, label: 'Drive' },
        { id: 'passengers', icon: <Users size={20}/>, label: 'Trips' },
        { id: 'feed', icon: <MessageSquare size={20}/>, label: 'Feed' },
        { id: 'profile', icon: <User size={20}/>, label: 'Profile' },
      ]} />
    </div>
  );
}

function TopBar({ name, photo, onProfile, active }) {
  return (
    <div className="top-bar">
      <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={onProfile}>
        {photo ? <img src={photo} className="avatar-sm" alt="" style={{ objectFit: 'cover' }} /> : <div className="avatar-sm">{name.charAt(0)}</div>}
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bus Driver</div>
          <div style={{ fontWeight: 600 }}>{name}</div>
        </div>
      </div>
      <div className={`badge-${active ? 'green' : 'gray'}`}>{active ? 'ONLINE' : 'OFFLINE'}</div>
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
  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Full Screen Map */}
      <div style={{ position: 'absolute', inset: 0, bottom: '60px' }}>
        <LiveMap height="100%" showRoute={active} />
      </div>

      {/* Floating Status Bar at Top */}
      <div style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 40 }} className="flex justify-between items-start">
        <div className="glass-card flex items-center gap-2 px-4 py-2" style={{ borderRadius: 30, background: 'rgba(2, 6, 23, 0.85)' }}>
           <div className={`status-dot ${active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} style={{ width:10, height:10, borderRadius:'50%' }}></div>
           <strong style={{ fontSize: '0.85rem' }}>{active ? 'ONLINE • T-04' : 'OFFLINE'}</strong>
        </div>
        {active && (
          <div className="glass-card flex-col items-center p-2" style={{ borderRadius: 16, background: 'rgba(2, 6, 23, 0.85)' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Earnings</span>
            <strong style={{ color: '#4ade80' }}>₹840</strong>
          </div>
        )}
      </div>

      {/* Bottom Sheet Overlay (Uber Style) */}
      <div className="driver-bottom-sheet glass-card" style={{ 
        position: 'absolute', bottom: 80, left: 10, right: 10, 
        zIndex: 40, padding: '1.5rem', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)' 
      }}>
        {!active ? (
          <div className="flex-col items-center gap-4">
            <h2 style={{ margin: 0 }}>You're Offline</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>Go online to start receiving passenger location broadcasts and factory route updates.</p>
            <button 
              className="btn btn-primary w-100" 
              style={{ padding: '1.2rem', fontSize: '1.1rem', borderRadius: 30, background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
              onClick={() => setActive(true)}
            >
              GO ONLINE
            </button>
          </div>
        ) : (
          <div className="flex-col gap-4">
            <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
               <div>
                 <h3 style={{ margin: 0, color: '#f8fafc' }}>Next Stop</h3>
                 <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>VasanthNagar Cross • 5 mins</p>
               </div>
               <div className="flex items-center justify-center bg-red-500" style={{ width: 45, height: 45, borderRadius: '50%' }}>
                 <Navigation size={24} color="#fff" />
               </div>
            </div>
            
            <div className="flex justify-between">
              <div className="flex-col items-center">
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Scanned</span>
                <strong style={{ fontSize: '1.2rem' }}>32<span style={{ fontSize: '0.8rem', color: '#64748b' }}>/40</span></strong>
              </div>
              <div className="flex-col items-center">
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Route</span>
                <strong style={{ fontSize: '1.2rem' }}>T-04</strong>
              </div>
              <div className="flex-col items-center">
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ETA</span>
                <strong style={{ fontSize: '1.2rem', color: '#f87171' }}>08:15 AM</strong>
              </div>
            </div>

            <button 
              className="btn btn-ghost w-100" 
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
            <strong style={{ fontSize: '1.5rem', color: '#f8fafc' }}>142</strong>
         </div>
      </div>

      <h3 className="mt-2" style={{ margin: 0 }}>Recent Scans (Route T-04)</h3>
      <div className="glass-card flex-col gap-2">
         <ScanRow name="Ramesh K." id="TMR-4492" time="07:46 AM" />
         <ScanRow name="Suresh M." id="TMR-1123" time="07:45 AM" />
         <ScanRow name="Kiran J." id="TMR-8891" time="07:32 AM" />
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
