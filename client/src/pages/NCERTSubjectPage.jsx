import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import ChapterTimeline from '../components/learning/ChapterTimeline';
import FloatingParticles from '../components/learning/FloatingParticles';
import { getChapters, hasNCERTData } from '../data/ncertData';
import { HiMenu, HiChevronRight, HiSearch, HiBookOpen, HiPlay, HiAcademicCap } from 'react-icons/hi';

const subjectConfig = {
  mathematics: { icon: '🔢', label: 'Mathematics', labelHi: 'गणित', gradient: 'from-blue-500 to-indigo-600', particle: 'numbers' },
  science: { icon: '🔬', label: 'Science', labelHi: 'विज्ञान', gradient: 'from-green-500 to-emerald-600', particle: 'science' },
  english: { icon: '📝', label: 'English', labelHi: 'अंग्रेज़ी', gradient: 'from-purple-500 to-violet-600', particle: 'letters' },
  hindi: { icon: '🔤', label: 'Hindi', labelHi: 'हिन्दी', gradient: 'from-orange-500 to-amber-600', particle: 'hindi' },
  social_studies: { icon: '🌍', label: 'Social Studies', labelHi: 'सामाजिक विज्ञान', gradient: 'from-pink-500 to-rose-600', particle: 'social' },
  computer_science: { icon: '💻', label: 'Computer Science', labelHi: 'कंप्यूटर विज्ञान', gradient: 'from-cyan-500 to-sky-600', particle: 'numbers' },
  environmental_studies: { icon: '🌿', label: 'Environmental Studies', labelHi: 'पर्यावरण अध्ययन', gradient: 'from-teal-500 to-green-600', particle: 'nature' },
};

const NCERTSubjectPage = () => {
  const { grade, subject } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const t = useSelector(selectT);
  const { current: lang } = useSelector((state) => state.language);

  const chapters = useMemo(() => getChapters(grade, subject), [grade, subject]);
  const config = subjectConfig[subject] || { icon: '📖', label: subject, labelHi: subject, gradient: 'from-gray-500 to-gray-600', particle: 'numbers' };

  const filteredChapters = chapters.filter(ch => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ch.title.toLowerCase().includes(q) ||
      ch.titleHi?.toLowerCase().includes(q) ||
      ch.description.toLowerCase().includes(q) ||
      `chapter ${ch.chapter}`.includes(q)
    );
  });

  const totalDuration = chapters.reduce((sum, ch) => sum + ch.duration, 0);

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center"
          id="sidebar-toggle-ncert-subject"
        >
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4 flex-wrap">
            <Link to="/modules" className="hover:text-primary-600 dark:hover:text-primary-400">
              {lang === 'hi' ? 'कक्षाएँ' : 'Classes'}
            </Link>
            <HiChevronRight className="w-3.5 h-3.5" />
            <Link to={`/modules/${grade}`} className="hover:text-primary-600 dark:hover:text-primary-400">
              {lang === 'hi' ? `कक्षा ${grade}` : `Class ${grade}`}
            </Link>
            <HiChevronRight className="w-3.5 h-3.5" />
            <Link to={`/modules/${grade}/${subject}`} className="hover:text-primary-600 dark:hover:text-primary-400">
              {lang === 'hi' ? config.labelHi : config.label}
            </Link>
            <HiChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 dark:text-white font-medium">
              {lang === 'hi' ? 'NCERT अध्याय' : 'NCERT Chapters'}
            </span>
          </div>

          {/* Hero header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl bg-gradient-to-br ${config.gradient} p-6 sm:p-8 mb-6 text-white relative overflow-hidden`}
          >
            <FloatingParticles type={config.particle} count={14} />
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full" />
            <div className="absolute -left-6 -bottom-10 w-28 h-28 bg-white/10 rounded-full" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl drop-shadow-md">{config.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                      NCERT
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                      {lang === 'hi' ? `कक्षा ${grade}` : `Class ${grade}`}
                    </span>
                  </div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold">
                    {lang === 'hi' ? config.labelHi : config.label}
                  </h1>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2">
                  <HiBookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {chapters.length} {lang === 'hi' ? 'अध्याय' : 'Chapters'}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2">
                  <HiPlay className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {chapters.filter(ch => ch.videoUrl).length} {lang === 'hi' ? 'वीडियो' : 'Videos'}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2">
                  <HiAcademicCap className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {totalDuration} {lang === 'hi' ? 'मिनट' : 'mins total'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          {chapters.length > 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6"
            >
              <div className="relative max-w-md">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={lang === 'hi' ? 'अध्याय खोजें...' : 'Search chapters...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-12 !rounded-xl"
                  id="ncert-chapter-search"
                />
              </div>
            </motion.div>
          )}

          {/* Chapter Timeline */}
          {filteredChapters.length > 0 ? (
            <ChapterTimeline
              chapters={filteredChapters}
              grade={grade}
              subject={subject}
              completedChapters={[]}
            />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-16">
              <span className="text-5xl block mb-4">📭</span>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {searchQuery
                  ? (lang === 'hi' ? 'कोई अध्याय नहीं मिला' : 'No chapters found')
                  : (lang === 'hi' ? 'इस विषय के लिए NCERT अध्याय जल्द आ रहे हैं' : 'NCERT chapters for this subject coming soon')
                }
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default NCERTSubjectPage;
