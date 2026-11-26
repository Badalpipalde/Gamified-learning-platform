import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/common/DashboardLayout';

// Auth pages (eager for instant initial paint)
import Login from './pages/Login';
import Register from './pages/Register';

// Student pages (lazy-loaded route chunks)
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const Quizzes = lazy(() => import('./pages/student/Quizzes'));
const QuizPlay = lazy(() => import('./pages/student/QuizPlay'));
const Leaderboard = lazy(() => import('./pages/student/Leaderboard'));
const LinkParent = lazy(() => import('./pages/student/LinkParent'));
const StudentDoubts = lazy(() => import('./pages/student/Doubts'));
const CodingTrack = lazy(() => import('./pages/student/CodingTrack'));
const GameHub = lazy(() => import('./pages/student/GameHub'));
const GameEngine = lazy(() => import('./pages/student/GameEngine'));
const BuzzAI = lazy(() => import('./pages/student/BuzzAI'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));

// Parent pages
const ParentDashboard = lazy(() => import('./pages/parent/Dashboard'));
const LinkChild = lazy(() => import('./pages/parent/LinkChild'));
const ParentDoubts = lazy(() => import('./pages/parent/Doubts'));

// Teacher pages
const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'));
const StudentManagement = lazy(() => import('./pages/teacher/StudentManagement'));
const TeacherDoubts = lazy(() => import('./pages/teacher/Doubts'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const TeacherManagement = lazy(() => import('./pages/admin/TeacherManagement'));
const ClassManagement = lazy(() => import('./pages/admin/ClassManagement'));
const SubjectManagement = lazy(() => import('./pages/admin/SubjectManagement'));
const QuizManagement = lazy(() => import('./pages/admin/QuizManagement'));

import './App.css';

function RouteFallback() {
  return (
    <div className="page-container">
      <div className="loader">
        <div className="spinner"></div>
      </div>
    </div>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const routes = {
    student: '/student',
    parent: '/parent',
    teacher: '/teacher',
    admin: '/admin',
  };

  return <Navigate to={routes[user.role] || '/login'} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Student routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute roles={['student']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="quizzes" element={<Quizzes />} />
              <Route path="quiz/:id" element={<QuizPlay />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="link" element={<LinkParent />} />
              <Route path="doubts" element={<StudentDoubts />} />
              <Route path="coding" element={<CodingTrack />} />
              <Route path="games" element={<GameHub />} />
              <Route path="games/:gameSlug" element={<GameEngine />} />
              <Route path="buzz-ai" element={<BuzzAI />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>

            {/* Parent routes */}
            <Route
              path="/parent"
              element={
                <ProtectedRoute roles={['parent']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ParentDashboard />} />
              <Route path="link" element={<LinkChild />} />
              <Route path="doubts" element={<ParentDoubts />} />
            </Route>

            {/* Teacher routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute roles={['teacher']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TeacherDashboard />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="doubts" element={<TeacherDoubts />} />
            </Route>

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="teachers" element={<TeacherManagement />} />
              <Route path="classes" element={<ClassManagement />} />
              <Route path="subjects" element={<SubjectManagement />} />
              <Route path="quizzes" element={<QuizManagement />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
