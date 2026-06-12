/**
 * HRDashboard – Company HR Portal
 * - First login: set company name
 * - View/accept/reject worker join requests
 * - Manage employees, post announcements
 * - Community Feed + Chat via DashboardShell
 */
import { useState, useEffect } from 'react';
import {
  Users, UserCheck, UserX, Building2, Plus, Bell, CheckCircle2,
  XCircle, Clock, Briefcase, Activity, ChevronRight, Megaphone,
  AlertTriangle, Car, PieChart, ClipboardList, HardHat, ShieldCheck, Search, Check, X
} from 'lucide-react';
import {
  collection, query, where, onSnapshot,
  doc, setDoc, updateDoc, deleteDoc, getDoc, serverTimestamp, addDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';
import DashboardShell from './DashboardShell';
import ProfileView from './ProfileView';
import RideHailing from './RideHailing';

/* ── Main Component ── */
export default function HRDashboard() {
  const { user, profile } = useUser();
  const [tab, setTab] = useState('home');
  const [company, setCompany] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  // Load company profile for this HR user
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'companies', user.uid), snap => {
      setCompany(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoadingCompany(false);
    });
    return () => unsub();
  }, [user]);

  if (loadingCompany) {
    return (
      <div className="flex-col items-center justify-center" style={{ flex: 1, gap: 16, minHeight: '100dvh' }}>
        <div className="spinner" /><p>Loading…</p>
      </div>
    );
  }

  // First time: no company set up yet
  if (!company) return <CompanySetup user={user} profile={profile} />;

  const tabs = [
    { id: 'home',     label: 'Dashboard',   icon: <PieChart size={18} /> },
    { id: 'requests', label: 'Join Requests', icon: <UserCheck size={18} /> },
    { id: 'workers',  label: 'Employees',   icon: <Users size={18} /> },
    { id: 'announce', label: 'Announcements', icon: <Megaphone size={18} /> },
    { id: 'bus',      label: 'Book Ride',   icon: <Car size={18} /> },
    { id: 'profile',  label: 'Profile',     icon: <Building2 size={18} /> },
  ];

  return (
    <DashboardShell role="HR Manager" title={company.name} tabs={tabs} activeTab={tab} setActiveTab={setTab}>
      {tab === 'home'     && <HRHome company={company} user={user} />}
      {tab === 'requests' && <JoinRequests company={company} user={user} />}
      {tab === 'workers'  && <EmployeeList company={company} />}
      {tab === 'announce' && <Announcements company={company} user={user} />}
      {tab === 'bus'      && <RideHailing onBack={() => setTab('home')} />}
      {tab === 'profile'  && <ProfileView onNavigate={setTab} />}
    </DashboardShell>
  );
}

/* ── Company Setup (First Login) ── */
function CompanySetup({ user, profile }) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Manufacturing');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const industries = ['Manufacturing', 'Automotive', 'Textile', 'Chemical', 'Food Processing', 'Engineering', 'Electronics', 'Pharma', 'Logistics', 'Other'];

  const handleCreate = async () => {
    if (!name.trim()) { setError('Company name is required'); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, 'companies', user.uid), {
        name: name.trim(),
        industry,
        location: location.trim() || 'Tumkuru, Karnataka',
        hrUid: user.uid,
        hrName: profile?.fullName || profile?.email,
        createdAt: serverTimestamp(),
        memberCount: 0,
      });
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="screen flex-col justify-center" style={{ gap: '1.5rem', overflowY: 'auto' }}>
      <div className="text-center flex-col items-center gap-2">
        <div style={{ padding: '20px', background: 'rgba(239,68,68,0.1)', borderRadius: '50%', color: '#f87171' }}>
          <Building2 size={40} />
        </div>
        <h2 style={{ margin: 0 }}>Set Up Your Company</h2>
        <p style={{ marginTop: 4 }}>Enter your company details to get started on Tumkuru Connect</p>
      </div>

      <div className="glass-card flex-col gap-3">
        {error && <div className="error-banner">{error}</div>}

        <div className="input-group mb-0">
          <label className="input-label">Company / Factory Name *</label>
          <input className="input-field" placeholder="e.g. Sri Sai Auto Components Pvt. Ltd." value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="input-group mb-0">
          <label className="input-label">Industry Sector</label>
          <select className="input-field" value={industry} onChange={e => setIndustry(e.target.value)} style={{ cursor: 'pointer' }}>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div className="input-group mb-0">
          <label className="input-label">Location</label>
          <input className="input-field" placeholder="e.g. KIADB Industrial Area, Tumkuru" value={location} onChange={e => setLocation(e.target.value)} />
        </div>

        <button className="btn btn-primary mt-2 flex items-center justify-center gap-2" disabled={saving || !name.trim()} onClick={handleCreate}>
          {saving ? 'Creating…' : <>Create Company Dashboard <ChevronRight size={16} /></>}
        </button>
      </div>
    </div>
  );
}

/* ── HR Home ── */
function HRHome({ company, user }) {
  const [requests, setRequests] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const q1 = query(collection(db, 'join_requests'), where('companyId', '==', user.uid), where('status', '==', 'pending'));
    const q2 = query(collection(db, 'company_members'), where('companyId', '==', user.uid));
    const u1 = onSnapshot(q1, s => setRequests(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(q2, s => setMembers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); };
  }, [user.uid]);

  return (
    <div className="flex-col gap-3">
      {/* Company Header Card */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg,rgba(30,41,59,0.9),rgba(15,23,42,0.95))', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            <Building2 size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{company.name}</h3>
            <p style={{ margin: 0, fontSize: '0.75rem' }}>{company.industry} · {company.location}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-2">
        <StatCard label="Total Employees" value={members.length} icon={<HardHat size={20} color="var(--primary)" />} />
        <StatCard label="Pending Requests" value={requests.length} icon={<ClipboardList size={20} color="#fbbf24" />} highlight={requests.length > 0} />
      </div>

      {/* Pending Requests Preview */}
      {requests.length > 0 && (
        <div className="glass-card">
          <div className="flex justify-between items-center mb-3">
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} color="#fbbf24" /> Pending Requests
            </h4>
            <span style={{ fontSize: '0.72rem', background: 'rgba(251,191,36,0.12)', padding: '2px 8px', borderRadius: '9999px', color: '#fbbf24' }}>{requests.length} waiting</span>
          </div>
          {requests.slice(0, 3).map(r => (
            <RequestRow key={r.id} req={r} compact />
          ))}
        </div>
      )}

      {/* Quick stats */}
      <div className="glass-card flex-col gap-3">
        <h4 style={{ margin: 0 }}>Company Overview</h4>
        <Row label="Industry" value={company.industry} />
        <Row label="Location" value={company.location} />
        <Row label="HR Manager" value={company.hrName} />
        <Row label="Company ID" value={user.uid.slice(0, 8).toUpperCase()} />
      </div>
    </div>
  );
}

/* ── Join Requests ── */
function JoinRequests({ company, user }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    const q = query(collection(db, 'join_requests'), where('companyId', '==', user.uid));
    return onSnapshot(q, s => setRequests(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user.uid]);

  const filtered = requests.filter(r => r.status === filter);

  const accept = async (req) => {
    await updateDoc(doc(db, 'join_requests', req.id), { status: 'accepted', respondedAt: serverTimestamp() });
    await setDoc(doc(db, 'company_members', req.workerId), {
      companyId: user.uid, companyName: company.name,
      workerName: req.workerName, workerEmail: req.workerEmail,
      joinedAt: serverTimestamp(), status: 'active',
    });
    await updateDoc(doc(db, 'companies', user.uid), { memberCount: (company.memberCount || 0) + 1 });
    // Notify the worker
    await addDoc(collection(db, 'notifications'), {
      userId: req.workerId, type: 'join_accepted',
      title: 'Request Accepted',
      body: `You have been added to ${company.name}!`,
      timestamp: serverTimestamp(), read: false,
    });
  };

  const reject = async (req) => {
    await updateDoc(doc(db, 'join_requests', req.id), { status: 'rejected', respondedAt: serverTimestamp() });
    await addDoc(collection(db, 'notifications'), {
      userId: req.workerId, type: 'join_rejected',
      title: 'Request Not Approved',
      body: `Your request to join ${company.name} was not approved.`,
      timestamp: serverTimestamp(), read: false,
    });
  };

  return (
    <div className="flex-col gap-3">
      <h3 style={{ margin: 0 }}>Join Requests</h3>

      {/* Filter tabs */}
      <div className="tab-bar">
        {['pending', 'accepted', 'rejected'].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && requests.filter(r => r.status === 'pending').length > 0 && (
              <span style={{ marginLeft: 4, background: 'rgba(255,255,255,0.2)', borderRadius: '9999px', padding: '0 5px', fontSize: '0.65rem' }}>
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card text-center flex-col items-center gap-2" style={{ color: 'var(--text-muted)', padding: '3rem 1rem' }}>
          <ShieldCheck size={32} color="#475569" />
          <div>No {filter} requests</div>
        </div>
      ) : (
        <div className="flex-col gap-2">
          {filtered.map(r => (
            <RequestRow key={r.id} req={r} onAccept={() => accept(r)} onReject={() => reject(r)} showActions={filter === 'pending'} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestRow({ req, compact, onAccept, onReject, showActions }) {
  return (
    <div className="glass-card flex items-center justify-between" style={{ padding: compact ? '0.6rem 0' : '0.85rem', border: 'none', borderBottom: compact ? '1px solid rgba(255,255,255,0.05)' : 'none', borderRadius: compact ? 0 : 12, background: compact ? 'transparent' : 'var(--glass)' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{req.workerName}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{req.department || 'General Worker'}</div>
      </div>
      {showActions ? (
        <div className="flex gap-2">
          <button onClick={onReject} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
          <button onClick={onAccept} style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Check size={16} /> Accept</button>
        </div>
      ) : !compact && (
        <div className={`badge-${req.status === 'accepted' ? 'green' : 'red'}`} style={{ fontSize: '0.7rem' }}>
          {req.status.toUpperCase()}
        </div>
      )}
    </div>
  );
}

/* ── Employee Directory ── */
function EmployeeList({ company }) {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!company?.id) return;
    const q = query(collection(db, 'company_members'), where('companyId', '==', company.id));
    return onSnapshot(q, s => setEmployees(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [company?.id]);

  const filtered = employees.filter(e => e.workerName?.toLowerCase().includes(search.toLowerCase()) || e.workerEmail?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-col gap-3">
      <h3 style={{ margin: 0 }}>Employee Directory</h3>

      <div className="glass-card flex items-center gap-2" style={{ padding: '0.75rem 1rem' }}>
        <Search size={18} color="var(--text-dim)" />
        <input
          className="search-input"
          placeholder="Search employees..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="glass-card text-center" style={{ color: 'var(--text-muted)', padding: '2rem' }}>No employees found.</div>
        ) : filtered.map(e => (
          <div key={e.id} className="glass-card flex items-center gap-3" style={{ padding: '0.85rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {(e.workerName || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{e.workerName}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{e.workerEmail || 'No email provided'}</div>
            </div>
            <span className="badge-green" style={{ fontSize: '0.65rem' }}>Active</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Announcements ── */
function Announcements({ company, user }) {
  const [text, setText] = useState('');
  const [posts, setPosts] = useState([]);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), where('companyId', '==', user.uid));
    return onSnapshot(q, s => {
      setPosts(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });
  }, [user.uid]);

  const post = async () => {
    if (!text.trim()) return;
    setPosting(true);
    await addDoc(collection(db, 'announcements'), {
      companyId: user.uid,
      companyName: company.name,
      text: text.trim(),
      createdAt: serverTimestamp(),
      author: company.hrName
    });
    setText('');
    setPosting(false);
  };

  const deletePost = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      await deleteDoc(doc(db, 'announcements', id));
    }
  };

  return (
    <div className="flex-col gap-3">
      <h3 style={{ margin: 0 }}>Announcements</h3>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Broadcast messages to all {company.name} employees. They will see this on their home dashboard.</p>

      <div className="glass-card flex-col gap-3">
        <textarea
          className="input-field"
          style={{ minHeight: 80, resize: 'none' }}
          placeholder="Type an announcement..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button className="btn btn-primary flex items-center justify-center gap-2" disabled={!text.trim() || posting} onClick={post}>
          <Megaphone size={16} /> {posting ? 'Posting...' : 'Broadcast Announcement'}
        </button>
      </div>

      <h4 style={{ margin: '1rem 0 0' }}>Recent Broadcasts</h4>
      {posts.length === 0 ? (
        <div className="glass-card text-center" style={{ color: 'var(--text-muted)', padding: '2rem' }}>No announcements made yet.</div>
      ) : (
        posts.map(p => (
          <div key={p.id} className="glass-card flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em' }}>COMPANY ANNOUNCEMENT</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                  {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now'}
                </div>
              </div>
              <button onClick={() => deletePost(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 4 }}><X size={16} /></button>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{p.text}</p>
          </div>
        ))
      )}
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

function StatCard({ label, value, icon, highlight }) {
  return (
    <div className="glass-card flex-col items-center justify-center gap-1" style={{ padding: '1.25rem', borderColor: highlight ? 'rgba(251,191,36,0.4)' : undefined, background: highlight ? 'rgba(251,191,36,0.05)' : undefined }}>
      <div style={{ marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: highlight ? '#fbbf24' : '#f8fafc', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.05em', textAlign: 'center' }}>{label.toUpperCase()}</div>
    </div>
  );
}
