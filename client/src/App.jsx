// src/App.jsx
import { useState } from 'react';
import LandingPage  from './pages/LandingPage';
import AuthPage     from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import './styles/globals.css';

const App = () => {
  const [page, setPage] = useState('landing'); // 'landing' | 'login' | 'dashboard'
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('landing');
  };

  if (page === 'dashboard' && user) {
    return <DashboardPage user={user} onLogout={handleLogout} />;
  }

  if (page === 'login') {
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  return <LandingPage onNavigate={setPage} />;
};

export default App;
