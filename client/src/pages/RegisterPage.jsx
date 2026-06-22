import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { selectT } from '../store/languageSlice';
import { registerUser } from '../store/authSlice';
import Navbar from '../components/common/Navbar';
import PageTransition from '../components/common/PageTransition';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff, HiAcademicCap, HiClipboardList, HiUsers } from 'react-icons/hi';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [step, setStep] = useState(1); // 1: role, 2: form, 3: otp
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: '' });
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpSent } = useSelector((state) => state.auth);
  const t = useSelector(selectT);

  const roles = [
    { value: 'student', icon: HiAcademicCap, label: t.auth.student, desc: 'Learn, play, and grow', emoji: '🎓', color: 'from-green-400 to-emerald-500' },
    { value: 'teacher', icon: HiClipboardList, label: t.auth.teacher, desc: 'Create and teach', emoji: '📚', color: 'from-blue-400 to-indigo-500' },
    { value: 'parent', icon: HiUsers, label: t.auth.parent, desc: 'Track child progress', emoji: '👨‍👩‍👧', color: 'from-purple-400 to-pink-500' },
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const result = await dispatch(registerUser(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Account created! OTP: ' + result.payload.otp);
      setStep(3);
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  const handleOTPSubmit = () => {
    toast.success('Account verified!');
    const role = formData.role || 'student';
    navigate(role === 'teacher' ? '/teacher/dashboard' : role === 'parent' ? '/parent/dashboard' : '/student/dashboard');
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-16 pb-8 px-4 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-surface-darkest dark:via-surface-darkest dark:to-primary-900/10">
        <div className="absolute top-20 right-10 w-64 h-64 bg-accent-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
          <div className="glass-card p-8 sm:p-10">
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">ग</div>
                  <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white">{t.auth.registerTitle}</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{t.auth.selectRole}</p>
                </div>

                <div className="space-y-3">
                  {roles.map((role) => (
                    <motion.button
                      key={role.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setFormData({ ...formData, role: role.value }); setStep(2); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 bg-white dark:bg-surface-darker transition-all group"
                      id={`role-${role.value}`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                        {role.emoji}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">{role.label}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{role.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                  {t.auth.haveAccount}{' '}
                  <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">{t.auth.signInHere}</Link>
                </p>
              </>
            )}

            {/* Step 2: Registration Form */}
            {step === 2 && (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white">{t.auth.registerTitle}</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 capitalize">{t.auth.selectRole} {formData.role}</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t.auth.name}</label>
                    <div className="relative">
                      <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field pl-11" placeholder="Rahul Kumar" required id="register-name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t.auth.email}</label>
                    <div className="relative">
                      <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field pl-11" placeholder="rahul@gmail.com" required id="register-email" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t.auth.password}</label>
                    <div className="relative">
                      <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type={showPass ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input-field pl-11 pr-11" placeholder="••••••••" required minLength={6} id="register-password" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t.auth.confirmPassword}</label>
                    <div className="relative">
                      <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="input-field pl-11" placeholder="••••••••" required id="register-confirm" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 !py-2.5">{t.common.back}</button>
                    <motion.button type="submit" whileTap={{ scale: 0.98 }} disabled={loading}
                      className="btn-primary flex-1 !py-2.5 disabled:opacity-60" id="register-submit">
                      {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : t.auth.register}
                    </motion.button>
                  </div>
                </form>
              </>
            )}

            {/* Step 3: OTP Verification */}
            {step === 3 && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-accent mx-auto mb-4 flex items-center justify-center text-white text-3xl shadow-lg">📨</div>
                  <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">{t.auth.otpTitle}</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{t.auth.otpSubtitle}</p>
                </div>

                <div className="flex justify-center gap-3 mb-6">
                  {otp.map((digit, i) => (
                    <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                      onChange={(e) => handleOTPChange(i, e.target.value)}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-darker text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    />
                  ))}
                </div>

                <motion.button whileTap={{ scale: 0.98 }} onClick={handleOTPSubmit}
                  className="btn-primary w-full" id="otp-verify">
                  {t.auth.verify}
                </motion.button>

                <button className="w-full text-center mt-4 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
                  {t.auth.resendOTP}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default RegisterPage;
