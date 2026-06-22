import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import { HiMenu, HiBookOpen, HiUsers, HiChartBar, HiTrendingUp, HiPlus, HiPencil, HiTrash, HiEye } from 'react-icons/hi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', description: '', subject: 'mathematics', grade: 3, difficulty: 'beginner', duration: 15, xpReward: 50, coinReward: 10, content: '', isPublished: true });
  const { user } = useSelector((state) => state.auth);
  const t = useSelector(selectT);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const { data } = await api.get('/lessons');
        setLessons(data.lessons || []);
      } catch (err) { console.error(err); }
    };
    fetchLessons();
  }, []);

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/lessons', newLesson);
      setLessons([data.lesson, ...lessons]);
      setShowCreateModal(false);
      setNewLesson({ title: '', description: '', subject: 'mathematics', grade: 3, difficulty: 'beginner', duration: 15, xpReward: 50, coinReward: 10, content: '', isPublished: true });
      toast.success('Lesson created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lesson');
    }
  };

  const stats = [
    { icon: HiBookOpen, label: t.teacher.totalLessons, value: lessons.length, color: 'from-green-400 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/10' },
    { icon: HiUsers, label: t.teacher.totalStudents, value: 45, color: 'from-blue-400 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
    { icon: HiChartBar, label: t.teacher.avgScore, value: '78%', color: 'from-purple-400 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
    { icon: HiTrendingUp, label: t.teacher.activeToday, value: 12, color: 'from-orange-400 to-red-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
  ];

  const subjectIcons = { mathematics: '🔢', science: '🔬', english: '📝', hindi: '🔤', social_studies: '🌍', computer_science: '💻', environmental_studies: '🌿' };

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center">
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t.teacher.dashboard}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{t.dashboard.welcome}, {user?.name}!</p>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2" id="create-lesson-btn">
              <HiPlus className="w-5 h-5" /> {t.teacher.uploadLesson}
            </motion.button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="card flex flex-col items-center text-center p-5">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="font-heading text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Lessons table */}
          <div className="card overflow-hidden">
            <h2 className="font-heading text-xl font-semibold text-gray-900 dark:text-white mb-4">My Lessons</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Lesson</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Subject</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Grade</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Students</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson, i) => (
                    <tr key={lesson._id || i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-surface-darker transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{subjectIcons[lesson.subject] || '📖'}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{lesson.title}</p>
                            <p className="text-xs text-gray-400">{lesson.duration} min • {lesson.xpReward} XP</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 hidden sm:table-cell"><span className="badge badge-common capitalize">{lesson.subject?.replace('_', ' ')}</span></td>
                      <td className="py-3 hidden md:table-cell text-sm text-gray-600 dark:text-gray-400">{lesson.grade}</td>
                      <td className="py-3 hidden md:table-cell text-sm text-gray-600 dark:text-gray-400">{lesson.completedBy?.length || 0}</td>
                      <td className="py-3"><span className={`badge ${lesson.isPublished ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'badge-common'}`}>{lesson.isPublished ? 'Published' : 'Draft'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Lesson Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-surface-dark rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-4">{t.teacher.uploadLesson}</h2>
              <form onSubmit={handleCreateLesson} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label><input type="text" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea value={newLesson.description} onChange={e => setNewLesson({...newLesson, description: e.target.value})} className="input-field h-20 resize-none" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                    <select value={newLesson.subject} onChange={e => setNewLesson({...newLesson, subject: e.target.value})} className="input-field">
                      {['mathematics','science','english','hindi','social_studies','computer_science','environmental_studies'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade</label><input type="number" min="1" max="12" value={newLesson.grade} onChange={e => setNewLesson({...newLesson, grade: parseInt(e.target.value)})} className="input-field" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label><textarea value={newLesson.content} onChange={e => setNewLesson({...newLesson, content: e.target.value})} className="input-field h-24 resize-none" /></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn-outline flex-1">{t.common.cancel}</button>
                  <button type="submit" className="btn-primary flex-1">{t.common.save}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default TeacherDashboard;
