import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Sell } from './pages/Sell';

/**
 * Main App component with routing
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Owner-only app */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Sell />
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

