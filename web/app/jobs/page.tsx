// app/jobs/page.tsx — Job Postings
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const JOBS = [
  { id: 'J001', title: 'CNC Machinist',      dept: 'Production', skills: ['CNC', 'G-Code'],      exp: 2, salary: '₹28,000', applicants: 12, status: 'Active',   urgent: true },
  { id: 'J002', title: 'Lathe Operator',     dept: 'Production', skills: ['Lathe'],               exp: 1, salary: '₹22,000', applicants: 8,  status: 'Active',   urgent: false },
  { id: 'J003', title: 'Weld Supervisor',    dept: 'Assembly',   skills: ['MIG', 'TIG'],          exp: 5, salary: '₹38,000', applicants: 4,  status: 'Paused',   urgent: false },
  { id: 'J004', title: 'QC Inspector',       dept: 'Quality',    skills: ['QC', 'Measurement'],   exp: 3, salary: '₹30,000', applicants: 6,  status: 'Active',   urgent: false },
  { id: 'J005', title: 'Assembly Tech',      dept: 'Assembly',   skills: ['Assembly'],            exp: 1, salary: '₹19,000', applicants: 15, status: 'Closed',   urgent: false },
];

function statusBadge(s: string, urgent: boolean) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span className={`badge ${s === 'Active' ? 'badge-success' : s === 'Paused' ? 'badge-warning' : 'badge-red'}`}>
        {s}
      </span>
      {urgent && <span className="badge badge-red">URGENT</span>}
    </div>
  );
}

export default function JobsPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <main style={{ flex: 1, padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="page-title">Job Postings</h1>
              <p className="text-muted" style={{ fontSize: 14, marginTop: 4 }}>14 open positions · AI matching enabled</p>
            </div>
            <button className="btn btn-primary">+ Post New Job</button>
          </div>

          {/* Summary cards */}
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { label: 'Active', value: '11', color: 'var(--success)' },
              { label: 'Urgent', value: '3',  color: 'var(--red)' },
              { label: 'Total Applicants', value: '45', color: 'var(--info)' },
            ].map(s => (
              <div key={s.label} className="glass kpi-card">
                <div className="kpi-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
                <div className="kpi-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="glass" style={{ padding: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 20 }}>All Positions</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Department</th>
                    <th>Skills Required</th>
                    <th>Min. Exp</th>
                    <th>Salary</th>
                    <th>Applicants</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {JOBS.map(j => (
                    <tr key={j.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{j.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--grey2)', fontFamily: 'monospace' }}>{j.id}</div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--grey1)' }}>{j.dept}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {j.skills.map(s => <span key={s} className="badge badge-info" style={{ fontSize: 10 }}>{s}</span>)}
                        </div>
                      </td>
                      <td style={{ color: 'var(--grey1)' }}>{j.exp} yr{j.exp > 1 ? 's' : ''}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>{j.salary}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: j.applicants >= 10 ? 'var(--success)' : 'var(--warning)',
                        }}>{j.applicants}</span>
                      </td>
                      <td>{statusBadge(j.status, j.urgent)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>View</button>
                          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>Match AI</button>
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
