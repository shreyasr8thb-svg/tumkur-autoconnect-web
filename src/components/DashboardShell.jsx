/**
 * DashboardShell – shared layout used by ALL dashboards (Worker, HR, Driver, Owner).
 * Provides: consistent top bar, mobile FAB menu button, slide-out drawer, notifications.
 */
import { useState } from 'react';
import {
  Bell, Menu, X, Home as HomeIcon, MessageSquare, Rss, User,
  LogOut, Settings, Download, ChevronRight, Building2, Car, Shield
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import NotificationsPanel from './NotificationsPanel';
import ChatBox from './ChatBox';
import CommunityFeed from './CommunityFeed';
import DownloadPage from './DownloadPage';
import AppFooter from './AppFooter';

export default function DashboardShell({ role, title, tabs, activeTab, setActiveTab, children, extraMenuLinks = [] }) {
  const { profile, signOut } = useUser();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const name = profile?.fullName || profile?.email?.split('@')[0] || 'User';
  const [internalTab, setInternalTab] = useState(null); // for shell-managed tabs

  const currentTab = internalTab || activeTab;

  const go = (t) => {
    if (['chat', 'feed', 'download'].includes(t)) {
      setInternalTab(t);
      setShowMenu(false);
    } else {
      setInternalTab(null);
      setActiveTab(t);
      setShowMenu(false);
    }
  };

  const isShellTab = ['chat', 'feed', 'download'].includes(currentTab);

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => go('profile')}>
          {profile?.photoURL
            ? <img src={profile.photoURL} alt="" className="avatar-sm" style={{ objectFit: 'cover' }} />
            : <div className="avatar-sm">{name.charAt(0).toUpperCase()}</div>
          }
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{role}</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{name}</div>
          </div>
        </div>

        {/* Center: title */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', display: 'none' }}>{title}</div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowNotifs(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4 }}>
            <Bell size={22} color="var(--text-dim)" />
            <div style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, background: 'var(--primary)', borderRadius: '50%', border: '1.5px solid var(--bg-dark)' }} />
          </button>
          <button onClick={() => setShowMenu(true)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Menu size={18} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
        {isShellTab ? (
          <div className="screen" style={{ overflowY: 'auto' }}>
            {currentTab === 'chat'     && <ChatBox onBack={() => setInternalTab(null)} />}
            {currentTab === 'feed'     && <CommunityFeed onBack={() => setInternalTab(null)} />}
            {currentTab === 'download' && <DownloadPage onBack={() => setInternalTab(null)} />}
          </div>
        ) : (
          <div className="screen" style={{ overflowY: 'auto' }}>
            {children}
            <AppFooter />
          </div>
        )}

        {/* Mobile FAB */}
        {currentTab !== 'bus' && (
          <button className="mobile-fab" onClick={() => setShowMenu(true)} aria-label="Navigation menu">
            <Menu size={20} color="#fff" />
          </button>
        )}
      </div>

      {/* Notifications Panel */}
      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}

      {/* Slide-out Menu Drawer */}
      {showMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, animation: 'fadeIn 0.2s' }} onClick={() => setShowMenu(false)}>
          <div className="flex-col" style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '82%', maxWidth: '300px', background: '#020617', borderRight: '1px solid rgba(255,255,255,0.07)', animation: 'slideInLeft 0.25s forwards' }} onClick={e => e.stopPropagation()}>

            {/* Drawer Header */}
            <div className="flex justify-between items-center" style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <div style={{ background: 'var(--primary)', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem' }}>TC</div>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Tumkuru Connect</span>
              </div>
              <button onClick={() => setShowMenu(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={22} color="var(--text-muted)" />
              </button>
            </div>

            {/* Profile card */}
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', cursor: 'pointer' }} onClick={() => go('profile')}>
                {profile?.photoURL
                  ? <img src={profile.photoURL} alt="" className="avatar-sm" style={{ objectFit: 'cover' }} />
                  : <div className="avatar-sm">{name.charAt(0).toUpperCase()}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{role}</div>
                </div>
                <ChevronRight size={16} color="var(--text-dim)" />
              </div>
            </div>

            {/* Nav Links */}
            <div className="flex-col" style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
              <DrawerSection label="MAIN">
                {tabs.map(t => (
                  <DrawerLink key={t.id} icon={t.menuIcon || t.icon} label={t.label} active={currentTab === t.id} onClick={() => go(t.id)} />
                ))}
              </DrawerSection>

              <DrawerSection label="COMMUNITY">
                <DrawerLink icon={<Rss size={18} />}          label="Community Feed"  onClick={() => go('feed')} active={currentTab === 'feed'} />
                <DrawerLink icon={<MessageSquare size={18} />} label="Messages & Chat" onClick={() => go('chat')} active={currentTab === 'chat'} />
              </DrawerSection>

              {extraMenuLinks.length > 0 && (
                <DrawerSection label="MORE">
                  {extraMenuLinks.map((l, i) => <DrawerLink key={i} icon={l.icon} label={l.label} onClick={() => { l.onClick(); setShowMenu(false); }} />)}
                </DrawerSection>
              )}

              <DrawerSection label="APP">
                <DrawerLink icon={<Download size={18} />} label="Download App"  onClick={() => go('download')} />
                <DrawerLink icon={<Settings size={18} />} label="Profile & Settings" onClick={() => go('profile')} />
              </DrawerSection>
            </div>

            {/* Sign Out */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={signOut} className="flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', width: '100%', padding: '0.75rem 1rem', cursor: 'pointer', color: '#f87171', fontWeight: 600, fontSize: '0.88rem' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DrawerSection({ label, children }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', padding: '0.5rem 1rem 0.25rem' }}>{label}</div>
      {children}
    </div>
  );
}

function DrawerLink({ icon, label, onClick, active }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3" style={{
      background: active ? 'rgba(239,68,68,0.1)' : 'none',
      border: 'none', borderRadius: '10px', width: '100%',
      padding: '0.7rem 1rem', cursor: 'pointer',
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      fontWeight: active ? 700 : 500, fontSize: '0.88rem',
      textAlign: 'left', transition: 'background 0.15s',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none'; }}
    >
      <span style={{ color: active ? 'var(--primary)' : 'var(--text-dim)', flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  );
}
