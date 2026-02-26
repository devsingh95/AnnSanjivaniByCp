import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SurplusPage from './pages/SurplusPage';
import TrackingPage from './pages/TrackingPage';
import ImpactPage from './pages/ImpactPage';
import AIDemo from './pages/AIDemo';
import { useAuthStore } from './store';
import { authAPI } from './api';

/* Guard: redirect to /login when not authenticated */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const { token, user, login, logout, setLoading } = useAuthStore();

  /* Recover user profile on mount if we have a token but no user */
  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      authAPI
        .me()
        .then((res) => {
          login(res.data, token);
        })
        .catch(() => {
          logout(); // token expired or invalid
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#f8fafc' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#f8fafc' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/surplus" element={<ProtectedRoute><SurplusPage /></ProtectedRoute>} />
        <Route path="/tracking" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
        <Route path="/impact" element={<ProtectedRoute><ImpactPage /></ProtectedRoute>} />
        <Route path="/ai-demo" element={<ProtectedRoute><AIDemo /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
