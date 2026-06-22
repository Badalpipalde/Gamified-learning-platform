import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import { loginUser, clearError } from '../store/authSlice';
import Navbar from '../components/common/Navbar';
import PageTransition from '../components/common/PageTransition';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const t = useSelector(selectT);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Welcome back!');
      const role = result.payload.user.role;
      navigate(role === 'teacher' ? '/teacher/dashboard' : role === 'parent' ? '/parent/dashboard' : '/student/dashboard');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-16 pb-8 px-4 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-surface-darkest dark:via-surface-darkest dark:to-primary-900/10">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md"
        >
          <div className="glass-card p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                ग
              </div>
              <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
                {t.auth.loginTitle}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{t.auth.loginSubtitle}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t.auth.email}</label>
                
                <div className="relative">
                  <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field pl-1"
                    placeholder="student@gramsiksha.com"
                    required
                    id="login-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t.auth.password}</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-11 pr-11"
                    placeholder="••••••••"
                    required
                    id="login-password"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                id="login-submit"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : t.auth.login}
              </motion.button>
            </form>

            {/* Demo info */}
            <div className="mt-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
              <p className="text-xs text-primary-700 dark:text-primary-400 font-medium text-center">
                Demo: student@gramsiksha.com / password123
              </p>
            </div>

            {/* Footer link */}
            <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
              {t.auth.noAccount}{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                {t.auth.signUpHere}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
