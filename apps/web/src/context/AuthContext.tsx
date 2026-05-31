import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient } from '../services/api.js';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  xp: number;
  level: number;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (localUser && token) {
      setUser(JSON.parse(localUser));
    }
    setLoading(false);

    const handleSessionExpiry = () => {
      setUser(null);
    };

    window.addEventListener('auth-session-expired', handleSessionExpiry);
    return () => window.removeEventListener('auth-session-expired', handleSessionExpiry);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await ApiClient.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      await ApiClient.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await ApiClient.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // clear session even if network call fails
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
};
