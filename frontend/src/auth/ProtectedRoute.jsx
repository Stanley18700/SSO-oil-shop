import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * ProtectedRoute component
 * Redirects to login if user is not authenticated
 * 
 * @param {React.Component} children - Component to render if authenticated
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-tablet text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return children;
};

