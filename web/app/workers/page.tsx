// app/workers/page.tsx — Workers List
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const WORKERS = [
  { id: 'W001', name: 'Ravi Kumar',     skills: ['CNC', 'G-Code'],        exp: 4.2, location: 'Tumkur', status: 'Employed',  match: 92 },
  { id: 'W002', name: 'Suresh Patil',   skills: ['Lathe', 'Turning'],      exp: 2.1, location: 'Sira',   status: 'Available', match: 85 },
  { id: 'W003', name: 'Lakshmi Devi',   skills: ['Assembly', 'QC'],        exp: 1.5, location: 'Tumkur', status: 'Training',  match: 71 },
  { id: 'W004', name: 'Irfan Ahmed',    skills: ['MIG Welding', 'TIG'],    exp: 6.0, location: 'Tumkur', status: 'Employed',  match: 88 },
  { id: 'W005', name: 'Kavitha R.',     skills: ['CAD/CAM', 'Blueprint'],  exp: 3.3, location: 'Kunigal', status: 'Available', match: 77 },
];

function statusBadge(s: string) {
  const map: Record<string, string> = {
    Employed: 'badge-success', Available: 'badge-info', Training: 'badge-warning',
  };
  return <span className={`badge ${map[s] || 'badge-info'}`}>{s}</span>;
}

export default function WorkersPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <main style={{ flex: 1, padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="page-title">Workers Registry</h1>
              <p className="text-muted" style={{ fontSize: 14, marginTop: 4 }}>248 registered · 192 active this month</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost">Filter ▾</button>
              <button className="btn btn-primary">+ Add Worker</button>
            </div>
          </div>

          {/* Search */}
          <input
            placeholder="🔍  Search by name, skill, location…"
            style={{
              width: '100%', maxWidth: 480, padding: '12px 18px',
              background: 'var(--glass1)', border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)', color: 'var(--white)', fontSize: 14, outline: 'none',
            }}
          />

          <div className="glass" style={{ padding: 24 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Worker</th>
                    <th>Skills</th>
                    <th>Exp. (yrs)</th>
                    <th>Location</th>
                    <th>AI Score</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {WORKERS.map(w => (
                    <tr key={w.id}>
                      <td style={{ color: 'var(--grey1)', fontFamily: 'monospace' }}>{w.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'var(--red-dim)', border: '1px solid var(--red)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, color: 'var(--red)', flexShrink: 0,
                          }}>
                            {w.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span style={{ fontWeight: 600 }}>{w.name}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {w.skills.map(s => (
                            <span key={s} className="badge badge-info" style={{ fontSize: 10 }}>{s}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ color: 'var(--grey1)' }}>{w.exp}</td>
                      <td style={{ color: 'var(--grey1)' }}>📍 {w.location}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: w.match >= 80 ? 'var(--success)' : 'var(--warning)' }}>
                          {w.match}%
                        </span>
                      </td>
                      <td>{statusBadge(w.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>Profile</button>
                          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>Assign Job</button>
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
