import { useState } from 'react';
import { Calendar, Users, AlertCircle, ChevronRight } from 'lucide-react';

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState('heatmap');

  return (
    <div className="flex-col h-full">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-panel)' }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-gray-light)' }}>Factory Dashboard</div>
          <div style={{ fontWeight: '600' }}>Sri Sai Auto Components</div>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users size={20} color="#DC3545" />
        </div>
      </div>

      <div className="screen">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={24} color="#DC3545" />
          <h2 style={{ margin: 0 }}>AI Leave Predictor</h2>
        </div>

        {/* Dynamic Heatmap (Mockup) */}
        <div className="card mb-4" style={{ padding: '1rem' }}>
          <div className="flex justify-between items-center mb-3">
            <h3 style={{ fontSize: '1rem' }}>Workforce Risk Heatmap</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>Next 14 Days</span>
          </div>
          
          <div className="flex gap-1 mb-2">
            {[...Array(14)].map((_, i) => {
              // Mock risk logic
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
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Plan Staffing</button>
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
              <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: 'var(--text-gray-light)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '4px 0' }}>Worker</th>
                    <th>Role</th>
                    <th>Predicted Reason</th>
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
              <div className="text-center mt-2" style={{ fontSize: '0.75rem', color: '#DC3545', cursor: 'pointer' }}>View All 15 Workers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
