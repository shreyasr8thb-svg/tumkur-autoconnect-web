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
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, bottom: ride || step === 'options' ? '320px' : '150px', transition: 'bottom 0.3s ease' }}>
        <LiveMap height="100%" fullScreen={true} showRoute={ride?.status === 'accepted'} />
      </div>

      <div className="driver-bottom-sheet glass-card" style={{ position: 'absolute', bottom: 80, left: 0, right: 0, zIndex: 40, padding: '1.2rem', background: 'rgba(15, 23, 42, 0.98)', borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', transition: 'all 0.3s ease', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 1rem' }} />

        {!ride ? (
          step === 'input' ? (
            <div className="flex-col gap-3">
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: 700 }}>Where to?</h3>
              <div className="input-group mb-0 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                <Search size={20} color="#94a3b8" />
                <input style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '1.05rem' }} placeholder="Search destination" value={dropoff} onChange={e => setDropoff(e.target.value)} />
              </div>
              <button className="btn btn-primary mt-2" style={{ padding: '1rem', fontSize: '1.05rem', borderRadius: 12, background: '#e11d48' }} disabled={!dropoff} onClick={() => setStep('options')}>Search Ride</button>
            </div>
          ) : (
            <div className="flex-col gap-3">
              <div className="flex items-center gap-3" onClick={() => setStep('input')} style={{ cursor: 'pointer', paddingBottom: '0.5rem' }}>
                 <ArrowLeft size={22} color="#94a3b8" />
                 <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Choose a ride</h3>
              </div>
              <div className="flex-col gap-2" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                {vehicleOptions.map(v => (
                  <div key={v.id} onClick={() => setSelectedVehicle(v.id)} className="flex justify-between items-center" style={{ padding: '12px', borderRadius: 12, border: selectedVehicle === v.id ? '2px solid #e11d48' : '2px solid transparent', background: selectedVehicle === v.id ? 'rgba(225,29,72,0.1)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ color: selectedVehicle === v.id ? '#e11d48' : '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '50%' }}>{v.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>{v.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{v.time}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc' }}>{v.price}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary mt-2" style={{ padding: '1rem', fontSize: '1.05rem', borderRadius: 12, background: '#e11d48' }} onClick={requestRide}>Confirm {selectedVehicle}</button>
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
            
            <div className="flex justify-between items-center" style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex gap-3 items-center">
                 <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '50%' }}>
                   <Car size={24} color="#f8fafc" />
                 </div>
                 <div className="flex-col">
                   <strong style={{ fontSize: '1.1rem', color: '#f8fafc' }}>{ride.vehicleNumber || 'KA-06-TC-1234'}</strong>
                   <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{ride.vehicleModel || ride.vehicleType}</span>
                 </div>
              </div>
              {ride.status === 'accepted' && (
                <div className="flex-col items-end" style={{ background: 'rgba(225,29,72,0.1)', padding: '8px 16px', borderRadius: 12, border: '1px solid rgba(225,29,72,0.2)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 700, letterSpacing: 1 }}>OTP</span>
                  <strong style={{ fontSize: '1.4rem', letterSpacing: 3, color: '#f8fafc' }}>{ride.otp}</strong>
                </div>
              )}
            </div>
            {ride.status === 'in-progress' && (
              <div className="text-center mt-1" style={{ color: '#4ade80', fontSize: '0.95rem', fontWeight: 500 }}>
                Sit back and relax. You are on the way to {ride.dropoff}.
              </div>
            )}
            {ride.status === 'accepted' && (
              <button className="btn btn-ghost mt-1" style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '1rem', borderRadius: 12 }} onClick={() => deleteDoc(doc(db, 'rides', user.uid))}>Cancel Ride</button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
