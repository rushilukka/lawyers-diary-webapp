import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AddCase from './pages/AddCase';
import ViewCase from './pages/ViewCase';
import Analytics from './pages/Analytics';
import AppNavbar from './components/AppNavbar';
import InstallPrompt from './components/InstallPrompt';
import { authApi } from './api/auth';

function AppLayout() {
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authApi.getMe();
        // Update stored user info
        localStorage.setItem('user', JSON.stringify({
          name: user.name,
          email: user.email,
        }));
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  if (!authChecked) {
    return (
      <div className="full-height-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const hideNavbar = location.pathname === '/login';

  return (
    <>
      {!hideNavbar && <AppNavbar />}
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" replace />} />
        <Route path="/add-case" element={isAuthenticated ? <AddCase /> : <Navigate to="/login" replace />} />
        <Route path="/case/:id" element={isAuthenticated ? <ViewCase /> : <Navigate to="/login" replace />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
      <InstallPrompt />
    </Router>
  );
}

export default App;
