import { useState, useRef } from 'react';
import { User, Briefcase, Target, CheckCircle, Truck, Search, Users, Camera, Upload } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import logo from '../assets/logo.png';
import { useUser } from '../context/UserContext';

const ROLES = [
  { id: 'worker', label: 'Industry Worker', icon: <User size={20} />, desc: 'I work in the industrial ecosystem' },
  { id: 'jobfinder', label: 'Job Finder', icon: <Search size={20} />, desc: 'I\'m looking for industrial jobs' },
  { id: 'driver', label: 'Bus Driver', icon: <Truck size={20} />, desc: 'I drive industrial shuttles' },
  { id: 'hr', label: 'Business Owner / HR', icon: <Users size={20} />, desc: 'I manage a company' },
];

export default function ProfileCreation({ onCancel, isCompleting = false }) {
  const { user, updateProfile: updateCtxProfile, showToast } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [userOtp, setUserOtp] = useState('');
  const photoRef = useRef(null);
  const idRef = useRef(null);

  const [form, setForm] = useState({
    email: user?.email || '', password: '', confirmPassword: '', fullName: user?.displayName || '', dob: '', phone: '',
    factoryUnit: '', department: '', supervisor: '', careerGoal: '', role: 'worker',
    photoURL: user?.photoURL || '', idCardURL: '', emergencyContact: '', bloodGroup: '', address: '', aadhar: '',
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
      if (!form.fullName || !form.email || (!isCompleting && !form.password)) { setError('Name, email and password required.'); return; }
      if (!form.aadhar || form.aadhar.length !== 12) { setError('Valid 12-digit Aadhaar required.'); return; }
      if (!isCompleting && form.password.length < 6) { setError('Password must be 6+ characters.'); return; }
      if (!isCompleting && form.password !== form.confirmPassword) { setError('Passwords don\'t match.'); return; }
    }
    setError(''); setStep(step + 1);
  };

  const triggerOtp = async (e) => {
    e.preventDefault();
    if (isCompleting) return finalSubmit();
    
    setLoading(true); setError('');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: form.email,
          subject: 'Your Tumkuru Connect Verification Code',
          text: `Your OTP is: ${otp}`,
          html: `<div style="font-family:sans-serif;padding:20px;"><h2>Verify Your Email</h2><p>Your one-time password (OTP) is: <strong style="font-size:24px;color:#e11d48;letter-spacing:2px;">${otp}</strong></p><p>Please enter this code in the app to complete your registration.</p></div>`
        })
      });
      setStep(4); // Move to OTP step
    } catch (err) {
      setError('Failed to send OTP to email. Please check your address.');
    } finally {
      setLoading(false);
    }
  };

  const finalSubmit = async () => {
    setLoading(true); setError('');
    try {
      let currentUid = user?.uid;
      
      if (!isCompleting) {
        if (userOtp !== generatedOtp) {
          setError('Invalid OTP. Please try again.');
          setLoading(false);
          return;
        }

        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(cred.user, { displayName: form.fullName, photoURL: form.photoURL || '' });
        currentUid = cred.user.uid;
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: form.email,
              subject: 'Welcome to Tumkuru Connect!',
              text: 'You have successfully created your Tumkuru Connect account.',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://tumkur-autoconnect-web.vercel.app/assets/logo.png" alt="Tumkuru Connect Logo" style="width: 80px; height: 80px; border-radius: 15px;" />
                  </div>
                  <h2 style="color: #1e293b; text-align: center;">Welcome to Tumkuru Connect! 🎉</h2>
                  <p style="color: #475569; font-size: 16px;">Hello ${form.fullName},</p>
                  <p style="color: #475569; font-size: 16px;">Your profile has been created successfully. We're thrilled to have you onboard!</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://tumkur-autoconnect-web.vercel.app" style="background-color: #e11d48; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Open Dashboard</a>
                  </div>
                  <p style="color: #475569; font-size: 14px;">If you have any questions, feel free to reply to this email.</p>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                  <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Tumkuru Connect. All rights reserved.</p>
                </div>
              `
            })
          });
          showToast('Profile created! Welcome email sent.');
        } catch(e) { console.error('Failed to send email', e); }
      } else {
        await updateProfile(user, { displayName: form.fullName, photoURL: form.photoURL || '' });
      }
      
      const data = { ...form, password: undefined, confirmPassword: undefined,
        employeeId: `TMR-${Math.floor(1000+Math.random()*9000)}`, canteenBalance: 500,
        profileComplete: true, createdAt: new Date().toISOString() };
      delete data.password; delete data.confirmPassword;
      
      try { await setDoc(doc(db, 'users', currentUid), data, { merge: true }); } catch {}
      
      if (isCompleting && updateCtxProfile) {
        updateCtxProfile(data);
      }
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

        <form onSubmit={step === 3 ? triggerOtp : (step === 4 ? (e) => { e.preventDefault(); finalSubmit(); } : (e) => e.preventDefault())} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {step === 1 && (
            <div className="flex-col gap-3 flex-1">
              <h3>Identity Details</h3>
              <Input label="Full Name *" name="fullName" value={form.fullName} onChange={set} />
              <Input label="Aadhaar Number *" name="aadhar" value={form.aadhar} onChange={set} placeholder="12-digit Aadhaar number" type="number" />
              <Input label="Email *" name="email" type="email" value={form.email} onChange={set} disabled={isCompleting} />
              {!isCompleting && (
                <>
                  <Input label="Password *" name="password" type="password" value={form.password} onChange={set} placeholder="Min 6 chars" />
                  <Input label="Confirm Password *" name="confirmPassword" type="password" value={form.confirmPassword} onChange={set} />
                </>
              )}
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
                  <span style={{ fontSize: '0.7rem', color: '#888' }}>Company / Aadhaar / Any Govt ID</span>
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
                    <label className="input-label">Company / Unit</label>
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

          {step === 4 && (
            <div className="flex-col gap-3 flex-1 items-center justify-center text-center">
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(225,29,72,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#e11d48' }}>
                <CheckCircle size={28} />
              </div>
              <h3 style={{ margin: 0 }}>Verify Email</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 16px' }}>We sent a 6-digit OTP to <strong>{form.email}</strong></p>
              
              <input 
                type="text" 
                maxLength={6}
                value={userOtp}
                onChange={e => setUserOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', padding: '1rem', fontSize: '1.5rem', letterSpacing: 8, fontWeight: 800, textAlign: 'center', width: '200px', outline: 'none' }}
              />
              <button type="button" onClick={triggerOtp} disabled={loading} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
                Resend OTP
              </button>
            </div>
          )}

          <div className="flex gap-2 mt-3" style={{ marginTop: 'auto' }}>
            {step > 1 && step < 4 && <button type="button" className="btn btn-ghost" onClick={() => { setError(''); setStep(step-1); }} style={{flex:1}}>Back</button>}
            {step === 4 && <button type="button" className="btn btn-ghost" onClick={() => { setError(''); setStep(3); }} style={{flex:1}}>Cancel</button>}
            {step < 3 && <button type="button" className="btn btn-primary" onClick={next} style={{flex:2}}>Next →</button>}
            {step === 3 && <button type="submit" className="btn btn-primary" disabled={loading} style={{flex:2}}>{loading ? 'Sending OTP...' : (isCompleting ? 'Save Profile' : 'Verify Email')}</button>}
            {step === 4 && <button type="submit" className="btn btn-primary" disabled={loading || userOtp.length < 6} style={{flex:2}}>{loading ? 'Creating...' : 'Confirm & Create'}</button>}
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
