import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SurplusPage from './pages/SurplusPage';
import TrackingPage from './pages/TrackingPage';
import ImpactPage from './pages/ImpactPage';
import AIDemo from './pages/AIDemo';

function App() {
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/surplus" element={<SurplusPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/ai-demo" element={<AIDemo />} />
      </Routes>
    </Router>
  );
}

export default App;
