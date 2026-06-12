import { useState } from 'react';
import { Search, MapPin, Briefcase, ChevronRight, User, Settings, Filter, ShieldCheck, DollarSign, MessageSquare, ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';
import LiveMap from './LiveMap';
import ProfileView from './ProfileView';
import AppFooter from './AppFooter';
import NotificationsPanel from './NotificationsPanel';
import RideHailing from './RideHailing';
import logo from '../assets/logo.png';

export default function JobFinderDashboard({ onSOS }) {
  const { profile } = useUser();
  const [tab, setTab] = useState('home');
  const [showNotifs, setShowNotifs] = useState(false);
  const name = profile?.fullName || profile?.email?.split('@')[0] || 'User';

  return (
    <div className="flex-col" style={{ flex: 1 }}>
      <TopBar name={name} photo={profile?.photoURL} onProfile={() => setTab('profile')} onNotifs={() => setShowNotifs(true)} badge="Job Finder" onBack={tab !== 'home' ? () => setTab('home') : null} />
      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
      <div className="screen" style={{ overflowY: 'auto' }}>
        {tab === 'home' && <Home go={setTab} />}
        {tab === 'map' && <JobMap />}
        {tab === 'jobs' && <JobList />}
        {tab === 'applications' && <Applications />}
        {tab === 'bus' && <RideHailing onBack={() => setTab('home')} />}
        {tab === 'profile' && <div className="p-4"><ProfileView onNavigate={setTab} /></div>}
        <AppFooter />
      </div>
      <BottomNav tab={tab} setTab={setTab} tabs={[
        { id: 'home', icon: <Search size={20}/>, label: 'Explore' },
        { id: 'map', icon: <MapPin size={20}/>, label: 'Map' },
        { id: 'jobs', icon: <Briefcase size={20}/>, label: 'Jobs' },
        { id: 'profile', icon: <User size={20}/>, label: 'Profile' },
      ]} />
    </div>
  );
}

function TopBar({ name, photo, onProfile, onNotifs, badge, onBack }) {
  return (
    <div className="top-bar">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
            <ArrowLeft size={24} />
          </button>
        )}
        <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={onProfile}>
          {photo ? <img src={photo} className="avatar-sm" alt="" style={{ objectFit: 'cover' }} /> : <div className="avatar-sm">{name.charAt(0)}</div>}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{badge || 'Welcome'}</div>
            <div style={{ fontWeight: 600 }}>{name}</div>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onNotifs}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </div>
        <div style={{ position: 'relative' }}><Settings size={22} color="var(--text-dim)" /></div>
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

function Home({ go }) {
  return (
    <div className="flex-col gap-4">
      <div className="search-bar glass-card">
        <Search size={18} color="var(--text-muted)" />
        <input type="text" placeholder="Search industry roles..." className="search-input" />
        <Filter size={18} color="#f87171" style={{ cursor: 'pointer' }} />
      </div>

      <div className="glass-card flex-col gap-2 p-4" style={{ background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(0, 0, 0, 0.3))' }}>
        <h3 style={{ margin: 0, color: '#f87171' }}>AI Job Matcher</h3>
        <p style={{ fontSize: '0.85rem' }}>Complete your profile to get personalized job recommendations in the Tumkuru ecosystem.</p>
        <button className="btn btn-primary mt-2 text-sm" onClick={() => go('profile')}>Complete Profile</button>
      </div>

      <div className="flex justify-between items-center">
        <h3 style={{ margin: 0 }}>Trending in Tumkur</h3>
        <span style={{ fontSize: '0.8rem', color: '#f87171', cursor: 'pointer' }} onClick={() => go('jobs')}>See All</span>
      </div>

      <div className="flex-col gap-3">
        <JobCard title="CNC Operator" company="Sri Sai Auto Components" wage="₹18,000/mo" tags={['Hiring Now', 'Training Provided']} />
        <JobCard title="Assembly Line Worker" company="Tumkur Machining Hub" wage="₹15,500/mo" tags={['Food Included']} />
        <JobCard title="Quality Inspector" company="Precision Parts" wage="₹22,000/mo" tags={['Experience Req.']} />
      </div>
    </div>
  );
}

function JobMap() {
  return (
    <div className="flex-col gap-3" style={{ height: '100%' }}>
      <div className="flex justify-between items-center">
        <h3 style={{ margin: 0 }}>Jobs Near You</h3>
        <div className="badge-green">Live GPS</div>
      </div>
      <LiveMap height="400px" />
      <div className="glass-card">
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', textAlign: 'center' }}>
          Showing 12 active hiring factories within 5km of your location.
        </p>
      </div>
    </div>
  );
}

function JobList() {
  return (
    <div className="flex-col gap-3">
      <h2 style={{ margin: 0 }}>All Jobs</h2>
      <div className="filters flex gap-2 overflow-x-auto pb-2">
        <div className="badge-outline active">All</div>
        <div className="badge-outline">Machining</div>
        <div className="badge-outline">Assembly</div>
        <div className="badge-outline">Logistics</div>
      </div>
      <div className="flex-col gap-3">
        <JobCard title="Welding Technician" company="Sri Sai Auto Components" wage="₹19,000/mo" tags={['Urgent']} />
        <JobCard title="CNC Operator" company="Sri Sai Auto Components" wage="₹18,000/mo" tags={['Hiring Now']} />
        <JobCard title="Assembly Line Worker" company="Tumkur Machining Hub" wage="₹15,500/mo" tags={['Food Included']} />
        <JobCard title="Logistics Assistant" company="Vasanth Logistics" wage="₹14,000/mo" tags={['Entry Level']} />
        <JobCard title="Quality Inspector" company="Precision Parts" wage="₹22,000/mo" tags={['Experience Req.']} />
      </div>
    </div>
  );
}

function Applications() {
  return (
    <div className="flex-col gap-3">
      <h2 style={{ margin: 0 }}>My Applications</h2>
      <div className="glass-card flex-col gap-2">
        <div className="flex justify-between">
          <strong style={{ fontSize: '1rem' }}>CNC Operator</strong>
          <span className="badge-warning">Under Review</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sri Sai Auto Components</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>Applied on 12 Oct 2024</div>
      </div>
    </div>
  );
}

function JobCard({ title, company, wage, tags }) {
  return (
    <div className="glass-card flex-col gap-2" style={{ padding: '1rem', cursor: 'pointer' }}>
      <div className="flex justify-between items-start">
        <div>
          <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{title}</strong>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{company}</div>
        </div>
        <div className="flex items-center gap-1" style={{ color: '#4ade80', fontWeight: 600 }}>
          <DollarSign size={14} />{wage}
        </div>
      </div>
      <div className="flex gap-2 mt-2 flex-wrap">
        {tags.map((t, i) => (
          <span key={i} className="badge-outline" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{t}</span>
        ))}
      </div>
    </div>
  );
}
