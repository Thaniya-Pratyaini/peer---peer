import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { clearStoredAuth, getStoredUser, setStoredUser } from '@/lib/auth-storage';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userState, setUserState] = useState<User | null>(() => getStoredUser());

  const setUser = (nextUser: User | null) => {
    setUserState(nextUser);
    setStoredUser(nextUser);
  };

  const logout = () => {
    clearStoredAuth();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user: userState, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
