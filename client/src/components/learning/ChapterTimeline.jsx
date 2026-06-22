import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiPlay, HiCheckCircle, HiClock, HiLockClosed } from 'react-icons/hi';

const subjectGradients = {
  mathematics: 'from-blue-500 to-indigo-500',
  science: 'from-green-500 to-emerald-500',
  english: 'from-purple-500 to-violet-500',
  hindi: 'from-orange-500 to-amber-500',
  social_studies: 'from-pink-500 to-rose-500',
  computer_science: 'from-cyan-500 to-sky-500',
  environmental_studies: 'from-teal-500 to-green-500',
};

const subjectDots = {
  mathematics: 'bg-blue-500',
  science: 'bg-green-500',
  english: 'bg-purple-500',
  hindi: 'bg-orange-500',
  social_studies: 'bg-pink-500',
  computer_science: 'bg-cyan-500',
  environmental_studies: 'bg-teal-500',
};

const ChapterTimeline = ({ chapters, grade, subject, completedChapters = [] }) => {
  const { current: lang } = useSelector((state) => state.language);
  const gradient = subjectGradients[subject] || subjectGradients.mathematics;
  const dotColor = subjectDots[subject] || subjectDots.mathematics;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, x: -30 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative"
    >
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

      {/* Animated progress fill */}
      <motion.div
        className={`absolute left-6 top-0 w-0.5 bg-gradient-to-b ${gradient}`}
        initial={{ height: 0 }}
        animate={{ height: `${(completedChapters.length / Math.max(chapters.length, 1)) * 100}%` }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
      />

      <div className="space-y-0">
        {chapters.map((chapter, i) => {
          const isCompleted = completedChapters.includes(chapter.id);
          return (
            <motion.div key={chapter.id} variants={item} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Timeline node */}
              <div className="relative z-10 flex-shrink-0">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    isCompleted
                      ? `bg-gradient-to-br ${gradient} text-white border-transparent shadow-lg`
                      : 'bg-white dark:bg-surface-dark border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {isCompleted ? <HiCheckCircle className="w-5 h-5" /> : i + 1}
                </motion.div>
              </div>

              {/* Chapter card */}
              <motion.div className="flex-1 min-w-0" whileHover={{ x: 4 }}>
                <Link
                  to={`/modules/${grade}/${subject}/ncert/${chapter.id}`}
                  className="card block p-4 sm:p-5 group hover:border-primary-300 dark:hover:border-primary-700 border-2 border-transparent transition-all"
                  id={`ncert-chapter-${chapter.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {lang === 'hi' && chapter.titleHi ? chapter.titleHi : chapter.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {lang === 'hi' && chapter.descriptionHi ? chapter.descriptionHi : chapter.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                        <span className={`badge capitalize ${
                          chapter.difficulty === 'advanced' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                          chapter.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                          'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        }`}>
                          {chapter.difficulty}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiClock className="w-3 h-3" />
                          {chapter.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <HiPlay className="w-3 h-3" />
                          {lang === 'hi' ? 'वीडियो पाठ' : 'Video Lesson'}
                        </span>
                      </div>
                    </div>

                    {/* Play icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-500'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/20 group-hover:text-primary-500'
                    } transition-all`}>
                      {isCompleted ? <HiCheckCircle className="w-5 h-5" /> : <HiPlay className="w-5 h-5" />}
                    </div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ChapterTimeline;
