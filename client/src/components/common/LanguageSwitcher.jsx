import { useSelector, useDispatch } from 'react-redux';
import { toggleLanguage } from '../../store/languageSlice';
import { motion } from 'framer-motion';
import { HiTranslate } from 'react-icons/hi';

const LanguageSwitcher = () => {
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state.language);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => dispatch(toggleLanguage())}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-surface-dark
        text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-surface-darker
        transition-colors text-sm font-medium"
      id="language-switcher"
    >
      <HiTranslate className="w-4 h-4" />
      <span className="uppercase font-semibold">{current === 'en' ? 'हि' : 'EN'}</span>
    </motion.button>
  );
};

export default LanguageSwitcher;
