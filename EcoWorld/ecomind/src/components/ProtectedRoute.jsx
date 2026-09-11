import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Gates a route behind sign-in, and optionally behind specific roles.
 * Usage: <ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>
 * Admins are always allowed through role-gated routes too (simulation mode).
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user, needsRoleChoice } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100svh' }}>
        <div className="spinner-ring" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (needsRoleChoice) {
    return <Navigate to="/choose-role" replace />;
  }

  if (roles && roles.length > 0 && user.role !== 'admin' && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
