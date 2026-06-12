import { useState, useEffect, useRef } from 'react';
import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, where, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';
import { Send, ArrowLeft, MessageSquare, Search, Building2, Users } from 'lucide-react';

/**
 * ChatBox – Intelligent message hub for Workers/HR
 * - Workers: Chat with HR of their company + fellow employees
 * - HR: Chat with all employees + see company channel
 * - Job Finders: NOT shown (removed from JobFinderDashboard)
 */
export default function ChatBox({ onBack }) {
  const { user, profile } = useUser();
  const [view, setView] = useState('list'); // 'list' | 'chat'
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [search, setSearch] = useState('');
  const isHR = profile?.role === 'hr';

  useEffect(() => {
    if (!user || !profile) return;
    buildContacts();
  }, [user, profile]);

  const buildContacts = async () => {
    const list = [];

    if (isHR) {
      // HR: show company-wide channel + all members
      list.push({
        id: `company-${user.uid}`,
        name: `${profile?.fullName?.split(' ')[0] || 'Company'} Team Channel`,
        subtitle: 'Broadcast to all employees',
        type: 'group',
        roomId: `company-${user.uid}`
      });

      // Fetch all company members
      const membersSnap = await getDocs(
        query(collection(db, 'company_members'), where('companyId', '==', user.uid))
      );
      membersSnap.docs.forEach(d => {
        const m = d.data();
        list.push({
          id: m.workerId || d.id,
          name: m.workerName || 'Worker',
          subtitle: 'Employee',
          type: 'dm',
          roomId: [user.uid, m.workerId || d.id].sort().join('_')
        });
      });
    } else {
      // Worker: show HR channel + fellow employees
      const companyId = profile?.companyId;
      if (companyId) {
        // Company group channel
        list.push({
          id: `company-${companyId}`,
          name: 'Team Channel',
          subtitle: 'Company-wide messages',
          type: 'group',
          roomId: `company-${companyId}`
        });

        // DM with HR
        const compSnap = await getDocs(
          query(collection(db, 'companies'), where('__name__', '==', companyId))
        );
        if (!compSnap.empty) {
          const comp = compSnap.docs[0].data();
          list.push({
            id: companyId,
            name: `HR: ${comp.hrName || 'HR Manager'}`,
            subtitle: comp.name,
            type: 'dm',
            roomId: [user.uid, companyId].sort().join('_')
          });
        }

        // Fellow employees
        const membersSnap = await getDocs(
          query(collection(db, 'company_members'), where('companyId', '==', companyId))
        );
        membersSnap.docs.forEach(d => {
          const m = d.data();
          const otherId = m.workerId || d.id;
          if (otherId === user.uid) return; // skip self
          list.push({
            id: otherId,
            name: m.workerName || 'Colleague',
            subtitle: 'Colleague',
            type: 'dm',
            roomId: [user.uid, otherId].sort().join('_')
          });
        });
      } else {
        // Not yet in a company – can still use a general channel
        list.push({
          id: 'general',
          name: 'General Chat',
          subtitle: 'Public channel for all users',
          type: 'group',
          roomId: 'general'
        });
      }
    }

    setContacts(list);
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (view === 'chat' && activeChat) {
    return <ChatRoom room={activeChat} onBack={() => setView('list')} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Messages</h2>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            {isHR ? 'Chat with your employees' : 'Chat with HR & colleagues'}
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '0.75rem 1rem 0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.6rem 1rem' }}>
          <Search size={16} color="var(--text-dim)" />
          <input
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', flex: 1, fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Contact list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {profile?.companyId || isHR ? (
              <>
                <Users size={40} color="#334155" />
                <span style={{ fontSize: '0.9rem' }}>No contacts found.</span>
              </>
            ) : (
              <>
                <Building2 size={40} color="#334155" />
                <span style={{ fontSize: '0.9rem' }}>Join a company to unlock team messaging.</span>
              </>
            )}
          </div>
        ) : (
          filtered.map(c => (
            <ContactCard
              key={c.id}
              contact={c}
              onClick={() => { setActiveChat(c); setView('chat'); }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ContactCard({ contact, onClick }) {
  const initials = (contact.name || '?').charAt(0).toUpperCase();
  const isGroup = contact.type === 'group';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '0.875rem', background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px',
        cursor: 'pointer', transition: 'all 0.15s'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(225,29,72,0.06)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
    >
      <div style={{
        width: 44, height: 44, borderRadius: isGroup ? '12px' : '50%',
        background: isGroup ? 'rgba(225,29,72,0.15)' : 'rgba(59,130,246,0.15)',
        border: `1px solid ${isGroup ? 'rgba(225,29,72,0.25)' : 'rgba(59,130,246,0.25)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', fontWeight: 700, color: isGroup ? '#f87171' : '#60a5fa',
        flexShrink: 0
      }}>
        {isGroup ? <MessageSquare size={20} /> : initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.name}</div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.subtitle}</div>
      </div>
      <MessageSquare size={16} color="#334155" />
    </div>
  );
}

function ChatRoom({ room, onBack }) {
  const { user, profile } = useUser();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const name = profile?.fullName || profile?.email?.split('@')[0] || 'User';

  useEffect(() => {
    const q = query(
      collection(db, 'chatRooms', room.roomId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [room.roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'chatRooms', room.roomId, 'messages'), {
        text: text.trim(),
        senderId: user.uid,
        senderName: name,
        senderRole: profile?.role || 'worker',
        createdAt: serverTimestamp()
      });
      setText('');
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const roleColor = (role) => {
    if (role === 'hr') return '#f59e0b';
    if (role === 'driver') return '#10b981';
    return '#60a5fa';
  };
  const roleLabel = (role) => {
    if (role === 'hr') return 'HR';
    if (role === 'driver') return 'Driver';
    return 'Worker';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: 'var(--bg-dark)', zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ width: 36, height: 36, borderRadius: room.type === 'group' ? '10px' : '50%', background: 'rgba(225,29,72,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', border: '1px solid rgba(225,29,72,0.2)', flexShrink: 0, fontWeight: 700, color: '#f87171' }}>
          {room.type === 'group' ? <MessageSquare size={18} /> : room.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{room.name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{room.subtitle}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '80px' }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '3rem', color: '#334155', textAlign: 'center' }}>
            <MessageSquare size={36} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === user?.uid;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' }}>
              {!isMe && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem', color: '#fff', flexShrink: 0 }}>
                  {(msg.senderName || 'U').charAt(0)}
                </div>
              )}
              <div style={{ maxWidth: '72%' }}>
                {!isMe && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)' }}>{msg.senderName}</span>
                    <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', color: roleColor(msg.senderRole) }}>{roleLabel(msg.senderRole)}</span>
                  </div>
                )}
                <div style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  border: isMe ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  color: 'var(--text-main)', fontSize: '0.875rem', lineHeight: 1.5
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#334155', marginTop: '3px', textAlign: isMe ? 'right' : 'left' }}>
                  {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem', position: 'absolute', bottom: 80, left: 0, right: 0, background: 'rgba(5,10,30,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.7rem 1rem', color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none' }}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          style={{ width: 42, height: 42, borderRadius: '12px', background: text.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: text.trim() ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.2s' }}
        >
          <Send size={18} color={text.trim() ? '#fff' : '#334155'} />
        </button>
      </div>
    </div>
  );
}
