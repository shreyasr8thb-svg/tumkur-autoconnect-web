import { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { Edit3, Save, X, LogOut, Camera, Upload, ShieldCheck, CreditCard, Phone, ChevronRight } from 'lucide-react';

export default function ProfileView({ onNavigate }) {
  const { profile, updateProfile, signOut } = useUser();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const photoRef = useRef(null);
  const idRef = useRef(null);
  const name = profile?.fullName || 'User';

  const startEdit = (s) => {
    const fields = s === 'personal'
      ? { fullName: profile?.fullName||'', dob: profile?.dob||'', phone: profile?.phone||'', emergencyContact: profile?.emergencyContact||'', bloodGroup: profile?.bloodGroup||'', address: profile?.address||'' }
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
            <MiniInput label="DOB" name="dob" type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
            <MiniInput label="Phone" name="phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            <MiniInput label="Emergency" name="emergencyContact" value={form.emergencyContact} onChange={e => setForm({...form, emergencyContact: e.target.value})} />
            <MiniInput label="Address" name="address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>
        ) : (
          <div className="flex-col gap-1">
            <Row label="Name" value={profile?.fullName} />
            <Row label="DOB" value={profile?.dob} />
            <Row label="Phone" value={profile?.phone} />
            <Row label="Email" value={profile?.email} />
            <Row label="Blood" value={profile?.bloodGroup} />
            <Row label="Emergency" value={profile?.emergencyContact} />
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
          <NavLink icon={<ShieldCheck size={22} color="#f87171" />} label="Skill Passport" onClick={() => onNavigate('passport')} />
          <NavLink icon={<CreditCard size={22} color="#f87171" />} label="Linked Cards" onClick={() => onNavigate('access')} />
          <NavLink icon={<Phone size={22} color="#f87171" />} label="Emergency Contacts" />
        </>
      )}

      <button className="btn btn-ghost mt-2" style={{ color: '#f87171' }} onClick={signOut}>
        <LogOut size={18} /> Sign Out
      </button>
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
