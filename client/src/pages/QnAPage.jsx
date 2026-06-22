import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HiMenu, HiQuestionMarkCircle, HiSearch, HiFilter, HiPlus, HiChevronUp, HiCheckCircle, HiEye, HiChatAlt2, HiArrowLeft, HiX } from 'react-icons/hi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const subjectConfig = {
  mathematics:           { icon: '🔢', label: 'Mathematics',           labelHi: 'गणित',         color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
  science:               { icon: '🔬', label: 'Science',               labelHi: 'विज्ञान',       color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
  english:               { icon: '📝', label: 'English',               labelHi: 'अंग्रेज़ी',     color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
  hindi:                 { icon: '🔤', label: 'Hindi',                 labelHi: 'हिन्दी',       color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20' },
  social_studies:        { icon: '🌍', label: 'Social Studies',        labelHi: 'सामाजिक विज्ञान', color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/20' },
  computer_science:      { icon: '💻', label: 'Computer Science',      labelHi: 'कंप्यूटर विज्ञान', color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/20' },
  environmental_studies: { icon: '🌿', label: 'Environmental Studies', labelHi: 'पर्यावरण अध्ययन', color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/20' },
};

const QnAPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subject: '', grade: '', resolved: '' });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', subject: 'mathematics', grade: 1, tags: '' });
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const t = useSelector(selectT);
  const { current: lang } = useSelector((state) => state.language);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) fetchQuestion();
    else fetchQuestions();
  }, [id, filters]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.resolved) params.append('resolved', filters.resolved);
      if (search) params.append('search', search);
      const { data } = await api.get(`/qna?${params.toString()}`);
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/qna/${id}`);
      setQuestion(data.question);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      toast.error(lang === 'hi' ? 'शीर्षक और विवरण आवश्यक है' : 'Title and content are required');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...newQuestion,
        tags: newQuestion.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      await api.post('/qna', payload);
      toast.success(lang === 'hi' ? 'प्रश्न पोस्ट किया गया!' : 'Question posted!');
      setShowAskModal(false);
      setNewQuestion({ title: '', content: '', subject: 'mathematics', grade: 1, tags: '' });
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to post question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = async () => {
    if (!answerText.trim()) return;
    try {
      setSubmitting(true);
      await api.post(`/qna/${id}/answer`, { content: answerText });
      setAnswerText('');
      fetchQuestion();
      toast.success(lang === 'hi' ? 'उत्तर पोस्ट किया गया!' : 'Answer posted!');
    } catch (err) {
      toast.error('Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (answerId) => {
    try {
      await api.put(`/qna/${id}/accept/${answerId}`);
      fetchQuestion();
      toast.success(lang === 'hi' ? 'उत्तर स्वीकार किया!' : 'Answer accepted!');
    } catch (err) {
      toast.error('Failed to accept answer');
    }
  };

  const handleUpvote = async (answerId) => {
    try {
      await api.put(`/qna/${id}/upvote/${answerId}`);
      fetchQuestion();
    } catch (err) {
      toast.error('Failed to upvote');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  // Single question detail view
  if (id) {
    return (
      <PageTransition>
        <Navbar />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center">
            <HiMenu className="w-6 h-6" />
          </button>
          <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <button onClick={() => navigate('/qna')} className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4">
              <HiArrowLeft className="w-4 h-4" /> {lang === 'hi' ? 'सभी प्रश्न' : 'All Questions'}
            </button>

            {loading ? <LoadingSpinner /> : !question ? (
              <div className="text-center py-16">
                <span className="text-6xl block mb-4">🔍</span>
                <p className="text-gray-500 text-lg">Question not found</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* Question */}
                <div className="card p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <span className="flex items-center gap-1 text-sm"><HiEye className="w-4 h-4" />{question.views}</span>
                      <span className="flex items-center gap-1 text-sm"><HiChatAlt2 className="w-4 h-4" />{question.answers?.length || 0}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h1 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{question.title}</h1>
                        {question.isResolved && (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium flex-shrink-0">
                            <HiCheckCircle className="w-4 h-4" /> {lang === 'hi' ? 'हल' : 'Resolved'}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-3 whitespace-pre-line">{question.content}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        {question.subject && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${subjectConfig[question.subject]?.bg} ${subjectConfig[question.subject]?.color}`}>
                            {subjectConfig[question.subject]?.icon} {lang === 'hi' ? subjectConfig[question.subject]?.labelHi : subjectConfig[question.subject]?.label}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{lang === 'hi' ? `कक्षा ${question.grade}` : `Class ${question.grade}`}</span>
                        {question.tags?.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">#{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                        <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                          {question.author?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-600 dark:text-gray-300">{question.author?.name}</span>
                        <span>•</span>
                        <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answers */}
                <div className="mb-6">
                  <h2 className="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {question.answers?.length || 0} {lang === 'hi' ? 'उत्तर' : 'Answers'}
                  </h2>
                  <div className="space-y-4">
                    {question.answers?.sort((a, b) => b.isAccepted - a.isAccepted || b.upvotes?.length - a.upvotes?.length)
                      .map((answer) => (
                      <div key={answer._id} className={`card p-5 ${answer.isAccepted ? 'border-2 border-green-400 dark:border-green-600' : ''}`}>
                        <div className="flex items-start gap-4">
                          {/* Upvote */}
                          <div className="flex flex-col items-center gap-1">
                            <button onClick={() => handleUpvote(answer._id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                answer.upvotes?.includes(user?._id) ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-400 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}>
                              <HiChevronUp className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{answer.upvotes?.length || 0}</span>
                            {answer.isAccepted && <HiCheckCircle className="w-5 h-5 text-green-500" />}
                          </div>

                          <div className="flex-1">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{answer.content}</p>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                                  {answer.author?.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-600 dark:text-gray-300">{answer.author?.name}</span>
                                <span className="capitalize badge bg-gray-100 dark:bg-gray-800 text-gray-500">{answer.author?.role}</span>
                                <span>•</span>
                                <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                              </div>
                              {question.author?._id === user?._id && !question.isResolved && (
                                <button onClick={() => handleAccept(answer._id)}
                                  className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                                  <HiCheckCircle className="w-4 h-4" />
                                  {lang === 'hi' ? 'स्वीकार करें' : 'Accept'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Post Answer */}
                <div className="card p-5">
                  <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {lang === 'hi' ? 'अपना उत्तर दें' : 'Your Answer'}
                  </h3>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    rows={4}
                    className="input-field !rounded-xl resize-none"
                    placeholder={lang === 'hi' ? 'अपना उत्तर यहाँ लिखें...' : 'Write your answer here...'}
                    id="qna-answer-input"
                  />
                  <div className="flex justify-end mt-3">
                    <button onClick={handleAnswer} disabled={submitting || !answerText.trim()} className="btn-primary disabled:opacity-50" id="qna-submit-answer">
                      {submitting ? (lang === 'hi' ? 'पोस्ट हो रहा...' : 'Posting...') : (lang === 'hi' ? 'उत्तर पोस्ट करें' : 'Post Answer')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </PageTransition>
    );
  }

  // Questions list view
  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center" id="sidebar-toggle-qna">
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg">❓</span>
                {lang === 'hi' ? 'प्रश्न और उत्तर' : 'Q & A'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {lang === 'hi' ? 'अपने सवाल पूछें और जवाब पाएं' : 'Ask questions and get answers from peers & teachers'}
              </p>
            </div>
            <button onClick={() => setShowAskModal(true)} className="btn-primary flex items-center gap-2" id="qna-ask-btn">
              <HiPlus className="w-4 h-4" />
              {lang === 'hi' ? 'प्रश्न पूछें' : 'Ask Question'}
            </button>
          </motion.div>

          {/* Search & Filters */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 space-y-3">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder={lang === 'hi' ? 'प्रश्न खोजें...' : 'Search questions...'} value={search} onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-12 !rounded-xl" id="qna-search" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} type="button"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  showFilters ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                <HiFilter className="w-4 h-4" /> {lang === 'hi' ? 'फ़िल्टर' : 'Filters'}
              </button>
            </form>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800">
                    <select value={filters.subject} onChange={(e) => setFilters(f => ({ ...f, subject: e.target.value }))} className="input-field !w-auto !py-2 !rounded-lg text-sm">
                      <option value="">{lang === 'hi' ? 'सभी विषय' : 'All Subjects'}</option>
                      {Object.entries(subjectConfig).map(([key, val]) => (
                        <option key={key} value={key}>{lang === 'hi' ? val.labelHi : val.label}</option>
                      ))}
                    </select>
                    <select value={filters.grade} onChange={(e) => setFilters(f => ({ ...f, grade: e.target.value }))} className="input-field !w-auto !py-2 !rounded-lg text-sm">
                      <option value="">{lang === 'hi' ? 'सभी कक्षाएँ' : 'All Grades'}</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{lang === 'hi' ? `कक्षा ${i + 1}` : `Class ${i + 1}`}</option>
                      ))}
                    </select>
                    <select value={filters.resolved} onChange={(e) => setFilters(f => ({ ...f, resolved: e.target.value }))} className="input-field !w-auto !py-2 !rounded-lg text-sm">
                      <option value="">{lang === 'hi' ? 'सभी' : 'All'}</option>
                      <option value="true">{lang === 'hi' ? 'हल' : 'Resolved'}</option>
                      <option value="false">{lang === 'hi' ? 'अनसुलझा' : 'Unresolved'}</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Ask Question Modal */}
          <AnimatePresence>
            {showAskModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white">{lang === 'hi' ? 'नया प्रश्न पूछें' : 'Ask a Question'}</h2>
                    <button onClick={() => setShowAskModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><HiX className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'hi' ? 'शीर्षक' : 'Title'}</label>
                      <input type="text" value={newQuestion.title} onChange={(e) => setNewQuestion(q => ({ ...q, title: e.target.value }))} className="input-field !rounded-xl" placeholder={lang === 'hi' ? 'अपना प्रश्न लिखें...' : 'What is your question?'} id="qna-new-title" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'hi' ? 'विवरण' : 'Details'}</label>
                      <textarea value={newQuestion.content} onChange={(e) => setNewQuestion(q => ({ ...q, content: e.target.value }))} rows={4} className="input-field !rounded-xl resize-none" placeholder={lang === 'hi' ? 'अपने प्रश्न का विस्तार से वर्णन करें...' : 'Describe your question in detail...'} id="qna-new-content" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'hi' ? 'विषय' : 'Subject'}</label>
                        <select value={newQuestion.subject} onChange={(e) => setNewQuestion(q => ({ ...q, subject: e.target.value }))} className="input-field !rounded-xl" id="qna-new-subject">
                          {Object.entries(subjectConfig).map(([key, val]) => (
                            <option key={key} value={key}>{lang === 'hi' ? val.labelHi : val.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'hi' ? 'कक्षा' : 'Class'}</label>
                        <select value={newQuestion.grade} onChange={(e) => setNewQuestion(q => ({ ...q, grade: parseInt(e.target.value) }))} className="input-field !rounded-xl" id="qna-new-grade">
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{lang === 'hi' ? `कक्षा ${i + 1}` : `Class ${i + 1}`}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'hi' ? 'टैग (अल्पविराम से अलग)' : 'Tags (comma separated)'}</label>
                      <input type="text" value={newQuestion.tags} onChange={(e) => setNewQuestion(q => ({ ...q, tags: e.target.value }))} className="input-field !rounded-xl" placeholder="algebra, equations" id="qna-new-tags" />
                    </div>
                    <button onClick={handleAsk} disabled={submitting} className="btn-primary w-full disabled:opacity-50" id="qna-submit-question">
                      {submitting ? (lang === 'hi' ? 'पोस्ट हो रहा...' : 'Posting...') : (lang === 'hi' ? 'प्रश्न पोस्ट करें' : 'Post Question')}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Questions List */}
          {loading ? <LoadingSpinner /> : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {questions.map((q) => {
                const sc = subjectConfig[q.subject] || {};
                return (
                  <motion.div key={q._id} variants={item} whileHover={{ x: 3 }}
                    onClick={() => navigate(`/qna/${q._id}`)}
                    className="card p-5 cursor-pointer group">
                    <div className="flex items-start gap-4">
                      {/* Stats */}
                      <div className="hidden sm:flex flex-col items-center gap-2 text-center min-w-[60px]">
                        <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${q.answers?.length > 0 ? (q.isResolved ? 'bg-green-100 dark:bg-green-900/20 text-green-700' : 'bg-primary-100 dark:bg-primary-900/20 text-primary-700') : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                          {q.answers?.length || 0}
                          <div className="text-xs font-normal">{lang === 'hi' ? 'उत्तर' : 'ans'}</div>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <HiEye className="w-3 h-3" /> {q.views}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <h3 className="font-heading font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                            {q.title}
                          </h3>
                          {q.isResolved && <HiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">{q.content}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {q.subject && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${sc.bg} ${sc.color}`}>
                              {sc.icon} {lang === 'hi' ? sc.labelHi : sc.label}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{lang === 'hi' ? `कक्षा ${q.grade}` : `Class ${q.grade}`}</span>
                          {q.tags?.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">#{tag}</span>
                          ))}
                          <span className="text-xs text-gray-400 ml-auto">{q.author?.name} • {new Date(q.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {!loading && questions.length === 0 && (
            <div className="card text-center py-16">
              <span className="text-5xl block mb-4">💬</span>
              <p className="text-gray-500 dark:text-gray-400 text-lg">{lang === 'hi' ? 'अभी कोई प्रश्न नहीं' : 'No questions yet'}</p>
              <p className="text-sm text-gray-400 mt-2">{lang === 'hi' ? 'पहला प्रश्न पूछें!' : 'Be the first to ask a question!'}</p>
              <button onClick={() => setShowAskModal(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
                <HiPlus className="w-4 h-4" /> {lang === 'hi' ? 'प्रश्न पूछें' : 'Ask Question'}
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default QnAPage;
