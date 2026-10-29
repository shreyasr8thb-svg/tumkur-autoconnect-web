// app/dashboard/page.tsx — HR Dashboard
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const KPI = [
  { icon: '👥', label: 'Active Workers',    value: '248', delta: '+12 today',    color: '#0A84FF', delay: 1 },
  { icon: '✅', label: 'Present Today',     value: '221', delta: '89.1% rate',   color: '#32D74B', delay: 2 },
  { icon: '💼', label: 'Open Positions',    value: '14',  delta: '3 urgent',     color: '#FF9F0A', delay: 3 },
  { icon: '⏳', label: 'Pending Approvals', value: '7',   delta: 'Review now',   color: '#FF3B30', delay: 4 },
];

const WORKERS = [
  { name: 'Suresh Patil',    role: 'CNC Operator',     match: 94, status: 'Present',  date: '2026-10-29' },
  { name: 'Lakshmi Devi',    role: 'Assembly Tech',    match: 78, status: 'Present',  date: '2026-10-29' },
  { name: 'Mohammed Irfan',  role: 'Welder Grade II',  match: 67, status: 'Absent',   date: '2026-10-29' },
  { name: 'Geeta Sharma',    role: 'QC Inspector',     match: 88, status: 'Late',     date: '2026-10-29' },
  { name: 'Ravi Kumar',      role: 'Lathe Operator',   match: 72, status: 'Present',  date: '2026-10-29' },
];

function statusBadge(s: string) {
  if (s === 'Present') return <span className="badge badge-success">● Present</span>;
  if (s === 'Absent')  return <span className="badge badge-red">● Absent</span>;
  return <span className="badge badge-warning">● Late</span>;
}

export default function DashboardPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <main style={{ flex: 1, padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Page header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 13, color: 'var(--grey1)', marginBottom: 4 }}>Thursday, 29 October 2026</p>
              <h1 className="page-title">HR Dashboard</h1>
              <p className="text-muted" style={{ fontSize: 14, marginTop: 4 }}>KIADB Tumkur Zone · Factory TZ-004</p>
            </div>
            <button className="btn btn-primary">+ Post New Job</button>
          </div>

          {/* KPI Grid */}
          <div className="kpi-grid">
            {KPI.map(k => (
              <div key={k.label} className={`kpi-card glass animate-delay-${k.delay}`}>
                <div className="kpi-icon" style={{ background: `${k.color}18` }}>
                  <span style={{ fontSize: 20 }}>{k.icon}</span>
                </div>
                <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-delta" style={{ color: k.color }}>{k.delta}</div>
              </div>
            ))}
          </div>

          {/* Workers Table */}
          <div className="glass" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="section-title">Today's Attendance</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>Export CSV</button>
                <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>Filter ▾</button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Role</th>
                    <th>AI Match</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {WORKERS.map(w => (
                    <tr key={w.name}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'var(--red-dim)', border: '1px solid var(--red)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: 'var(--red)', flexShrink: 0,
                          }}>
                            {w.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span style={{ fontWeight: 600 }}>{w.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--grey1)' }}>{w.role}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: w.match >= 80 ? 'var(--success)' : w.match >= 65 ? 'var(--warning)' : 'var(--red)',
                        }}>
                          {w.match}%
                        </span>
                      </td>
                      <td>{statusBadge(w.status)}</td>
                      <td style={{ color: 'var(--grey1)' }}>{w.date}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>View</button>
                          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>Shortlist</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
