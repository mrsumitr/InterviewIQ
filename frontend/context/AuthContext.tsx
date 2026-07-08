'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'interviewer' | 'interviewee';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
