import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import { HiMenu, HiBookOpen, HiClock, HiChartBar, HiTrendingUp, HiStar, HiAcademicCap } from 'react-icons/hi';

const ParentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const t = useSelector(selectT);

  // Mock data for children
  const children = [
    {
      name: 'Rahul Kumar', level: 3, xp: 1250, streak: 7,
      lessonsCompleted: 8, totalLessons: 20, avgScore: 85, timeSpent: '12h 30m',
      weeklyData: { lessonsCompleted: 3, xpEarned: 250, timeSpent: '3h 45m', avgScore: 88 },
      recentLessons: [
        { title: 'Introduction to Numbers', subject: 'mathematics', score: 85, date: '2 days ago' },
        { title: 'Plants Around Us', subject: 'science', score: 90, date: '1 day ago' },
      ]
    },
    {
      name: 'Anita Devi', level: 2, xp: 980, streak: 3,
      lessonsCompleted: 5, totalLessons: 20, avgScore: 78, timeSpent: '8h 15m',
      weeklyData: { lessonsCompleted: 2, xpEarned: 160, timeSpent: '2h 30m', avgScore: 80 },
      recentLessons: [
        { title: 'English Alphabets', subject: 'english', score: 75, date: '3 days ago' },
      ]
    }
  ];

  const [selectedChild, setSelectedChild] = useState(0);
  const child = children[selectedChild];

  const subjectIcons = { mathematics: '🔢', science: '🔬', english: '📝' };

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center">
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t.parent.dashboard}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t.dashboard.welcome}, {user?.name}!</p>
          </motion.div>

          {/* Child selector */}
          <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide pb-2">
            {children.map((c, i) => (
              <button key={i} onClick={() => setSelectedChild(i)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap ${
                  selectedChild === i ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}>
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                  {c.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500">Level {c.level} • {c.xp} XP</p>
                </div>
              </button>
            ))}
          </div>

          {/* Child stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: HiBookOpen, label: t.parent.lessonsCompleted, value: `${child.lessonsCompleted}/${child.totalLessons}`, color: 'from-green-400 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/10' },
              { icon: HiClock, label: t.parent.timeSpent, value: child.timeSpent, color: 'from-blue-400 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
              { icon: HiChartBar, label: t.parent.avgScore, value: `${child.avgScore}%`, color: 'from-purple-400 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
              { icon: HiTrendingUp, label: t.dashboard.dailyStreak, value: `${child.streak} days`, color: 'from-orange-400 to-red-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="card flex flex-col items-center text-center p-5">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="font-heading text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Weekly Summary */}
            <div className="card">
              <h2 className="font-heading text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                📊 {t.parent.weeklySummary}
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Lessons Completed', value: child.weeklyData.lessonsCompleted, icon: '📖' },
                  { label: 'XP Earned', value: child.weeklyData.xpEarned, icon: '⭐' },
                  { label: 'Time Spent', value: child.weeklyData.timeSpent, icon: '⏱️' },
                  { label: 'Average Score', value: `${child.weeklyData.avgScore}%`, icon: '📈' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-surface-darker">
                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-lg">{item.icon}</span>{item.label}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent lessons */}
            <div className="card">
              <h2 className="font-heading text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                📚 Recent Lessons
              </h2>
              <div className="space-y-3">
                {child.recentLessons.map((lesson, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-surface-darker">
                    <span className="text-2xl">{subjectIcons[lesson.subject] || '📖'}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${lesson.score >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>{lesson.score}%</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Overall Progress</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{Math.round((child.lessonsCompleted / child.totalLessons) * 100)}%</span>
                </div>
                <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(child.lessonsCompleted / child.totalLessons) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ParentDashboard;
