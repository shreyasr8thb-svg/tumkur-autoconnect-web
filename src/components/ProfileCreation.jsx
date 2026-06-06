import { useState } from 'react';
import { User, Briefcase, Target, CheckCircle } from 'lucide-react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function ProfileCreation({ onComplete, onCancel }) {
  const [step, setStep] = useState(1); // 1: Identity, 2: Work Details, 3: Aspirations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    dob: '',
    phone: '',
    aadhar: '',
    factoryUnit: '',
    department: '',
    supervisor: '',
    careerGoal: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && (!formData.email || !formData.password || !formData.fullName)) {
      setError('Please fill in email, password, and full name.');
      return;
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
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // In a real app, save formData to Firestore here
      
      const userEmail = userCredential.user.email || '';
      onComplete(userEmail.toLowerCase().includes('owner') ? 'owner' : 'worker');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create profile.');
      setLoading(false);
    }
  };

  return (
    <div className="screen flex-col" style={{ paddingBottom: '20px' }}>
      <div className="flex justify-between items-center mb-4 mt-2">
        <h2 style={{ margin: 0 }}>Create Profile</h2>
        <button onClick={onCancel} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', border: 'none', fontSize: '0.8rem' }}>Cancel</button>
      </div>

      {/* Progress Tracker */}
      <div className="flex justify-between items-center mb-4 position-relative">
        <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', backgroundColor: 'var(--border-color)', zIndex: 0 }}>
           <div style={{ height: '100%', width: `${((step - 1) / 2) * 100}%`, backgroundColor: '#DC3545', transition: 'width 0.3s ease' }}></div>
        </div>
        {[
          { num: 1, icon: <User size={16} /> },
          { num: 2, icon: <Briefcase size={16} /> },
          { num: 3, icon: <Target size={16} /> }
        ].map(item => (
          <div key={item.num} className="flex-col items-center gap-1" style={{ zIndex: 1, backgroundColor: 'var(--bg-dark)', padding: '0 10px' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              backgroundColor: step >= item.num ? '#DC3545' : 'var(--bg-panel)',
              border: `2px solid ${step >= item.num ? '#DC3545' : 'var(--border-color)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: step >= item.num ? '#FFF' : 'var(--text-gray-dark)'
            }}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {error && (
          <div className="mb-3" style={{ padding: '0.75rem', backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#DC3545', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', border: '1px solid #DC3545' }}>
            {error}
          </div>
        )}

        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {step === 1 && (
            <div className="flex-col gap-3 flex-1">
              <h3 className="mb-2">1. Identity Details</h3>
              <div className="input-group mb-0">
                <label className="input-label">Full Name as per Aadhaar</label>
                <input type="text" name="fullName" className="input-field" value={formData.fullName} onChange={handleChange} required />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Date of Birth</label>
                <input type="date" name="dob" className="input-field" value={formData.dob} onChange={handleChange} />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Phone Number</label>
                <input type="tel" name="phone" className="input-field" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Email Address (Login ID)</label>
                <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Password</label>
                <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} required />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-col gap-3 flex-1">
              <h3 className="mb-2">2. Work Details</h3>
              <div className="input-group mb-0">
                <label className="input-label">Current Factory Unit</label>
                <select name="factoryUnit" className="input-field" value={formData.factoryUnit} onChange={handleChange} style={{ appearance: 'none' }}>
                  <option value="">Select Unit...</option>
                  <option value="Sri Sai Auto Components">Sri Sai Auto Components</option>
                  <option value="Tumkur Machining Hub">Tumkur Machining Hub</option>
                  <option value="Precision Parts Pvt Ltd">Precision Parts Pvt Ltd</option>
                </select>
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Department</label>
                <input type="text" name="department" className="input-field" placeholder="e.g. CNC, Welding, Assembly" value={formData.department} onChange={handleChange} />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Direct Supervisor Name</label>
                <input type="text" name="supervisor" className="input-field" value={formData.supervisor} onChange={handleChange} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-col gap-3 flex-1">
              <h3 className="mb-2">3. Aspirations</h3>
              <div className="card" style={{ backgroundColor: 'rgba(220, 53, 69, 0.05)', border: '1px solid rgba(220, 53, 69, 0.2)', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-gray-light)' }}>
                  Tumkuru Connect uses your aspirations to recommend skill pathways and badge verification opportunities.
                </p>
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Where do you want to be in 2 years?</label>
                <select name="careerGoal" className="input-field" value={formData.careerGoal} onChange={handleChange} style={{ appearance: 'none' }}>
                  <option value="">Select Goal...</option>
                  <option value="Master Technician">Master Technician (e.g. CNC Programmer)</option>
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
              <button type="button" className="btn btn-secondary" onClick={prevStep} style={{ flex: 1 }}>
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button type="button" className="btn btn-primary" onClick={nextStep} style={{ flex: 2 }}>
                Next Step
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Creating...' : 'Create Profile'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
