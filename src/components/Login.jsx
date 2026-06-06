import { useState } from 'react';
import { Settings } from 'lucide-react';

export default function Login({ onLogin }) {
  const [step, setStep] = useState('login'); // 'login' or 'verify'
  const [email, setEmail] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();
    if (email) {
      setStep('verify');
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    // For demo purposes, if email has 'owner', login as owner, else worker.
    if (email.toLowerCase().includes('owner')) {
      onLogin('owner');
    } else {
      onLogin('worker');
    }
  };

  if (step === 'verify') {
    return (
      <div className="screen flex-col justify-center">
        <div className="mb-4 text-center">
          <Settings size={40} color="#DC3545" className="mb-2 mx-auto" />
          <h2>Verify Your Email</h2>
          <p>We sent a 6-digit code to {email}</p>
        </div>

        <form onSubmit={handleVerify} className="flex-col gap-3">
          <div className="input-group">
            <label className="input-label">Verification Code</label>
            <input 
              type="text" 
              className="input-field text-center" 
              placeholder="• • • • • •" 
              style={{ letterSpacing: '8px', fontSize: '1.5rem' }}
              maxLength={6}
              autoFocus
            />
          </div>
          
          <button type="submit" className="btn btn-primary mt-2">
            Verify & Login
          </button>
          
          <div className="text-center mt-3">
            <button type="button" className="btn-secondary" style={{ border: 'none', fontSize: '0.875rem' }} onClick={() => setStep('login')}>
              Resend Code
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="screen flex-col justify-center">
      <div className="mb-4 text-center">
        <Settings size={48} color="#DC3545" className="mb-2 mx-auto" />
        <h2 className="text-white">Welcome Back</h2>
        <p>Login to your Tumkuru Connect account</p>
        <p className="mt-1" style={{ fontSize: '0.75rem', color: '#DC3545' }}>(Tip: use 'owner' in email for Factory Owner View)</p>
      </div>

      <form onSubmit={handleContinue} className="flex-col gap-3">
        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input 
            type="email" 
            className="input-field" 
            placeholder="worker@tumkur.in" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="input-group">
          <label className="input-label">Password</label>
          <input 
            type="password" 
            className="input-field" 
            placeholder="••••••••" 
            required
          />
        </div>

        <button type="submit" className="btn btn-primary mt-2">
          Continue with Email
        </button>

        <div className="flex items-center gap-2 mt-2 mb-2">
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray-dark)' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        <button type="button" className="btn btn-secondary flex items-center justify-center gap-2" style={{ backgroundColor: '#ffffff', color: '#000000', border: 'none' }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width: '18px' }} />
          Sign in with Google
        </button>

        <div className="text-center mt-3">
          <a href="#" className="text-gray" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>Forgot Password?</a>
        </div>
      </form>
    </div>
  );
}
