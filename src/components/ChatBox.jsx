import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';
import { Send, ArrowLeft, MessageSquare, Plus, Search } from 'lucide-react';

export default function ChatBox({ onBack }) {
  const { user, profile } = useUser();
  const [view, setView] = useState('list'); // 'list' | 'chat'
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showNew, setShowNew] = useState(false);

  // Preset conversation rooms (group chats by type)
  const presetRooms = [
    { id: 'general', name: '🏭 General — Tumkuru Connect', desc: 'All workers & staff', type: 'group' },
    { id: 'hr-announcements', name: '📢 HR Announcements', desc: 'Official HR updates', type: 'group' },
    { id: 'job-board', name: '💼 Job Board Chat', desc: 'Jobs & interviews', type: 'group' },
    { id: 'ride-coordination', name: '🚕 Ride Coordination', desc: 'Factory cab schedule', type: 'group' },
  ];

  const openRoom = (room) => {
    setActiveRoom(room);
    setView('chat');
  };

  if (view === 'chat' && activeRoom) {
    return <ChatRoom room={activeRoom} onBack={() => setView('list')} />;
  }

  return (
    <div className="flex-col" style={{ flex: 1 }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b-dark" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Messages</h2>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Chat with HR, workers & job finders</div>
        </div>
        <button onClick={() => setShowNew(true)} style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.3)', borderRadius: '10px', padding: '6px 12px', color: '#e11d48', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
          <Plus size={14} /> New
        </button>
      </div>

      {/* Search */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.6rem 1rem' }}>
          <Search size={16} color="#64748b" />
          <input placeholder="Search conversations..." style={{ background: 'transparent', border: 'none', color: '#f8fafc', outline: 'none', flex: 1, fontSize: '0.875rem' }} />
        </div>
      </div>

      {/* Room list */}
      <div className="flex-col gap-2 p-4 pt-2" style={{ overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', letterSpacing: '0.5px', marginBottom: '4px' }}>CHANNELS</div>
        {presetRooms.map(room => (
          <RoomCard key={room.id} room={room} onClick={() => openRoom(room)} />
        ))}
      </div>
    </div>
  );
}

function RoomCard({ room, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px',
      cursor: 'pointer', transition: 'all 0.2s'
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(225,29,72,0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
    >
      <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem' }}>
        {room.name.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{room.name}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{room.desc}</div>
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
      collection(db, 'chatRooms', room.id, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [room.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'chatRooms', room.id, 'messages'), {
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
    if (role === 'jobfinder') return '#3b82f6';
    if (role === 'driver') return '#10b981';
    return '#94a3b8';
  };
  const roleLabel = (role) => {
    if (role === 'hr') return 'HR';
    if (role === 'jobfinder') return 'Job Finder';
    if (role === 'driver') return 'Driver';
    return 'Worker';
  };

  return (
    <div className="flex-col" style={{ flex: 1, height: '100%' }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b-dark" style={{ borderColor: 'rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#020617', zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(225,29,72,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid rgba(225,29,72,0.15)' }}>
          {room.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>{room.name}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{room.desc}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-col gap-3 p-4" style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        {messages.length === 0 && (
          <div className="flex-col items-center gap-2 text-center" style={{ marginTop: '3rem', color: '#334155' }}>
            <MessageSquare size={40} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === user?.uid;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' }}>
              {!isMe && (
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#fff', flexShrink: 0 }}>
                  {(msg.senderName || 'U').charAt(0)}
                </div>
              )}
              <div style={{ maxWidth: '72%' }}>
                {!isMe && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#cbd5e1' }}>{msg.senderName}</span>
                    <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', color: roleColor(msg.senderRole) }}>{roleLabel(msg.senderRole)}</span>
                  </div>
                )}
                <div style={{
                  padding: '0.6rem 0.9rem', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe ? 'linear-gradient(135deg, #e11d48, #f43f5e)' : 'rgba(30,41,59,0.8)',
                  border: isMe ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  color: '#f8fafc', fontSize: '0.875rem', lineHeight: 1.5
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
      <div className="flex items-center gap-2 p-3" style={{ position: 'absolute', bottom: 80, left: 0, right: 0, background: 'rgba(2,6,23,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          style={{ flex: 1, background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.7rem 1rem', color: '#f8fafc', fontSize: '0.875rem', outline: 'none' }}
        />
        <button onClick={sendMessage} disabled={!text.trim() || sending} style={{
          width: 42, height: 42, borderRadius: '12px', background: text.trim() ? '#e11d48' : 'rgba(255,255,255,0.05)',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: text.trim() ? 'pointer' : 'default', flexShrink: 0,
          transition: 'all 0.2s'
        }}>
          <Send size={18} color={text.trim() ? '#fff' : '#334155'} />
        </button>
      </div>
    </div>
  );
}
