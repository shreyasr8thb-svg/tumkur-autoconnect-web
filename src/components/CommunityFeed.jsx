import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Heart, MessageCircle, Plus, X, Send, Image as ImageIcon } from 'lucide-react';

export default function CommunityFeed({ onBack }) {
  const { user, profile } = useUser();
  const [posts, setPosts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const [showComment, setShowComment] = useState(null);
  const fileInputRef = useRef(null);
  const name = profile?.fullName || profile?.email?.split('@')[0] || 'User';
  const role = profile?.role || 'worker';

  useEffect(() => {
    const q = query(collection(db, 'communityFeed'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const createPost = async () => {
    if ((!newPost.trim() && !postImage) || !user) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'communityFeed'), {
        text: newPost.trim(),
        image: postImage,
        authorId: user.uid,
        authorName: name,
        authorRole: role,
        likes: [],
        createdAt: serverTimestamp()
      });
      setNewPost('');
      setPostImage(null);
      setShowCreate(false);
    } finally {
      setPosting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleLike = async (postId, likes) => {
    if (!user) return;
    const ref = doc(db, 'communityFeed', postId);
    if (likes?.includes(user.uid)) {
      await updateDoc(ref, { likes: arrayRemove(user.uid) });
    } else {
      await updateDoc(ref, { likes: arrayUnion(user.uid) });
    }
  };

  const roleColor = (r) => {
    if (r === 'hr') return '#f59e0b';
    if (r === 'jobfinder') return '#3b82f6';
    if (r === 'driver') return '#10b981';
    return 'var(--primary)';
  };
  const roleLabel = (r) => {
    if (r === 'hr') return 'HR';
    if (r === 'jobfinder') return 'Job Finder';
    if (r === 'driver') return 'Driver';
    return 'Worker';
  };

  return (
    <div className="flex-col" style={{ flex: 1 }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b-dark" style={{ borderColor: 'var(--border)', position: 'sticky', top: 0, background: 'var(--bg-dark)', zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Community Feed</h2>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Updates from workers, HR & job finders</div>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ width: 36, height: 36, background: 'var(--primary)', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Plus size={18} color="#fff" />
        </button>
      </div>

      {/* Create Post Overlay */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div className="flex-col gap-3" style={{ background: 'var(--bg-panel)', borderRadius: '24px 24px 0 0', padding: '1.5rem', width: '100%', maxWidth: '480px', margin: '0 auto', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeIn 0.25s' }}>
            <div className="flex justify-between items-center">
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Create a Post</h3>
              <X size={22} color="var(--text-dim)" onClick={() => setShowCreate(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div className="flex items-start gap-3">
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{name}</div>
                <div style={{ fontSize: '0.7rem', color: roleColor(role) }}>{roleLabel(role)}</div>
              </div>
            </div>
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Share an update, job opportunity, or announcement..."
              rows={4}
              style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.875rem', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit' }}
            />
            {postImage && (
              <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', marginTop: '0.5rem' }}>
                <img src={postImage} alt="Post preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                <button onClick={() => setPostImage(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', padding: 4, cursor: 'pointer' }}>
                  <X size={16} color="#fff" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} className="btn flex items-center justify-center gap-2" style={{ background: 'var(--border)', color: 'var(--text-main)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', flex: 1 }}>
                <ImageIcon size={18} />
                Photo
              </button>
              <button onClick={createPost} disabled={(!newPost.trim() && !postImage) || posting} className="btn flex items-center justify-center gap-2" style={{ background: 'var(--primary)', padding: '0.85rem', borderRadius: '12px', border: 'none', flex: 2, color: '#fff' }}>
                <Send size={16} />
                {posting ? 'Posting...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="flex-col gap-3 p-4" style={{ overflowY: 'auto' }}>
        {posts.length === 0 && (
          <div className="flex-col items-center gap-2 text-center" style={{ marginTop: '3rem', color: '#334155' }}>
            <MessageCircle size={44} />
            <p style={{ margin: 0 }}>No posts yet. Be the first to share!</p>
          </div>
        )}
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            userId={user?.uid}
            onLike={() => toggleLike(post.id, post.likes)}
            onComment={() => setShowComment(showComment === post.id ? null : post.id)}
            showComment={showComment === post.id}
            roleColor={roleColor}
            roleLabel={roleLabel}
          />
        ))}
        <div style={{ height: '90px' }} />
      </div>
    </div>
  );
}

function PostCard({ post, userId, onLike, onComment, showComment, roleColor, roleLabel }) {
  const { user, profile } = useUser();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const liked = post.likes?.includes(userId);
  const name = profile?.fullName || profile?.email?.split('@')[0] || 'User';

  useEffect(() => {
    if (!showComment) return;
    const q = query(collection(db, 'communityFeed', post.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => setComments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [showComment, post.id]);

  const sendComment = async () => {
    if (!commentText.trim() || !user) return;
    await addDoc(collection(db, 'communityFeed', post.id, 'comments'), {
      text: commentText.trim(),
      authorId: user.uid,
      authorName: name,
      authorRole: profile?.role || 'worker',
      createdAt: serverTimestamp()
    });
    setCommentText('');
  };

  return (
    <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', overflow: 'hidden' }}>
      {/* Author */}
      <div className="flex items-center gap-3" style={{ padding: '1rem 1rem 0.5rem' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.85rem', flexShrink: 0 }}>
          {(post.authorName || 'U').charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{post.authorName}</div>
          <div style={{ fontSize: '0.68rem', color: roleColor(post.authorRole) }}>{roleLabel(post.authorRole)}</div>
        </div>
        <div style={{ fontSize: '0.68rem', color: '#334155' }}>
          {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'just now'}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0.5rem 1rem 1rem', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
        {post.text}
      </div>
      {post.image && (
        <div style={{ padding: '0 1rem 1rem' }}>
          <img src={post.image} alt="Post image" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '12px' }} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4" style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <button onClick={onLike} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: liked ? 'var(--primary)' : 'var(--text-dim)', fontSize: '0.82rem', fontWeight: 600 }}>
          <Heart size={16} fill={liked ? 'var(--primary)' : 'none'} />
          {post.likes?.length || 0}
        </button>
        <button onClick={onComment} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: showComment ? '#3b82f6' : 'var(--text-dim)', fontSize: '0.82rem', fontWeight: 600 }}>
          <MessageCircle size={16} />
          Comments
        </button>
      </div>

      {/* Comments */}
      {showComment && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)' }}>
          <div className="flex-col gap-2" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '0.75rem' }}>
            {comments.map(c => (
              <div key={c.id} className="flex items-start gap-2">
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{(c.authorName || 'U').charAt(0)}</div>
                <div style={{ background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.5rem 0.75rem', flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>{c.authorName}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{c.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendComment()} placeholder="Add a comment..." style={{ flex: 1, background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }} />
            <button onClick={sendComment} style={{ width: 34, height: 34, background: 'var(--primary)', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Send size={14} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
