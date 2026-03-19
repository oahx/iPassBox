import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isFirstTime: boolean;
  isLocked: boolean;
  login: (password: string) => Promise<boolean>;
  setMasterPassword: (password: string) => Promise<boolean>;
  lock: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        await window.electronAPI.ping();
        
        const firstTime = await window.electronAPI.checkFirstTime();
        setIsFirstTime(firstTime);
      } catch (error) {
        console.error('Failed to check first time:', error);
      }
    };

    checkFirstTime();
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const result = await window.electronAPI.unlock(password);
      if (result) {
        setIsAuthenticated(true);
        setIsLocked(false);
      }
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  const setMasterPassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      const result = await window.electronAPI.setMasterPassword(password);
      if (result) {
        setIsAuthenticated(true);
        setIsFirstTime(false);
      }
      return result;
    } catch (error) {
      console.error('Set master password failed:', error);
      return false;
    }
  }, []);

  const lock = useCallback(async () => {
    try {
      await window.electronAPI.lock();
      setIsLocked(true);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Lock failed:', error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isFirstTime, isLocked, login, setMasterPassword, lock }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
