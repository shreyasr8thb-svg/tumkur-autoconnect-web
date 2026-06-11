import { useState } from 'react';
import { Calendar, Users, AlertCircle, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';
import NotificationsPanel from './NotificationsPanel';

export default function OwnerDashboard() {
  const { profile, signOut } = useUser();
  const [showNotifs, setShowNotifs] = useState(false);
  const companyName = profile?.factoryUnit || 'Your Company';

  return (
    <div className="flex-col" style={{ flex: 1 }}>
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-panel)' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Company Dashboard</div>
          <div style={{ fontWeight: '600' }}>{companyName}</div>
        </div>
        <div className="flex gap-3 items-center">
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifs(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </div>
          <div className="avatar-sm" style={{ cursor: 'pointer' }} onClick={signOut}>
            <LogOut size={18} />
          </div>
        </div>
      </div>

      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}

      <div className="screen" style={{ overflowY: 'auto' }}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={24} color="#DC3545" />
          <h2 style={{ margin: 0 }}>AI Leave Predictor</h2>
        </div>

        {/* Dynamic Heatmap */}
        <div className="card mb-4" style={{ padding: '1rem' }}>
          <div className="flex justify-between items-center mb-3">
            <h3 style={{ fontSize: '1rem' }}>Workforce Risk Heatmap</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Next 14 Days</span>
          </div>
          <div className="flex gap-1 mb-2">
            {[...Array(14)].map((_, i) => {
              const isHighRisk = i === 4 || i === 5;
              const isMedRisk = i === 3 || i === 6;
              const color = isHighRisk ? '#DC3545' : isMedRisk ? '#ffc107' : '#28a745';
              return (
                <div key={i} className="flex-col items-center gap-1" style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-gray-light)' }}>{10 + i}</div>
                  <div style={{ width: '100%', height: '40px', backgroundColor: color, borderRadius: '4px', opacity: 0.8 }}></div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 text-center" style={{ fontSize: '0.75rem' }}>
            <div className="flex items-center gap-1"><div style={{ width: '10px', height: '10px', backgroundColor: '#28a745', borderRadius: '2px' }}></div> Low</div>
            <div className="flex items-center gap-1"><div style={{ width: '10px', height: '10px', backgroundColor: '#ffc107', borderRadius: '2px' }}></div> Medium</div>
            <div className="flex items-center gap-1"><div style={{ width: '10px', height: '10px', backgroundColor: '#DC3545', borderRadius: '2px' }}></div> High Risk</div>
          </div>
        </div>

        {/* High Risk Alerts */}
        <h3 className="mb-2" style={{ color: '#DC3545', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> High Risk Dates
        </h3>

        <div className="flex-col gap-3">
          <div className="card" style={{ borderLeft: '4px solid #DC3545', padding: '1rem' }}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div style={{ fontWeight: '600' }}>Oct 14 - Oct 15 (Deepavali Setup)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Predicted Shortage: 15 Workers (12%)</div>
              </div>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', width: 'auto' }}>Plan</button>
            </div>

            <div style={{ backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
              <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: 'var(--text-gray-light)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '4px 0' }}>Worker</th>
                    <th>Role</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 0', fontWeight: '600' }}>Suresh M.</td>
                    <td style={{ color: 'var(--text-gray-light)' }}>Welder</td>
                    <td style={{ color: '#DC3545' }}>Harvest (Davanagere)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', fontWeight: '600' }}>Kiran J.</td>
                    <td style={{ color: 'var(--text-gray-light)' }}>Machinist</td>
                    <td style={{ color: '#DC3545' }}>Festival Travel</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-center mt-2" style={{ fontSize: '0.75rem', color: '#DC3545', cursor: 'pointer' }}>View All 15 Workers →</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
