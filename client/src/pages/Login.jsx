import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import '../assets/styles/pages/auth.css';

function Login() {
  // Fun animation variants for kiddish floating elements
  const floatVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const bounceVariants = {
    animate: {
      y: [0, -30, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      // Redirect based on role
      const routes = {
        student: '/student',
        parent: '/parent',
        teacher: '/teacher',
        admin: '/admin',
      };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-section">
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <img src="\src\img\logo.png" alt="logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
          </div>
          <span className="auth-brand-name">VidyaQuest</span>
        </div>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">
          Sign in to continue your learning journey
        </p>

        <div className="auth-card">
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>

      <div className="auth-hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Soft floating background elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'var(--color-primary)', opacity: '0.05', filter: 'blur(60px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '300px', height: '300px', background: 'var(--color-accent)', opacity: '0.05', filter: 'blur(60px)', borderRadius: '50%' }} />

        <motion.div
          variants={floatVariants}
          animate="animate"
          style={{ position: 'absolute', top: '15%', left: '20%', fontSize: '4rem', opacity: 0.8 }}
        >
          🚀
        </motion.div>

        <motion.div
          variants={bounceVariants}
          animate="animate"
          style={{ position: 'absolute', top: '25%', right: '15%', fontSize: '5rem', opacity: 0.6 }}
        >
          🌟
        </motion.div>

        <motion.div
          variants={floatVariants}
          animate="animate"
          style={{ position: 'absolute', bottom: '20%', left: '10%', fontSize: '4.5rem', opacity: 0.7, animationDelay: '1s' }}
        >
          🦖
        </motion.div>

        <motion.div
          variants={bounceVariants}
          animate="animate"
          style={{ position: 'absolute', bottom: '15%', right: '25%', fontSize: '3.5rem', opacity: 0.6, animationDelay: '0.5s' }}
        >
          🎈
        </motion.div>

        <motion.div
          variants={floatVariants}
          animate="animate"
          style={{ position: 'absolute', top: '50%', right: '5%', fontSize: '3rem', opacity: 0.5, animationDelay: '1.5s' }}
        >
          🎮
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          style={{ zIndex: 10, textAlign: 'center', maxWidth: '400px' }}
        >
          <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/src/img/logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>Learn, Play, Grow.</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)', lineHeight: 1.6 }}>
            VidyaQuest makes learning fun with gamified quizzes, coding
            challenges, and real-time progress tracking. Designed for every
            student, everywhere.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
