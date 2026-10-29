// app/components/Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { icon: '⚡', label: 'Dashboard',   href: '/dashboard' },
  { icon: '👥', label: 'Workers',     href: '/workers' },
  { icon: '💼', label: 'Job Postings', href: '/jobs' },
  { icon: '📍', label: 'Attendance',  href: '/attendance' },
  { icon: '🚌', label: 'Transport',   href: '/transport' },
  { icon: '💳', label: 'Payroll',     href: '/payroll' },
  { icon: '🏫', label: 'Institutes',  href: '/institutes' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">TA</div>
        <div>
          <div className="sidebar-logo-text">AutoConnect</div>
          <div className="sidebar-logo-sub">Tumkur Industrial ERP</div>
        </div>
      </div>

      <div className="sidebar-divider" />
      <span className="sidebar-section-label">Main Menu</span>

      {NAV_ITEMS.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`sidebar-link ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
        </Link>
      ))}

      <div className="sidebar-divider" style={{ marginTop: 'auto' }} />
      <span className="sidebar-section-label">Account</span>
      <a className="sidebar-link" href="#">
        <span className="icon">⚙️</span>Settings
      </a>
      <a className="sidebar-link" href="#" style={{ color: 'var(--red)' }}>
        <span className="icon">🚪</span>Sign Out
      </a>
    </aside>
  );
}
