import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HiMenu, HiArrowLeft, HiPlay, HiPuzzle, HiStar, HiClock, HiCheckCircle, HiChevronRight, HiAcademicCap, HiBookOpen } from 'react-icons/hi';
import api from '../utils/api';
import { getChapters, hasNCERTData } from '../data/ncertData';

const subjectLabels = {
  mathematics: { label: 'Mathematics', labelHi: 'गणित', icon: '🔢', gradient: 'from-blue-400 to-indigo-500' },
  science: { label: 'Science', labelHi: 'विज्ञान', icon: '🔬', gradient: 'from-green-400 to-emerald-500' },
  english: { label: 'English', labelHi: 'अंग्रेज़ी', icon: '📝', gradient: 'from-purple-400 to-violet-500' },
  hindi: { label: 'Hindi', labelHi: 'हिन्दी', icon: '🔤', gradient: 'from-orange-400 to-amber-500' },
  social_studies: { label: 'Social Studies', labelHi: 'सामाजिक विज्ञान', icon: '🌍', gradient: 'from-pink-400 to-rose-500' },
  computer_science: { label: 'Computer Science', labelHi: 'कंप्यूटर विज्ञान', icon: '💻', gradient: 'from-cyan-400 to-sky-500' },
  environmental_studies: { label: 'Environmental Studies', labelHi: 'पर्यावरण अध्ययन', icon: '🌿', gradient: 'from-teal-400 to-green-500' },
};

const ModuleSubjectPage = () => {
  const { grade, subject } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons');
  const t = useSelector(selectT);
  const { current: lang } = useSelector((state) => state.language);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: res } = await api.get(`/modules/${grade}/${subject}`);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [grade, subject]);

  const config = subjectLabels[subject] || { label: subject, labelHi: subject, icon: '📖', gradient: 'from-gray-400 to-gray-500' };
  const ncertChapters = getChapters(grade, subject);
  const showNCERT = hasNCERTData(grade, subject);
  const tabs = [
    { key: 'lessons', label: lang === 'hi' ? 'पाठ' : 'Lessons', icon: HiPlay },
    { key: 'quizzes', label: lang === 'hi' ? 'प्रश्नोत्तरी' : 'Quizzes', icon: HiPuzzle },
    ...(showNCERT ? [{ key: 'ncert', label: lang === 'hi' ? 'NCERT अध्याय' : 'NCERT Chapters', icon: HiAcademicCap }] : []),
  ];

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center" id="sidebar-toggle-module-subject">
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4 flex-wrap">
            <Link to="/modules" className="hover:text-primary-600 dark:hover:text-primary-400">{lang === 'hi' ? 'कक्षाएँ' : 'Classes'}</Link>
            <HiChevronRight className="w-3.5 h-3.5" />
            <Link to={`/modules/${grade}`} className="hover:text-primary-600 dark:hover:text-primary-400">{lang === 'hi' ? `कक्षा ${grade}` : `Class ${grade}`}</Link>
            <HiChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 dark:text-white font-medium">{lang === 'hi' ? config.labelHi : config.label}</span>
          </div>

          {/* Header card */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl bg-gradient-to-br ${config.gradient} p-6 mb-6 text-white relative overflow-hidden`}>
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -left-4 -bottom-8 w-24 h-24 bg-white/10 rounded-full" />
            <div className="relative z-10 flex items-center gap-4">
              <span className="text-5xl drop-shadow-md">{config.icon}</span>
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold">
                  {lang === 'hi' ? config.labelHi : config.label}
                </h1>
                <p className="text-white/80 mt-1">{lang === 'hi' ? `कक्षा ${grade}` : `Class ${grade}`} • {data?.lessons?.length || 0} {lang === 'hi' ? 'पाठ' : 'Lessons'} • {data?.quizzes?.length || 0} {lang === 'hi' ? 'प्रश्नोत्तरी' : 'Quizzes'}</p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white dark:bg-surface-dark rounded-xl p-1.5 border border-gray-200 dark:border-gray-800">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key ? 'bg-gradient-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-darker'
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? <LoadingSpinner /> : (
            <AnimatePresence mode="wait">
              {activeTab === 'lessons' && (
                <motion.div key="lessons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {data?.lessons?.length > 0 ? (
                    <div className="space-y-4">
                      {data.lessons.map((lesson, i) => {
                        const isCompleted = lesson.progress?.status === 'completed';
                        const isInProgress = lesson.progress?.status === 'in_progress';
                        return (
                          <motion.div key={lesson._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ x: 4 }}>
                            <Link to={`/learn/${lesson._id}`} className="card block p-5 group">
                              <div className="flex items-start gap-4">
                                {/* Order number */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                  isCompleted ? 'bg-green-100 dark:bg-green-900/20 text-green-600' :
                                  isInProgress ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600' :
                                  'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                }`}>
                                  {isCompleted ? <HiCheckCircle className="w-5 h-5" /> : i + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h3 className="font-heading font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {lang === 'hi' && lesson.titleHi ? lesson.titleHi : lesson.title}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                    {lang === 'hi' && lesson.descriptionHi ? lesson.descriptionHi : lesson.description}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                                    <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 capitalize">{lesson.difficulty}</span>
                                    <span className="flex items-center gap-1"><HiClock className="w-3 h-3" />{lesson.duration} min</span>
                                    <span className="flex items-center gap-1 text-xp-gold"><HiStar className="w-3 h-3" />+{lesson.xpReward} XP</span>
                                    {lesson.quizzes?.length > 0 && (
                                      <span className="flex items-center gap-1 text-accent-500"><HiPuzzle className="w-3 h-3" />{lesson.quizzes.length} Quiz</span>
                                    )}
                                  </div>
                                </div>

                                <HiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0 mt-2" />
                              </div>

                              {/* Progress bar for in-progress lessons */}
                              {isInProgress && lesson.progress?.progressPercent > 0 && (
                                <div className="mt-3 ml-14">
                                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${lesson.progress.progressPercent}%` }} />
                                  </div>
                                </div>
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="card text-center py-16">
                      <span className="text-5xl block mb-4">📭</span>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">{lang === 'hi' ? 'अभी कोई पाठ उपलब्ध नहीं' : 'No lessons available yet'}</p>
                      <p className="text-sm text-gray-400 mt-2">{lang === 'hi' ? 'जल्द ही पाठ जोड़े जाएंगे' : 'Lessons will be added soon'}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'quizzes' && (
                <motion.div key="quizzes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {data?.quizzes?.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {data.quizzes.map((quiz, i) => (
                        <motion.div key={quiz._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}>
                          <Link to={`/quizzes?quiz=${quiz._id}`} className="card block p-5 h-full group">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-xl flex-shrink-0">
                                🧠
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-heading font-semibold text-gray-900 dark:text-white">{lang === 'hi' && quiz.titleHi ? quiz.titleHi : quiz.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{quiz.description}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                                  <span>{quiz.questions?.length || 0} {lang === 'hi' ? 'प्रश्न' : 'Questions'}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1"><HiClock className="w-3 h-3" />{quiz.timeLimit} min</span>
                                  <span>•</span>
                                  <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 capitalize">{quiz.difficulty}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="card text-center py-16">
                      <span className="text-5xl block mb-4">🧩</span>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">{lang === 'hi' ? 'अभी कोई प्रश्नोत्तरी उपलब्ध नहीं' : 'No quizzes available yet'}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'ncert' && showNCERT && (
                <motion.div key="ncert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {/* NCERT Hero Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card mb-6 border-l-4 border-primary-500 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-900/10 dark:to-transparent"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl flex-shrink-0 shadow-lg">
                        📚
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-gray-900 dark:text-white">
                          {lang === 'hi' ? 'NCERT पाठ्यक्रम' : 'NCERT Curriculum'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {lang === 'hi'
                            ? `${ncertChapters.length} अध्याय • एनीमेशन और वीडियो के साथ सीखें`
                            : `${ncertChapters.length} chapters • Learn with animations & videos`}
                        </p>
                      </div>
                      <Link
                        to={`/modules/${grade}/${subject}/ncert`}
                        className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5 flex-shrink-0"
                      >
                        {lang === 'hi' ? 'सभी देखें' : 'View All'}
                        <HiChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>

                  {/* NCERT Chapter Cards */}
                  <div className="space-y-3">
                    {ncertChapters.slice(0, 6).map((ch, i) => (
                      <motion.div
                        key={ch.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ x: 4 }}
                      >
                        <Link to={`/modules/${grade}/${subject}/ncert/${ch.id}`} className="card block p-4 group">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-400 flex-shrink-0">
                              {ch.chapter}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-heading font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {lang === 'hi' && ch.titleHi ? ch.titleHi : ch.title}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {lang === 'hi' && ch.descriptionHi ? ch.descriptionHi : ch.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><HiClock className="w-3 h-3" />{ch.duration} min</span>
                                <span className="flex items-center gap-1"><HiPlay className="w-3 h-3" />{lang === 'hi' ? 'वीडियो' : 'Video'}</span>
                                <span className={`badge capitalize ${
                                  ch.difficulty === 'advanced' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                                  ch.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700' :
                                  'bg-green-100 dark:bg-green-900/20 text-green-600'
                                }`}>{ch.difficulty}</span>
                              </div>
                            </div>
                            <HiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0 mt-2" />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* View All button if more than 6 */}
                  {ncertChapters.length > 6 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-center mt-6"
                    >
                      <Link to={`/modules/${grade}/${subject}/ncert`} className="btn-outline inline-flex items-center gap-2">
                        <HiBookOpen className="w-4 h-4" />
                        {lang === 'hi' ? `सभी ${ncertChapters.length} अध्याय देखें` : `View All ${ncertChapters.length} Chapters`}
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ModuleSubjectPage;
