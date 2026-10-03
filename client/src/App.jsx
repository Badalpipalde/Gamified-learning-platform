import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/common/DashboardLayout';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import Quizzes from './pages/student/Quizzes';
import QuizPlay from './pages/student/QuizPlay';
import Leaderboard from './pages/student/Leaderboard';
import LinkParent from './pages/student/LinkParent';
import StudentDoubts from './pages/student/Doubts';
import CodingTrack from './pages/student/CodingTrack';
import GameHub from './pages/student/GameHub';
import GameEngine from './pages/student/GameEngine';
import BuzzAI from './pages/student/BuzzAI';
import StudentProfile from './pages/student/Profile';

// Parent pages
import ParentDashboard from './pages/parent/Dashboard';
import LinkChild from './pages/parent/LinkChild';
import ParentDoubts from './pages/parent/Doubts';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentManagement from './pages/teacher/StudentManagement';
import TeacherDoubts from './pages/teacher/Doubts';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import TeacherManagement from './pages/admin/TeacherManagement';
import ClassManagement from './pages/admin/ClassManagement';
import SubjectManagement from './pages/admin/SubjectManagement';
import QuizManagement from './pages/admin/QuizManagement';

import './App.css';

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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
