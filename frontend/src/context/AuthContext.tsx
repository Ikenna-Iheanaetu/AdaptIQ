import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe } from '@/api/authApi';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (jwtToken: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('adaptiq_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((userData) => setUser(userData))
      .catch(() => {
        // The axiosInstance 401 interceptor already removes the token from localStorage
        // and does a hard redirect to /login before this catch handler runs.
        // setToken(null) here handles non-401 failures (network error, 500, etc.)
        // and keeps React state consistent in case the redirect hasn't fired yet.
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = (jwtToken: string, userData: User) => {
    localStorage.setItem('adaptiq_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('adaptiq_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
