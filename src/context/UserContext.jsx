import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const UserContext = createContext(null);

const DEFAULT_PROFILE = {
  fullName: '',
  dob: '',
  phone: '',
  email: '',
  factoryUnit: '',
  department: '',
  supervisor: '',
  careerGoal: '',
  role: 'worker', // 'worker' or 'owner'
  employeeId: '',
  canteenBalance: 450,
  profileComplete: false,
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);        // Firebase Auth user
  const [profile, setProfile] = useState(null);   // Firestore profile data
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Try to load profile from Firestore
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            setProfile({ ...DEFAULT_PROFILE, ...snap.data() });
          } else {
            // New user — set defaults from auth
            const newProfile = {
              ...DEFAULT_PROFILE,
              email: firebaseUser.email || '',
              fullName: firebaseUser.displayName || '',
              role: (firebaseUser.email || '').toLowerCase().includes('owner') ? 'owner' : 'worker',
              employeeId: `TMR-${Math.floor(1000 + Math.random() * 9000)}`,
            };
            setProfile(newProfile);
          }
        } catch {
          // Firestore might not have rules set — use local defaults
          const newProfile = {
            ...DEFAULT_PROFILE,
            email: firebaseUser.email || '',
            fullName: firebaseUser.displayName || '',
            role: (firebaseUser.email || '').toLowerCase().includes('owner') ? 'owner' : 'worker',
            employeeId: `TMR-${Math.floor(1000 + Math.random() * 9000)}`,
          };
          setProfile(newProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateProfile = async (updates) => {
    const merged = { ...profile, ...updates };
    setProfile(merged);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), merged, { merge: true });
        showToast('Profile updated successfully');
      } catch {
        // Firestore rules may block — still update locally
        showToast('Saved locally');
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <UserContext.Provider value={{ user, profile, loading, updateProfile, signOut, toast, showToast }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
