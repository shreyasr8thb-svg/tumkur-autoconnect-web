import { useState } from 'react';
import { Calendar, Users, AlertCircle, LogOut, ChevronRight, PieChart, Activity } from 'lucide-react';
import { useUser } from '../context/UserContext';
import ProfileView from './ProfileView';

export default function HRDashboard() {
  const { profile, signOut } = useUser();
  const [tab, setTab] = useState('dashboard');
  const factoryName = profile?.factoryUnit || 'Your Factory';

  return (
    <div className="flex-col" style={{ flex: 1 }}>
      {/* Top Bar */}
      <div className="top-bar">
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>HR / Owner Panel</div>
          <div style={{ fontWeight: 600 }}>{factoryName}</div>
        </div>
        <div className="avatar-sm" style={{ cursor: 'pointer' }} onClick={() => setTab('profile')}>
          <Users size={18} color="#fff" />
        </div>
      </div>

      <div className="screen" style={{ overflowY: 'auto' }}>
        {tab === 'dashboard' && <HRHome />}
        {tab === 'workers' && <Workforce />}
        {tab === 'profile' && <ProfileView />}
      </div>

      <BottomNav tab={tab} setTab={setTab} tabs={[
        { id: 'dashboard', icon: <PieChart size={20}/>, label: 'Analytics' },
        { id: 'workers', icon: <Users size={20}/>, label: 'Workforce' },
      ]} />
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

function HRHome() {
  return (
    <div className="flex-col gap-4">
      <div className="flex items-center gap-2">
        <Activity size={22} color="#f87171" />
        <h2 style={{ margin: 0 }}>Factory Health</h2>
      </div>

      <div className="grid-2">
        <StatCard title="Total Staff" value="240" trend="+5" positive />
        <StatCard title="Present Today" value="218" trend="90%" />
      </div>

      <div className="glass-card">
        <div className="flex justify-between items-center mb-3">
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>AI Leave Predictor</h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>14 Days</span>
        </div>
        
        <div className="flex gap-1 mb-2">
          {[...Array(14)].map((_, i) => {
            const high = i === 4 || i === 5;
            const med = i === 3 || i === 6;
            const bg = high ? '#ef4444' : med ? '#eab308' : '#22c55e';
            return (
              <div key={i} className="flex-col items-center gap-1" style={{ flex: 1 }}>
                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{10 + i}</div>
                <div style={{ width: '100%', height: '40px', backgroundColor: bg, borderRadius: '4px', opacity: 0.8 }}></div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-3 text-center" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          <div className="flex items-center gap-1"><div style={{ width: 8, height: 8, backgroundColor: '#22c55e', borderRadius: 2 }} /> Low</div>
          <div className="flex items-center gap-1"><div style={{ width: 8, height: 8, backgroundColor: '#eab308', borderRadius: 2 }} /> Med</div>
          <div className="flex items-center gap-1"><div style={{ width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 2 }} /> High</div>
        </div>
      </div>

      <h3 className="flex items-center gap-2" style={{ color: '#f87171', margin: 0, marginTop: 8 }}>
        <AlertCircle size={20} /> High Risk Alert
      </h3>
      
      <div className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <strong style={{ color: '#f8fafc' }}>Oct 14 - Oct 15 (Festival)</strong>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Predicted Shortage: 15 Workers</div>
          </div>
          <button className="btn btn-outline-sm" style={{ padding: '0.4rem 0.8rem' }}>Plan</button>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '0.75rem', marginTop: 12 }}>
           <Row n="Suresh M." r="Welder" rr="Harvest (Davanagere)" />
           <Row n="Kiran J." r="Machinist" rr="Travel" last />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, positive }) {
  return (
    <div className="glass-card flex-col gap-1" style={{ padding: '1rem' }}>
      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{title}</span>
      <strong style={{ fontSize: '1.5rem', color: '#f8fafc' }}>{value}</strong>
      <span style={{ fontSize: '0.75rem', color: positive ? '#4ade80' : '#f87171' }}>{trend}</span>
    </div>
  );
}

function Row({ n, r, rr, last }) {
  return (
    <div className="flex justify-between items-center" style={{ paddingBottom: last ? 0 : 8, marginBottom: last ? 0 : 8, borderBottom: last ? 'none' : '1px solid #1e293b' }}>
      <div>
        <strong style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{n}</strong>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r}</div>
      </div>
      <span style={{ fontSize: '0.8rem', color: '#f87171' }}>{rr}</span>
    </div>
  );
}

function Workforce() {
  return (
    <div className="flex-col gap-3">
      <div className="flex justify-between items-center">
        <h2 style={{ margin: 0 }}>Staff Directory</h2>
        <div className="badge-outline">240 Total</div>
      </div>
      <div className="glass-card p-0 overflow-hidden">
        <StaffRow name="Ramesh K." role="Machinist" status="present" />
        <StaffRow name="Suresh M." role="Welder" status="absent" />
        <StaffRow name="Anil V." role="CNC Operator" status="present" />
        <StaffRow name="Manjula S." role="Assembly" status="present" />
      </div>
    </div>
  );
}

function StaffRow({ name, role, status }) {
  const p = status === 'present';
  return (
    <div className="flex justify-between items-center p-3 border-b-dark">
      <div className="flex items-center gap-3">
        <div className="avatar-sm" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>{name.charAt(0)}</div>
        <div>
          <strong style={{ fontSize: '0.95rem' }}>{name}</strong>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{role}</div>
        </div>
      </div>
      <span style={{ fontSize: '0.75rem', color: p ? '#4ade80' : '#f87171', background: p ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)', padding: '4px 8px', borderRadius: 4 }}>
        {p ? 'Present' : 'Absent'}
      </span>
    </div>
  );
}
