import { useSelector } from 'react-redux';
import { selectT } from '../../store/languageSlice';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiPlay, HiArrowRight } from 'react-icons/hi';

const Hero = () => {
  const t = useSelector(selectT);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-surface-darkest dark:via-surface-darkest dark:to-primary-900/20" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-300/5 rounded-full blur-3xl" />

      {/* Floating elements */}
      <div className="absolute top-32 left-[15%] animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg flex items-center justify-center text-2xl">🏆</div>
      </div>
      <div className="absolute top-48 right-[20%] animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 shadow-lg flex items-center justify-center text-xl">📚</div>
      </div>
      <div className="absolute bottom-32 left-[25%] animate-float hidden lg:block" style={{ animationDelay: '4s' }}>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-400 shadow-lg flex items-center justify-center text-xl">⭐</div>
      </div>
      <div className="absolute bottom-48 right-[15%] animate-float hidden lg:block" style={{ animationDelay: '0.5s' }}>
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg flex items-center justify-center text-xl p-3">🎮</div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-semibold mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              {t.tagline}
            </motion.div>

            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              <span className="text-gray-900 dark:text-white">{t.hero.title.split(',')[0]},</span>
              <br />
              <span className="text-gradient">{t.hero.title.split(',')[1]},</span>
              <br />
              <span className="text-gray-900 dark:text-white">{t.hero.title.split(',')[2]}</span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
                  id="hero-cta"
                >
                  {t.hero.cta}
                  <HiArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-outline flex items-center gap-2 text-lg px-8 py-4 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                id="hero-demo"
              >
                <HiPlay className="w-5 h-5" />
                {t.hero.ctaSecondary}
              </motion.button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10 pt-8 border-t border-gray-200 dark:border-gray-800">
              {[
                { value: '10K+', label: 'Students' },
                { value: '500+', label: 'Lessons' },
                { value: '50+', label: 'Villages' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <p className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 font-heading">{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Illustration / Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main card */}
              <div className="glass-card p-6 rounded-3xl shadow-glass">
                <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl p-6 text-white mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-white/80">Welcome back!</p>
                      <p className="text-xl font-bold font-heading">Rahul Kumar</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">👋</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: '🔥', value: '7', label: 'Streak' },
                      { icon: '⭐', value: '1,250', label: 'XP' },
                      { icon: '🪙', value: '340', label: 'Coins' },
                    ].map(item => (
                      <div key={item.label} className="bg-white/10 rounded-xl p-3 text-center">
                        <span className="text-lg">{item.icon}</span>
                        <p className="font-bold text-sm mt-1">{item.value}</p>
                        <p className="text-xs text-white/70">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini lesson cards */}
                <div className="space-y-3">
                  {['Introduction to Numbers', 'Plants Around Us'].map((title, i) => (
                    <div key={title} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-surface-darker hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${i === 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                        {i === 0 ? '🔢' : '🌿'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                            <div className={`h-full rounded-full ${i === 0 ? 'bg-blue-500 w-full' : 'bg-green-500 w-3/4'}`} />
                          </div>
                          <span className="text-xs text-gray-500">{i === 0 ? '100%' : '75%'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 glass-card px-4 py-3 shadow-lg flex items-center gap-2"
              >
                <span className="text-2xl">🏅</span>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">Badge Unlocked!</p>
                  <p className="text-xs text-gray-500">Streak Master</p>
                </div>
              </motion.div>

              {/* Floating XP notification */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-2 -left-4 glass-card px-4 py-3 shadow-lg flex items-center gap-2"
              >
                <span className="text-xl">✨</span>
                <div>
                  <p className="text-xs font-bold text-xp-gold">+50 XP</p>
                  <p className="text-xs text-gray-500">Lesson complete</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
