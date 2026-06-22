import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HiPlay, HiPuzzle, HiPencilAlt, HiCheckCircle, HiStar, HiClock, HiArrowLeft, HiMenu, HiChevronRight } from 'react-icons/hi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const LearningModule = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [activeTab, setActiveTab] = useState('video');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const t = useSelector(selectT);
  const { current: lang } = useSelector((state) => state.language);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (id) {
          const { data } = await api.get(`/lessons/${id}`);
          setLesson(data.lesson);
        } else {
          const { data } = await api.get('/lessons');
          setLessons(data.lessons || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAnswer = (questionIndex, selectedOption) => {
    const existing = answers.filter(a => a.questionIndex !== questionIndex);
    setAnswers([...existing, { questionIndex, selectedOption }]);
  };

  const submitQuiz = async () => {
    if (!lesson?.quizzes?.[0]) return;
    try {
      const { data } = await api.post(`/quizzes/${lesson.quizzes[0]._id}/submit`, { answers });
      setQuizResult(data);
      if (data.passed) toast.success(`🎉 ${t.learning.passed} +${data.xpEarned} XP`);
      else toast.error(t.learning.failed);
    } catch (err) {
      toast.error('Quiz submission failed');
    }
  };

  const subjectIcons = { mathematics: '🔢', science: '🔬', english: '📝', hindi: '🔤', social_studies: '🌍', computer_science: '💻', environmental_studies: '🌿' };
  const subjectColors = { mathematics: 'bg-blue-100 dark:bg-blue-900/20', science: 'bg-green-100 dark:bg-green-900/20', english: 'bg-purple-100 dark:bg-purple-900/20', hindi: 'bg-orange-100 dark:bg-orange-900/20', social_studies: 'bg-pink-100 dark:bg-pink-900/20', computer_science: 'bg-cyan-100 dark:bg-cyan-900/20', environmental_studies: 'bg-teal-100 dark:bg-teal-900/20' };

  // Lesson list view
  if (!id) {
    return (
      <PageTransition>
        <Navbar />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center" id="sidebar-toggle-learn">
            <HiMenu className="w-6 h-6" />
          </button>
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">{t.nav.lessons}</h1>
            {loading ? <LoadingSpinner /> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.map((l, i) => (
                  <motion.div key={l._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}>
                    <Link to={`/learn/${l._id}`} className="card block p-5 h-full group">
                      <div className={`w-14 h-14 rounded-2xl ${subjectColors[l.subject] || 'bg-gray-100'} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                        {subjectIcons[l.subject] || '📖'}
                      </div>
                      <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-1">{lang === 'hi' && l.titleHi ? l.titleHi : l.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{lang === 'hi' && l.descriptionHi ? l.descriptionHi : l.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="capitalize">{l.subject?.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Grade {l.grade}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><HiClock className="w-3 h-3" />{l.duration}min</span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 capitalize">{l.difficulty}</span>
                        <span className="text-xs text-xp-gold font-semibold flex items-center gap-1"><HiStar className="w-3 h-3" />+{l.xpReward} XP</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    );
  }

  // Single lesson view
  if (loading) return <><Navbar /><div className="pt-20"><LoadingSpinner text="Loading lesson..." /></div></>;
  if (!lesson) return <><Navbar /><div className="pt-20 text-center text-gray-500">Lesson not found</div></>;

  const quiz = lesson.quizzes?.[0];
  const tabs = [
    { key: 'video', icon: HiPlay, label: t.learning.watchVideo },
    { key: 'quiz', icon: HiPuzzle, label: t.learning.takeQuiz },
    { key: 'exercise', icon: HiPencilAlt, label: t.learning.exercises },
  ];

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center">
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Back link */}
          <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4">
            <HiArrowLeft className="w-4 h-4" /> {t.common.back}
          </Link>

          {/* Lesson header */}
          <div className="card mb-6">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl ${subjectColors[lesson.subject] || 'bg-gray-100'} flex items-center justify-center text-3xl flex-shrink-0`}>
                {subjectIcons[lesson.subject] || '📖'}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">{lang === 'hi' && lesson.titleHi ? lesson.titleHi : lesson.title}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{lang === 'hi' && lesson.descriptionHi ? lesson.descriptionHi : lesson.description}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                  <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 capitalize">{lesson.difficulty}</span>
                  <span className="flex items-center gap-1"><HiClock className="w-4 h-4" />{lesson.duration} min</span>
                  <span className="flex items-center gap-1 text-xp-gold"><HiStar className="w-4 h-4" />+{lesson.xpReward} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white dark:bg-surface-dark rounded-xl p-1.5 border border-gray-200 dark:border-gray-800">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key ? 'bg-gradient-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-darker'
                }`}>
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === 'video' && (
              <motion.div key="video" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="card overflow-hidden">
                  <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center mb-6">
                    {lesson.videoUrl ? (
                      <iframe src={lesson.videoUrl} className="w-full h-full rounded-xl" allowFullScreen title={lesson.title} />
                    ) : (
                      <div className="text-center text-gray-400">
                        <HiPlay className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p>Video content coming soon</p>
                      </div>
                    )}
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-3">Lesson Content</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                      {lang === 'hi' && lesson.contentHi ? lesson.contentHi : lesson.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {!quiz ? (
                  <div className="card text-center py-12"><HiPuzzle className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No quiz available for this lesson</p></div>
                ) : quizResult ? (
                  <div className="card text-center py-8">
                    <div className="text-6xl mb-4">{quizResult.passed ? '🎉' : '💪'}</div>
                    <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-2">{quizResult.passed ? t.learning.passed : t.learning.failed}</h3>
                    <p className="text-4xl font-bold text-gradient mb-4">{quizResult.percentage}%</p>
                    <div className="flex justify-center gap-6">
                      <div className="text-center"><p className="text-2xl font-bold text-xp-gold">{quizResult.xpEarned}</p><p className="text-sm text-gray-500">{t.learning.xpEarned}</p></div>
                      <div className="text-center"><p className="text-2xl font-bold text-accent-400">{quizResult.coinsEarned}</p><p className="text-sm text-gray-500">{t.learning.coinsEarned}</p></div>
                    </div>
                    <button onClick={() => { setQuizResult(null); setQuizStarted(false); setCurrentQuestion(0); setAnswers([]); }} className="btn-primary mt-6">Try Again</button>
                  </div>
                ) : !quizStarted ? (
                  <div className="card text-center py-8">
                    <div className="text-5xl mb-4">🧠</div>
                    <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-2">{lang === 'hi' && quiz.titleHi ? quiz.titleHi : quiz.title}</h3>
                    <p className="text-gray-500 mb-4">{quiz.questions?.length} questions • {quiz.timeLimit} min</p>
                    <button onClick={() => setQuizStarted(true)} className="btn-primary">Start Quiz</button>
                  </div>
                ) : (
                  <div className="card">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-sm text-gray-500">Question {currentQuestion + 1} / {quiz.questions.length}</span>
                      <span className="badge bg-xp-gold/10 text-xp-gold">{quiz.questions[currentQuestion]?.points} pts</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mb-6"><div className="h-full rounded-full bg-gradient-primary transition-all" style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }} /></div>

                    <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-6">
                      {lang === 'hi' && quiz.questions[currentQuestion]?.questionHi ? quiz.questions[currentQuestion].questionHi : quiz.questions[currentQuestion]?.question}
                    </h3>

                    {quiz.questions[currentQuestion]?.type === 'fill_blank' ? (
                      <input type="text" value={fillAnswer} onChange={(e) => { setFillAnswer(e.target.value); handleAnswer(currentQuestion, { answer: e.target.value }); }}
                        className="input-field text-lg" placeholder="Type your answer..." />
                    ) : (
                      <div className="space-y-3">
                        {quiz.questions[currentQuestion]?.options?.map((opt, oi) => (
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
                      {currentQuestion < quiz.questions.length - 1 ? (
                        <button onClick={() => setCurrentQuestion(c => c + 1)} className="btn-primary !py-2 flex items-center gap-1">Next <HiChevronRight /></button>
                      ) : (
                        <button onClick={submitQuiz} className="btn-primary !py-2">{t.learning.submit}</button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'exercise' && (
              <motion.div key="exercise" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="card text-center py-12">
                  <div className="text-5xl mb-4">✏️</div>
                  <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-2">{t.learning.exercises}</h3>
                  <p className="text-gray-500 mb-6">Interactive exercises for this lesson will appear here.</p>
                  <div className="max-w-md mx-auto space-y-4">
                    {['Fill in the blank: 2 + 3 = __', 'Match the pairs: Cat → Animal', 'True or False: The Sun rises in the West'].map((ex, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-surface-darker text-left">
                        <HiCheckCircle className={`w-6 h-6 flex-shrink-0 ${i === 0 ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default LearningModule;
