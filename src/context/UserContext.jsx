import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const UserContext = createContext(null);

const DEFAULT_PROFILE = {
  fullName: '', dob: '', phone: '', email: '',
  factoryUnit: '', department: '', supervisor: '', careerGoal: '',
  role: 'worker', employeeId: '', canteenBalance: 450,
  profileComplete: false, photoURL: '', idCardURL: '',
  emergencyContact: '', bloodGroup: '', address: '',
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [location, setLocation] = useState(null);

  // GPS Location
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: 13.3379, lng: 77.1173 }), // Tumkur fallback
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        try {
          const snap = await getDoc(doc(db, 'users', fbUser.uid));
          if (snap.exists()) { setProfile({ ...DEFAULT_PROFILE, ...snap.data() }); }
          else {
            const p = {
              ...DEFAULT_PROFILE,
              email: fbUser.email || '', fullName: fbUser.displayName || '',
              photoURL: fbUser.photoURL || '',
              role: (fbUser.email||'').toLowerCase().includes('owner') ? 'hr' : 'worker',
              employeeId: `TMR-${Math.floor(1000 + Math.random() * 9000)}`,
            };
            setProfile(p);
          }
        } catch {
          setProfile({
            ...DEFAULT_PROFILE, email: fbUser.email || '', fullName: fbUser.displayName || '',
            photoURL: fbUser.photoURL || '',
            role: (fbUser.email||'').toLowerCase().includes('owner') ? 'hr' : 'worker',
            employeeId: `TMR-${Math.floor(1000 + Math.random() * 9000)}`,
          });
        }
      } else { setUser(null); setProfile(null); }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateProfile = async (updates) => {
    const merged = { ...profile, ...updates };
    setProfile(merged);
    if (user) {
      try { await setDoc(doc(db, 'users', user.uid), merged, { merge: true }); } catch {}
    }
    showToast('Profile saved ✓');
  };

  const signOut = async () => { await firebaseSignOut(auth); setUser(null); setProfile(null); };
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  return (
    <UserContext.Provider value={{ user, profile, loading, updateProfile, signOut, toast, showToast, location }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}
