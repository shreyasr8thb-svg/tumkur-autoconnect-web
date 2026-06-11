import { useState } from 'react';
import { X, Trash2, CheckCircle, BellRing, Info } from 'lucide-react';

export default function NotificationsPanel({ onClose }) {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', text: 'System update: Server maintenance at 2 AM.', read: false },
    { id: 2, type: 'alert', text: 'HR: Action required on your skill passport.', read: false },
    { id: 3, type: 'success', text: 'Your previous ride was completed successfully.', read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const deleteNotif = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s' }}>
      <div className="glass-card flex-col" style={{ width: '100%', maxWidth: '380px', height: '100%', background: 'rgba(15,23,42,0.98)', borderRadius: 0, animation: 'slideInRight 0.3s forwards', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-dark" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Notifications</h3>
            {unreadCount > 0 && (
              <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                {unreadCount} New
              </span>
            )}
          </div>
          <X size={24} color="var(--text-muted)" onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex justify-between items-center px-4 py-2 border-b-dark" style={{ borderColor: 'rgba(255,255,255,0.02)', background: 'rgba(0,0,0,0.2)' }}>
            <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
              Mark all as read
            </button>
            <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
              Clear all
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-col p-4 gap-3" style={{ overflowY: 'auto', flex: 1 }}>
          {notifications.length === 0 ? (
            <div className="flex-col items-center justify-center gap-3" style={{ height: '100%', color: '#475569', marginTop: '4rem' }}>
              <BellRing size={48} color="var(--border)" />
              <p>You have no notifications.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3" style={{ background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(59,130,246,0.1)', border: '1px solid', borderColor: n.read ? 'var(--border)' : 'rgba(59,130,246,0.2)', borderRadius: '12px', transition: 'background 0.2s', position: 'relative' }} onClick={() => !n.read && markRead(n.id)}>
                <div style={{ marginTop: '2px' }}>
                  {n.type === 'alert' ? <AlertTriangleIcon /> : n.type === 'success' ? <CheckCircle size={18} color="#4ade80" /> : <Info size={18} color="#3b82f6" />}
                </div>
                <div style={{ flex: 1, paddingRight: '20px' }}>
                  <div style={{ fontSize: '0.85rem', color: n.read ? 'var(--text-main)' : 'var(--text-main)', fontWeight: n.read ? 400 : 600, lineHeight: 1.4 }}>
                    {n.text}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {n.read ? 'Read' : 'Just now'}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  );
}
