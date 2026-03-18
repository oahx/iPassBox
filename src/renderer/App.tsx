import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nProvider, useI18n } from './context/I18nContext';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage.tsx';
import './styles/App.css';

function AppContent() {
  const { isAuthenticated, isFirstTime, isLocked } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleActivity = () => {
      window.electronAPI?.reportActivity();
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  useEffect(() => {
    const handleLocked = () => {
      window.location.reload();
    };
    
    const unsubscribe = window.electronAPI?.onLocked(handleLocked);
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  if (!isAuthenticated || isLocked) {
    return <LoginPage isFirstTime={isFirstTime} />;
  }

  return <MainPage />;
}

function App() {
  return (
    <AuthProvider>
      <I18nProvider>
        <AppContent />
      </I18nProvider>
    </AuthProvider>
  );
}

export default App;
