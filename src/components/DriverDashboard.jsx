import { useState } from 'react';
import { Truck, Navigation, Users, User, AlertTriangle, Power } from 'lucide-react';
import { useUser } from '../context/UserContext';
import LiveMap from './LiveMap';
import ProfileView from './ProfileView';

export default function DriverDashboard() {
  const { profile } = useUser();
  const [tab, setTab] = useState('drive');
  const [active, setActive] = useState(false);
  const name = profile?.fullName || profile?.email?.split('@')[0] || 'Driver';

  return (
    <div className="flex-col" style={{ flex: 1 }}>
      <TopBar name={name} photo={profile?.photoURL} onProfile={() => setTab('profile')} active={active} />
      <div className="screen" style={{ overflowY: 'auto', paddingBottom: '90px' }}>
        {tab === 'drive' && <DriveMode active={active} setActive={setActive} />}
        {tab === 'route' && <RouteInfo />}
        {tab === 'passengers' && <Passengers />}
        {tab === 'profile' && <ProfileView onNavigate={setTab} />}
      </div>
      <BottomNav tab={tab} setTab={setTab} tabs={[
        { id: 'drive', icon: <Truck size={20}/>, label: 'Drive' },
        { id: 'route', icon: <Navigation size={20}/>, label: 'Route' },
        { id: 'passengers', icon: <Users size={20}/>, label: 'Logs' },
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
      <div className={`badge-${active ? 'green' : 'gray'}`}>{active ? 'ON DUTY' : 'OFF DUTY'}</div>
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
    <div className="flex-col gap-4" style={{ height: '100%' }}>
      <div className="glass-card flex-col items-center justify-center py-6">
        <button
          className="power-btn mb-3"
          style={{
            width: 100, height: 100, borderRadius: '50%', border: 'none',
            background: active ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'linear-gradient(135deg, #f87171, #dc2626)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 30px ${active ? 'rgba(34, 197, 94, 0.4)' : 'rgba(220, 38, 38, 0.4)'}`,
            cursor: 'pointer', transition: 'all 0.3s ease'
          }}
          onClick={() => setActive(!active)}
        >
          <Power size={48} />
        </button>
        <h2 style={{ margin: 0 }}>{active ? 'Broadcasting Location' : 'Start Shift'}</h2>
        <p style={{ margin: 0, marginTop: 4, color: '#94a3b8' }}>Route T-04 (VasanthNagar)</p>
      </div>

      {active && (
        <>
          <div style={{ flex: 1, minHeight: 250, borderRadius: 16, overflow: 'hidden' }}>
            <LiveMap height="100%" showRoute />
          </div>
          <div className="glass-card flex justify-between items-center bg-red-900">
             <div className="flex gap-3 items-center">
               <AlertTriangle color="#f87171" size={24} />
               <strong style={{ color: '#f87171' }}>Emergency Break</strong>
             </div>
             <button className="btn btn-outline-red text-sm" style={{ width: 'auto' }}>Report</button>
          </div>
        </>
      )}
    </div>
  );
}

function RouteInfo() {
  return (
    <div className="flex-col gap-3">
      <h2 style={{ margin: 0 }}>Route Details</h2>
      <div className="glass-card p-4 flex-col gap-4">
        <h3 style={{ margin: 0, color: '#f87171' }}>Route T-04</h3>
        <div className="flex-col gap-0 relative route-timeline">
           <Stop time="07:30 AM" name="Tumkur Main Bus Stand" active />
           <Stop time="07:45 AM" name="VasanthNagar Cross" active />
           <Stop time="08:00 AM" name="Industrial Area Gate 1" />
           <Stop time="08:15 AM" name="Sri Sai Auto Components" last />
        </div>
      </div>
    </div>
  );
}

function Stop({ time, name, active, last }) {
  return (
    <div className="flex gap-3 relative pb-4">
      {!last && <div style={{ position: 'absolute', left: 5, top: 16, bottom: 0, width: 2, background: active ? '#4ade80' : '#334155' }} />}
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: active ? '#4ade80' : '#334155', border: '3px solid #1a1a1a', zIndex: 1, marginTop: 4 }} />
      <div className="flex-col">
        <strong style={{ fontSize: '0.9rem', color: active ? '#f8fafc' : '#94a3b8' }}>{name}</strong>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{time}</span>
      </div>
    </div>
  );
}

function Passengers() {
  return (
    <div className="flex-col gap-3">
      <div className="flex justify-between items-center">
        <h2 style={{ margin: 0 }}>Recent Scans</h2>
        <div className="badge-outline">32 / 40 Seats</div>
      </div>
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
    <div className="flex justify-between items-center pb-2 border-b-dark">
      <div>
        <strong style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{name}</strong>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {id}</div>
      </div>
      <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>✓ {time}</span>
    </div>
  );
}
