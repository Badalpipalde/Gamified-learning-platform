import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../store/themeSlice';
import { motion } from 'framer-motion';
import { HiSun, HiMoon } from 'react-icons/hi';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      onClick={() => dispatch(toggleTheme())}
      className="relative w-10 h-10 rounded-xl bg-gray-100 dark:bg-surface-dark flex items-center justify-center
        text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-surface-darker transition-colors"
      aria-label="Toggle theme"
      id="theme-toggle"
    >
      <motion.div
        initial={false}
        animate={{ rotate: mode === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {mode === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
