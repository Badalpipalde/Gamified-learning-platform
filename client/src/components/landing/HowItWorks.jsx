import { useSelector } from 'react-redux';
import { selectT } from '../../store/languageSlice';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  const t = useSelector(selectT);

  const steps = [
    { icon: '📝', ...t.howItWorks.step1, color: 'from-blue-400 to-blue-600' },
    { icon: '📖', ...t.howItWorks.step2, color: 'from-green-400 to-green-600' },
    { icon: '🎮', ...t.howItWorks.step3, color: 'from-purple-400 to-purple-600' },
    { icon: '🚀', ...t.howItWorks.step4, color: 'from-orange-400 to-orange-600' },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-surface-darkest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t.howItWorks.title}
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-green-400 via-purple-400 to-orange-400 transform -translate-y-1/2 opacity-30" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative text-center"
              >
                {/* Step number */}
                <div className="relative inline-block mb-6">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center text-4xl shadow-lg mx-auto`}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-surface-dark shadow-md flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 border-2 border-gray-100 dark:border-gray-700">
                    {i + 1}
                  </div>
                </div>

                <h3 className="font-heading text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
