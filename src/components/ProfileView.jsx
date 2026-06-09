import { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { Edit3, Save, X, LogOut, Camera, Upload, ShieldCheck, CreditCard, Phone, ChevronRight } from 'lucide-react';

export default function ProfileView({ onNavigate }) {
  const { profile, updateProfile, signOut, deleteProfile } = useUser();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const photoRef = useRef(null);
  const idRef = useRef(null);
  const name = profile?.fullName || 'User';

  const startEdit = (s) => {
    const fields = s === 'personal'
      ? { fullName: profile?.fullName||'', dob: profile?.dob||'', phone: profile?.phone||'', emergencyContact: profile?.emergencyContact||'', bloodGroup: profile?.bloodGroup||'', address: profile?.address||'', aadhar: profile?.aadhar||'' }
      : s === 'emergency'
      ? { emName1: profile?.emName1||'', emPhone1: profile?.emPhone1||'', emName2: profile?.emName2||'', emPhone2: profile?.emPhone2||'' }
      : { factoryUnit: profile?.factoryUnit||'', department: profile?.department||'', supervisor: profile?.supervisor||'' };
    setForm(fields); setEditing(s);
  };

  const save = () => { updateProfile(form); setEditing(null); };

  const handlePhoto = (field) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2*1024*1024) return;
    const r = new FileReader();
    r.onloadend = () => updateProfile({ [field]: r.result });
    r.readAsDataURL(file);
  };

  return (
    <div className="flex-col gap-3">
      {/* Profile Header with Photo */}
      <div className="text-center mb-2">
        <div className="profile-photo-wrap" onClick={() => photoRef.current?.click()}>
          {profile?.photoURL
            ? <img src={profile.photoURL} alt="You" className="profile-photo" />
            : <div className="profile-photo-placeholder">{name.charAt(0)}</div>
          }
          <div className="photo-overlay"><Camera size={18} /></div>
        </div>
        <input ref={photoRef} type="file" accept="image/*" hidden onChange={handlePhoto('photoURL')} />
        <h2 style={{ marginBottom: 2 }}>{name}</h2>
        <p>{profile?.department || profile?.role} • {profile?.employeeId || 'N/A'}</p>
      </div>

      {/* ID Card Section */}
      <div className="glass-card flex-col gap-2" style={{ padding: '1rem' }}>
        <h4 style={{ color: '#94a3b8', margin: 0 }}>ID Card</h4>
        {profile?.idCardURL ? (
          <div className="id-card-display">
            <img src={profile.idCardURL} alt="ID Card" />
            <button className="btn btn-outline-sm mt-2" onClick={() => idRef.current?.click()}>
              <Upload size={14} /> Replace
            </button>
          </div>
        ) : (
          <button className="btn btn-outline-sm" onClick={() => idRef.current?.click()}>
            <Upload size={14} /> Upload ID Card
          </button>
        )}
        <input ref={idRef} type="file" accept="image/*" hidden onChange={handlePhoto('idCardURL')} />
      </div>

      {/* Personal Info */}
      <div className="glass-card flex-col gap-2" style={{ padding: '1rem' }}>
        <div className="flex justify-between items-center">
          <h4 style={{ color: '#94a3b8', margin: 0 }}>Personal Info</h4>
          {editing === 'personal'
            ? <div className="flex gap-2"><Save size={18} color="#4ade80" style={{ cursor:'pointer' }} onClick={save} /><X size={18} color="#f87171" style={{ cursor:'pointer' }} onClick={() => setEditing(null)} /></div>
            : <Edit3 size={16} style={{ cursor:'pointer', color:'#64748b' }} onClick={() => startEdit('personal')} />
          }
        </div>
        {editing === 'personal' ? (
          <div className="flex-col gap-2">
            <MiniInput label="Name" name="fullName" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
            <MiniInput label="Aadhaar" name="aadhar" value={form.aadhar} onChange={e => setForm({...form, aadhar: e.target.value})} />
            <MiniInput label="DOB" name="dob" type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
            <MiniInput label="Phone" name="phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            <MiniInput label="Blood" name="bloodGroup" value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})} />
            <MiniInput label="Address" name="address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>
        ) : (
          <div className="flex-col gap-1">
            <Row label="Name" value={profile?.fullName} />
            <Row label="Aadhaar" value={profile?.aadhar} />
            <Row label="DOB" value={profile?.dob} />
            <Row label="Phone" value={profile?.phone} />
            <Row label="Email" value={profile?.email} />
            <Row label="Blood" value={profile?.bloodGroup} />
            <Row label="Address" value={profile?.address} />
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="glass-card flex-col gap-2" style={{ padding: '1rem' }}>
        <div className="flex justify-between items-center">
          <h4 style={{ color: '#94a3b8', margin: 0 }}>Emergency Contacts</h4>
          {editing === 'emergency'
            ? <div className="flex gap-2"><Save size={18} color="#4ade80" style={{ cursor:'pointer' }} onClick={save} /><X size={18} color="#f87171" style={{ cursor:'pointer' }} onClick={() => setEditing(null)} /></div>
            : <Edit3 size={16} style={{ cursor:'pointer', color:'#64748b' }} onClick={() => startEdit('emergency')} />
          }
        </div>
        {editing === 'emergency' ? (
          <div className="flex-col gap-2">
            <MiniInput label="Primary Name" name="emName1" value={form.emName1} onChange={e => setForm({...form, emName1: e.target.value})} />
            <MiniInput label="Primary Phone" name="emPhone1" value={form.emPhone1} onChange={e => setForm({...form, emPhone1: e.target.value})} />
            <MiniInput label="Secondary Name" name="emName2" value={form.emName2} onChange={e => setForm({...form, emName2: e.target.value})} />
            <MiniInput label="Secondary Phone" name="emPhone2" value={form.emPhone2} onChange={e => setForm({...form, emPhone2: e.target.value})} />
          </div>
        ) : (
          <div className="flex-col gap-1">
            <Row label={profile?.emName1 || 'Primary Contact'} value={profile?.emPhone1 || 'Not set'} />
            <Row label={profile?.emName2 || 'Secondary Contact'} value={profile?.emPhone2 || 'Not set'} />
          </div>
        )}
      </div>

      {/* Work Records */}
      <div className="glass-card flex-col gap-2" style={{ padding: '1rem' }}>
        <div className="flex justify-between items-center">
          <h4 style={{ color: '#94a3b8', margin: 0 }}>Work Records</h4>
          {editing === 'work'
            ? <div className="flex gap-2"><Save size={18} color="#4ade80" style={{ cursor:'pointer' }} onClick={save} /><X size={18} color="#f87171" style={{ cursor:'pointer' }} onClick={() => setEditing(null)} /></div>
            : <Edit3 size={16} style={{ cursor:'pointer', color:'#64748b' }} onClick={() => startEdit('work')} />
          }
        </div>
        {editing === 'work' ? (
          <div className="flex-col gap-2">
            <div className="input-group mb-0"><label className="input-label">Unit</label>
              <select className="input-field" value={form.factoryUnit} onChange={e => setForm({...form, factoryUnit: e.target.value})}>
                <option value="">Select...</option><option>Sri Sai Auto</option><option>Tumkur Machining Hub</option><option>Precision Parts</option><option>Other</option>
              </select>
            </div>
            <MiniInput label="Dept" name="department" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
            <MiniInput label="Supervisor" name="supervisor" value={form.supervisor} onChange={e => setForm({...form, supervisor: e.target.value})} />
          </div>
        ) : (
          <div className="flex-col gap-1">
            <Row label="Unit" value={profile?.factoryUnit} />
            <Row label="Dept" value={profile?.department} />
            <Row label="Supervisor" value={profile?.supervisor} />
          </div>
        )}
      </div>

      {/* Nav Cards */}
      {onNavigate && (
        <>
          {profile?.role === 'worker' && (
            <>
              <NavLink icon={<ShieldCheck size={22} color="#f87171" />} label="Skill Passport" onClick={() => onNavigate('passport')} />
              <NavLink icon={<CreditCard size={22} color="#f87171" />} label="Linked Cards" onClick={() => onNavigate('access')} />
            </>
          )}
        </>
      )}

      <div className="flex gap-2 mt-2">
        <button className="btn btn-ghost flex-1" style={{ color: '#94a3b8' }} onClick={signOut}>
          <LogOut size={18} /> Sign Out
        </button>
        <button 
          className="btn btn-ghost flex-1" 
          style={{ color: '#ef4444' }} 
          onClick={() => { if(window.confirm('Are you sure you want to permanently delete your profile?')) deleteProfile(); }}
        >
          <X size={18} /> Delete Profile
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between" style={{ fontSize: '0.85rem' }}><span style={{ color: '#64748b' }}>{label}</span><span>{value || '—'}</span></div>;
}
function MiniInput({ label, ...props }) {
  return <div className="input-group mb-0"><label className="input-label">{label}</label><input className="input-field" style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }} {...props} /></div>;
}
function NavLink({ icon, label, onClick }) {
  return <div className="glass-card flex justify-between items-center" style={{ padding: '1rem', cursor: 'pointer' }} onClick={onClick}><div className="flex items-center gap-3">{icon}<span style={{ fontWeight: 600 }}>{label}</span></div><ChevronRight size={18} color="#475569" /></div>;
}
