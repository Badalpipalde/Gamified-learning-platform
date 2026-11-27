import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../img/logo.png';
import {
  LayoutDashboard,
  FileEdit,
  Gamepad2,
  Bot,
  Trophy,
  HelpCircle,
  Link as LinkIcon,
  Code,
  Users,
  Mail,
  GraduationCap,
  School,
  Sun,
  Moon,
  X
} from 'lucide-react';

// Navigation configs per role
const navConfig = {
  student: [
    { label: 'Dashboard', path: '/student', icon: <LayoutDashboard size={20} />, end: true },
    { label: 'Quizzes', path: '/student/quizzes', icon: <FileEdit size={20} /> },
    { label: 'Coding', path: '/student/coding', icon: <Code size={20} /> },
    { label: 'Mini Games', path: '/student/games', icon: <Gamepad2 size={20} /> },
    { label: 'Buzz AI', path: '/student/buzz-ai', icon: <Bot size={20} /> },
    { label: 'Leaderboard', path: '/student/leaderboard', icon: <Trophy size={20} /> },
    { label: 'Messages', path: '/student/doubts', icon: <HelpCircle size={20} /> },
    { label: 'Link Parent', path: '/student/link', icon: <LinkIcon size={20} /> },
  ],
  parent: [
    { label: 'Dashboard', path: '/parent', icon: <LayoutDashboard size={20} />, end: true },
    { label: 'Messages', path: '/parent/doubts', icon: <HelpCircle size={20} /> },
    { label: 'Link Child', path: '/parent/link', icon: <LinkIcon size={20} /> },
  ],
  teacher: [
    { label: 'Dashboard', path: '/teacher', icon: <LayoutDashboard size={20} />, end: true },
    { label: 'Students', path: '/teacher/students', icon: <Users size={20} /> },
    { label: 'Doubts', path: '/teacher/doubts', icon: <HelpCircle size={20} /> },
    { label: 'Messages', path: '/teacher/messages', icon: <Mail size={20} /> },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} />, end: true },
    { label: 'Teachers', path: '/admin/teachers', icon: <GraduationCap size={20} /> },
    { label: 'Classes', path: '/admin/classes', icon: <School size={20} /> },
  ],
};

function DashboardLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const links = navConfig[user?.role] || [];
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div className="sidebar-brand-logo">
              <img src={logo} alt="VidyaQuest" />
            </div>
            <span className="sidebar-brand-name">VidyaQuest</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ display: 'none' }} />
      </aside>

      {/* Top navbar */}
      <header className="navbar">
        <div className="navbar-left">
          <button
            className="navbar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>

          <div className="sidebar-brand-logo">
            <img src={logo} alt="VidyaQuest" />
          </div>
          <span className="sidebar-brand-name">VidyaQuest</span>
        </div>

        <div className="navbar-actions">
          <button
            type="button"
            className="navbar-theme-btn"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="navbar-profile-btn"
              aria-label="Account menu"
            >
              <div className="sidebar-avatar">{initials}</div>
              <div className="navbar-user-meta">
                <span className="navbar-user-name">{user?.name || 'Student'}</span>
                <span className="navbar-user-email">{user?.email || ''}</span>
              </div>
            </button>

            {profileOpen && (
              <div className="navbar-profile-dropdown">
                <div style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border-light)', marginBottom: 'var(--space-2)' }}>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>{user?.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>{user?.email}</div>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); navigate(`/${user?.role}/profile`); }}
                  style={{ width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--font-size-sm)', borderRadius: 'var(--radius-sm)' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Your Profile
                </button>
                <button
                  onClick={handleLogout}
                  style={{ width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--font-size-sm)', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="layout-main">
        {isOffline && (
          <div style={{
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            padding: 'var(--space-2) var(--space-4)',
            textAlign: 'center',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}>
            <span>⚠️</span> You are currently offline. Some features may not be available.
          </div>
        )}
        <div className="layout-content-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}
            >
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <Outlet />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
