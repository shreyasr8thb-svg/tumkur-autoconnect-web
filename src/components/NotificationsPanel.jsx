import { useState, useEffect, useRef } from 'react';
import {
  X, Trash2, CheckCircle, BellRing, MessageSquare, Briefcase,
  UserCheck, Megaphone, AlertTriangle, Car, Info
} from 'lucide-react';
import {
  collection, query, where, onSnapshot, updateDoc, deleteDoc,
  doc, orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';

/* ─── In-App Toast Popup (used globally) ─── */
let _toastFn = null;
export function triggerNotifToast(msg) { _toastFn?.(msg); }

export function NotifToastProvider() {
  const [toast, setToast] = useState(null);
  _toastFn = setToast;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  const icon = ICONS[toast.type] || <Info size={16} color="#3b82f6" />;

  return (
    <div style={{
      position: 'fixed', bottom: '5.5rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 99999, display: 'flex', alignItems: 'center', gap: '10px',
      background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '14px', padding: '0.75rem 1.1rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      animation: 'slideUp 0.3s ease-out', backdropFilter: 'blur(12px)',
      maxWidth: '90vw', minWidth: '260px'
    }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f8fafc' }}>{toast.title}</div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{toast.body}</div>
      </div>
      <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 2, flexShrink: 0 }}>
        <X size={14} />
      </button>
    </div>
  );
}

const ICONS = {
  new_application: <Briefcase size={16} color="#f59e0b" />,
  join_accepted:   <UserCheck size={16} color="#4ade80" />,
  join_rejected:   <AlertTriangle size={16} color="#f87171" />,
  announcement:    <Megaphone size={16} color="#a78bfa" />,
  message:         <MessageSquare size={16} color="#60a5fa" />,
  ride:            <Car size={16} color="#34d399" />,
  info:            <Info size={16} color="#3b82f6" />,
};

const TYPE_LABELS = {
  new_application: 'New Application',
  join_accepted:   'Offer Accepted',
  join_rejected:   'Application Rejected',
  announcement:    'Announcement',
  message:         'New Message',
  ride:            'Ride Update',
  info:            'System',
};

export default function NotificationsPanel({ onClose }) {
  const { user } = useUser();
  const [notifs, setNotifs] = useState([]);
  const prevLen = useRef(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Trigger toast for truly new notifications
      if (prevLen.current > 0 && list.length > prevLen.current) {
        const newest = list[0];
        triggerNotifToast({ type: newest.type, title: newest.title, body: newest.body });
      }
      prevLen.current = list.length;
      setNotifs(list);
    });
  }, [user]);

  const unread = notifs.filter(n => !n.read).length;

  const markRead = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };
  const markAllRead = async () => {
    await Promise.all(notifs.filter(n => !n.read).map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
  };
  const del = async (id) => {
    await deleteDoc(doc(db, 'notifications', id));
  };
  const clearAll = async () => {
    await Promise.all(notifs.map(n => deleteDoc(doc(db, 'notifications', n.id))));
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '390px', height: '100%', background: 'rgba(8,16,36,0.99)', borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s forwards', backdropFilter: 'blur(20px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.25rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BellRing size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Notifications</h3>
            {unread > 0 && (
              <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', padding: '2px 7px', borderRadius: '9999px', fontWeight: 800, letterSpacing: '0.03em' }}>
                {unread} NEW
              </span>
            )}
          </div>
          <X size={22} color="var(--text-muted)" onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>

        {/* Actions bar */}
        {notifs.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1.25rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, padding: '4px 0' }}>
              ✓ Mark all read
            </button>
            <button onClick={clearAll} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, padding: '4px 0' }}>
              🗑 Clear all
            </button>
          </div>
        )}

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          {notifs.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: '#334155', marginTop: '4rem' }}>
              <BellRing size={52} color="#1e293b" />
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>All caught up! No notifications.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {notifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '0.85rem', borderRadius: '12px',
                    background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(59,130,246,0.08)',
                    border: `1px solid ${n.read ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.2)'}`,
                    cursor: n.read ? 'default' : 'pointer', position: 'relative',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>
                    {ICONS[n.type] || <Info size={16} color="#3b82f6" />}
                  </div>
                  <div style={{ flex: 1, paddingRight: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {TYPE_LABELS[n.type] || 'Update'}
                      </span>
                      {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block', flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: n.read ? 400 : 600, color: 'var(--text-main)', lineHeight: 1.4 }}>{n.title}</div>
                    {n.body && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.4 }}>{n.body}</div>}
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '5px' }}>
                      {n.timestamp?.toDate ? n.timestamp.toDate().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Just now'}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); del(n.id); }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: 2 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
