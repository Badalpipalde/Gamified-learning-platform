import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to their own dashboard
    const dashboardMap = {
      student: '/student',
      parent: '/parent',
      teacher: '/teacher',
      admin: '/admin',
    };
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
  }

  return children;
}

export default ProtectedRoute;
