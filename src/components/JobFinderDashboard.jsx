import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, User, Filter, Car } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import DashboardShell from './DashboardShell';
import LiveMap from './LiveMap';
import ProfileView from './ProfileView';
import RideHailing from './RideHailing';

export default function JobFinderDashboard({ onSOS }) {
  const { profile } = useUser();
  const [tab, setTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Explore Jobs', icon: <Search size={18} /> },
    { id: 'map', label: 'Live Map', icon: <MapPin size={18} /> },
    { id: 'applications', label: 'My Applications', icon: <Briefcase size={18} /> },
    { id: 'bus', label: 'Book Ride', icon: <Car size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
  ];

  const name = profile?.fullName || profile?.email?.split('@')[0] || 'User';

  return (
    <DashboardShell role="Job Finder" title="Job Portal" tabs={tabs} activeTab={tab} setActiveTab={setTab}>
      {tab === 'home' && <JobList />}
      {tab === 'map' && <JobMap />}
      {tab === 'applications' && <Applications />}
      {tab === 'bus' && <RideHailing onBack={() => setTab('home')} />}
      {tab === 'profile' && <ProfileView onNavigate={setTab} />}
    </DashboardShell>
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
          Showing active hiring factories near your location.
        </p>
      </div>
    </div>
  );
}

function JobList() {
  const { user, profile } = useUser();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'jobs'), where('active', '==', true));
    return onSnapshot(q, s => setJobs(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds)));
  }, []);

  const applyForJob = async (job) => {
    if (!profile?.photoURL && !profile?.idCardURL) {
      alert('Please complete your profile and upload certificates in the Profile tab before applying.');
      return;
    }
    try {
      await addDoc(collection(db, 'join_requests'), {
        companyId: job.companyId,
        companyName: job.companyName,
        workerId: user.uid,
        workerName: profile?.fullName || profile?.email || 'User',
        workerEmail: profile?.email || '',
        jobId: job.id,
        jobTitle: job.title,
        certificateUrl: profile?.idCardURL || '',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      // Notify HR
      await addDoc(collection(db, 'notifications'), {
        userId: job.companyId,
        type: 'new_application',
        title: 'New Job Application',
        body: `${profile?.fullName || 'A candidate'} applied for ${job.title}`,
        timestamp: serverTimestamp(),
        read: false
      });
      alert('Application submitted successfully! Check "My Applications" tab.');
    } catch(err) {
      alert('Error applying: ' + err.message);
    }
  };

  return (
    <div className="flex-col gap-3">
      <div className="search-bar glass-card">
        <Search size={18} color="var(--text-muted)" />
        <input type="text" placeholder="Search industry roles..." className="search-input" />
        <Filter size={18} color="#f87171" style={{ cursor: 'pointer' }} />
      </div>

      <div className="flex justify-between items-center">
        <h3 style={{ margin: 0 }}>Active Jobs</h3>
      </div>

      <div className="flex-col gap-3">
        {jobs.length === 0 ? <div className="glass-card text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>No active job listings found.</div> : jobs.map(j => (
          <div key={j.id} className="glass-card flex-col gap-2" style={{ padding: '1rem' }}>
            <div className="flex justify-between items-start">
              <div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{j.title}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{j.companyName}</div>
              </div>
              <div className="flex items-center gap-1" style={{ color: '#4ade80', fontWeight: 600 }}>
                ₹{j.wage?.toLocaleString('en-IN')}/mo
              </div>
            </div>
            {j.tags && j.tags.length > 0 && (
              <div className="flex gap-2 mt-1 flex-wrap">
                {j.tags.map((t, i) => (
                  <span key={i} className="badge-outline" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{t}</span>
                ))}
              </div>
            )}
            <button className="btn btn-primary mt-2" style={{ width: '100%' }} onClick={() => applyForJob(j)}>Apply Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Applications() {
  const { user } = useUser();
  const [apps, setApps] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'join_requests'), where('workerId', '==', user.uid));
    return onSnapshot(q, s => setApps(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds)));
  }, [user.uid]);

  return (
    <div className="flex-col gap-3">
      <h2 style={{ margin: 0 }}>My Applications</h2>
      {apps.length === 0 ? <div className="glass-card text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>You haven't applied to any jobs yet.</div> : apps.map(a => (
        <div key={a.id} className="glass-card flex-col gap-2">
          <div className="flex justify-between">
            <strong style={{ fontSize: '1rem' }}>{a.jobTitle || 'General Application'}</strong>
            <span className={`badge-${a.status === 'accepted' ? 'green' : a.status === 'rejected' ? 'red' : 'warning'}`}>
              {a.status === 'pending' ? 'Under Review' : a.status.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.companyName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
            Applied on {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString('en-IN') : 'Recently'}
          </div>
        </div>
      ))}
    </div>
  );
}
