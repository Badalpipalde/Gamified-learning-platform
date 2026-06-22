import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectT } from '../../store/languageSlice';
import { HiHeart } from 'react-icons/hi';

const Footer = () => {
  const t = useSelector(selectT);

  return (
    <footer className="bg-primary-700 dark:bg-surface-darkest text-white" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                ग
              </div>
              <span className="font-heading font-bold text-2xl">{t.appName}</span>
            </div>
            <p className="text-primary-200 dark:text-gray-400 max-w-md leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-primary-200 dark:text-gray-400 hover:text-white transition-colors">{t.nav.home}</Link></li>
              <li><Link to="/register" className="text-primary-200 dark:text-gray-400 hover:text-white transition-colors">{t.nav.register}</Link></li>
              <li><Link to="/login" className="text-primary-200 dark:text-gray-400 hover:text-white transition-colors">{t.nav.login}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">{t.footer.support}</h4>
            <ul className="space-y-2.5">
              <li><span className="text-primary-200 dark:text-gray-400 hover:text-white transition-colors cursor-pointer">{t.footer.faq}</span></li>
              <li><span className="text-primary-200 dark:text-gray-400 hover:text-white transition-colors cursor-pointer">{t.footer.contact}</span></li>
              <li><span className="text-primary-200 dark:text-gray-400 hover:text-white transition-colors cursor-pointer">{t.footer.privacy}</span></li>
              <li><span className="text-primary-200 dark:text-gray-400 hover:text-white transition-colors cursor-pointer">{t.footer.terms}</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-600 dark:border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-300 dark:text-gray-500 text-sm">
            © {new Date().getFullYear()} {t.appName}. {t.footer.rights}
          </p>
          <p className="text-primary-300 dark:text-gray-500 text-sm flex items-center gap-1">
            Made with <HiHeart className="w-4 h-4 text-red-400" /> for Rural India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
