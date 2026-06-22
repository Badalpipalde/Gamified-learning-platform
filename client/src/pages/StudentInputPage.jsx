import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HiMenu, HiPencilAlt, HiStar, HiLightBulb, HiPlus, HiX, HiTrash, HiReply, HiCheckCircle, HiClock } from 'react-icons/hi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const typeConfig = {
  note: { icon: '📝', label: 'Notes', labelHi: 'नोट्स', gradient: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50 dark:bg-blue-900/10', color: 'text-blue-600 dark:text-blue-400', iconComponent: HiPencilAlt },
  feedback: { icon: '⭐', label: 'Feedback', labelHi: 'प्रतिक्रिया', gradient: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-50 dark:bg-yellow-900/10', color: 'text-yellow-600 dark:text-yellow-400', iconComponent: HiStar },
  suggestion: { icon: '💡', label: 'Suggestions', labelHi: 'सुझाव', gradient: 'from-purple-400 to-violet-500', bg: 'bg-purple-50 dark:bg-purple-900/10', color: 'text-purple-600 dark:text-purple-400', iconComponent: HiLightBulb },
};

const statusColors = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
  reviewed: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  archived: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
};

const subjectOptions = [
  { value: 'mathematics', label: 'Mathematics', labelHi: 'गणित' },
  { value: 'science', label: 'Science', labelHi: 'विज्ञान' },
  { value: 'english', label: 'English', labelHi: 'अंग्रेज़ी' },
  { value: 'hindi', label: 'Hindi', labelHi: 'हिन्दी' },
  { value: 'social_studies', label: 'Social Studies', labelHi: 'सामाजिक विज्ञान' },
  { value: 'computer_science', label: 'Computer Science', labelHi: 'कंप्यूटर विज्ञान' },
  { value: 'environmental_studies', label: 'Environmental Studies', labelHi: 'पर्यावरण अध्ययन' },
];

const StudentInputPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('note');
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newInput, setNewInput] = useState({ title: '', content: '', type: 'note', subject: 'mathematics', grade: 1, rating: 5 });
  const t = useSelector(selectT);
  const { current: lang } = useSelector((state) => state.language);

  useEffect(() => {
    fetchInputs();
  }, [activeTab]);

  const fetchInputs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/student-inputs/mine?type=${activeTab}`);
      setInputs(data.inputs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newInput.title.trim() || !newInput.content.trim()) {
      toast.error(lang === 'hi' ? 'शीर्षक और सामग्री आवश्यक है' : 'Title and content are required');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/student-inputs', { ...newInput, type: activeTab });
      toast.success(lang === 'hi' ? 'सफलतापूर्वक जोड़ा गया!' : 'Successfully added!');
      setShowCreateModal(false);
      setNewInput({ title: '', content: '', type: 'note', subject: 'mathematics', grade: 1, rating: 5 });
      fetchInputs();
    } catch (err) {
      toast.error('Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(lang === 'hi' ? 'क्या आप वाकई हटाना चाहते हैं?' : 'Are you sure you want to delete?')) return;
    try {
      await api.delete(`/student-inputs/${id}`);
      toast.success(lang === 'hi' ? 'हटा दिया गया' : 'Deleted');
      fetchInputs();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const tabs = Object.entries(typeConfig).map(([key, val]) => ({
    key,
    label: lang === 'hi' ? val.labelHi : val.label,
    icon: val.iconComponent,
    gradient: val.gradient,
  }));

  const currentConfig = typeConfig[activeTab];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center" id="sidebar-toggle-inputs">
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentConfig.gradient} flex items-center justify-center text-white text-lg`}>
                  {currentConfig.icon}
                </span>
                {lang === 'hi' ? 'मेरा इनपुट' : 'My Input'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {lang === 'hi' ? 'अपने नोट्स, प्रतिक्रिया और सुझाव प्रबंधित करें' : 'Manage your notes, feedback & suggestions'}
              </p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2" id="input-create-btn">
              <HiPlus className="w-4 h-4" />
              {lang === 'hi' ? 'नया जोड़ें' : 'Add New'}
            </button>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white dark:bg-surface-dark rounded-xl p-1.5 border border-gray-200 dark:border-gray-800">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md` : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-darker'
                }`}>
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Create Modal */}
          <AnimatePresence>
            {showCreateModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {currentConfig.icon} {lang === 'hi' ? `नया ${currentConfig.labelHi}` : `New ${currentConfig.label.slice(0, -1)}`}
                    </h2>
                    <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><HiX className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'hi' ? 'शीर्षक' : 'Title'}</label>
                      <input type="text" value={newInput.title} onChange={(e) => setNewInput(inp => ({ ...inp, title: e.target.value }))}
                        className="input-field !rounded-xl" placeholder={
                          activeTab === 'note' ? (lang === 'hi' ? 'नोट शीर्षक...' : 'Note title...') :
                          activeTab === 'feedback' ? (lang === 'hi' ? 'प्रतिक्रिया शीर्षक...' : 'Feedback title...') :
                          (lang === 'hi' ? 'सुझाव शीर्षक...' : 'Suggestion title...')
                        } id="input-new-title" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'hi' ? 'सामग्री' : 'Content'}</label>
                      <textarea value={newInput.content} onChange={(e) => setNewInput(inp => ({ ...inp, content: e.target.value }))}
                        rows={5} className="input-field !rounded-xl resize-none" placeholder={lang === 'hi' ? 'विस्तार से लिखें...' : 'Write in detail...'} id="input-new-content" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'hi' ? 'विषय' : 'Subject'}</label>
                        <select value={newInput.subject} onChange={(e) => setNewInput(inp => ({ ...inp, subject: e.target.value }))} className="input-field !rounded-xl" id="input-new-subject">
                          {subjectOptions.map(s => (
                            <option key={s.value} value={s.value}>{lang === 'hi' ? s.labelHi : s.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'hi' ? 'कक्षा' : 'Class'}</label>
                        <select value={newInput.grade} onChange={(e) => setNewInput(inp => ({ ...inp, grade: parseInt(e.target.value) }))} className="input-field !rounded-xl" id="input-new-grade">
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{lang === 'hi' ? `कक्षा ${i + 1}` : `Class ${i + 1}`}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Rating for feedback */}
                    {activeTab === 'feedback' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{lang === 'hi' ? 'रेटिंग' : 'Rating'}</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setNewInput(inp => ({ ...inp, rating: star }))}
                              className={`text-3xl transition-transform hover:scale-110 ${star <= newInput.rating ? 'opacity-100' : 'opacity-30'}`}>
                              ⭐
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={handleCreate} disabled={submitting} className={`w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r ${currentConfig.gradient} hover:shadow-lg transition-shadow disabled:opacity-50`} id="input-submit">
                      {submitting ? (lang === 'hi' ? 'जोड़ा जा रहा...' : 'Adding...') : (lang === 'hi' ? 'जोड़ें' : 'Add')}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content List */}
          {loading ? <LoadingSpinner /> : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
              {inputs.map((inp) => (
                <motion.div key={inp._id} variants={item} whileHover={{ x: 3 }}>
                  <div className="card p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${currentConfig.bg} flex items-center justify-center text-xl flex-shrink-0`}>
                        {currentConfig.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-heading font-semibold text-gray-900 dark:text-white">{inp.title}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`badge ${statusColors[inp.status]} capitalize text-xs`}>
                              {inp.status === 'pending' && <HiClock className="w-3 h-3 mr-0.5" />}
                              {inp.status === 'reviewed' && <HiCheckCircle className="w-3 h-3 mr-0.5" />}
                              {inp.status}
                            </span>
                            <button onClick={() => handleDelete(inp._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line line-clamp-3">{inp.content}</p>

                        {/* Rating display for feedback */}
                        {activeTab === 'feedback' && inp.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} className={`text-sm ${i < inp.rating ? 'opacity-100' : 'opacity-20'}`}>⭐</span>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                          {inp.subject && <span className="capitalize">{inp.subject.replace('_', ' ')}</span>}
                          {inp.grade && <span>{lang === 'hi' ? `कक्षा ${inp.grade}` : `Class ${inp.grade}`}</span>}
                          {inp.lesson && <span className="text-primary-500">{inp.lesson.title}</span>}
                          <span>{new Date(inp.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Teacher Reply */}
                        {inp.teacherReply?.content && (
                          <div className="mt-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800">
                            <div className="flex items-center gap-2 mb-2">
                              <HiReply className="w-4 h-4 text-primary-600" />
                              <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                                {lang === 'hi' ? 'शिक्षक का जवाब' : 'Teacher Reply'}
                              </span>
                              {inp.teacherReply.teacher?.name && <span className="text-xs text-gray-400">— {inp.teacherReply.teacher.name}</span>}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{inp.teacherReply.content}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && inputs.length === 0 && (
            <div className="card text-center py-16">
              <span className="text-5xl block mb-4">{currentConfig.icon}</span>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {lang === 'hi' ? `अभी कोई ${currentConfig.labelHi} नहीं` : `No ${currentConfig.label.toLowerCase()} yet`}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {activeTab === 'note' ? (lang === 'hi' ? 'अपना पहला नोट बनाएं' : 'Create your first note') :
                 activeTab === 'feedback' ? (lang === 'hi' ? 'किसी पाठ पर प्रतिक्रिया दें' : 'Give feedback on a lesson') :
                 (lang === 'hi' ? 'एक सुझाव भेजें' : 'Send a suggestion')}
              </p>
              <button onClick={() => setShowCreateModal(true)} className={`mt-4 px-6 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r ${currentConfig.gradient} inline-flex items-center gap-2 hover:shadow-lg transition-shadow`}>
                <HiPlus className="w-4 h-4" /> {lang === 'hi' ? 'नया जोड़ें' : 'Add New'}
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default StudentInputPage;
