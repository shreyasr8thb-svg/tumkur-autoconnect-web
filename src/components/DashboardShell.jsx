/**
 * DashboardShell – shared layout for ALL portals
 * Uses a true responsive layout: Sidebar on Desktop, Drawer + TopBar on Mobile.
 * UI is modeled after the reference professional app (dark theme, red accents).
 */
import { useState } from 'react';
import {
  Bell, Menu, X, MessageSquare, Rss,
  LogOut, Settings, Download, ChevronRight, Plus
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
    <>
      {/* ── Desktop Sidebar ── */}
      <div className="desktop-sidebar">
        {/* App Logo / Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '1.25rem 1.5rem' }}>
          <div style={{ background: 'var(--primary)', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem' }}>TC</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Tumkuru Connect</span>
        </div>

        {/* Profile Card in Sidebar */}
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => go('profile')} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
            {profile?.photoURL
              ? <img src={profile.photoURL} alt="" className="avatar-sm" style={{ objectFit: 'cover', width: 42, height: 42, borderRadius: 12 }} />
              : <div className="avatar-sm" style={{ width: 42, height: 42, borderRadius: 12, fontSize: '1.1rem' }}>{name.charAt(0).toUpperCase()}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{role}</div>
            </div>
            <ChevronRight size={16} color="var(--text-dim)" />
          </div>
        </div>

        {/* Action Button (Optional based on role, here a general Quick Action or SOS) */}
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <button className="btn btn-primary w-100" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.9rem', borderRadius: 14, fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 20px rgba(239,68,68,0.3)' }} onClick={() => go('feed')}>
            <Plus size={18} /> Create New Post
          </button>
        </div>

        {/* Navigation Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
          <NavGroup label="MENU">
            {tabs.map(t => (
              <NavItem key={t.id} icon={t.menuIcon || t.icon} label={t.label} active={(shellTab === null && activeTab === t.id)} onClick={() => go(t.id)} />
            ))}
          </NavGroup>

          <NavGroup label="COMMUNITY">
            <NavItem icon={<Rss size={18} />}           label="Innovation Feed" active={shellTab === 'feed'}     onClick={() => go('feed')} />
            <NavItem icon={<MessageSquare size={18} />} label="Messages"        active={shellTab === 'chat'}     onClick={() => go('chat')} />
          </NavGroup>

          {extraMenuLinks.length > 0 && (
            <NavGroup label="MORE">
              {extraMenuLinks.map((l, i) => <NavItem key={i} icon={l.icon} label={l.label} onClick={l.onClick} />)}
            </NavGroup>
          )}

          <NavGroup label="APP">
            <NavItem icon={<Bell size={18} />}     label="Notifications"                                     onClick={() => setShowNotifs(true)} />
            <NavItem icon={<Download size={18} />} label="Download App"       active={shellTab === 'download'} onClick={() => go('download')} />
            <NavItem icon={<Settings size={18} />} label="Settings"                                          onClick={() => go('profile')} />
          </NavGroup>
        </div>

        {/* Sign out */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', padding: '0.75rem', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='#f87171'} onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="desktop-main">
        {/* Mobile Top Bar */}
        <div className="top-bar mobile-only">
          <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => go('profile')}>
            {profile?.photoURL
              ? <img src={profile.photoURL} alt="" className="avatar-sm" style={{ objectFit: 'cover' }} />
              : <div className="avatar-sm">{name.charAt(0).toUpperCase()}</div>}
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{role}</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{name}</div>
            </div>
          </div>

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

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: '1.25rem', paddingBottom: 'max(5rem, calc(1.5rem + env(safe-area-inset-bottom)))', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.25s ease-out', maxWidth: 900, margin: '0 auto', width: '100%' }}>
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

        {/* Mobile FAB */}
        <button className="mobile-fab" onClick={() => setShowMenu(true)} aria-label="Open menu">
          <Menu size={20} color="#fff" />
        </button>

        {/* Notifications */}
        {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}

        {/* Mobile Drawer Menu */}
        {showMenu && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500, backdropFilter: 'blur(4px)' }}
            onClick={() => setShowMenu(false)}
            className="mobile-only"
          >
            <div
              style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '82%', maxWidth: 320, background: 'rgba(5,10,30,0.98)', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', animation: 'slideInLeft 0.22s ease-out' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: 'var(--primary)', color: '#fff', padding: '4px 8px', borderRadius: '7px', fontWeight: 800, fontSize: '0.8rem' }}>TC</div>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Tumkuru Connect</span>
                </div>
                <button onClick={() => setShowMenu(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                  <X size={22} />
                </button>
              </div>

              {/* Profile pill */}
              <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: 16, cursor: 'pointer' }} onClick={() => go('profile')}>
                  {profile?.photoURL
                    ? <img src={profile.photoURL} alt="" className="avatar-sm" style={{ objectFit: 'cover', width: 42, height: 42, borderRadius: 12 }} />
                    : <div className="avatar-sm" style={{ width: 42, height: 42, borderRadius: 12, fontSize: '1.1rem' }}>{name.charAt(0).toUpperCase()}</div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{role}</div>
                  </div>
                  <ChevronRight size={16} color="var(--text-dim)" />
                </div>
              </div>

              {/* Action Button */}
              <div style={{ padding: '1rem' }}>
                <button className="btn btn-primary w-100" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.9rem', borderRadius: 14, fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 20px rgba(239,68,68,0.3)' }} onClick={() => go('feed')}>
                  <Plus size={18} /> Create New Post
                </button>
              </div>

              {/* Scrollable nav */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
                <NavGroup label="MENU">
                  {tabs.map(t => (
                    <NavItem key={t.id} icon={t.menuIcon || t.icon} label={t.label} active={(shellTab === null && activeTab === t.id)} onClick={() => go(t.id)} />
                  ))}
                </NavGroup>

                <NavGroup label="COMMUNITY">
                  <NavItem icon={<Rss size={18} />}           label="Innovation Feed" active={shellTab === 'feed'}     onClick={() => go('feed')} />
                  <NavItem icon={<MessageSquare size={18} />} label="Messages"        active={shellTab === 'chat'}     onClick={() => go('chat')} />
                </NavGroup>

                {extraMenuLinks.length > 0 && (
                  <NavGroup label="MORE">
                    {extraMenuLinks.map((l, i) => <NavItem key={i} icon={l.icon} label={l.label} onClick={l.onClick} />)}
                  </NavGroup>
                )}

                <NavGroup label="APP">
                  <NavItem icon={<Download size={18} />} label="Download App"       active={shellTab === 'download'} onClick={() => go('download')} />
                  <NavItem icon={<Settings size={18} />} label="Settings"                                            onClick={() => go('profile')} />
                </NavGroup>
              </div>

              {/* Sign out */}
              <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={signOut} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 14, padding: '0.85rem', cursor: 'pointer', color: '#f87171', fontWeight: 700, fontSize: '0.9rem' }}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function NavGroup({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.1em', padding: '0 0.5rem 0.5rem' }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {children}
      </div>
    </div>
  );
}

function NavItem({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', padding: '0.75rem 1rem',
        background: active ? 'var(--primary)' : 'transparent',
        border: 'none', borderRadius: 12,
        color: active ? '#fff' : 'var(--text-muted)',
        fontWeight: active ? 700 : 600, fontSize: '0.92rem',
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
        boxShadow: active ? '0 4px 14px rgba(239,68,68,0.3)' : 'none'
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
    >
      <span style={{ display: 'flex', alignItems: 'center', opacity: active ? 1 : 0.8 }}>
        {icon}
      </span>
      {label}
    </button>
  );
}
