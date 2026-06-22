import { useSelector } from 'react-redux';
import { selectT } from '../../store/languageSlice';
import { motion } from 'framer-motion';
import { HiPuzzle, HiGlobeAlt, HiTranslate, HiChartBar, HiLightningBolt, HiUserGroup } from 'react-icons/hi';

const Features = () => {
  const t = useSelector(selectT);

  const features = [
    { icon: HiPuzzle, title: t.features.gamified.title, desc: t.features.gamified.desc, color: 'from-yellow-400 to-orange-400', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
    { icon: HiGlobeAlt, title: t.features.offline.title, desc: t.features.offline.desc, color: 'from-green-400 to-emerald-400', bg: 'bg-green-50 dark:bg-green-900/10' },
    { icon: HiTranslate, title: t.features.multilingual.title, desc: t.features.multilingual.desc, color: 'from-blue-400 to-cyan-400', bg: 'bg-blue-50 dark:bg-blue-900/10' },
    { icon: HiChartBar, title: t.features.progress.title, desc: t.features.progress.desc, color: 'from-purple-400 to-pink-400', bg: 'bg-purple-50 dark:bg-purple-900/10' },
    { icon: HiLightningBolt, title: t.features.interactive.title, desc: t.features.interactive.desc, color: 'from-red-400 to-rose-400', bg: 'bg-red-50 dark:bg-red-900/10' },
    { icon: HiUserGroup, title: t.features.community.title, desc: t.features.community.desc, color: 'from-teal-400 to-cyan-400', bg: 'bg-teal-50 dark:bg-teal-900/10' },
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-surface-darkest relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-300 dark:via-primary-700 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t.features.title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="card group cursor-default"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
