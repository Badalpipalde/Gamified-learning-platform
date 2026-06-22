import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import { HiMenu, HiFire, HiStar, HiCurrencyDollar, HiTrendingUp, HiBookOpen, HiChevronRight, HiClock, HiLightningBolt } from 'react-icons/hi';
import api from '../utils/api';

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lessons, setLessons] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const t = useSelector(selectT);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lb, ls] = await Promise.all([
          api.get('/leaderboard?limit=5'),
          api.get('/lessons?limit=4')
        ]);
        setLeaderboard(lb.data.leaderboard || []);
        setLessons(ls.data.lessons || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const xpForNextLevel = 500;
  const currentLevelXP = (user?.xp || 0) % xpForNextLevel;
  const xpProgress = (currentLevelXP / xpForNextLevel) * 100;

  const statCards = [
    { icon: HiFire, label: t.dashboard.dailyStreak, value: `${user?.streak?.current || 0}`, sub: t.dashboard.daysStreak, color: 'from-orange-400 to-red-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
    { icon: HiStar, label: t.dashboard.xpPoints, value: user?.xp?.toLocaleString() || '0', sub: `Level ${user?.level || 1}`, color: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
    { icon: HiTrendingUp, label: t.dashboard.level, value: user?.level || 1, sub: `${currentLevelXP}/${xpForNextLevel} XP`, color: 'from-green-400 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/10' },
    { icon: HiCurrencyDollar, label: t.dashboard.coins, value: user?.coins?.toLocaleString() || '0', sub: 'Coins earned', color: 'from-blue-400 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const subjectIcons = { mathematics: '🔢', science: '🔬', english: '📝', hindi: '🔤', social_studies: '🌍', computer_science: '💻', environmental_studies: '🌿' };
  const subjectColors = { mathematics: 'bg-blue-100 dark:bg-blue-900/20', science: 'bg-green-100 dark:bg-green-900/20', english: 'bg-purple-100 dark:bg-purple-900/20', hindi: 'bg-orange-100 dark:bg-orange-900/20', social_studies: 'bg-pink-100 dark:bg-pink-900/20', computer_science: 'bg-cyan-100 dark:bg-cyan-900/20', environmental_studies: 'bg-teal-100 dark:bg-teal-900/20' };

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        {/* Mobile sidebar toggle */}
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center hover:shadow-glow-green transition-shadow" id="sidebar-toggle">
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Welcome header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {t.dashboard.welcome}, <span className="text-gradient">{user?.name?.split(' ')[0]}!</span> 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t.dashboard.keepGoing}</p>
          </motion.div>

          {/* Stat cards */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <motion.div key={i} variants={item} whileHover={{ y: -2 }} className="card flex flex-col items-center text-center p-4 sm:p-5">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* XP Progress */}
          <motion.div variants={item} initial="hidden" animate="show" className="card mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <HiLightningBolt className="text-xp-gold" /> Level Progress
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{currentLevelXP} / {xpForNextLevel} XP</span>
            </div>
            <div className="xp-bar h-4">
              <motion.div className="xp-bar-fill" initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Level {user?.level || 1}</span>
              <span>Level {(user?.level || 1) + 1}</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recommended lessons */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-semibold text-gray-900 dark:text-white">{t.dashboard.recommended}</h2>
                <Link to="/learn" className="text-sm text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 hover:underline">
                  {t.dashboard.viewAll} <HiChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {lessons.map((lesson, i) => (
                  <motion.div key={lesson._id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -3 }}>
                    <Link to={`/learn/${lesson._id}`} className="card block p-4 h-full">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-xl ${subjectColors[lesson.subject] || 'bg-gray-100'} flex items-center justify-center text-2xl flex-shrink-0`}>
                          {subjectIcons[lesson.subject] || '📖'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{lesson.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{lesson.subject?.replace('_', ' ')} • Grade {lesson.grade}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><HiClock className="w-3 h-3" />{lesson.duration}min</span>
                            <span className="flex items-center gap-1 text-xp-gold"><HiStar className="w-3 h-3" />+{lesson.xpReward} XP</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Daily Challenge Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="mt-6 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 font-medium">{t.dashboard.dailyChallenge}</p>
                    <h3 className="font-heading text-xl font-bold mt-1">Complete 2 lessons today!</h3>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-sm"><HiStar className="w-4 h-4 text-yellow-300" />+200 XP</span>
                      <span className="flex items-center gap-1 text-sm"><HiCurrencyDollar className="w-4 h-4 text-yellow-300" />+50 Coins</span>
                    </div>
                  </div>
                  <div className="text-5xl">🎯</div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white/60 w-1/2 transition-all" />
                </div>
                <p className="text-xs text-white/70 mt-1.5">1 of 2 completed</p>
              </motion.div>
            </div>

            {/* Leaderboard */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-semibold text-gray-900 dark:text-white">{t.dashboard.leaderboard}</h2>
                <Link to="/leaderboard" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
                  {t.dashboard.viewAll}
                </Link>
              </div>
              <div className="card p-4">
                <div className="space-y-3">
                  {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                    <div key={entry._id || i} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${entry.isCurrentUser ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-surface-darker'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                        i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                        i === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-white' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : entry.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${entry.isCurrentUser ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                          {entry.name} {entry.isCurrentUser && '(You)'}
                        </p>
                        <p className="text-xs text-gray-400">Level {entry.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-xp-gold">{entry.xp?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">XP</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-gray-400 py-4 text-sm">Loading...</p>
                  )}
                </div>
              </div>

              {/* Achievements preview */}
              <div className="mt-6">
                <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-3">{t.dashboard.achievements}</h3>
                <div className="card p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {['🌱', '📚', '🔥', '⭐', '💰', '👑'].map((badge, i) => (
                      <motion.div key={i} whileHover={{ scale: 1.1 }}
                        className={`aspect-square rounded-xl flex items-center justify-center text-2xl ${
                          i < 3 ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-100 dark:bg-gray-800 opacity-40'
                        }`}>
                        {badge}
                      </motion.div>
                    ))}
                  </div>
                  <Link to="/achievements" className="block text-center text-sm text-primary-600 dark:text-primary-400 font-medium mt-3 hover:underline">
                    {t.dashboard.viewAll}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default StudentDashboard;
