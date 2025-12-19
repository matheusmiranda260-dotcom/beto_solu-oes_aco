import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import { AuthState, Lead } from './types';

import { supabase } from './services/supabaseClient';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session);
      setIsLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session);
      if (session) {
        setShowLogin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setSessionUser = (session: any) => {
    if (session?.user) {
      // Extract username from metadata if saved, or email
      const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';

      setAuth({
        isAuthenticated: true,
        user: {
          id: session.user.id,
          username: username,
          email: session.user.email,
          role: 'gestor', // Default role for now, ideally fetch from profiles
          name: username.charAt(0).toUpperCase() + username.slice(1)
        }
      });
      // Try to fetch real role from profiles if needed
      fetchProfile(session.user.id);
    } else {
      setAuth({
        isAuthenticated: false,
        user: null
      });
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setAuth(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, role: data.role as any, username: data.username || prev.user.username } : null
      }));
    }
  };

  const handleLogin = (username: string) => {
    // This is now just a fallback callback, real auth is handled by session listener
    // We don't need to do anything here because the session listener will pick it up
  };

  const handleLogout = async () => {
    await authService.logout();
    setAuth({
      isAuthenticated: false,
      user: null
    });
    setShowLogin(false);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Carregando...</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <Dashboard
        username={auth.user?.name || 'Gestor'}
        onLogout={handleLogout}
        userRole={auth.user?.role} // Pass role to Dashboard
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
