import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import { HiMenu, HiChat, HiHeart, HiEye, HiReply, HiPlus, HiFilter } from 'react-icons/hi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CommunityPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const t = useSelector(selectT);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = filter !== 'all' ? `?category=${filter}` : '';
        const { data } = await api.get(`/forum${params}`);
        setPosts(data.posts || []);
      } catch (err) { console.error(err); }
    };
    fetchPosts();
  }, [filter]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/forum', newPost);
      setPosts([data.post, ...posts]);
      setShowCreate(false);
      setNewPost({ title: '', content: '', category: 'general' });
      toast.success('Post created!');
    } catch (err) { toast.error('Failed to create post'); }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await api.put(`/forum/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.liked ? [...(p.likes || []), user._id] : (p.likes || []).filter(id => id !== user._id) } : p));
    } catch (err) { console.error(err); }
  };

  const handleReply = async (postId) => {
    if (!replyContent.trim()) return;
    try {
      const { data } = await api.post(`/forum/${postId}/reply`, { content: replyContent });
      setPosts(posts.map(p => p._id === postId ? data.post : p));
      setReplyContent('');
      setReplyingTo(null);
      toast.success('Reply posted!');
    } catch (err) { toast.error('Failed to reply'); }
  };

  const categories = [
    { key: 'all', label: 'All', emoji: '📋' },
    { key: 'general', label: t.community.discussion, emoji: '💬' },
    { key: 'doubt', label: t.community.doubt, emoji: '❓' },
    { key: 'achievement', label: t.community.achievement, emoji: '🏆' },
    { key: 'resource', label: 'Resources', emoji: '📚' },
  ];

  const categoryColors = { general: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400', doubt: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400', achievement: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400', discussion: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400', resource: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400' };

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center">
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t.community.title}</h1>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(true)}
              className="btn-primary flex items-center gap-2 text-sm">
              <HiPlus className="w-4 h-4" /> {t.community.newPost}
            </motion.button>
          </motion.div>

          {/* Category filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
            {categories.map(cat => (
              <button key={cat.key} onClick={() => setFilter(cat.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === cat.key ? 'bg-primary-500 text-white shadow-md' : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-darker border border-gray-200 dark:border-gray-700'
                }`}>
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {posts.map((post, i) => (
              <motion.div key={post._id || i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                    {post.author?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{post.author?.name}</span>
                      <span className={`badge text-xs ${categoryColors[post.category] || 'badge-common'}`}>{post.category}</span>
                      {post.author?.role === 'teacher' && <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs">Teacher</span>}
                    </div>
                    <h3 className="font-heading font-semibold text-gray-900 dark:text-white mt-1">{post.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">{post.content}</p>

                    <div className="flex items-center gap-4 mt-3">
                      <button onClick={() => handleLike(post._id)} className={`flex items-center gap-1 text-sm transition-colors ${post.likes?.includes(user?._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                        <HiHeart className="w-4 h-4" /> {post.likes?.length || 0}
                      </button>
                      <button onClick={() => setReplyingTo(replyingTo === post._id ? null : post._id)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-500 transition-colors">
                        <HiReply className="w-4 h-4" /> {post.replies?.length || 0}
                      </button>
                      <span className="flex items-center gap-1 text-xs text-gray-400"><HiEye className="w-3 h-3" />{post.views}</span>
                    </div>

                    {/* Replies */}
                    {post.replies?.length > 0 && (
                      <div className="mt-4 space-y-2 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                        {post.replies.slice(0, 3).map((reply, ri) => (
                          <div key={ri} className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">
                              {reply.author?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{reply.author?.name}</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply input */}
                    {replyingTo === post._id && (
                      <div className="mt-3 flex gap-2">
                        <input type="text" value={replyContent} onChange={e => setReplyContent(e.target.value)}
                          className="input-field text-sm !py-2" placeholder="Write a reply..." onKeyDown={e => e.key === 'Enter' && handleReply(post._id)} />
                        <button onClick={() => handleReply(post._id)} className="btn-primary !py-2 !px-4 text-sm">{t.community.reply}</button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-surface-dark rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-4">{t.community.newPost}</h2>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div><input type="text" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="input-field" placeholder="Post title..." required /></div>
                <div><textarea value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="input-field h-28 resize-none" placeholder="What's on your mind?" required /></div>
                <div>
                  <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="input-field">
                    <option value="general">General</option>
                    <option value="doubt">Doubt</option>
                    <option value="achievement">Achievement</option>
                    <option value="discussion">Discussion</option>
                    <option value="resource">Resource</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-outline flex-1">{t.common.cancel}</button>
                  <button type="submit" className="btn-primary flex-1">Post</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default CommunityPage;
