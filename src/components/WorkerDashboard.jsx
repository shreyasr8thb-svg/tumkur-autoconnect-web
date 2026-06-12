/**
 * WorkerDashboard – Worker Portal
 * - Shows company info if joined, or lets worker find & join a company
 * - All core features: Skill Passport, Salary, Smart Access, Ride, Feed, Chat
 * - Uses shared DashboardShell for consistent UI across all portals
 */
import { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck, Car, IndianRupee, CreditCard, AlertTriangle,
  Upload, Unlink, Building2, Search, CheckCircle2, Clock, X,
  Home as HomeIcon, Award, User, MapPin, Megaphone, Info, FileText, Check
} from 'lucide-react';
import {
  collection, query, where, onSnapshot, doc, setDoc, deleteDoc,
  addDoc, serverTimestamp, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';
import DashboardShell from './DashboardShell';
import ProfileView from './ProfileView';
import RideHailing from './RideHailing';
import QRCode from 'react-qr-code';
import logo from '../assets/logo.png';

export default function WorkerDashboard({ onSOS }) {
  const { user, profile, signOut } = useUser();
  const [tab, setTab] = useState('home');

  const tabs = [
    { id: 'home',     label: 'Home',         icon: <HomeIcon size={18} /> },
    { id: 'company',  label: 'My Company',   icon: <Building2 size={18} /> },
    { id: 'passport', label: 'Skill Passport', icon: <Award size={18} /> },
    { id: 'salary',   label: 'Earnings',     icon: <IndianRupee size={18} /> },
    { id: 'access',   label: 'Smart Access', icon: <CreditCard size={18} /> },
    { id: 'bus',      label: 'Book Ride',    icon: <Car size={18} /> },
    { id: 'profile',  label: 'Profile',      icon: <User size={18} /> },
  ];

  return (
    <>
      {/* RideHailing is full-screen: render outside DashboardShell */}
      {tab === 'bus' && <RideHailing onBack={() => setTab('home')} />}
      {tab !== 'bus' && (
        <DashboardShell role="Worker" title="Worker Portal" tabs={tabs} activeTab={tab} setActiveTab={setTab}>
          {tab === 'home'     && <Home onSOS={onSOS} go={setTab} />}
          {tab === 'company'  && <CompanySection user={user} profile={profile} />}
          {tab === 'passport' && <SkillPassport />}
          {tab === 'salary'   && <Salary />}
          {tab === 'access'   && <SmartAccess />}
          {tab === 'profile'  && <ProfileView onNavigate={setTab} />}
        </DashboardShell>
      )}
    </>
  );
}

/* ── Home ── */
function Home({ onSOS, go }) {
  const { profile, user } = useUser();
  const [company, setCompany] = useState(null);
  const [announcement, setAnnouncement] = useState(null);
  const name = profile?.fullName?.split(' ')[0] || profile?.email?.split('@')[0] || 'Worker';

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'company_members', user.uid), snap => {
      setCompany(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!company?.companyId) return;
    const q = query(collection(db, 'announcements'), where('companyId', '==', company.companyId));
    return onSnapshot(q, s => {
      const sorted = s.docs.map(d => d.data()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAnnouncement(sorted[0] || null);
    });
  }, [company]);

  return (
    <div className="flex-col gap-3">
      {/* Welcome banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg,rgba(30,41,59,0.9),rgba(15,23,42,0.95))', borderColor: 'rgba(239,68,68,0.2)' }}>
        <div className="flex justify-between items-start">
          <div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.08em' }}>WELCOME BACK</div>
            <h2 style={{ margin: '4px 0 2px', fontSize: '1.2rem' }}>Hello, {name}!</h2>
            {company
              ? <p style={{ margin: 0, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {company.companyName}</p>
              : <p style={{ margin: 0, fontSize: '0.75rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> Not joined any company yet</p>
            }
          </div>
          {profile?.photoURL
            ? <img src={profile.photoURL} alt="" style={{ width: 48, height: 48, borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.12)' }} />
            : <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{name.charAt(0)}</div>
          }
        </div>
        {profile?.employeeId && (
          <div style={{ marginTop: 10, padding: '6px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>Employee ID</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace' }}>{profile.employeeId}</span>
          </div>
        )}
      </div>

      {/* Announcement from company */}
      {announcement && (
        <div className="glass-card" style={{ borderLeft: '3px solid #fbbf24' }}>
          <div style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Megaphone size={12} /> COMPANY ANNOUNCEMENT</div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>{announcement.text}</p>
        </div>
      )}

      {/* If no company, nudge */}
      {!company && (
        <div className="glass-card flex items-center gap-3" style={{ border: '1px solid rgba(251,191,36,0.3)', cursor: 'pointer', background: 'rgba(251,191,36,0.05)' }} onClick={() => go('company')}>
          <div style={{ padding: '8px', background: 'rgba(251,191,36,0.1)', borderRadius: '8px', color: '#fbbf24' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fbbf24' }}>Join Your Company</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Search and request to join your workplace</div>
          </div>
          <div style={{ marginLeft: 'auto', color: 'var(--text-dim)' }}>›</div>
        </div>
      )}

      {/* SOS */}
      <button onClick={onSOS} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <AlertTriangle size={18} /> Emergency SOS — Alert Security & Police
      </button>

      {/* Quick Access */}
      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>QUICK ACCESS</div>
      <div className="grid-2">
        <QCard icon={<Award size={24} />} title="Skill Passport" sub="Your badges" onClick={() => go('passport')} />
        <QCard icon={<Car size={24} />} title="Book Ride" sub="Industrial Shuttle" onClick={() => go('bus')} />
        <QCard icon={<IndianRupee size={24} />} title="Earnings" sub="Salary details" onClick={() => go('salary')} />
        <QCard icon={<CreditCard size={24} />} title="Smart Access" sub="Card & Canteen" onClick={() => go('access')} />
      </div>
    </div>
  );
}

function QCard({ icon, title, sub, onClick }) {
  return (
    <div className="glass-card flex-col gap-2 action-card" style={{ padding: '0.9rem', cursor: 'pointer' }} onClick={onClick}>
      <div style={{ color: 'var(--primary)', marginBottom: '4px' }}>{icon}</div>
      <strong style={{ fontSize: '0.85rem' }}>{title}</strong>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sub}</span>
    </div>
  );
}

/* ── Company Section ── */
function CompanySection({ user, profile }) {
  const [membership, setMembership] = useState(undefined); // undefined=loading, null=none
  const [request, setRequest] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Watch membership
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'company_members', user.uid), snap => {
      setMembership(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [user]);

  // Watch any pending request
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'join_requests'), where('workerId', '==', user.uid), where('status', '==', 'pending'));
    return onSnapshot(q, s => setRequest(s.docs.length > 0 ? { id: s.docs[0].id, ...s.docs[0].data() } : null));
  }, [user]);

  // Load companies
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'companies'), s => {
      setCompanies(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const sendRequest = async (company) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'join_requests'), {
        workerId: user.uid,
        workerName: profile?.fullName || profile?.email || 'Worker',
        workerEmail: profile?.email || '',
        department: profile?.department || 'General',
        companyId: company.id,
        companyName: company.name,
        status: 'pending',
        timestamp: serverTimestamp(),
      });
      showToast('Request sent to ' + company.name + '!');
    } catch (e) { showToast('Error: ' + e.message); }
    setLoading(false);
  };

  const cancelRequest = async () => {
    if (request) await deleteDoc(doc(db, 'join_requests', request.id));
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = companies.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.industry?.toLowerCase().includes(search.toLowerCase()));

  if (membership === undefined) return <div className="spinner" style={{ margin: '3rem auto' }} />;

  // Already a member
  if (membership) {
    return (
      <div className="flex-col gap-3">
        <h3 style={{ margin: 0 }}>My Company</h3>
        <div className="glass-card" style={{ background: 'linear-gradient(135deg,rgba(30,41,59,0.9),rgba(15,23,42,0.95))' }}>
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
              <Building2 size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{membership.companyName}</h3>
              <span className="badge-green">Active Employee</span>
            </div>
          </div>
          <div className="flex-col gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
            <Row label="Joined" value={membership.joinedAt?.toDate ? membership.joinedAt.toDate().toLocaleDateString('en-IN') : 'Recently'} />
            <Row label="Status" value={<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Active <CheckCircle2 size={14} color="#4ade80" /></span>} />
          </div>
        </div>
        <div className="info-box">
          <CheckCircle2 size={16} color="#4ade80" />
          <span>You are an active member of {membership.companyName}. Contact your HR for any changes.</span>
        </div>
      </div>
    );
  }

  // Pending request
  if (request) {
    return (
      <div className="flex-col gap-3">
        <h3 style={{ margin: 0 }}>Join Request Pending</h3>
        <div className="glass-card text-center flex-col items-center gap-2" style={{ padding: '2rem', borderColor: 'rgba(251,191,36,0.3)' }}>
          <div style={{ padding: '16px', background: 'rgba(251,191,36,0.1)', borderRadius: '50%', color: '#fbbf24', marginBottom: '8px' }}>
            <Clock size={32} />
          </div>
          <h4 style={{ margin: '0 0 6px', color: '#fbbf24' }}>Awaiting Approval</h4>
          <p style={{ margin: '0 0 1rem' }}>Your request to join <strong>{request.companyName}</strong> is pending HR approval.</p>
          <button onClick={cancelRequest} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontWeight: 600, cursor: 'pointer' }}>
            Cancel Request
          </button>
        </div>
      </div>
    );
  }

  // No membership — show search
  return (
    <div className="flex-col gap-3">
      <h3 style={{ margin: 0 }}>Find & Join Your Company</h3>
      <p style={{ margin: 0, fontSize: '0.85rem' }}>Search for your company and send a join request. HR will approve it.</p>

      {/* Search bar */}
      <div className="glass-card flex items-center gap-2" style={{ padding: '0.75rem 1rem' }}>
        <Search size={18} color="var(--text-dim)" />
        <input
          className="search-input"
          placeholder="Search company name or industry..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <X size={16} color="var(--text-dim)" style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card text-center" style={{ color: 'var(--text-muted)', padding: '2rem' }}>
          {companies.length === 0 ? 'No companies registered yet on Tumkuru Connect' : 'No companies match your search'}
        </div>
      )}

      {filtered.map(company => (
        <div key={company.id} className="glass-card flex items-center gap-3" style={{ padding: '0.9rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', flexShrink: 0 }}>
            <Building2 size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{company.industry} · {company.location}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>{company.memberCount || 0} employees</div>
          </div>
          <button onClick={() => sendRequest(company)} disabled={loading} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: '9px', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            Join
          </button>
        </div>
      ))}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ── Skill Passport ── */
function SkillPassport() {
  const { profile } = useUser();
  const certRef = useRef(null);
  const [certs, setCerts] = useState([]);

  const handleCert = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setCerts(prev => [...prev, r.result]);
      r.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-col gap-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="avatar-md">{(profile?.fullName || 'U').charAt(0)}</div>
        <div>
          <h3 style={{ margin: 0 }}>{profile?.fullName || 'Worker'}</h3>
          <p style={{ margin: 0, fontSize: '0.8rem' }}>ID: {profile?.employeeId || '—'} · {profile?.department || 'General'}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h4 style={{ margin: 0 }}>Certificates & Badges</h4>
        <button className="btn btn-outline-sm flex items-center gap-2" onClick={() => certRef.current?.click()}>
          <Upload size={13} /> Upload
        </button>
        <input ref={certRef} type="file" accept="image/*" hidden onChange={handleCert} />
      </div>

      {certs.length === 0
        ? <div className="glass-card text-center flex-col items-center gap-2" style={{ color: 'var(--text-muted)', padding: '2rem' }}>
            <FileText size={28} color="#64748b" />
            <div>No certificates uploaded yet.<br /><span style={{ fontSize: '0.75rem' }}>Upload your certificates to build your Skill Passport.</span></div>
          </div>
        : certs.map((c, i) => (
          <div key={i} className="glass-card flex-col gap-2" style={{ padding: '0.75rem' }}>
            <div className="flex justify-between items-center">
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Certificate #{i + 1}</span>
              <span className="badge-warning">Pending Verification</span>
            </div>
            <img src={c} alt="cert" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8 }} />
          </div>
        ))
      }

      <div className="glass-card">
        <h4 style={{ margin: '0 0 8px' }}>Career Path</h4>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 12 }}>Upload your skills and certificates to generate a personalized career growth path.</div>
        <button className="btn btn-outline-red w-100">Request Badge Verification</button>
      </div>
    </div>
  );
}

/* ── Salary ── */
function Salary() {
  const { profile } = useUser();
  const base = Number(profile?.baseSalary) || 0;
  const pf = Number(profile?.pfDeduction) || 0;
  const bonus = Number(profile?.welfareBonus) || 0;
  const takeHome = base - pf + bonus;

  return (
    <div className="flex-col gap-3">
      <h3 style={{ margin: 0 }}>Earnings</h3>
      <div className="glass-card" style={{ borderTop: '3px solid #ef4444' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>MONTHLY TAKE HOME</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: 12 }}>₹{takeHome.toLocaleString('en-IN')}</div>
        <SRow l="Base Salary" v={`₹${base.toLocaleString('en-IN')}`} />
        <SRow l="PF Deduction" v={`-₹${pf.toLocaleString('en-IN')}`} c="#f87171" />
        <SRow l="Welfare Bonus" v={`+₹${bonus.toLocaleString('en-IN')}`} c="#4ade80" />
      </div>
      {takeHome === 0 && (
        <div className="info-box">
          <Info size={16} />
          <span>Update your salary details in Profile → Edit Profile to see earnings here.</span>
        </div>
      )}
    </div>
  );
}
function SRow({ l, v, c }) {
  return (
    <div className="flex justify-between" style={{ paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 6 }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: c || '#f8fafc' }}>{v}</span>
    </div>
  );
}

/* ── Smart Access ── */
function SmartAccess() {
  const { profile, updateProfile } = useUser();
  const [sub, setSub] = useState('card');
  const [amount, setAmount] = useState('');
  const name = profile?.fullName || 'Worker';

  const handleTopUp = (method) => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return alert('Enter a valid amount');
    const newBal = (profile?.canteenBalance || 0) + Number(amount);
    updateProfile({ canteenBalance: newBal });
    setAmount('');
    alert(`Topped up ₹${amount} via ${method}`);
  };

  return (
    <div className="flex-col gap-3">
      <h3 style={{ margin: 0 }}>Smart Access</h3>

      {/* Digital ID Card */}
      <div className="digital-id-card">
        <div className="flex justify-between mb-3" style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontWeight: 700, letterSpacing: 1, fontSize: '0.8rem' }}>TUMKURU CONNECT</span>
          <span className="badge-active">ACTIVE</span>
        </div>
        <div className="flex items-center gap-3 mb-3" style={{ position: 'relative', zIndex: 1 }}>
          {profile?.photoURL ? <img src={profile.photoURL} alt="" className="id-photo" /> : <div className="avatar-card">{name.charAt(0)}</div>}
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{name}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{profile?.department || 'Worker'} · {profile?.employeeId || '—'}</div>
          </div>
        </div>
        <div className="flex justify-between items-end" style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.65rem', color: '#475569' }}>NFC ENABLED</span>
          <CreditCard size={26} color="#334155" />
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {[['card', 'ID Card'], ['canteen', 'Canteen'], ['buspass', 'Bus Pass']].map(([id, label]) => (
          <button key={id} className={`tab-btn ${sub === id ? 'active' : ''}`} onClick={() => setSub(id)}>{label}</button>
        ))}
      </div>

      <div className="glass-card">
        {sub === 'card' && (
          <>
            <h4 style={{ margin: '0 0 10px' }}>Access Logs</h4>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' }}>No recent access logs.<br />Logs appear when you scan your card at the gate.</div>
          </>
        )}

        {sub === 'canteen' && (
          <>
            <div className="flex justify-between items-center mb-3">
              <span style={{ color: 'var(--text-muted)' }}>Canteen Wallet</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4ade80' }}>₹{profile?.canteenBalance || 0}</span>
            </div>
            <input type="number" className="input-field" placeholder="Enter Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} style={{ marginBottom: 10 }} />
            <div className="flex-col gap-2">
              <button className="btn btn-primary" onClick={() => handleTopUp('Salary Deduction')}>Top Up from Salary</button>
              <button className="btn btn-outline-red" onClick={() => handleTopUp('UPI / Card')}>Top Up via UPI / Card</button>
            </div>
          </>
        )}

        {sub === 'buspass' && (
          <div className="text-center">
            <div className="badge-green" style={{ padding: '0.5rem', borderRadius: 8, marginBottom: '1rem', display: 'inline-block' }}>Valid Bus Pass</div>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, display: 'inline-block', marginBottom: 8 }}>
              <QRCode value={`TMR-${profile?.employeeId || user?.uid?.slice(0, 8) || 'DEMO'}`} size={140} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Show this QR at the bus terminal</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Helpers ── */
function Row({ label, value }) {
  return (
    <div className="flex justify-between" style={{ paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 6 }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
