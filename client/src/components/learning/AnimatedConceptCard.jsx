import { motion } from 'framer-motion';
import { HiLightBulb } from 'react-icons/hi';

const subjectGlows = {
  mathematics: 'from-blue-400/20 to-indigo-400/20',
  science: 'from-green-400/20 to-emerald-400/20',
  english: 'from-purple-400/20 to-violet-400/20',
  hindi: 'from-orange-400/20 to-amber-400/20',
  social_studies: 'from-pink-400/20 to-rose-400/20',
  computer_science: 'from-cyan-400/20 to-sky-400/20',
  environmental_studies: 'from-teal-400/20 to-green-400/20',
};

const subjectBorders = {
  mathematics: 'border-blue-200/40 dark:border-blue-700/30',
  science: 'border-green-200/40 dark:border-green-700/30',
  english: 'border-purple-200/40 dark:border-purple-700/30',
  hindi: 'border-orange-200/40 dark:border-orange-700/30',
  social_studies: 'border-pink-200/40 dark:border-pink-700/30',
  computer_science: 'border-cyan-200/40 dark:border-cyan-700/30',
  environmental_studies: 'border-teal-200/40 dark:border-teal-700/30',
};

const subjectIconBg = {
  mathematics: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  science: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  english: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  hindi: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  social_studies: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  computer_science: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  environmental_studies: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
};

const AnimatedConceptCard = ({ topic, index = 0, subject = 'mathematics', icon = null }) => {
  const glow = subjectGlows[subject] || subjectGlows.mathematics;
  const border = subjectBorders[subject] || subjectBorders.mathematics;
  const iconBg = subjectIconBg[subject] || subjectIconBg.mathematics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.03 }}
      className={`concept-card relative overflow-hidden rounded-xl border ${border} p-4 cursor-default`}
    >
      {/* Glassmorphism background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${glow} opacity-50`} />
      <div className="absolute inset-0 bg-white/60 dark:bg-surface-dark/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon || <HiLightBulb className="w-4 h-4" />}
        </div>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{topic}</span>
      </div>

      {/* Decorative corner glow */}
      <div className={`absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br ${glow} rounded-full blur-lg`} />
    </motion.div>
  );
};

export default AnimatedConceptCard;
