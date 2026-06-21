import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';
import LiveMap from './LiveMap';

export default function CompanyBus() {
  const { profile } = useUser();
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    let q = query(collection(db, 'users'), where('role', '==', 'driver'), where('vehicleCategory', '==', 'office_bus'));
    if (profile?.companyName) {
        q = query(collection(db, 'users'), where('role', '==', 'driver'), where('vehicleCategory', '==', 'office_bus'), where('companyName', '==', profile.companyName));
    }
    const unsub = onSnapshot(q, snap => {
      setBuses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const bookBus = (bus) => {
    alert(`Request sent to ${bus.fullName} for Company Bus!`);
  }

  return (
    <div className="flex-col gap-3">
      <h3 style={{ margin: 0 }}>Company Buses</h3>
      <div style={{ marginBottom: 12 }}>
        <LiveMap height="200px" showBuses={true} />
      </div>
      {buses.length === 0 ? (
        <div className="glass-card text-center" style={{ color: 'var(--text-muted)', padding: '2rem' }}>
          No company buses currently online.
        </div>
      ) : (
        buses.map(bus => (
          <div key={bus.id} className="glass-card flex items-center justify-between" style={{ padding: '0.9rem' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{bus.fullName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{bus.vehicleNumber || 'Bus'} • {bus.companyName}</div>
              {bus.pickupTimes && (
                <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: 4 }}>
                  Login: {bus.pickupTimes.loginTime} | Logout: {bus.pickupTimes.logoutTime}
                </div>
              )}
            </div>
            <button onClick={() => bookBus(bus)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Book Seat
            </button>
          </div>
        ))
      )}
    </div>
  );
}
