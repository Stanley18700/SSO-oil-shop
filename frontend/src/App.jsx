import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerView } from './pages/CustomerView';
import { MixCalculator } from './pages/MixCalculator';

/**
 * Main App component with routing
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<CustomerView />} />
          <Route path="/calculator" element={<MixCalculator />} />
          <Route path="/login" element={<Login />} />

          {/* Protected admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

