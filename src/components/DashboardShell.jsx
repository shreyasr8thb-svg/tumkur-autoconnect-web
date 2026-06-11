/**
 * DashboardShell – shared layout for ALL portals
 * Wraps into a single flex-column div (not fragment) so flex layout works correctly.
 */
import { useState } from 'react';
import {
  Bell, Menu, X, MessageSquare, Rss,
  LogOut, Settings, Download, ChevronRight
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import NotificationsPanel from './NotificationsPanel';
import ChatBox from './ChatBox';
import CommunityFeed from './CommunityFeed';
import DownloadPage from './DownloadPage';
import AppFooter from './AppFooter';

export default function DashboardShell({
  role, tabs, activeTab, setActiveTab, children, extraMenuLinks = []
}) {
  const { profile, signOut } = useUser();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu,   setShowMenu]   = useState(false);
  const [shellTab,   setShellTab]   = useState(null); // chat | feed | download

  const name = profile?.fullName || profile?.email?.split('@')[0] || 'User';

  const go = (t) => {
    setShowMenu(false);
    if (t === 'chat' || t === 'feed' || t === 'download') {
      setShellTab(t);
    } else {
      setShellTab(null);
      setActiveTab(t);
    }
  };

  const isShell = !!shellTab;

  return (
    /* ONE wrapper div — fills .app-shell (flex-column parent) */
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>

      {/* ── Top Bar ── */}
      <div className="top-bar">
        {/* Left: avatar + name */}
        <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => go('profile')}>
          {profile?.photoURL
            ? <img src={profile.photoURL} alt="" className="avatar-sm" style={{ objectFit: 'cover' }} />
            : <div className="avatar-sm">{name.charAt(0).toUpperCase()}</div>}
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{role}</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{name}</div>
          </div>
        </div>

        {/* Right: bell + menu */}
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotifs(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
            <Bell size={17} color="var(--text-muted)" />
            <div style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, background: 'var(--primary)', borderRadius: '50%' }} />
          </button>
          <button onClick={() => setShowMenu(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Menu size={17} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '1.1rem', paddingBottom: 'max(5rem, calc(1.5rem + env(safe-area-inset-bottom)))', display: 'flex', flexDirection: 'column', gap: '0.85rem', animation: 'fadeIn 0.25s ease-out' }}>
          {isShell ? (
            <>
              {shellTab === 'chat'     && <ChatBox onBack={() => setShellTab(null)} />}
              {shellTab === 'feed'     && <CommunityFeed onBack={() => setShellTab(null)} />}
              {shellTab === 'download' && <DownloadPage onBack={() => setShellTab(null)} />}
            </>
          ) : (
            <>
              {children}
              <AppFooter />
            </>
          )}
        </div>
      </div>

      {/* ── Mobile FAB ── */}
      <button className="mobile-fab" onClick={() => setShowMenu(true)} aria-label="Open menu">
        <Menu size={20} color="#fff" />
      </button>

      {/* ── Notifications ── */}
      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}

      {/* ── Drawer Menu ── */}
      {showMenu && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500, backdropFilter: 'blur(4px)' }}
          onClick={() => setShowMenu(false)}
        >
          <div
            style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '82%', maxWidth: 300, background: 'rgba(5,10,30,0.98)', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', animation: 'slideInLeft 0.22s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: 'var(--primary)', color: '#fff', padding: '3px 8px', borderRadius: '7px', fontWeight: 800, fontSize: '0.78rem' }}>TC</div>
                <span style={{ fontWeight: 700 }}>Tumkuru Connect</span>
              </div>
              <button onClick={() => setShowMenu(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Profile pill */}
            <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.65rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, cursor: 'pointer' }} onClick={() => go('profile')}>
                {profile?.photoURL
                  ? <img src={profile.photoURL} alt="" className="avatar-sm" style={{ objectFit: 'cover' }} />
                  : <div className="avatar-sm">{name.charAt(0).toUpperCase()}</div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{role}</div>
                </div>
                <ChevronRight size={14} color="var(--text-dim)" />
              </div>
            </div>

            {/* Scrollable nav */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.5rem 0' }}>
              <NavGroup label="NAVIGATION">
                {tabs.map(t => (
                  <NavItem key={t.id} icon={t.menuIcon || t.icon} label={t.label} active={(shellTab === null && activeTab === t.id)} onClick={() => go(t.id)} />
                ))}
              </NavGroup>

              <NavGroup label="COMMUNITY">
                <NavItem icon={<Rss size={16} />}           label="Community Feed"  active={shellTab === 'feed'}     onClick={() => go('feed')} />
                <NavItem icon={<MessageSquare size={16} />} label="Messages & Chat" active={shellTab === 'chat'}     onClick={() => go('chat')} />
              </NavGroup>

              {extraMenuLinks.length > 0 && (
                <NavGroup label="MORE">
                  {extraMenuLinks.map((l, i) => <NavItem key={i} icon={l.icon} label={l.label} onClick={l.onClick} />)}
                </NavGroup>
              )}

              <NavGroup label="APP">
                <NavItem icon={<Download size={16} />} label="Download App"       active={shellTab === 'download'} onClick={() => go('download')} />
                <NavItem icon={<Settings size={16} />} label="Profile & Settings"                                 onClick={() => go('profile')} />
              </NavGroup>
            </div>

            {/* Sign out */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={signOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '0.7rem 1rem', cursor: 'pointer', color: '#f87171', fontWeight: 600, fontSize: '0.85rem' }}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavGroup({ label, children }) {
  return (
    <div style={{ marginBottom: '0.25rem' }}>
      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', padding: '0.6rem 0.9rem 0.2rem' }}>{label}</div>
      {children}
    </div>
  );
}

function NavItem({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '0.65rem 0.9rem',
        background: active ? 'rgba(239,68,68,0.1)' : 'transparent',
        border: 'none', borderRadius: 9,
        color: active ? 'var(--primary)' : 'var(--text-muted)',
        fontWeight: active ? 700 : 500, fontSize: '0.86rem',
        cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(239,68,68,0.1)' : 'transparent'; }}
    >
      <span style={{ color: active ? 'var(--primary)' : 'var(--text-dim)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {typeof icon === 'string' ? <span style={{ fontSize: '1rem' }}>{icon}</span> : icon}
      </span>
      {label}
    </button>
  );
}
