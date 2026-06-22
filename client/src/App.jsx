import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { setTheme } from './store/themeSlice';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import LearningModule from './pages/LearningModule';
import CommunityPage from './pages/CommunityPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import ModulesPage from './pages/ModulesPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import ModuleSubjectPage from './pages/ModuleSubjectPage';
import QuizzesPage from './pages/QuizzesPage';
import QnAPage from './pages/QnAPage';
import StudentInputPage from './pages/StudentInputPage';
import NCERTSubjectPage from './pages/NCERTSubjectPage';
import NCERTChapterPage from './pages/NCERTChapterPage';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  // Auto redirect based on role
  const getDashboardRedirect = () => {
    if (!isAuthenticated) return '/';
    const map = { student: '/student/dashboard', teacher: '/teacher/dashboard', parent: '/parent/dashboard' };
    return map[user?.role] || '/student/dashboard';
  };

  return (
    <Router>
      <div className={`${mode === 'dark' ? 'dark' : ''}`}>
        <div className="min-h-screen bg-surface-DEFAULT dark:bg-surface-darkest text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: mode === 'dark' ? '#1E3A2F' : '#fff',
                color: mode === 'dark' ? '#D8F3DC' : '#1B4332',
                borderRadius: '12px',
                border: mode === 'dark' ? '1px solid #2D6A4F' : '1px solid #E5E7EB',
              },
            }}
          />

          <Routes>
            {/* Public */}
            <Route path="/" element={isAuthenticated ? <Navigate to={getDashboardRedirect()} /> : <LandingPage />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to={getDashboardRedirect()} /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to={getDashboardRedirect()} /> : <RegisterPage />} />

            {/* Student */}
            <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/learn" element={<ProtectedRoute><LearningModule /></ProtectedRoute>} />
            <Route path="/learn/:id" element={<ProtectedRoute><LearningModule /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/quizzes" element={<ProtectedRoute><QuizzesPage /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/modules" element={<ProtectedRoute><ModulesPage /></ProtectedRoute>} />
            <Route path="/modules/:grade" element={<ProtectedRoute><ModuleDetailPage /></ProtectedRoute>} />
            <Route path="/modules/:grade/:subject" element={<ProtectedRoute><ModuleSubjectPage /></ProtectedRoute>} />
            <Route path="/modules/:grade/:subject/ncert" element={<ProtectedRoute><NCERTSubjectPage /></ProtectedRoute>} />
            <Route path="/modules/:grade/:subject/ncert/:chapterId" element={<ProtectedRoute><NCERTChapterPage /></ProtectedRoute>} />
            <Route path="/qna" element={<ProtectedRoute><QnAPage /></ProtectedRoute>} />
            <Route path="/qna/:id" element={<ProtectedRoute><QnAPage /></ProtectedRoute>} />
            <Route path="/my-inputs" element={<ProtectedRoute roles={['student']}><StudentInputPage /></ProtectedRoute>} />

            {/* Teacher */}
            <Route path="/teacher/dashboard" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/lessons" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/quizzes" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/students" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/analytics" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />

            {/* Parent */}
            <Route path="/parent/dashboard" element={<ProtectedRoute roles={['parent']}><ParentDashboard /></ProtectedRoute>} />
            <Route path="/parent/progress" element={<ProtectedRoute roles={['parent']}><ParentDashboard /></ProtectedRoute>} />
            <Route path="/parent/summary" element={<ProtectedRoute roles={['parent']}><ParentDashboard /></ProtectedRoute>} />

            {/* Shared */}
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
