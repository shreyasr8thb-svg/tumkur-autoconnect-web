import { useState, useEffect } from 'react';
import { Bus, Car, Search, ArrowLeft } from 'lucide-react';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';
import LiveMap from './LiveMap';

/* ─── Ride Hailing (Cab) ─── */
export default function RideHailing() {
  const { user, profile } = useUser();
  const [ride, setRide] = useState(null);
  const [dropoff, setDropoff] = useState('');
  const [step, setStep] = useState('input');
  const [selectedVehicle, setSelectedVehicle] = useState('Mini');

  const vehicleOptions = [
    { id: 'Shuttle', name: 'Shared Shuttle', price: '₹20', time: '5 min away', icon: <Bus size={28} /> },
    { id: 'Mini', name: 'TC Mini', price: '₹120', time: '2 min away', icon: <Car size={28} /> },
    { id: 'Sedan', name: 'TC Sedan', price: '₹160', time: '4 min away', icon: <Car size={28} /> },
    { id: 'SUV', name: 'TC SUV', price: '₹250', time: '7 min away', icon: <Car size={28} /> },
  ];

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'rides', user.uid), (docRef) => {
      if (docRef.exists()) setRide(docRef.data());
      else {
        setRide(null);
        setStep('input');
      }
    });
    return () => unsub();
  }, [user]);

  const requestRide = async () => {
    if (!dropoff) return;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await setDoc(doc(db, 'rides', user.uid), {
      workerId: user.uid, workerName: profile?.fullName || 'Worker',
      pickup: 'Current Location', dropoff, vehicleType: selectedVehicle,
      status: 'pending', driverId: null, driverName: null, otp, timestamp: Date.now()
    });
  };

  return (
    <div className="ride-hailing-container">
      <div style={{ position: 'absolute', inset: 0 }}>
        <LiveMap height="100%" fullScreen={true} showRoute={ride?.status === 'accepted'} />
      </div>

      <div className="ride-hailing-sheet glass-card">
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 1.5rem' }} />

        {!ride ? (
          step === 'input' ? (
            <div className="flex-col gap-4">
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Where to?</h3>
              <div className="input-group mb-0 flex items-center gap-3" style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                <Search size={24} color="#94a3b8" />
                <input style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '1.1rem', fontWeight: 500 }} placeholder="Search destination" value={dropoff} onChange={e => setDropoff(e.target.value)} />
              </div>
              <button className="btn btn-primary mt-2" style={{ padding: '1.2rem', fontSize: '1.1rem', borderRadius: 16, background: 'linear-gradient(135deg, #e11d48, #be123c)' }} disabled={!dropoff} onClick={() => setStep('options')}>Find Rides</button>
            </div>
          ) : (
            <div className="flex-col gap-4">
              <div className="flex items-center gap-3" onClick={() => setStep('input')} style={{ cursor: 'pointer', paddingBottom: '0.5rem' }}>
                 <ArrowLeft size={24} color="#94a3b8" />
                 <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Choose a ride</h3>
              </div>
              <div className="flex-col gap-3" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
                {vehicleOptions.map(v => (
                  <div key={v.id} onClick={() => setSelectedVehicle(v.id)} className="flex justify-between items-center" style={{ padding: '16px', borderRadius: 16, border: selectedVehicle === v.id ? '2px solid #e11d48' : '2px solid transparent', background: selectedVehicle === v.id ? 'rgba(225,29,72,0.1)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.2s', boxShadow: selectedVehicle === v.id ? '0 4px 15px rgba(225,29,72,0.2)' : 'none' }}>
                    <div className="flex items-center gap-4">
                      <div style={{ color: selectedVehicle === v.id ? '#e11d48' : '#cbd5e1', background: selectedVehicle === v.id ? 'transparent' : 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '50%' }}>{v.icon}</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>{v.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{v.time}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc' }}>{v.price}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary mt-2" style={{ padding: '1.2rem', fontSize: '1.1rem', borderRadius: 16, background: 'linear-gradient(135deg, #e11d48, #be123c)' }} onClick={requestRide}>Confirm {selectedVehicle}</button>
            </div>
          )
        ) : ride.status === 'pending' ? (
          <div className="flex-col items-center gap-4 py-4">
            <div className="spinner" style={{ borderColor: '#333', borderTopColor: '#e11d48', width: 40, height: 40 }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Finding your driver...</h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Matching you with the nearest {ride.vehicleType}</p>
            <button className="btn btn-ghost mt-2 w-100" style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '1rem', borderRadius: 12 }} onClick={() => deleteDoc(doc(db, 'rides', user.uid))}>Cancel Request</button>
          </div>
        ) : (ride.status === 'accepted' || ride.status === 'in-progress') ? (
          <div className="flex-col gap-4">
            <div className="flex justify-between items-center border-b-dark pb-3">
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#4ade80', fontSize: '1.2rem' }}>{ride.status === 'in-progress' ? 'Trip in Progress!' : 'Driver Arriving!'}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>{ride.driverName} • 4.9 ★</p>
              </div>
              {ride.driverPhoto ? (
                <img src={ride.driverPhoto} alt="Driver" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', color: '#000' }}>{ride.driverName.charAt(0)}</div>
              )}
            </div>
            
            <div className="flex justify-between items-center" style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex gap-4 items-center">
                 <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%' }}>
                   <Car size={28} color="#f8fafc" />
                 </div>
                 <div className="flex-col">
                   <strong style={{ fontSize: '1.2rem', color: '#f8fafc' }}>{ride.vehicleNumber || 'KA-06-TC-1234'}</strong>
                   <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{ride.vehicleModel || ride.vehicleType}</span>
                 </div>
              </div>
              {ride.status === 'accepted' && (
                <div className="flex-col items-end" style={{ background: 'rgba(225,29,72,0.1)', padding: '10px 16px', borderRadius: 16, border: '1px solid rgba(225,29,72,0.2)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 800, letterSpacing: 1 }}>OTP</span>
                  <strong style={{ fontSize: '1.6rem', letterSpacing: 3, color: '#f8fafc' }}>{ride.otp}</strong>
                </div>
              )}
            </div>
            {ride.status === 'in-progress' && (
              <div className="text-center mt-2" style={{ color: '#4ade80', fontSize: '1rem', fontWeight: 600 }}>
                Sit back and relax. You are on the way to {ride.dropoff}.
              </div>
            )}
            {ride.status === 'accepted' && (
              <button className="btn btn-ghost mt-2" style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '1.2rem', borderRadius: 16, fontSize: '1.1rem', fontWeight: 700 }} onClick={() => deleteDoc(doc(db, 'rides', user.uid))}>Cancel Ride</button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
