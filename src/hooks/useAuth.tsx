import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  role_id: number | null;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    console.log('useAuth: Checking for existing session...');
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      console.log('useAuth: Found stored user:', JSON.parse(storedUser));
      setUser(JSON.parse(storedUser));
    } else {
      console.log('useAuth: No stored user found');
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

      if (error) {
        return { error: { message: 'Database error occurred' } };
      }

      if (!users || users.length === 0) {
        return { error: { message: 'Invalid email or password' } };
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return { error: { message: 'Invalid email or password' } };
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = user;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      return { error: null };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const isAuthenticated = !!user;
  console.log('useAuth: isAuthenticated =', isAuthenticated, 'loading =', loading);

  return (
    <AuthContext.Provider value={{ 
      user, 
      signIn, 
      signOut, 
      isAuthenticated, 
      loading 
    }}>
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