import { useState } from 'react';
import {
  Bell, AlertTriangle, ShieldCheck, Bus, IndianRupee, CreditCard,
  ChevronRight, MapPin, Navigation, User, Edit3, Link as LinkIcon,
  Unlink, LogOut, Save, X, Settings, Camera, Phone, Shield
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import logo from '../assets/logo.png';

import NotificationsPanel from './NotificationsPanel';

export default function Dashboard({ onSOS }) {
  const { profile, signOut } = useUser();
  const [activeTab, setActiveTab] = useState('home');
  const [showNotifs, setShowNotifs] = useState(false);
  const displayName = profile?.fullName || profile?.email?.split('@')[0] || 'User';

  return (
    <div className="flex-col" style={{ flex: 1 }}>
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-panel)' }}>
        <div
          className="flex items-center gap-3"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('profile')}
        >
          <div className="avatar-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Welcome,</div>
            <div style={{ fontWeight: '600' }}>{displayName}</div>
          </div>
        </div>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifs(true)}>
          <Bell size={24} color="#ADB5BD" />
          <div className="notification-dot"></div>
        </div>
      </div>

      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}

      <div className="screen" style={{ overflowY: 'auto' }}>
        {activeTab === 'home' && <HomeView onSOS={onSOS} onNavigate={setActiveTab} />}
        {activeTab === 'passport' && <SkillPassportView />}
        {activeTab === 'salary' && <SalaryView />}
        {activeTab === 'bus' && <BusTrackingView />}
        {activeTab === 'access' && <SmartAccessView />}
        {activeTab === 'profile' && <ProfileView onNavigate={setActiveTab} />}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <NavTab icon={<ShieldCheck size={20} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavTab icon={<CreditCard size={20} />} label="Access" active={activeTab === 'access'} onClick={() => setActiveTab('access')} />
        <NavTab icon={<IndianRupee size={20} />} label="Salary" active={activeTab === 'salary'} onClick={() => setActiveTab('salary')} />
        <NavTab icon={<Bus size={20} />} label="Bus" active={activeTab === 'bus'} onClick={() => setActiveTab('bus')} />
        <NavTab icon={<User size={20} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </div>
    </div>
  );
}

/* ─── NavTab ─── */
function NavTab({ icon, label, active, onClick }) {
  return (
    <div className={`nav-tab flex-col items-center gap-1 ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      <span style={{ fontSize: '0.7rem', fontWeight: active ? '600' : '400' }}>{label}</span>
    </div>
  );
}

/* ─── Home View ─── */
function HomeView({ onSOS, onNavigate }) {
  return (
    <div className="flex-col gap-4">
      {/* SOS Button */}
      <div className="card text-center" style={{ borderColor: 'rgba(220, 53, 69, 0.3)', backgroundColor: 'rgba(220, 53, 69, 0.05)' }}>
        <button
          onClick={onSOS}
          className="btn btn-primary flex-col gap-2"
          style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}
        >
          <AlertTriangle size={32} />
          <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '1px' }}>EMERGENCY SOS</span>
        </button>
        <p className="mt-2" style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Tap to alert Ecosystem Security & Police</p>
      </div>

      <h3 className="mt-2">Quick Access</h3>

      {/* Action Cards Grid — each card is now clickable */}
      <div className="grid-2">
        <ActionCard
          icon={<ShieldCheck size={28} color="#DC3545" />}
          title="Skill Passport"
          subtitle="View your badges"
          onClick={() => onNavigate('passport')}
        />
        <ActionCard
          icon={<Bus size={28} color="#DC3545" />}
          title="Live Bus"
          subtitle="Next Shuttle: 5 mins"
          onClick={() => onNavigate('bus')}
        />
        <ActionCard
          icon={<IndianRupee size={28} color="#DC3545" />}
          title="Your Earnings"
          subtitle="Salary comparison"
          onClick={() => onNavigate('salary')}
        />
        <ActionCard
          icon={<CreditCard size={28} color="#DC3545" />}
          title="Smart Access"
          subtitle="Card & Canteen"
          onClick={() => onNavigate('access')}
        />
      </div>
    </div>
  );
}

function ActionCard({ icon, title, subtitle, onClick }) {
  return (
    <div className="card flex-col items-start gap-2 action-card" style={{ padding: '1rem', cursor: 'pointer' }} onClick={onClick}>
      <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)' }}>
        {icon}
      </div>
      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{title}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-gray-light)' }}>{subtitle}</div>
    </div>
  );
}

/* ─── Skill Passport View ─── */
function SkillPassportView() {
  const { profile } = useUser();
  const displayName = profile?.fullName || 'User';

  return (
    <div className="flex-col gap-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="avatar-md">{displayName.charAt(0).toUpperCase()}</div>
        <div>
          <h2>{displayName}</h2>
          <p>ID: {profile?.employeeId || 'N/A'} • {profile?.department || 'Unassigned'}</p>
        </div>
      </div>

      <h3>My Badges</h3>

      <div className="card text-center p-3" style={{ color: 'var(--text-gray-dark)' }}>
        No verified badges yet.
      </div>

      <div className="card mt-2">
        <h3 className="mb-3" style={{ fontSize: '1rem' }}>Path to Promotion</h3>
        <div className="text-center p-3" style={{ color: 'var(--text-gray-dark)' }}>
          Update your skills to generate your career path.
        </div>

        <button className="btn btn-outline-red mt-4 w-100">
          Request New Badge Verification
        </button>
      </div>
    </div>
  );
}

/* ─── Salary View ─── */
function SalaryView() {
  const { profile } = useUser();
  const base = Number(profile?.baseSalary) || 0;
  const pf = Number(profile?.pfDeduction) || 0;
  const welfare = Number(profile?.welfareBonus) || 0;
  const takeHome = base - pf + welfare;

  return (
    <div className="flex-col gap-4">
      <div className="text-center mb-2">
        <h2 style={{ color: '#DC3545' }}>Your Earnings</h2>
      </div>

      <div className="grid-2">
        <div className="card" style={{ borderTop: '4px solid #DC3545', backgroundColor: 'rgba(220, 53, 69, 0.05)' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Monthly Take Home</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>₹{takeHome.toLocaleString()}</div>
          <SalaryRow label="Base Salary" value={`₹${base.toLocaleString()}`} />
          <SalaryRow label="PF Deduction" value={`- ₹${pf.toLocaleString()}`} color="#DC3545" />
          <SalaryRow label="Welfare Bonus" value={`+ ₹${welfare.toLocaleString()}`} color="#28a745" />
        </div>
      </div>

      <div className="text-center mt-2 p-3" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderRadius: 'var(--radius-md)', color: '#DC3545', fontWeight: '600' }}>
        {takeHome > 0 ? 'Your salary details are up to date.' : 'Please update your salary details in Profile.'}
      </div>
    </div>
  );
}

function SalaryRow({ label, value, color, dim }) {
  const textColor = dim ? 'var(--text-gray-dark)' : 'var(--text-gray-light)';
  return (
    <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
      <span style={{ fontSize: '0.8rem', color: textColor }}>{label}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: color || (dim ? 'var(--text-gray-dark)' : 'var(--text-white)') }}>{value}</span>
    </div>
  );
}

/* ─── Bus Tracking View ─── */
function BusTrackingView() {
  return (
    <div className="flex-col gap-4" style={{ height: '100%' }}>
      <div className="flex justify-between items-center mb-2">
        <h2>Live Shuttle Tracking</h2>
        <div className="flex gap-2 items-center">
          <div className="live-dot"></div>
          <span style={{ fontSize: '0.8rem', color: '#28a745' }}>Live</span>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="map-container">
        <div className="map-grid"></div>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M 50 50 Q 150 150 250 100 T 350 250" fill="none" stroke="#DC3545" strokeWidth="4" strokeDasharray="5,5" opacity="0.5" />
        </svg>
        <div className="user-dot" style={{ left: '50px', top: '50px' }}>
          <div className="dot-inner"></div>
          <div className="dot-pulse"></div>
        </div>
        <div className="bus-marker" style={{ left: '250px', top: '100px' }}>
          <div className="bus-icon-wrapper"><Bus size={16} color="#FFF" /></div>
          <div className="bus-label">T-04</div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)' }}>
              <Navigation size={24} color="#DC3545" />
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>Route T-04 (VasanthNagar)</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Capacity: 32/40 Seats</div>
            </div>
          </div>
          <div className="text-right">
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#DC3545' }}>5 min</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray-light)' }}>ETA</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Smart Access View ─── */
function SmartAccessView() {
  const { profile, updateProfile } = useUser();
  const [activeTab, setActiveTab] = useState('log');
  const [amount, setAmount] = useState('');
  const displayName = profile?.fullName || 'User';

  const handleTopUp = (method) => {
    if (!amount || isNaN(amount) || amount <= 0) return alert('Enter a valid top-up amount');
    const newBal = (profile?.canteenBalance || 0) + Number(amount);
    updateProfile({ canteenBalance: newBal });
    alert(`Successfully topped up ₹${amount} via ${method}`);
    setAmount('');
  };

  return (
    <div className="flex-col gap-4">
      {/* Digital Card */}
      <div className="digital-card">
        <div className="card-circle-1"></div>
        <div className="card-circle-2"></div>
        <div className="flex justify-between mb-4" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex gap-2 items-center">
            <img src={logo} alt="Logo" style={{ width: '20px', height: '20px' }} />
            <span style={{ fontWeight: '600', letterSpacing: '1px', fontSize: '0.85rem' }}>TUMKURU CONNECT</span>
          </div>
          <div className="status-badge active">ACTIVE</div>
        </div>
        <div className="flex items-center gap-4 mb-4" style={{ position: 'relative', zIndex: 1 }}>
          <div className="avatar-card">{displayName.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{displayName}</div>
            <div style={{ color: 'var(--text-gray-light)', fontSize: '0.9rem' }}>{profile?.department || 'Worker'} • {profile?.employeeId || 'N/A'}</div>
          </div>
        </div>
        <div className="flex justify-between items-end" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-gray-dark)' }}>NFC ENABLED</div>
          <CreditCard size={32} color="var(--text-gray-dark)" opacity={0.5} />
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {['log', 'canteen', 'buspass'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'log' ? 'Access Log' : tab === 'canteen' ? 'Canteen' : 'Bus Pass'}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        {activeTab === 'log' && (
          <div className="flex-col gap-3">
            <h4 style={{ color: 'var(--text-gray-light)' }}>Access Logs</h4>
            <div className="text-center p-3" style={{ color: 'var(--text-gray-dark)' }}>No recent access logs.</div>
          </div>
        )}

        {activeTab === 'canteen' && (
          <div className="flex-col gap-3">
            <div className="flex justify-between items-center mb-2">
              <span style={{ color: 'var(--text-gray-light)' }}>Available Balance</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#DC3545' }}>₹{profile?.canteenBalance || 0}.00</span>
            </div>
            
            <div className="input-group mb-0" style={{ marginBottom: '1rem' }}>
              <input type="number" className="input-field" placeholder="Enter Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>

            <div className="flex gap-2">
              <button className="btn btn-primary" style={{ padding: '0.75rem', flex: 1 }} onClick={() => handleTopUp('Salary Deduction')}>From Salary</button>
              <button className="btn btn-secondary flex items-center justify-center gap-2" style={{ padding: '0.75rem', flex: 1 }} onClick={() => handleTopUp('UPI / Card')}>
                UPI / Card
              </button>
            </div>
            <button className="btn btn-secondary flex items-center justify-center gap-2 mt-2 w-full" style={{ padding: '0.75rem' }} onClick={() => alert('Card unlinked')}>
              <Unlink size={16} /> Unlink
            </button>
          </div>
        )}

        {activeTab === 'buspass' && (
          <div className="flex-col gap-3 text-center">
            <div style={{ padding: '1rem', backgroundColor: 'rgba(40, 167, 69, 0.1)', borderRadius: 'var(--radius-sm)', color: '#28a745' }}>
              <div style={{ fontWeight: '600' }}>Valid State Bus Pass</div>
              <div style={{ fontSize: '0.8rem' }}>Expires: 30 Nov 2025</div>
            </div>
            <div className="qr-placeholder">
              <div className="qr-pattern"></div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary" style={{ flex: 1 }}>Digital Pass</button>
              <button className="btn btn-outline-red" style={{ flex: 1 }}>
                <LinkIcon size={16} /> Link New
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Profile View — Fully editable ─── */
function ProfileView({ onNavigate }) {
  const { profile, updateProfile, signOut } = useUser();
  const [editing, setEditing] = useState(null); // 'personal', 'work', or null
  const [formData, setFormData] = useState({});

  const displayName = profile?.fullName || 'User';

  const startEdit = (section) => {
    if (section === 'personal') {
      setFormData({
        fullName: profile?.fullName || '',
        dob: profile?.dob || '',
        phone: profile?.phone || '',
        email: profile?.email || '',
      });
    } else if (section === 'work') {
      setFormData({
        factoryUnit: profile?.factoryUnit || '',
        department: profile?.department || '',
        supervisor: profile?.supervisor || '',
      });
    }
    setEditing(section);
  };

  const saveEdit = () => {
    updateProfile(formData);
    setEditing(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setFormData({});
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex-col gap-4">
      {/* Profile Header */}
      <div className="text-center mb-2">
        <div className="avatar-lg" style={{ margin: '0 auto 1rem auto' }}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ marginBottom: '0.25rem' }}>{displayName}</h2>
        <p>{profile?.department || 'Worker'} • {profile?.employeeId || 'N/A'}</p>
      </div>

      {/* Personal Info Card */}
      <div className="card flex-col gap-3" style={{ padding: '1rem' }}>
        <h3 className="flex items-center justify-between" style={{ color: 'var(--text-gray-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <span>Personal Info</span>
          {editing === 'personal' ? (
            <div className="flex gap-2">
              <Save size={18} color="#28a745" style={{ cursor: 'pointer' }} onClick={saveEdit} />
              <X size={18} color="#DC3545" style={{ cursor: 'pointer' }} onClick={cancelEdit} />
            </div>
          ) : (
            <Edit3 size={16} style={{ cursor: 'pointer' }} onClick={() => startEdit('personal')} />
          )}
        </h3>
        {editing === 'personal' ? (
          <div className="flex-col gap-2">
            <div className="input-group mb-0">
              <label className="input-label">Full Name</label>
              <input type="text" name="fullName" className="input-field" value={formData.fullName} onChange={handleChange} />
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Date of Birth</label>
              <input type="date" name="dob" className="input-field" value={formData.dob} onChange={handleChange} />
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Phone</label>
              <input type="tel" name="phone" className="input-field" value={formData.phone} onChange={handleChange} />
            </div>
          </div>
        ) : (
          <>
            <ProfileRow label="Name" value={profile?.fullName || '—'} />
            <ProfileRow label="DOB" value={profile?.dob || '—'} />
            <ProfileRow label="Phone" value={profile?.phone || '—'} />
            <ProfileRow label="Email" value={profile?.email || '—'} />
          </>
        )}
      </div>

      {/* Work Records Card */}
      <div className="card flex-col gap-3" style={{ padding: '1rem' }}>
        <h3 className="flex items-center justify-between" style={{ color: 'var(--text-gray-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <span>Work Records</span>
          {editing === 'work' ? (
            <div className="flex gap-2">
              <Save size={18} color="#28a745" style={{ cursor: 'pointer' }} onClick={saveEdit} />
              <X size={18} color="#DC3545" style={{ cursor: 'pointer' }} onClick={cancelEdit} />
            </div>
          ) : (
            <Edit3 size={16} style={{ cursor: 'pointer' }} onClick={() => startEdit('work')} />
          )}
        </h3>
        {editing === 'work' ? (
          <div className="flex-col gap-2">
            <div className="input-group mb-0">
              <label className="input-label">Company / Unit</label>
              <select name="factoryUnit" className="input-field" value={formData.factoryUnit} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="Sri Sai Auto Components">Sri Sai Auto Components</option>
                <option value="Tumkur Machining Hub">Tumkur Machining Hub</option>
                <option value="Precision Parts Pvt Ltd">Precision Parts Pvt Ltd</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Department</label>
              <input type="text" name="department" className="input-field" value={formData.department} onChange={handleChange} />
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Supervisor</label>
              <input type="text" name="supervisor" className="input-field" value={formData.supervisor} onChange={handleChange} />
            </div>
          </div>
        ) : (
          <>
            <ProfileRow label="Unit" value={profile?.factoryUnit || '—'} />
            <ProfileRow label="Dept" value={profile?.department || '—'} />
            <ProfileRow label="Supervisor" value={profile?.supervisor || '—'} />
          </>
        )}
      </div>

      {/* Navigation Cards */}
      <NavCard icon={<ShieldCheck size={24} color="#DC3545" />} label="Skill Passport" onClick={() => onNavigate('passport')} />
      <NavCard icon={<CreditCard size={24} color="#DC3545" />} label="Linked Cards" onClick={() => onNavigate('access')} />
      <NavCard icon={<Phone size={24} color="#DC3545" />} label="Emergency Contacts" onClick={() => {}} />

      {/* Sign Out */}
      <button className="btn btn-secondary flex items-center justify-center gap-2 mt-2" style={{ color: '#DC3545', borderColor: '#DC3545' }} onClick={signOut}>
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: 'var(--text-gray-dark)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function NavCard({ icon, label, onClick }) {
  return (
    <div className="card flex justify-between items-center action-card" style={{ padding: '1.25rem 1rem', cursor: 'pointer' }} onClick={onClick}>
      <div className="flex items-center gap-3">
        {icon}
        <span style={{ fontWeight: '600' }}>{label}</span>
      </div>
      <ChevronRight size={20} color="var(--text-gray-dark)" />
    </div>
  );
}
