import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  adminUsername: string;
  login: (username: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  updatePassword: (oldPass: string, newPass: string) => { success: boolean; error?: string };
}

const AUTH_KEY = 'mq_dars_auth_persistent_v2';
const PASS_KEY = 'mq_dars_admin_pass_v1';
const DEFAULT_USER = 'admin';
const DEFAULT_PASS = 'madinul2026';

// Persistent Cookie Helpers (10-year device retention)
function getCookie(name: string): string | null {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  } catch {
    // ignore
  }
  return null;
}

function setCookie(name: string, value: string, days = 3650) {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

function deleteCookie(name: string) {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

function checkDeviceAuth(): boolean {
  try {
    const local = localStorage.getItem(AUTH_KEY);
    if (local === 'true') return true;
  } catch {
    // ignore
  }

  try {
    const cookie = getCookie(AUTH_KEY);
    if (cookie === 'true') return true;
  } catch {
    // ignore
  }

  return false;
}

function saveDeviceAuth(authenticated: boolean) {
  try {
    if (authenticated) {
      localStorage.setItem(AUTH_KEY, 'true');
      setCookie(AUTH_KEY, 'true', 3650);
    } else {
      localStorage.removeItem(AUTH_KEY);
      deleteCookie(AUTH_KEY);
    }
  } catch {
    // ignore
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Retains authentication permanently on device until explicit logout
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkDeviceAuth);
  const [adminUsername] = useState<string>(DEFAULT_USER);

  useEffect(() => {
    // Ensure default password is initialized on device
    try {
      if (!localStorage.getItem(PASS_KEY)) {
        localStorage.setItem(PASS_KEY, DEFAULT_PASS);
      }
    } catch {
      // ignore
    }

    // Refresh cookies to ensure 10-year retention if authenticated
    if (isAuthenticated) {
      saveDeviceAuth(true);
    }
  }, [isAuthenticated]);

  const login = (username: string, pass: string) => {
    let currentPass = DEFAULT_PASS;
    try {
      currentPass = localStorage.getItem(PASS_KEY) || DEFAULT_PASS;
    } catch {
      currentPass = DEFAULT_PASS;
    }

    const cleanUser = username.trim().toLowerCase();

    if (cleanUser === DEFAULT_USER && pass === currentPass) {
      setIsAuthenticated(true);
      saveDeviceAuth(true);
      return { success: true };
    }
    return { success: false, error: 'Invalid administrator credentials. Please check your username and password.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    saveDeviceAuth(false);
  };

  const updatePassword = (oldPass: string, newPass: string) => {
    let currentPass = DEFAULT_PASS;
    try {
      currentPass = localStorage.getItem(PASS_KEY) || DEFAULT_PASS;
    } catch {
      currentPass = DEFAULT_PASS;
    }

    if (oldPass !== currentPass) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    try {
      localStorage.setItem(PASS_KEY, newPass);
    } catch {
      // ignore
    }
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
