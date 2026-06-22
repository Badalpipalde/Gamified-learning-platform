import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HiMenu, HiArrowLeft, HiBookOpen, HiPuzzle, HiChevronRight } from 'react-icons/hi';
import api from '../utils/api';

const subjectConfig = {
  mathematics:           { icon: '🔢', label: 'Mathematics',           labelHi: 'गणित',         gradient: 'from-blue-400 to-indigo-500',   bg: 'bg-blue-50 dark:bg-blue-900/10' },
  science:               { icon: '🔬', label: 'Science',               labelHi: 'विज्ञान',       gradient: 'from-green-400 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/10' },
  english:               { icon: '📝', label: 'English',               labelHi: 'अंग्रेज़ी',     gradient: 'from-purple-400 to-violet-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
  hindi:                 { icon: '🔤', label: 'Hindi',                 labelHi: 'हिन्दी',       gradient: 'from-orange-400 to-amber-500',  bg: 'bg-orange-50 dark:bg-orange-900/10' },
  social_studies:        { icon: '🌍', label: 'Social Studies',        labelHi: 'सामाजिक विज्ञान', gradient: 'from-pink-400 to-rose-500',    bg: 'bg-pink-50 dark:bg-pink-900/10' },
  computer_science:      { icon: '💻', label: 'Computer Science',      labelHi: 'कंप्यूटर विज्ञान', gradient: 'from-cyan-400 to-sky-500',     bg: 'bg-cyan-50 dark:bg-cyan-900/10' },
  environmental_studies: { icon: '🌿', label: 'Environmental Studies', labelHi: 'पर्यावरण अध्ययन', gradient: 'from-teal-400 to-green-500',   bg: 'bg-teal-50 dark:bg-teal-900/10' },
};

const ModuleDetailPage = () => {
  const { grade } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const t = useSelector(selectT);
  const { current: lang } = useSelector((state) => state.language);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/modules/${grade}`);
        setModuleData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [grade]);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } };

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center" id="sidebar-toggle-module-detail">
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Back link */}
          <Link to="/modules" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4">
            <HiArrowLeft className="w-4 h-4" /> {lang === 'hi' ? 'सभी कक्षाएँ' : 'All Classes'}
          </Link>

          {loading ? <LoadingSpinner /> : !moduleData ? (
            <div className="text-center py-16">
              <span className="text-6xl block mb-4">📭</span>
              <p className="text-gray-500 text-lg">Module not found</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {lang === 'hi' ? moduleData.titleHi || moduleData.title : moduleData.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {lang === 'hi' ? 'विषय चुनें और सीखना शुरू करें' : 'Choose a subject to start learning'}
                </p>
              </motion.div>

              {/* Subject Grid */}
              <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {moduleData.subjects?.map((sub, i) => {
                  const config = subjectConfig[sub.subject] || { icon: '📖', label: sub.subject, labelHi: sub.subject, gradient: 'from-gray-400 to-gray-500', bg: 'bg-gray-50' };
                  return (
                    <motion.div key={sub.subject} variants={item} whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                      <Link to={`/modules/${grade}/${sub.subject}`} className="block group" id={`subject-${sub.subject}`}>
                        <div className="card overflow-hidden h-full border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300">
                          {/* Gradient header */}
                          <div className={`h-20 bg-gradient-to-br ${config.gradient} relative overflow-hidden flex items-center px-5`}>
                            <div className="absolute -right-3 -top-3 w-20 h-20 bg-white/10 rounded-full" />
                            <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full" />
                            <span className="text-4xl drop-shadow-md relative z-10">{config.icon}</span>
                            <div className="ml-4 relative z-10">
                              <h3 className="font-heading text-lg font-bold text-white">
                                {lang === 'hi' ? config.labelHi : config.label}
                              </h3>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="p-4">
                            <div className="flex items-center gap-4 mb-3">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} text-gray-700 dark:text-gray-300`}>
                                <HiBookOpen className="w-3.5 h-3.5" />
                                {sub.lessonCount} {lang === 'hi' ? 'पाठ' : 'Lessons'}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} text-gray-700 dark:text-gray-300`}>
                                <HiPuzzle className="w-3.5 h-3.5" />
                                {sub.quizCount} {lang === 'hi' ? 'प्रश्नोत्तरी' : 'Quizzes'}
                              </span>
                            </div>

                            {/* Progress bar */}
                            {sub.progress !== undefined && (
                              <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                  <span className="text-gray-500 dark:text-gray-400">{lang === 'hi' ? 'प्रगति' : 'Progress'}</span>
                                  <span className="font-semibold text-primary-600 dark:text-primary-400">{sub.progress}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                  <motion.div
                                    className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${sub.progress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-end mt-3">
                              <span className="text-sm text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                {lang === 'hi' ? 'अन्वेषण करें' : 'Explore'}
                                <HiChevronRight className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ModuleDetailPage;
