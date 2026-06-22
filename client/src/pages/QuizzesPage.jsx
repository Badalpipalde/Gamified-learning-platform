import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HiMenu, HiPuzzle, HiClock, HiStar, HiSearch, HiFilter, HiChevronRight, HiCheckCircle, HiX } from 'react-icons/hi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const subjectOptions = [
  { value: '', label: 'All Subjects', labelHi: 'सभी विषय' },
  { value: 'mathematics', label: 'Mathematics', labelHi: 'गणित' },
  { value: 'science', label: 'Science', labelHi: 'विज्ञान' },
  { value: 'english', label: 'English', labelHi: 'अंग्रेज़ी' },
  { value: 'hindi', label: 'Hindi', labelHi: 'हिन्दी' },
  { value: 'social_studies', label: 'Social Studies', labelHi: 'सामाजिक विज्ञान' },
  { value: 'computer_science', label: 'Computer Science', labelHi: 'कंप्यूटर विज्ञान' },
  { value: 'environmental_studies', label: 'Environmental Studies', labelHi: 'पर्यावरण अध्ययन' },
];

const difficultyColors = {
  beginner: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  intermediate: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
  advanced: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
};

const subjectIcons = { mathematics: '🔢', science: '🔬', english: '📝', hindi: '🔤', social_studies: '🌍', computer_science: '💻', environmental_studies: '🌿' };

const QuizzesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [filters, setFilters] = useState({ subject: '', grade: '', difficulty: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');

  // Quiz taking state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [fillAnswer, setFillAnswer] = useState('');

  const t = useSelector(selectT);
  const { current: lang } = useSelector((state) => state.language);

  useEffect(() => {
    fetchQuizzes();
  }, [filters]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      // Note: The quiz API may not directly support subject/grade filter — we fetch via lessons
      const { data } = await api.get(`/quizzes?${params.toString()}`);
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quizId) => {
    try {
      const { data } = await api.get(`/quizzes/${quizId}`);
      setQuizData(data.quiz);
      setActiveQuiz(quizId);
      setCurrentQuestion(0);
      setAnswers([]);
      setQuizResult(null);
      setFillAnswer('');
    } catch (err) {
      toast.error('Failed to load quiz');
    }
  };

  const handleAnswer = (questionIndex, selectedOption) => {
    const existing = answers.filter(a => a.questionIndex !== questionIndex);
    setAnswers([...existing, { questionIndex, selectedOption }]);
  };

  const submitQuiz = async () => {
    try {
      const { data } = await api.post(`/quizzes/${activeQuiz}/submit`, { answers });
      setQuizResult(data);
      if (data.passed) toast.success(`🎉 ${t.learning.passed} +${data.xpEarned} XP`);
      else toast.error(t.learning.failed);
    } catch (err) {
      toast.error('Quiz submission failed');
    }
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setQuizData(null);
    setQuizResult(null);
    setAnswers([]);
    setCurrentQuestion(0);
  };

  const filteredQuizzes = quizzes.filter(q =>
    !search || q.title?.toLowerCase().includes(search.toLowerCase()) || q.description?.toLowerCase().includes(search.toLowerCase())
  );

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center" id="sidebar-toggle-quizzes">
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-lg">🧠</span>
              {t.nav.quizzes}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {lang === 'hi' ? 'अपना ज्ञान परखें और XP अर्जित करें' : 'Test your knowledge and earn XP rewards'}
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 space-y-3">
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-md">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder={lang === 'hi' ? 'प्रश्नोत्तरी खोजें...' : 'Search quizzes...'} value={search} onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-12 !rounded-xl" id="quiz-search" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  showFilters ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                }`} id="quiz-filter-toggle">
                <HiFilter className="w-4 h-4" />
                {lang === 'hi' ? 'फ़िल्टर' : 'Filters'}
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800">
                    <select value={filters.difficulty} onChange={(e) => setFilters(f => ({ ...f, difficulty: e.target.value }))}
                      className="input-field !w-auto !py-2 !rounded-lg text-sm" id="quiz-difficulty-filter">
                      <option value="">{lang === 'hi' ? 'सभी स्तर' : 'All Levels'}</option>
                      <option value="beginner">{lang === 'hi' ? 'शुरुआती' : 'Beginner'}</option>
                      <option value="intermediate">{lang === 'hi' ? 'मध्यम' : 'Intermediate'}</option>
                      <option value="advanced">{lang === 'hi' ? 'उन्नत' : 'Advanced'}</option>
                    </select>
                    <select value={filters.grade} onChange={(e) => setFilters(f => ({ ...f, grade: e.target.value }))}
                      className="input-field !w-auto !py-2 !rounded-lg text-sm" id="quiz-grade-filter">
                      <option value="">{lang === 'hi' ? 'सभी कक्षाएँ' : 'All Grades'}</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{lang === 'hi' ? `कक्षा ${i + 1}` : `Class ${i + 1}`}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Quiz Modal */}
          <AnimatePresence>
            {activeQuiz && quizData && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">

                  {quizResult ? (
                    /* Quiz Result */
                    <div className="text-center py-4">
                      <button onClick={closeQuiz} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <HiX className="w-5 h-5" />
                      </button>
                      <div className="text-6xl mb-4">{quizResult.passed ? '🎉' : '💪'}</div>
                      <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-2">{quizResult.passed ? t.learning.passed : t.learning.failed}</h3>
                      <p className="text-4xl font-bold text-gradient mb-4">{quizResult.percentage}%</p>
                      <div className="flex justify-center gap-6 mb-6">
                        <div className="text-center"><p className="text-2xl font-bold text-xp-gold">{quizResult.xpEarned}</p><p className="text-sm text-gray-500">{t.learning.xpEarned}</p></div>
                        <div className="text-center"><p className="text-2xl font-bold text-accent-400">{quizResult.coinsEarned}</p><p className="text-sm text-gray-500">{t.learning.coinsEarned}</p></div>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <button onClick={() => { setQuizResult(null); setCurrentQuestion(0); setAnswers([]); }} className="btn-outline">{lang === 'hi' ? 'पुनः प्रयास' : 'Try Again'}</button>
                        <button onClick={closeQuiz} className="btn-primary">{lang === 'hi' ? 'बंद करें' : 'Close'}</button>
                      </div>
                    </div>
                  ) : (
                    /* Quiz Questions */
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-white">{lang === 'hi' && quizData.titleHi ? quizData.titleHi : quizData.title}</h2>
                        <button onClick={closeQuiz} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><HiX className="w-5 h-5" /></button>
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-500">{lang === 'hi' ? 'प्रश्न' : 'Question'} {currentQuestion + 1} / {quizData.questions?.length}</span>
                        <span className="badge bg-xp-gold/10 text-xp-gold">{quizData.questions?.[currentQuestion]?.points} pts</span>
                      </div>

                      <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mb-6">
                        <div className="h-full rounded-full bg-gradient-primary transition-all" style={{ width: `${((currentQuestion + 1) / (quizData.questions?.length || 1)) * 100}%` }} />
                      </div>

                      <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        {lang === 'hi' && quizData.questions?.[currentQuestion]?.questionHi ? quizData.questions[currentQuestion].questionHi : quizData.questions?.[currentQuestion]?.question}
                      </h3>

                      {quizData.questions?.[currentQuestion]?.type === 'fill_blank' ? (
                        <input type="text" value={fillAnswer} onChange={(e) => { setFillAnswer(e.target.value); handleAnswer(currentQuestion, { answer: e.target.value }); }}
                          className="input-field text-lg" placeholder={lang === 'hi' ? 'अपना उत्तर टाइप करें...' : 'Type your answer...'} />
                      ) : (
                        <div className="space-y-3">
                          {quizData.questions?.[currentQuestion]?.options?.map((opt, oi) => (
                            <button key={oi} onClick={() => handleAnswer(currentQuestion, oi)}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                answers.find(a => a.questionIndex === currentQuestion)?.selectedOption === oi
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}>
                              <span className="text-gray-900 dark:text-white">{lang === 'hi' && opt.textHi ? opt.textHi : opt.text}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between mt-8">
                        <button disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(c => c - 1)}
                          className="btn-outline !py-2 disabled:opacity-40">{t.common.back}</button>
                        {currentQuestion < (quizData.questions?.length || 1) - 1 ? (
                          <button onClick={() => setCurrentQuestion(c => c + 1)} className="btn-primary !py-2 flex items-center gap-1">{lang === 'hi' ? 'अगला' : 'Next'} <HiChevronRight /></button>
                        ) : (
                          <button onClick={submitQuiz} className="btn-primary !py-2">{t.learning.submit}</button>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quiz Grid */}
          {loading ? <LoadingSpinner /> : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuizzes.map((quiz, i) => (
                <motion.div key={quiz._id} variants={item} whileHover={{ y: -3 }}>
                  <div className="card p-5 h-full flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-2xl flex-shrink-0">
                        {subjectIcons[quiz.lesson?.subject] || '🧠'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold text-gray-900 dark:text-white truncate">
                          {lang === 'hi' && quiz.titleHi ? quiz.titleHi : quiz.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                          {quiz.lesson?.subject?.replace('_', ' ') || 'General'}
                        </p>
                      </div>
                    </div>

                    {quiz.description && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{quiz.description}</p>}

                    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                      <span className={`badge ${difficultyColors[quiz.difficulty] || difficultyColors.beginner} capitalize`}>{quiz.difficulty}</span>
                      <span className="text-gray-400 flex items-center gap-1"><HiClock className="w-3 h-3" />{quiz.timeLimit} min</span>
                      <span className="text-gray-400">{quiz.questions?.length || 0} Q</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-xp-gold font-semibold"><HiStar className="w-3.5 h-3.5" />+{quiz.xpReward} XP</span>
                        <span className="text-accent-400 font-semibold">+{quiz.coinReward} 🪙</span>
                      </div>
                      <button onClick={() => startQuiz(quiz._id)}
                        className="px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:shadow-glow-green transition-shadow" id={`start-quiz-${quiz._id}`}>
                        {lang === 'hi' ? 'शुरू करें' : 'Start'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && filteredQuizzes.length === 0 && (
            <div className="card text-center py-16">
              <span className="text-5xl block mb-4">🧩</span>
              <p className="text-gray-500 dark:text-gray-400 text-lg">{lang === 'hi' ? 'कोई प्रश्नोत्तरी नहीं मिली' : 'No quizzes found'}</p>
              <p className="text-sm text-gray-400 mt-2">{lang === 'hi' ? 'फ़िल्टर बदलकर देखें' : 'Try changing the filters'}</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default QuizzesPage;
