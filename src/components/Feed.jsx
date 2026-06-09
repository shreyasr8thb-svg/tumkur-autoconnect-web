import { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { Image, ThumbsUp, MessageSquare, Share2, MoreHorizontal, Send } from 'lucide-react';

export default function Feed() {
  const { profile } = useUser();
  const [posts, setPosts] = useState([
    {
      id: 1, author: 'Suresh Factory Manager', role: 'HR / Owner', photo: '', time: '2 hrs ago',
      content: 'Great news! We just installed 5 new CNC machines at Sri Sai Auto. Looking for experienced operators. Reach out or apply via the Jobs tab!',
      image: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=600&q=80', likes: 24, comments: 5
    },
    {
      id: 2, author: 'Ramesh K.', role: 'Machinist', photo: '', time: '5 hrs ago',
      content: 'Just completed my advanced G-Code certification at Govt ITI Tumkur! 🎓 Grateful for the upskilling opportunity.',
      likes: 56, comments: 12
    },
    {
      id: 3, author: 'Tumkur Transit Auth', role: 'Admin', photo: '', time: '1 day ago',
      content: 'Notice: Bus Route T-04 will be diverted through Ring Road tomorrow due to highway maintenance. Plan your commute accordingly.',
      likes: 112, comments: 8
    }
  ]);
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState(null);
  const fileRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setPostImage(r.result);
      r.readAsDataURL(file);
    }
  };

  const submitPost = () => {
    if (!newPost.trim() && !postImage) return;
    setPosts([{
      id: Date.now(),
      author: profile?.fullName || 'User',
      role: profile?.role === 'hr' ? 'HR' : profile?.role === 'driver' ? 'Driver' : 'Worker',
      photo: profile?.photoURL,
      time: 'Just now',
      content: newPost,
      image: postImage,
      likes: 0, comments: 0
    }, ...posts]);
    setNewPost(''); setPostImage(null);
  };

  return (
    <div className="flex-col gap-3">
      {/* Create Post */}
      <div className="glass-card flex-col gap-3" style={{ padding: '1rem' }}>
        <div className="flex gap-3 items-start">
          <div className="avatar-sm flex-shrink-0" style={{ width: 36, height: 36 }}>
            {profile?.photoURL ? <img src={profile.photoURL} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} /> : (profile?.fullName||'U').charAt(0)}
          </div>
          <textarea 
            className="input-field" 
            placeholder="Share an update, certificate, or news..." 
            value={newPost} onChange={e => setNewPost(e.target.value)}
            style={{ minHeight: 60, padding: '0.5rem', fontSize: '0.85rem', resize: 'none' }}
          />
        </div>
        {postImage && <div className="relative"><img src={postImage} alt="" style={{ width:'100%', borderRadius:8, maxHeight:200, objectFit:'cover' }} /><button className="btn btn-ghost" style={{ position:'absolute', top:5, right:5, padding:5, background:'rgba(0,0,0,0.5)' }} onClick={() => setPostImage(null)}>X</button></div>}
        <div className="flex justify-between items-center border-t-dark pt-2 mt-1">
          <button className="btn btn-ghost flex gap-2 text-muted" style={{ padding: '0.4rem 0.6rem' }} onClick={() => fileRef.current?.click()}>
            <Image size={18} color="#4ade80" /> <span style={{ fontSize:'0.8rem' }}>Photo</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImage} />
          <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', width: 'auto' }} onClick={submitPost}>
            <Send size={14} /> Post
          </button>
        </div>
      </div>

      {/* Feed Posts */}
      {posts.map(post => (
        <div key={post.id} className="glass-card flex-col" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="p-3 flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className="avatar-sm" style={{ width: 40, height: 40 }}>
                {post.photo ? <img src={post.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} /> : post.author.charAt(0)}
              </div>
              <div className="flex-col">
                <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{post.author}</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{post.role} • {post.time}</span>
              </div>
            </div>
            <MoreHorizontal size={18} color="#64748b" />
          </div>
          
          <div className="px-3 pb-2 text-sm" style={{ color: '#e2e8f0' }}>{post.content}</div>
          
          {post.image && (
            <img src={post.image} alt="Post media" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
          )}
          
          <div className="flex justify-between items-center px-4 py-2 border-t-dark" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{post.likes} Likes • {post.comments} Comments</span>
          </div>
          
          <div className="flex border-t-dark" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button className="btn btn-ghost flex-1 flex gap-2 justify-center py-3" style={{ borderRadius: 0, color: '#94a3b8' }}><ThumbsUp size={18} /> <span style={{ fontSize:'0.8rem' }}>Like</span></button>
            <button className="btn btn-ghost flex-1 flex gap-2 justify-center py-3" style={{ borderRadius: 0, color: '#94a3b8' }}><MessageSquare size={18} /> <span style={{ fontSize:'0.8rem' }}>Comment</span></button>
            <button className="btn btn-ghost flex-1 flex gap-2 justify-center py-3" style={{ borderRadius: 0, color: '#94a3b8' }}><Share2 size={18} /> <span style={{ fontSize:'0.8rem' }}>Share</span></button>
          </div>
        </div>
      ))}
    </div>
  );
}
