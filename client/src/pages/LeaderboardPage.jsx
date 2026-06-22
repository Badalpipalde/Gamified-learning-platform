import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HiMenu, HiTrendingUp, HiFire, HiStar } from 'react-icons/hi';
import api from '../utils/api';

const LeaderboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const t = useSelector(selectT);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/leaderboard?limit=20');
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.userRank || 0);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchLeaderboard();
  }, []);

  const podiumColors = [
    'from-yellow-400 to-amber-500',
    'from-gray-300 to-gray-400',
    'from-orange-400 to-amber-600'
  ];

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center">
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <HiTrendingUp className="text-primary-500" /> {t.dashboard.leaderboard}
            </h1>
            {userRank > 0 && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">Your rank: <span className="font-bold text-primary-600 dark:text-primary-400">#{userRank}</span></p>
            )}
          </motion.div>

          {loading ? <LoadingSpinner /> : (
            <>
              {/* Top 3 podium */}
              {leaderboard.length >= 3 && (
                <div className="flex items-end justify-center gap-4 mb-8">
                  {[1, 0, 2].map((idx) => {
                    const entry = leaderboard[idx];
                    const heights = ['h-32', 'h-24', 'h-20'];
                    const orders = ['order-2', 'order-1', 'order-3'];
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }}
                        className={`flex flex-col items-center ${orders[idx]}`}>
                        <div className="relative mb-2">
                          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${podiumColors[idx]} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                            {entry?.name?.charAt(0)}
                          </div>
                          <div className="absolute -top-2 -right-2 text-lg">{['🥇', '🥈', '🥉'][idx]}</div>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm text-center max-w-[80px] truncate">{entry?.name}</p>
                        <p className="text-xs text-xp-gold font-bold">{entry?.xp?.toLocaleString()} XP</p>
                        <div className={`w-20 sm:w-24 ${heights[idx]} mt-2 rounded-t-2xl bg-gradient-to-t ${podiumColors[idx]} opacity-20`} />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Full list */}
              <div className="card p-2">
                {leaderboard.map((entry, i) => (
                  <motion.div key={entry._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      entry.isCurrentUser ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' : 'hover:bg-gray-50 dark:hover:bg-surface-darker'
                    }`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                      i < 3 ? `bg-gradient-to-br ${podiumColors[i]} text-white` : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : entry.rank}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                      {entry.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${entry.isCurrentUser ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                        {entry.name} {entry.isCurrentUser && '(You)'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>Level {entry.level}</span>
                        <span className="flex items-center gap-0.5"><HiFire className="w-3 h-3 text-orange-400" />{entry.streak}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xp-gold flex items-center gap-1"><HiStar className="w-4 h-4" />{entry.xp?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">XP</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default LeaderboardPage;
