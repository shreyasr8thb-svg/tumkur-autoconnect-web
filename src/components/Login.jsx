import { useState } from 'react';
import { Settings } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import logo from '../assets/logo.png';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userEmail = userCredential.user.email || '';
      // Route based on email for demo purposes
      onLogin(userEmail.toLowerCase().includes('owner') ? 'owner' : 'worker');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const userEmail = userCredential.user.email || '';
      // Route based on email for demo purposes
      onLogin(userEmail.toLowerCase().includes('owner') ? 'owner' : 'worker');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen flex-col justify-center">
      <div className="mb-4 text-center">
        <img src={logo} alt="Tumkuru Connect Logo" style={{ width: '60px', height: '60px', marginBottom: '0.5rem', objectFit: 'contain' }} className="mx-auto" />
        <h2 className="text-white">Welcome Back</h2>
        <p>Login to your Tumkuru Connect account</p>
        <p className="mt-1" style={{ fontSize: '0.75rem', color: '#DC3545' }}>(Tip: use 'owner' in email for Factory Owner View)</p>
      </div>

      <form onSubmit={handleEmailSignIn} className="flex-col gap-3">
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#DC3545', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', border: '1px solid #DC3545' }}>
            {error}
          </div>
        )}

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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
          {loading ? 'Signing In...' : 'Continue with Email'}
        </button>

        <div className="flex items-center gap-2 mt-2 mb-2">
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray-dark)' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn btn-secondary flex items-center justify-center gap-2" 
          style={{ backgroundColor: '#ffffff', color: '#000000', border: 'none' }}
        >
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
