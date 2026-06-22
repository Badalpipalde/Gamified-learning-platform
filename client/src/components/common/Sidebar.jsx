import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { selectT } from '../../store/languageSlice';
import { logout } from '../../store/authSlice';
import {
  HiHome, HiBookOpen, HiAcademicCap, HiChartBar, HiUserGroup,
  HiCog, HiLogout, HiTrendingUp, HiPuzzle, HiStar, HiUpload,
  HiClipboardList, HiUsers, HiDocumentReport, HiCollection, HiQuestionMarkCircle, HiPencilAlt
} from 'react-icons/hi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const t = useSelector(selectT);
  const { current: lang } = useSelector((state) => state.language);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const studentLinks = [
    { to: '/student/dashboard', icon: HiHome, label: t.nav.dashboard },
    { to: '/modules', icon: HiCollection, label: lang === 'hi' ? 'मॉड्यूल' : 'Modules' },
    { to: '/learn', icon: HiBookOpen, label: t.nav.lessons },
    { to: '/quizzes', icon: HiPuzzle, label: t.nav.quizzes },
    { to: '/qna', icon: HiQuestionMarkCircle, label: lang === 'hi' ? 'प्रश्न उत्तर' : 'Q & A' },
    { to: '/my-inputs', icon: HiPencilAlt, label: lang === 'hi' ? 'मेरा इनपुट' : 'My Input' },
    { to: '/leaderboard', icon: HiTrendingUp, label: t.nav.leaderboard },
    { to: '/achievements', icon: HiStar, label: t.dashboard.achievements },
    { to: '/community', icon: HiUserGroup, label: t.nav.community },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', icon: HiHome, label: t.nav.dashboard },
    { to: '/teacher/lessons', icon: HiUpload, label: t.teacher.uploadLesson },
    { to: '/teacher/quizzes', icon: HiClipboardList, label: t.teacher.createQuiz },
    { to: '/teacher/students', icon: HiUsers, label: t.teacher.studentProgress },
    { to: '/teacher/analytics', icon: HiChartBar, label: t.teacher.analytics },
    { to: '/community', icon: HiUserGroup, label: t.nav.community },
  ];

  const parentLinks = [
    { to: '/parent/dashboard', icon: HiHome, label: t.nav.dashboard },
    { to: '/parent/progress', icon: HiDocumentReport, label: t.parent.childProgress },
    { to: '/parent/summary', icon: HiChartBar, label: t.parent.weeklySummary },
    { to: '/community', icon: HiUserGroup, label: t.nav.community },
  ];

  const links = user?.role === 'teacher' ? teacherLinks : user?.role === 'parent' ? parentLinks : studentLinks;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <motion.aside
        className={`fixed top-16 left-0 bottom-0 z-40 w-64 bg-white dark:bg-surface-darkest border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full p-4">
          {/* User card */}
          <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
            <div className="w-11 h-11 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-md">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-primary-600 dark:text-primary-400 capitalize font-medium">{user?.role}</p>
            </div>
          </div>

          {/* XP bar for students */}
          {user?.role === 'student' && (
            <div className="mb-4 px-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400">Level {user?.level || 1}</span>
                <span className="text-xp-gold font-semibold">{user?.xp || 0} XP</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${((user?.xp || 0) % 500) / 5}%` }} />
              </div>
            </div>
          )}

          {/* Navigation links */}
          <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3 space-y-1">
            <NavLink to="/profile" onClick={onClose} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <HiCog className="w-5 h-5" />
              <span>{t.nav.settings}</span>
            </NavLink>
            <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
              <HiLogout className="w-5 h-5" />
              <span>{t.nav.logout}</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
