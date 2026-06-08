'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../lib/api';

export type User = {
  id: string;
  email: string;
  isAlumno: boolean;
  isProfesor: boolean;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('ag-cursos-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setToken(parsed.token);
    }
  }, []);

  const saveSession = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('ag-cursos-auth', JSON.stringify({ user, token }));
  };

  const login = async (email: string, password: string) => {
    const res = await fetch('${API_URL}/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Credenciales inválidas');
    const data = await res.json();
    saveSession(data.user, data.access_token);
  };

  const register = async (email: string, password: string) => {
    const res = await fetch('${API_URL}/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('El email ya está registrado');
    const data = await res.json();
    saveSession(data.user, data.access_token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ag-cursos-auth');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
