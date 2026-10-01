import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  adminUsername: string;
  login: (username: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  updatePassword: (oldPass: string, newPass: string) => { success: boolean; error?: string };
}

const AUTH_KEY = 'mq_dars_auth_state_v1';
const PASS_KEY = 'mq_dars_admin_pass_v1';
const DEFAULT_USER = 'admin';
const DEFAULT_PASS = 'madinul2026';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [adminUsername] = useState<string>(DEFAULT_USER);

  useEffect(() => {
    // initialize default password if not set
    if (!localStorage.getItem(PASS_KEY)) {
      localStorage.setItem(PASS_KEY, DEFAULT_PASS);
    }
  }, []);

  const login = (username: string, pass: string) => {
    const currentPass = localStorage.getItem(PASS_KEY) || DEFAULT_PASS;
    const cleanUser = username.trim().toLowerCase();

    if (cleanUser === DEFAULT_USER && pass === currentPass) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      return { success: true };
    }
    return { success: false, error: 'Invalid administrator credentials. Please check your username and password.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  };

  const updatePassword = (oldPass: string, newPass: string) => {
    const currentPass = localStorage.getItem(PASS_KEY) || DEFAULT_PASS;
    if (oldPass !== currentPass) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }
    localStorage.setItem(PASS_KEY, newPass);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        adminUsername,
        login,
        logout,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
