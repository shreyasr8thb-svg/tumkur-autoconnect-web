import { useUser } from '../context/UserContext';
import logo from '../assets/logo.png';
import {
  Home, CreditCard, Car, User, ShieldCheck, IndianRupee,
  MessageSquare, Rss, Download, LogOut, Bell, Navigation,
  Briefcase, MapPin, Users
} from 'lucide-react';

export default function DesktopSidebar({ tab, setTab, role = 'worker', onSignOut }) {
  const { profile } = useUser();
  const name = profile?.fullName || profile?.email?.split('@')[0] || 'User';

  const workerLinks = [
    { id: 'home', icon: <Home size={18} />, label: 'Home' },
    { id: 'feed', icon: <Rss size={18} />, label: 'Community Feed' },
    { id: 'chat', icon: <MessageSquare size={18} />, label: 'Messages' },
    { id: 'access', icon: <CreditCard size={18} />, label: 'Smart Access' },
    { id: 'bus', icon: <Car size={18} />, label: 'Book Ride' },
    { id: 'passport', icon: <ShieldCheck size={18} />, label: 'Skill Passport' },
    { id: 'salary', icon: <IndianRupee size={18} />, label: 'Earnings' },
    { id: 'profile', icon: <User size={18} />, label: 'Profile' },
  ];

  const jobfinderLinks = [
    { id: 'home', icon: <Home size={18} />, label: 'Explore' },
    { id: 'map', icon: <MapPin size={18} />, label: 'Jobs Map' },
    { id: 'jobs', icon: <Briefcase size={18} />, label: 'All Jobs' },
    { id: 'profile', icon: <User size={18} />, label: 'Profile' },
  ];

  const driverLinks = [
    { id: 'drive', icon: <Navigation size={18} />, label: 'Drive Mode' },
    { id: 'passengers', icon: <Users size={18} />, label: 'Trip Logs' },
    { id: 'profile', icon: <User size={18} />, label: 'Profile' },
  ];

  const links = role === 'jobfinder' ? jobfinderLinks : role === 'driver' ? driverLinks : workerLinks;

  return (
    <div className="desktop-sidebar flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: '64px' }}>
        <img src={logo} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc', letterSpacing: '-0.02em' }}>Tumkuru Connect</div>
          <div style={{ fontSize: '0.65rem', color: '#475569' }}>Industrial Platform</div>
        </div>
      </div>

      {/* User card */}
      <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3 p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setTab('profile')}>
          <div className="avatar-sm" style={{ width: 34, height: 34, fontSize: '0.85rem', flexShrink: 0 }}>{name.charAt(0)}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div style={{ fontSize: '0.68rem', color: '#475569', textTransform: 'capitalize' }}>{role}</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-col gap-1 p-2" style={{ flex: 1, overflowY: 'auto', paddingTop: '0.75rem' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#334155', letterSpacing: '0.5px', padding: '0 1rem 0.5rem' }}>NAVIGATION</div>
        {links.map(l => (
          <div
            key={l.id}
            className={`sidebar-nav-item ${tab === l.id ? 'active' : ''}`}
            onClick={() => setTab(l.id)}
          >
            <span className="icon">{l.icon}</span>
            <span>{l.label}</span>
          </div>
        ))}

        {/* Download section */}
        <div style={{ margin: '1rem 8px 0', padding: '0.75rem 1rem', background: 'linear-gradient(135deg, rgba(225,29,72,0.1), rgba(239,68,68,0.05))', border: '1px solid rgba(225,29,72,0.2)', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#e11d48', marginBottom: '0.5rem' }}>📱 GET THE APP</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: 1.4 }}>Download APK for the best experience</div>
          <button className="btn btn-primary w-100" style={{ padding: '0.6rem', borderRadius: '10px', fontSize: '0.8rem', gap: '6px' }} onClick={() => setTab('download')}>
            <Download size={14} /> Download APK
          </button>
        </div>
      </div>

      {/* Sign out */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="sidebar-nav-item" onClick={onSignOut} style={{ color: '#f87171' }}>
          <span className="icon"><LogOut size={18} color="#f87171" /></span>
          <span>Sign Out</span>
        </div>
      </div>
    </div>
  );
}
