import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import { AuthState, Lead } from './types';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (username: string) => {
    setAuth({
      isAuthenticated: true,
      user: {
        username,
        role: 'gestor',
        name: username.charAt(0).toUpperCase() + username.slice(1)
      }
    });
    setShowLogin(false);
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      user: null
    });
    setShowLogin(false); // Return to landing page after logout
  };

  if (auth.isAuthenticated) {
    return (
      <Dashboard
        username={auth.user?.name || 'Gestor'}
        onLogout={handleLogout}
      />
    );
  }

  if (showLogin) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onBack={() => setShowLogin(false)}
      />
    );
  }

  return (
    <LandingPage onLoginClick={() => setShowLogin(true)} />
  );
};

export default App;
