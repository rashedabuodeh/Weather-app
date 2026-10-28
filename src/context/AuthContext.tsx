import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '@/services/firebase';

type AuthContextValue = {
  user: User | null;
  /** True until Firebase has restored any saved session. */
  initializing: boolean;
  /** False when Firebase isn't configured in .env.local. */
  isAvailable: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(auth !== null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setInitializing(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, isAvailable: auth !== null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
