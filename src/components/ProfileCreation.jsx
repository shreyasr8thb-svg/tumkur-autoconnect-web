import { useState, useRef } from 'react';
import { User, Briefcase, Target, CheckCircle, Truck, Search, Users, Camera, Upload } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import logo from '../assets/logo.png';

const ROLES = [
  { id: 'worker', label: 'Factory Worker', icon: <User size={20} />, desc: 'I work in a factory' },
  { id: 'jobfinder', label: 'Job Finder', icon: <Search size={20} />, desc: 'I\'m looking for factory jobs' },
  { id: 'driver', label: 'Bus Driver', icon: <Truck size={20} />, desc: 'I drive factory shuttles' },
  { id: 'hr', label: 'HR / Owner', icon: <Users size={20} />, desc: 'I manage a factory' },
];

export default function ProfileCreation({ onCancel }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const photoRef = useRef(null);
  const idRef = useRef(null);

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', fullName: '', dob: '', phone: '',
    factoryUnit: '', department: '', supervisor: '', careerGoal: '', role: 'worker',
    photoURL: '', idCardURL: '', emergencyContact: '', bloodGroup: '', address: '',
  });

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (field) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('File must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, [field]: reader.result });
    reader.readAsDataURL(file);
  };

  const next = () => {
    if (step === 1) {
      if (!form.fullName || !form.email || !form.password) { setError('Name, email and password required.'); return; }
      if (form.password.length < 6) { setError('Password must be 6+ characters.'); return; }
      if (form.password !== form.confirmPassword) { setError('Passwords don\'t match.'); return; }
    }
    setError(''); setStep(step + 1);
  };

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.fullName, photoURL: form.photoURL || '' });
      const data = { ...form, password: undefined, confirmPassword: undefined,
        employeeId: `TMR-${Math.floor(1000+Math.random()*9000)}`, canteenBalance: 500,
        profileComplete: true, createdAt: new Date().toISOString() };
      delete data.password; delete data.confirmPassword;
      try { await setDoc(doc(db, 'users', cred.user.uid), data); } catch {}
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'Email already registered.' : err.message || 'Failed.');
      setLoading(false);
    }
  };

  return (
    <div className="screen flex-col" style={{ paddingBottom: 20 }}>
      <div className="flex justify-between items-center mb-3">
        <h2 style={{ margin: 0 }}>Create Profile</h2>
        <button onClick={onCancel} className="btn-link">← Back</button>
      </div>

      {/* Steps */}
      <div className="steps-bar mb-3">
        {['Identity', 'Role & Photo', 'Work Info'].map((l, i) => (
          <div key={i} className={`step ${step > i ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
            <div className="step-num">{step > i + 1 ? '✓' : i + 1}</div>
            <span>{l}</span>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {error && <div className="error-box mb-2">{error}</div>}

        <form onSubmit={step === 3 ? submit : (e) => e.preventDefault()} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {step === 1 && (
            <div className="flex-col gap-3 flex-1">
              <h3>Identity Details</h3>
              <Input label="Full Name *" name="fullName" value={form.fullName} onChange={set} />
              <Input label="Email *" name="email" type="email" value={form.email} onChange={set} />
              <Input label="Password *" name="password" type="password" value={form.password} onChange={set} placeholder="Min 6 chars" />
              <Input label="Confirm Password *" name="confirmPassword" type="password" value={form.confirmPassword} onChange={set} />
              <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={set} placeholder="+91" />
              <Input label="Date of Birth" name="dob" type="date" value={form.dob} onChange={set} />
            </div>
          )}

          {step === 2 && (
            <div className="flex-col gap-3 flex-1">
              <h3>Select Your Role</h3>
              <div className="role-grid">
                {ROLES.map(r => (
                  <div key={r.id} className={`role-card ${form.role === r.id ? 'selected' : ''}`} onClick={() => setForm({ ...form, role: r.id })}>
                    {r.icon}
                    <strong>{r.label}</strong>
                    <span>{r.desc}</span>
                  </div>
                ))}
              </div>

              <h3 className="mt-3">Your Photo</h3>
              <div className="flex gap-3 items-center">
                <div className="photo-preview" onClick={() => photoRef.current?.click()}>
                  {form.photoURL ? <img src={form.photoURL} alt="Photo" /> : <Camera size={28} />}
                </div>
                <div className="flex-col gap-1 flex-1">
                  <button type="button" className="btn btn-outline-sm" onClick={() => photoRef.current?.click()}>
                    <Upload size={14} /> Upload Photo
                  </button>
                  <span style={{ fontSize: '0.7rem', color: '#888' }}>Max 2MB, JPG/PNG</span>
                </div>
                <input ref={photoRef} type="file" accept="image/*" hidden onChange={handleFile('photoURL')} />
              </div>

              <h3 className="mt-3">ID Card (Optional)</h3>
              <div className="flex gap-3 items-center">
                <div className="id-preview" onClick={() => idRef.current?.click()}>
                  {form.idCardURL ? <img src={form.idCardURL} alt="ID" /> : <CreditCardIcon />}
                </div>
                <div className="flex-col gap-1 flex-1">
                  <button type="button" className="btn btn-outline-sm" onClick={() => idRef.current?.click()}>
                    <Upload size={14} /> Upload ID Card
                  </button>
                  <span style={{ fontSize: '0.7rem', color: '#888' }}>Factory / Aadhaar / Any Govt ID</span>
                </div>
                <input ref={idRef} type="file" accept="image/*" hidden onChange={handleFile('idCardURL')} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-col gap-3 flex-1">
              <h3>Work Information</h3>
              {(form.role === 'worker' || form.role === 'jobfinder') && (
                <>
                  <div className="input-group mb-0">
                    <label className="input-label">Factory Unit</label>
                    <select name="factoryUnit" className="input-field" value={form.factoryUnit} onChange={set}>
                      <option value="">Select...</option>
                      <option>Sri Sai Auto Components</option>
                      <option>Tumkur Machining Hub</option>
                      <option>Precision Parts Pvt Ltd</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <Input label="Department" name="department" value={form.department} onChange={set} placeholder="CNC, Welding..." />
                </>
              )}
              <Input label="Emergency Contact" name="emergencyContact" type="tel" value={form.emergencyContact} onChange={set} />
              <div className="input-group mb-0">
                <label className="input-label">Blood Group</label>
                <select name="bloodGroup" className="input-field" value={form.bloodGroup} onChange={set}>
                  <option value="">Select...</option>
                  {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <Input label="Address" name="address" value={form.address} onChange={set} placeholder="Your residential address" />
              <div className="info-box mt-2">
                <CheckCircle size={16} color="#4ade80" /> Govt. ID verification will be done post-registration.
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-3" style={{ marginTop: 'auto' }}>
            {step > 1 && <button type="button" className="btn btn-ghost" onClick={() => { setError(''); setStep(step-1); }} style={{flex:1}}>Back</button>}
            {step < 3
              ? <button type="button" className="btn btn-primary" onClick={next} style={{flex:2}}>Next →</button>
              : <button type="submit" className="btn btn-primary" disabled={loading} style={{flex:2}}>{loading ? 'Creating...' : 'Create Profile'}</button>
            }
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="input-group mb-0">
      <label className="input-label">{label}</label>
      <input className="input-field" {...props} />
    </div>
  );
}

function CreditCardIcon() {
  return <div style={{ width: 40, height: 28, border: '2px dashed #555', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '0.6rem', color: '#555' }}>ID</span></div>;
}
