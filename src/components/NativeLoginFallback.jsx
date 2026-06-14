import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function NativeLoginFallback() {
  const [status, setStatus] = useState('Initializing secure login...');

  useEffect(() => {
    const doLogin = async () => {
      try {
        setStatus('Waiting for Google authentication...');
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const idToken = credential?.idToken;

        if (idToken) {
          setStatus('Authentication successful! Returning to app...');
          // Redirect back to the native app using the custom scheme
          window.location.href = `tumkuruconnect://login?idToken=${idToken}`;
          
          // Fallback if the redirect fails (e.g. they opened it on a desktop by mistake)
          setTimeout(() => {
            setStatus('If the app does not open automatically, please close this browser window and return to the Tumkuru Connect app.');
          }, 3000);
        } else {
          setStatus('Authentication failed. No token received.');
        }
      } catch (err) {
        console.error(err);
        setStatus(`Error: ${err.message}`);
      }
    };

    doLogin();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#0f172a', color: 'white', padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif'
    }}>
      <div style={{ width: 64, height: 64, background: '#3b82f6', borderRadius: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Tumkuru Connect Secure Login</h2>
      <p style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: 400, lineHeight: 1.5 }}>
        {status}
      </p>
    </div>
  );
}
