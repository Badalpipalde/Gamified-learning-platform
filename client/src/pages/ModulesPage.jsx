import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HiMenu, HiBookOpen, HiPuzzle, HiChevronRight, HiSearch } from 'react-icons/hi';
import api from '../utils/api';

const gradeGradients = [
  'from-rose-400 to-pink-500',
  'from-orange-400 to-amber-500',
  'from-yellow-400 to-lime-500',
  'from-emerald-400 to-green-500',
  'from-teal-400 to-cyan-500',
  'from-sky-400 to-blue-500',
  'from-indigo-400 to-violet-500',
  'from-purple-400 to-fuchsia-500',
  'from-pink-400 to-rose-500',
  'from-red-400 to-orange-500',
  'from-cyan-400 to-teal-500',
  'from-blue-400 to-indigo-500',
];

const gradeEmojis = ['📚', '✏️', '📖', '🎒', '🏫', '📐', '🔬', '🧪', '📊', '🎓', '🧮', '🏆'];

const gradeBgColors = [
  'bg-rose-50 dark:bg-rose-900/10',
  'bg-orange-50 dark:bg-orange-900/10',
  'bg-yellow-50 dark:bg-yellow-900/10',
  'bg-emerald-50 dark:bg-emerald-900/10',
  'bg-teal-50 dark:bg-teal-900/10',
  'bg-sky-50 dark:bg-sky-900/10',
  'bg-indigo-50 dark:bg-indigo-900/10',
  'bg-purple-50 dark:bg-purple-900/10',
  'bg-pink-50 dark:bg-pink-900/10',
  'bg-red-50 dark:bg-red-900/10',
  'bg-cyan-50 dark:bg-cyan-900/10',
  'bg-blue-50 dark:bg-blue-900/10',
];

const ModulesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const t = useSelector(selectT);
  const { current: lang } = useSelector((state) => state.language);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/modules');
        setModules(data.modules || []);
      } catch (err) {
        console.error(err);
        // Fallback: generate default modules if API fails
        const fallbackModules = Array.from({ length: 12 }, (_, i) => ({
          grade: i + 1,
          title: `Class ${i + 1}`,
          titleHi: `कक्षा ${i + 1}`,
          description: `All subjects and lessons for Class ${i + 1}`,
          subjectCount: i < 5 ? 5 : 7,
          lessonCount: 0,
          quizCount: 0,
        }));
        setModules(fallbackModules);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  const filteredModules = modules.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `class ${m.grade}`.includes(searchQuery.toLowerCase()) ||
    `${m.grade}`.includes(searchQuery)
  );

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 30, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } };

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center" id="sidebar-toggle-modules">
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-lg">📚</span>
              {lang === 'hi' ? 'कक्षा मॉड्यूल' : 'Class Modules'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {lang === 'hi' ? 'कक्षा 1 से 12 तक सभी विषय और पाठ' : 'Browse subjects and lessons from Class 1 to 12'}
            </p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <div className="relative max-w-md">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={lang === 'hi' ? 'कक्षा खोजें...' : 'Search class...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 !rounded-xl"
                id="module-search"
              />
            </div>
          </motion.div>

          {/* Module Grid */}
          {loading ? <LoadingSpinner /> : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredModules.map((mod, i) => (
                <motion.div key={mod.grade} variants={item} whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to={`/modules/${mod.grade}`} className="block group" id={`module-class-${mod.grade}`}>
                    <div className={`card overflow-hidden h-full border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300`}>
                      {/* Gradient header */}
                      <div className={`h-24 sm:h-28 bg-gradient-to-br ${gradeGradients[i]} relative overflow-hidden flex items-center justify-center`}>
                        <div className="absolute inset-0 bg-black/5" />
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
                        <div className="absolute -left-2 -bottom-6 w-20 h-20 bg-white/10 rounded-full" />
                        <div className="relative text-center">
                          <span className="text-4xl sm:text-5xl drop-shadow-md">{gradeEmojis[i]}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-heading text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            {lang === 'hi' ? mod.titleHi || mod.title : mod.title}
                          </h3>
                          <HiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${gradeBgColors[i]} text-gray-700 dark:text-gray-300`}>
                            <HiBookOpen className="w-3.5 h-3.5" />
                            {mod.subjectCount} {lang === 'hi' ? 'विषय' : 'Subjects'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${gradeBgColors[i]} text-gray-700 dark:text-gray-300`}>
                            <HiPuzzle className="w-3.5 h-3.5" />
                            {mod.lessonCount} {lang === 'hi' ? 'पाठ' : 'Lessons'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && filteredModules.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <span className="text-6xl mb-4 block">🔍</span>
              <p className="text-gray-500 dark:text-gray-400 text-lg">{lang === 'hi' ? 'कोई कक्षा नहीं मिली' : 'No class found'}</p>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ModulesPage;
