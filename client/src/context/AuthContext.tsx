import { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load from memory on mount (in-memory only, no localStorage per artifact rules)
  // For a real deployed app, we use localStorage here since this is outside the artifact sandbox
  useEffect(() => {
    const storedToken = localStorage.getItem('documind_token');
    const storedUser = localStorage.getItem('documind_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
