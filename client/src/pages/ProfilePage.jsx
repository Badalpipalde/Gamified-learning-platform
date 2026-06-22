import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import { setLanguage } from '../store/languageSlice';
import { logout, updateUser } from '../store/authSlice';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import { HiMenu, HiUser, HiMail, HiPhone, HiGlobe, HiLogout, HiStar, HiCurrencyDollar, HiFire } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const t = useSelector(selectT);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <PageTransition>
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-16 lg:pl-64 min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-lg flex items-center justify-center">
          <HiMenu className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">{t.nav.profile}</h1>

          {/* Profile card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                  {user?.role === 'student' && (
                    <>
                      <span className="flex items-center gap-1 text-sm text-xp-gold font-semibold"><HiStar className="w-4 h-4" />{user?.xp} XP</span>
                      <span className="flex items-center gap-1 text-sm text-accent-400 font-semibold"><HiCurrencyDollar className="w-4 h-4" />{user?.coins}</span>
                      <span className="flex items-center gap-1 text-sm text-orange-400 font-semibold"><HiFire className="w-4 h-4" />{user?.streak?.current}d</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info cards */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-surface-darker">
                  <HiUser className="w-5 h-5 text-gray-400" />
                  <div><p className="text-xs text-gray-500">Name</p><p className="font-medium text-gray-900 dark:text-white">{user?.name}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-surface-darker">
                  <HiMail className="w-5 h-5 text-gray-400" />
                  <div><p className="text-xs text-gray-500">Email</p><p className="font-medium text-gray-900 dark:text-white">{user?.email}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-surface-darker">
                  <HiGlobe className="w-5 h-5 text-gray-400" />
                  <div><p className="text-xs text-gray-500">Role</p><p className="font-medium text-gray-900 dark:text-white capitalize">{user?.role}</p></div>
                </div>
              </div>
            </div>

            <button onClick={() => { dispatch(logout()); navigate('/'); }}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
              <HiLogout className="w-5 h-5" /> {t.nav.logout}
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
