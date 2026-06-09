import { useState } from 'react';
import { User, Briefcase, Target, CheckCircle } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import logo from '../assets/logo.png';

export default function ProfileCreation({ onCancel }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dob: '',
    phone: '',
    factoryUnit: '',
    department: '',
    supervisor: '',
    careerGoal: '',
    role: 'worker',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password) {
        setError('Full name, email, and password are required.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // Set display name
      await updateProfile(userCredential.user, { displayName: formData.fullName });

      // Save profile to Firestore
      const profileData = {
        fullName: formData.fullName,
        email: formData.email,
        dob: formData.dob,
        phone: formData.phone,
        factoryUnit: formData.factoryUnit,
        department: formData.department,
        supervisor: formData.supervisor,
        careerGoal: formData.careerGoal,
        role: formData.role,
        employeeId: `TMR-${Math.floor(1000 + Math.random() * 9000)}`,
        canteenBalance: 500,
        profileComplete: true,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), profileData);
      } catch {
        // Firestore write may fail due to rules — auth still works
      }

      // onAuthStateChanged in UserContext will pick up the new user
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError(err.message || 'Failed to create profile.');
      }
      setLoading(false);
    }
  };

  const stepLabels = ['Identity', 'Work Details', 'Aspirations'];

  return (
    <div className="screen flex-col" style={{ paddingBottom: '20px' }}>
      <div className="flex justify-between items-center mb-4 mt-2">
        <h2 style={{ margin: 0 }}>Create Profile</h2>
        <button onClick={onCancel} className="btn-text-cancel">← Back</button>
      </div>

      {/* Progress Tracker */}
      <div className="progress-tracker mb-4">
        <div className="progress-line">
          <div className="progress-fill" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        </div>
        {[
          { num: 1, icon: <User size={14} /> },
          { num: 2, icon: <Briefcase size={14} /> },
          { num: 3, icon: <Target size={14} /> }
        ].map(item => (
          <div key={item.num} className={`progress-dot ${step >= item.num ? 'active' : ''}`}>
            {item.icon}
            <span className="progress-label">{stepLabels[item.num - 1]}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {error && <div className="error-banner mb-3">{error}</div>}

        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {step === 1 && (
            <div className="flex-col gap-3" style={{ flex: 1 }}>
              <h3 className="mb-2">Identity Details</h3>
              <div className="input-group mb-0">
                <label className="input-label">Full Name *</label>
                <input type="text" name="fullName" className="input-field" placeholder="As per Aadhaar" value={formData.fullName} onChange={handleChange} required />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Date of Birth</label>
                <input type="date" name="dob" className="input-field" value={formData.dob} onChange={handleChange} />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Phone Number</label>
                <input type="tel" name="phone" className="input-field" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Email Address (Login ID) *</label>
                <input type="email" name="email" className="input-field" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Password *</label>
                <input type="password" name="password" className="input-field" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Confirm Password *</label>
                <input type="password" name="confirmPassword" className="input-field" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Account Type</label>
                <select name="role" className="input-field" value={formData.role} onChange={handleChange}>
                  <option value="worker">Factory Worker</option>
                  <option value="owner">Factory Owner</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-col gap-3" style={{ flex: 1 }}>
              <h3 className="mb-2">Work Details</h3>
              <div className="input-group mb-0">
                <label className="input-label">Current Factory Unit</label>
                <select name="factoryUnit" className="input-field" value={formData.factoryUnit} onChange={handleChange}>
                  <option value="">Select Unit...</option>
                  <option value="Sri Sai Auto Components">Sri Sai Auto Components</option>
                  <option value="Tumkur Machining Hub">Tumkur Machining Hub</option>
                  <option value="Precision Parts Pvt Ltd">Precision Parts Pvt Ltd</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Department</label>
                <input type="text" name="department" className="input-field" placeholder="e.g. CNC, Welding, Assembly" value={formData.department} onChange={handleChange} />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Supervisor Name</label>
                <input type="text" name="supervisor" className="input-field" placeholder="Direct supervisor" value={formData.supervisor} onChange={handleChange} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-col gap-3" style={{ flex: 1 }}>
              <h3 className="mb-2">Aspirations</h3>
              <div className="info-banner mb-3">
                Tumkuru Connect uses your aspirations to recommend skill pathways and badge verification opportunities.
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Where do you want to be in 2 years?</label>
                <select name="careerGoal" className="input-field" value={formData.careerGoal} onChange={handleChange}>
                  <option value="">Select Goal...</option>
                  <option value="Master Technician">Master Technician (CNC Programmer)</option>
                  <option value="Floor Supervisor">Floor Supervisor</option>
                  <option value="Quality Inspector">Quality Inspector</option>
                  <option value="Independent Contractor">Independent Contractor</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <CheckCircle size={20} color="#28a745" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Govt. ID Verification will be done post-registration.</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4" style={{ marginTop: 'auto' }}>
            {step > 1 && (
              <button type="button" className="btn btn-secondary" onClick={prevStep} style={{ flex: 1 }}>Back</button>
            )}
            {step < 3 ? (
              <button type="button" className="btn btn-primary" onClick={nextStep} style={{ flex: 2 }}>Next Step</button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Creating Account...' : 'Create Profile'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
