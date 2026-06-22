import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import VideoPlayer from '../components/learning/VideoPlayer';
import AnimatedConceptCard from '../components/learning/AnimatedConceptCard';
import FloatingParticles from '../components/learning/FloatingParticles';
import { getChapterById, getAdjacentChapters } from '../data/ncertData';
import {
  HiMenu, HiChevronRight, HiChevronLeft, HiArrowLeft,
  HiPlay, HiLightBulb, HiBookOpen, HiStar, HiClock,
  HiAcademicCap, HiSparkles, HiCalculator
} from 'react-icons/hi';

const subjectConfig = {
  mathematics: { icon: '🔢', label: 'Mathematics', labelHi: 'गणित', gradient: 'from-blue-500 to-indigo-600', particle: 'numbers', accentText: 'text-blue-600 dark:text-blue-400', accentBg: 'bg-blue-100 dark:bg-blue-900/20' },
  science: { icon: '🔬', label: 'Science', labelHi: 'विज्ञान', gradient: 'from-green-500 to-emerald-600', particle: 'science', accentText: 'text-green-600 dark:text-green-400', accentBg: 'bg-green-100 dark:bg-green-900/20' },
  english: { icon: '📝', label: 'English', labelHi: 'अंग्रेज़ी', gradient: 'from-purple-500 to-violet-600', particle: 'letters', accentText: 'text-purple-600 dark:text-purple-400', accentBg: 'bg-purple-100 dark:bg-purple-900/20' },
  hindi: { icon: '🔤', label: 'Hindi', labelHi: 'हिन्दी', gradient: 'from-orange-500 to-amber-600', particle: 'hindi', accentText: 'text-orange-600 dark:text-orange-400', accentBg: 'bg-orange-100 dark:bg-orange-900/20' },
  social_studies: { icon: '🌍', label: 'Social Studies', labelHi: 'सामाजिक विज्ञान', gradient: 'from-pink-500 to-rose-600', particle: 'social', accentText: 'text-pink-600 dark:text-pink-400', accentBg: 'bg-pink-100 dark:bg-pink-900/20' },
  computer_science: { icon: '💻', label: 'Computer Science', labelHi: 'कंप्यूटर विज्ञान', gradient: 'from-cyan-500 to-sky-600', particle: 'numbers', accentText: 'text-cyan-600 dark:text-cyan-400', accentBg: 'bg-cyan-100 dark:bg-cyan-900/20' },
  environmental_studies: { icon: '🌿', label: 'Environmental Studies', labelHi: 'पर्यावरण अध्ययन', gradient: 'from-teal-500 to-green-600', particle: 'nature', accentText: 'text-teal-600 dark:text-teal-400', accentBg: 'bg-teal-100 dark:bg-teal-900/20' },
};

const NCERTChapterPage = () => {
  const { grade, subject, chapterId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('video');
  const t = useSelector(selectT);
  const { current: lang } = useSelector((state) => state.language);

  const chapter = useMemo(() => getChapterById(grade, subject, chapterId), [grade, subject, chapterId]);
  const { prev, next, total, currentNumber } = useMemo(() => getAdjacentChapters(grade, subject, chapterId), [grade, subject, chapterId]);
  const config = subjectConfig[subject] || subjectConfig.mathematics;

  const sections = [
    { key: 'video', icon: HiPlay, label: lang === 'hi' ? 'वीडियो पाठ' : 'Video Lesson' },
    { key: 'concepts', icon: HiLightBulb, label: lang === 'hi' ? 'मुख्य अवधारणाएँ' : 'Key Concepts' },
    { key: 'summary', icon: HiBookOpen, label: lang === 'hi' ? 'सारांश' : 'Summary' },
  ];

  if (!chapter) {
    return (
      <PageTransition>
        <Navbar />
        <div className="pt-20 text-center">
          <span className="text-6xl block mb-4">📭</span>
          <p className="text-gray-500 text-lg">Chapter not found</p>
          <Link to={`/modules/${grade}/${subject}/ncert`} className="btn-primary mt-4 inline-block">
            ← Back to Chapters
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center"
          id="sidebar-toggle-ncert-chapter"
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
            <Link to={`/modules/${grade}/${subject}`} className="hover:text-primary-600 dark:hover:text-primary-400">
              {lang === 'hi' ? config.labelHi : config.label}
            </Link>
            <HiChevronRight className="w-3.5 h-3.5" />
            <Link to={`/modules/${grade}/${subject}/ncert`} className="hover:text-primary-600 dark:hover:text-primary-400">
              {lang === 'hi' ? 'NCERT' : 'NCERT'}
            </Link>
            <HiChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
              {lang === 'hi' ? `अध्याय ${currentNumber}` : `Chapter ${currentNumber}`}
            </span>
          </div>

          {/* Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl bg-gradient-to-br ${config.gradient} p-6 sm:p-8 mb-6 text-white relative overflow-hidden`}
          >
            <FloatingParticles type={config.particle} count={12} />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -left-6 -bottom-8 w-28 h-28 bg-white/10 rounded-full" />
            <div className="absolute right-4 bottom-4 w-20 h-20 bg-white/5 rounded-full" />

            <div className="relative z-10">
              {/* Chapter number badge */}
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wide">
                  NCERT • {lang === 'hi' ? `कक्षा ${grade}` : `Class ${grade}`}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                  {lang === 'hi' ? `अध्याय ${currentNumber} / ${total}` : `Chapter ${currentNumber} of ${total}`}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
                {lang === 'hi' && chapter.titleHi ? chapter.titleHi : chapter.title}
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-2xl">
                {lang === 'hi' && chapter.descriptionHi ? chapter.descriptionHi : chapter.description}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 text-xs font-medium">
                  <HiClock className="w-3.5 h-3.5" /> {chapter.duration} min
                </span>
                <span className={`flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 text-xs font-medium capitalize`}>
                  <HiAcademicCap className="w-3.5 h-3.5" /> {chapter.difficulty}
                </span>
                {chapter.videoUrl && (
                  <span className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 text-xs font-medium">
                    <HiPlay className="w-3.5 h-3.5" /> {lang === 'hi' ? 'वीडियो उपलब्ध' : 'Video Available'}
                  </span>
                )}
              </div>
            </div>

            {/* Animated progress arc */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <svg className="w-14 h-14 sm:w-16 sm:h-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <motion.path
                  className="text-white"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${(currentNumber / total) * 100}, 100` }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center rotate-90">
                <span className="text-xs font-bold">{currentNumber}/{total}</span>
              </div>
            </div>
          </motion.div>

          {/* Section Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-6 bg-white dark:bg-surface-dark rounded-xl p-1.5 border border-gray-200 dark:border-gray-800"
          >
            {sections.map(sec => (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeSection === sec.key
                    ? 'bg-gradient-primary text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-darker'
                }`}
                id={`section-tab-${sec.key}`}
              >
                <sec.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{sec.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Section Content */}
          <AnimatePresence mode="wait">
            {/* ─── VIDEO SECTION ─── */}
            {activeSection === 'video' && (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="card overflow-hidden mb-6">
                  <VideoPlayer
                    videoUrl={chapter.videoUrl}
                    title={lang === 'hi' && chapter.titleHi ? chapter.titleHi : chapter.title}
                  />
                </div>

                {/* Fun Fact Card */}
                {chapter.funFact && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="card mb-6 border-l-4 border-amber-400 bg-amber-50/50 dark:bg-amber-900/10"
                  >
                    <div className="flex items-start gap-3">
                      <motion.span
                        className="text-3xl flex-shrink-0"
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3, repeatDelay: 5 }}
                      >
                        💡
                      </motion.span>
                      <div>
                        <h4 className="font-heading font-semibold text-amber-800 dark:text-amber-400 mb-1">
                          {lang === 'hi' ? 'क्या आप जानते हैं?' : 'Did You Know?'}
                        </h4>
                        <p className="text-sm text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                          {lang === 'hi' && chapter.funFactHi ? chapter.funFactHi : chapter.funFact}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ─── CONCEPTS SECTION ─── */}
            {activeSection === 'concepts' && (
              <motion.div
                key="concepts"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Key Topics */}
                <div className="card mb-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className={`w-8 h-8 rounded-lg ${config.accentBg} flex items-center justify-center`}>
                      <HiLightBulb className={`w-4 h-4 ${config.accentText}`} />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                      {lang === 'hi' ? 'मुख्य विषय' : 'Key Topics'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(lang === 'hi' && chapter.keyTopicsHi ? chapter.keyTopicsHi : chapter.keyTopics).map((topic, i) => (
                      <AnimatedConceptCard
                        key={i}
                        topic={topic}
                        index={i}
                        subject={subject}
                      />
                    ))}
                  </div>
                </div>

                {/* Formulas / Important Definitions */}
                {chapter.formulas && chapter.formulas.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                  >
                    <div className="flex items-center gap-2 mb-5">
                      <div className={`w-8 h-8 rounded-lg ${config.accentBg} flex items-center justify-center`}>
                        <HiCalculator className={`w-4 h-4 ${config.accentText}`} />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                        {lang === 'hi' ? 'महत्वपूर्ण सूत्र' : 'Important Formulas'}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {chapter.formulas.map((formula, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.08 }}
                          className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-surface-darker border border-gray-100 dark:border-gray-800"
                        >
                          <span className={`w-7 h-7 rounded-lg ${config.accentBg} ${config.accentText} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                            {i + 1}
                          </span>
                          <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                            {formula}
                          </code>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ─── SUMMARY SECTION ─── */}
            {activeSection === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="card mb-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className={`w-8 h-8 rounded-lg ${config.accentBg} flex items-center justify-center`}>
                      <HiBookOpen className={`w-4 h-4 ${config.accentText}`} />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                      {lang === 'hi' ? 'अध्याय सारांश' : 'Chapter Summary'}
                    </h3>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                      {lang === 'hi' && chapter.summaryHi ? chapter.summaryHi : chapter.summary}
                    </p>
                  </div>
                </div>

                {/* Key Topics quick view */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="card"
                >
                  <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <HiSparkles className={`w-5 h-5 ${config.accentText}`} />
                    {lang === 'hi' ? 'इस अध्याय में आप सीखेंगे' : 'What You\'ll Learn'}
                  </h4>
                  <ul className="space-y-2.5">
                    {(lang === 'hi' && chapter.keyTopicsHi ? chapter.keyTopicsHi : chapter.keyTopics).map((topic, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient} flex-shrink-0`} />
                        {topic}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Fun Fact in summary too */}
                {chapter.funFact && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="card mt-6 border-l-4 border-amber-400 bg-amber-50/50 dark:bg-amber-900/10"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl flex-shrink-0">💡</span>
                      <div>
                        <h4 className="font-heading font-semibold text-amber-800 dark:text-amber-400 mb-1">
                          {lang === 'hi' ? 'रोचक तथ्य' : 'Fun Fact'}
                        </h4>
                        <p className="text-sm text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                          {lang === 'hi' && chapter.funFactHi ? chapter.funFactHi : chapter.funFact}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── CHAPTER NAVIGATION ─── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mt-8 gap-4"
          >
            {prev ? (
              <Link
                to={`/modules/${grade}/${subject}/ncert/${prev.id}`}
                className="flex-1 card group hover:border-primary-300 dark:hover:border-primary-700 border-2 border-transparent transition-all p-4"
                id="prev-chapter-link"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/20 transition-colors">
                    <HiChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">{lang === 'hi' ? 'पिछला अध्याय' : 'Previous Chapter'}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {lang === 'hi' && prev.titleHi ? prev.titleHi : prev.title}
                    </p>
                  </div>
                </div>
              </Link>
            ) : <div className="flex-1" />}

            {next ? (
              <Link
                to={`/modules/${grade}/${subject}/ncert/${next.id}`}
                className="flex-1 card group hover:border-primary-300 dark:hover:border-primary-700 border-2 border-transparent transition-all p-4"
                id="next-chapter-link"
              >
                <div className="flex items-center gap-3 justify-end text-right">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">{lang === 'hi' ? 'अगला अध्याय' : 'Next Chapter'}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {lang === 'hi' && next.titleHi ? next.titleHi : next.title}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/20 transition-colors">
                    <HiChevronRight className="w-5 h-5 text-gray-500 group-hover:text-primary-500" />
                  </div>
                </div>
              </Link>
            ) : (
              <Link
                to={`/modules/${grade}/${subject}/ncert`}
                className="flex-1 card group hover:border-green-300 dark:hover:border-green-700 border-2 border-transparent transition-all p-4 text-center"
              >
                <div className="flex items-center gap-2 justify-center">
                  <HiStar className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {lang === 'hi' ? 'सभी अध्याय पूर्ण!' : 'All Chapters Complete!'}
                  </span>
                </div>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default NCERTChapterPage;
