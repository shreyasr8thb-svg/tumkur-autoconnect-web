import { useState } from 'react';
import { Calendar, Users, AlertCircle, LogOut, ChevronRight, PieChart, Activity, MessageSquare, Briefcase, PlusCircle, Car } from 'lucide-react';
import { useUser } from '../context/UserContext';
import ProfileView from './ProfileView';
import AppFooter from './AppFooter';
import NotificationsPanel from './NotificationsPanel';
import RideHailing from './RideHailing';

export default function HRDashboard() {
  const { profile, signOut } = useUser();
  const [tab, setTab] = useState('dashboard');
  const [showNotifs, setShowNotifs] = useState(false);
  const companyName = profile?.factoryUnit || 'Your Company';

  return (
    <div className="flex-col" style={{ flex: 1 }}>
      {/* Top Bar */}
      <div className="top-bar">
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Company Dashboard</div>
          <div style={{ fontWeight: 600 }}>{companyName}</div>
        </div>
        <div className="flex gap-3 items-center">
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifs(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </div>
          <div className="avatar-sm" style={{ cursor: 'pointer' }} onClick={() => setTab('profile')}>
            <Users size={18} color="#fff" />
          </div>
        </div>
      </div>

      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}

      <div className="screen" style={{ overflowY: 'auto' }}>
        {tab === 'dashboard' && <HRHome />}
        {tab === 'workers' && <Workforce />}
        {tab === 'jobs' && <PostJobs companyName={companyName} />}
        {tab === 'bus' && <RideHailing />}
        {tab === 'profile' && <div className="p-4"><ProfileView onNavigate={setTab} /></div>}
        <AppFooter />
      </div>

      <BottomNav tab={tab} setTab={setTab} tabs={[
        { id: 'dashboard', icon: <PieChart size={20}/>, label: 'Analytics' },
        { id: 'workers', icon: <Users size={20}/>, label: 'Workforce' },
        { id: 'bus', icon: <Car size={20}/>, label: 'Book Ride' },
        { id: 'profile', icon: <Users size={20}/>, label: 'Profile' },
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
        <h2 style={{ margin: 0 }}>Company Health</h2>
      </div>

      <div className="grid-2">
        <StatCard title="Total Staff" value="240" trend="+5" positive />
        <StatCard title="Present Today" value="218" trend="90%" />
      </div>

      <div className="glass-card">
        <div className="flex justify-between items-center mb-3">
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>AI Leave Predictor</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>14 Days</span>
        </div>
        
        <div className="flex gap-1 mb-2">
          {[...Array(14)].map((_, i) => {
            const high = i === 4 || i === 5;
            const med = i === 3 || i === 6;
            const bg = high ? 'var(--primary)' : med ? '#eab308' : '#22c55e';
            return (
              <div key={i} className="flex-col items-center gap-1" style={{ flex: 1 }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{10 + i}</div>
                <div style={{ width: '100%', height: '40px', backgroundColor: bg, borderRadius: '4px', opacity: 0.8 }}></div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-3 text-center" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-1"><div style={{ width: 8, height: 8, backgroundColor: '#22c55e', borderRadius: 2 }} /> Low</div>
          <div className="flex items-center gap-1"><div style={{ width: 8, height: 8, backgroundColor: '#eab308', borderRadius: 2 }} /> Med</div>
          <div className="flex items-center gap-1"><div style={{ width: 8, height: 8, backgroundColor: 'var(--primary)', borderRadius: 2 }} /> High</div>
        </div>
      </div>

      <h3 className="flex items-center gap-2" style={{ color: '#f87171', margin: 0, marginTop: 8 }}>
        <AlertCircle size={20} /> High Risk Alert
      </h3>
      
      <div className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Oct 14 - Oct 15 (Festival)</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Predicted Shortage: 15 Workers</div>
          </div>
          <button className="btn btn-outline-sm" style={{ padding: '0.4rem 0.8rem' }}>Plan</button>
        </div>
        <div style={{ background: 'var(--border-light)', borderRadius: 8, padding: '0.75rem', marginTop: 12 }}>
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
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{title}</span>
      <strong style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>{value}</strong>
      <span style={{ fontSize: '0.75rem', color: positive ? '#4ade80' : '#f87171' }}>{trend}</span>
    </div>
  );
}

function Row({ n, r, rr, last }) {
  return (
    <div className="flex justify-between items-center" style={{ paddingBottom: last ? 0 : 8, marginBottom: last ? 0 : 8, borderBottom: last ? 'none' : '1px solid #1e293b' }}>
      <div>
        <strong style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{n}</strong>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{r}</div>
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
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{role}</div>
        </div>
      </div>
      <span style={{ fontSize: '0.75rem', color: p ? '#4ade80' : '#f87171', background: p ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)', padding: '4px 8px', borderRadius: 4 }}>
        {p ? 'Present' : 'Absent'}
      </span>
    </div>
  );
}

function PostJobs({ companyName }) {
  const { showToast } = useUser();
  const [jobs, setJobs] = useState([
    { title: 'CNC Operator', type: 'Full-time', salary: '₹15,000/mo' },
    { title: 'Floor Supervisor', type: 'Contract', salary: '₹22,000/mo' }
  ]);
  const [form, setForm] = useState({ title: '', type: 'Full-time', salary: '' });

  const postJob = () => {
    if (!form.title || !form.salary) return;
    setJobs([...jobs, form]);
    setForm({ title: '', type: 'Full-time', salary: '' });
    showToast('Job requirement posted!');
  };

  return (
    <div className="flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h2 style={{ margin: 0 }}>Active Job Posts</h2>
        <div className="badge-outline">{jobs.length} Active</div>
      </div>

      <div className="glass-card flex-col gap-3">
        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}><PlusCircle size={16} color="#4ade80" /> Post New Job</h3>
        <div className="input-group mb-0">
          <label className="input-label">Job Title</label>
          <input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Lathe Master" />
        </div>
        <div className="flex gap-2">
          <div className="input-group mb-0 flex-1">
            <label className="input-label">Type</label>
            <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option>Full-time</option><option>Contract</option><option>Temporary</option>
            </select>
          </div>
          <div className="input-group mb-0 flex-1">
            <label className="input-label">Salary</label>
            <input className="input-field" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="e.g. ₹15,000/mo" />
          </div>
        </div>
        <button className="btn btn-primary mt-2" onClick={postJob}>Post Job</button>
      </div>

      <h3 style={{ margin: '10px 0 0 0' }}>Current Postings</h3>
      {jobs.map((j, i) => (
        <div key={i} className="glass-card flex justify-between items-center">
          <div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{j.title}</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{companyName} • {j.type}</div>
          </div>
          <div style={{ color: '#4ade80', fontSize: '0.85rem', fontWeight: 600 }}>{j.salary}</div>
        </div>
      ))}
    </div>
  );
}
