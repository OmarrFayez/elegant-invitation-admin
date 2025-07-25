import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { setDatabaseContext } from '@/lib/auth-middleware';

interface User {
  user_id: number;
  email: string;
  name: string;
  role_id: number | null;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      // Set database context for RLS
      setDatabaseContext(userData.user_id);
    }
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    // Set database context for RLS
    await setDatabaseContext(userData.user_id);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    // Clear database context
    await setDatabaseContext(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};