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
  AlertTriangle, Car, PieChart
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
      {tab === 'bus'      && <RideHailing />}
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
      <div className="text-center">
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🏭</div>
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

        <button className="btn btn-primary mt-2" disabled={saving || !name.trim()} onClick={handleCreate}>
          {saving ? 'Creating…' : 'Create Company Dashboard →'}
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
          <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏭</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{company.name}</h3>
            <p style={{ margin: 0, fontSize: '0.75rem' }}>{company.industry} · {company.location}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-2">
        <StatCard label="Total Employees" value={members.length} icon="👷" />
        <StatCard label="Pending Requests" value={requests.length} icon="📋" highlight={requests.length > 0} />
      </div>

      {/* Pending Requests Preview */}
      {requests.length > 0 && (
        <div className="glass-card">
          <div className="flex justify-between items-center mb-3">
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} color="#fbbf24" /> Pending Requests
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', background: 'rgba(251,191,36,0.12)', padding: '2px 8px', borderRadius: '9999px', color: '#fbbf24' }}>{requests.length} waiting</span>
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
      title: '✅ Request Accepted',
      body: `You have been added to ${company.name}!`,
      timestamp: serverTimestamp(), read: false,
    });
  };

  const reject = async (req) => {
    await updateDoc(doc(db, 'join_requests', req.id), { status: 'rejected', respondedAt: serverTimestamp() });
    await addDoc(collection(db, 'notifications'), {
      userId: req.workerId, type: 'join_rejected',
      title: '❌ Request Not Approved',
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

      {filtered.length === 0
        ? <div className="glass-card text-center" style={{ color: 'var(--text-muted)', padding: '2rem' }}>No {filter} requests</div>
        : filtered.map(req => (
          <RequestRow key={req.id} req={req} onAccept={accept} onReject={reject} />
        ))
      }
    </div>
  );
}

function RequestRow({ req, onAccept, onReject, compact }) {
  return (
    <div className="glass-card flex items-center gap-3" style={{ padding: compact ? '0.75rem' : '1rem', marginBottom: compact ? '0.5rem' : 0 }}>
      <div className="avatar-sm" style={{ borderRadius: '10px', background: 'rgba(239,68,68,0.2)', color: '#f87171', flexShrink: 0 }}>
        {(req.workerName || 'W').charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.workerName}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{req.workerEmail} · {req.department || 'General'}</div>
        {req.status !== 'pending' && (
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: req.status === 'accepted' ? '#4ade80' : '#f87171' }}>
            {req.status === 'accepted' ? '✅ Accepted' : '❌ Rejected'}
          </span>
        )}
      </div>
      {req.status === 'pending' && !compact && (
        <div className="flex gap-2">
          <button onClick={() => onAccept(req)} style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '6px 12px', color: '#4ade80', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
            ✓ Accept
          </button>
          <button onClick={() => onReject(req)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '6px 12px', color: '#f87171', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
            ✗ Reject
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Employee List ── */
function EmployeeList({ company }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'company_members'), where('companyId', '==', company.hrUid));
    return onSnapshot(q, s => setMembers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [company.hrUid]);

  return (
    <div className="flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 style={{ margin: 0 }}>Employees <span style={{ fontWeight: 400, color: 'var(--text-dim)', fontSize: '0.85rem' }}>({members.length})</span></h3>
      </div>
      {members.length === 0
        ? <div className="glass-card text-center" style={{ color: 'var(--text-muted)', padding: '2rem' }}>No employees yet. Accept join requests to add workers.</div>
        : members.map(m => (
          <div key={m.id} className="glass-card flex items-center gap-3" style={{ padding: '0.85rem' }}>
            <div className="avatar-sm" style={{ borderRadius: '10px' }}>{(m.workerName || 'W').charAt(0)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.workerName}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{m.workerEmail}</div>
            </div>
            <span style={{ fontSize: '0.68rem', background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>Active</span>
          </div>
        ))
      }
    </div>
  );
}

/* ── Announcements ── */
function Announcements({ company, user }) {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), where('companyId', '==', user.uid));
    return onSnapshot(q, s => setPosts(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))));
  }, [user.uid]);

  const post = async () => {
    if (!text.trim()) return;
    setPosting(true);
    await addDoc(collection(db, 'announcements'), {
      companyId: user.uid, companyName: company.name,
      text: text.trim(), createdAt: serverTimestamp(),
    });
    setText(''); setPosting(false);
  };

  return (
    <div className="flex-col gap-3">
      <h3 style={{ margin: 0 }}>Post Announcement</h3>
      <div className="glass-card flex-col gap-3">
        <textarea
          className="input-field"
          placeholder="Write an announcement to all your employees..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          style={{ resize: 'none' }}
        />
        <button className="btn btn-primary" onClick={post} disabled={posting || !text.trim()}>
          {posting ? 'Posting…' : <><Megaphone size={16} /> Post Announcement</>}
        </button>
      </div>
      {posts.map(p => (
        <div key={p.id} className="glass-card">
          <p style={{ margin: 0 }}>{p.text}</p>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 6 }}>
            {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
          </div>
        </div>
      ))}
      {posts.length === 0 && <div className="glass-card text-center" style={{ color: 'var(--text-muted)', padding: '1.5rem' }}>No announcements yet</div>}
    </div>
  );
}

/* ── Helpers ── */
function StatCard({ label, value, icon, highlight }) {
  return (
    <div className="glass-card flex-col gap-1" style={{ border: highlight ? '1px solid rgba(251,191,36,0.3)' : undefined }}>
      <div style={{ fontSize: '1.6rem' }}>{icon}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: highlight ? '#fbbf24' : 'var(--text-main)' }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.6rem' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
