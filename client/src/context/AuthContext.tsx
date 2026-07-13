import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface IUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: IUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ← Read from localStorage immediately — not in useEffect
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('documind_token');
  } catch {
    return null;
  }
};

const getStoredUser = (): IUser | null => {
  try {
    const stored = localStorage.getItem('documind_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ← Initialize directly from localStorage — no useEffect needed
  const [user, setUser] = useState<IUser | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);

  const login = (newToken: string, newUser: IUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('documind_token', newToken);
    localStorage.setItem('documind_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('documind_token');
    localStorage.removeItem('documind_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
