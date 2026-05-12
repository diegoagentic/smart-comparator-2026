import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  isAllowedDomain,
  getDomainError,
  validatePassword,
} from '../lib/auth-utils';

// --- Mock User Type (mirrors Supabase User shape used by consumers) ---

interface MockUser {
  id: string;
  email: string;
  user_metadata: { full_name: string };
}

// --- Demo Credentials ---

const DEMO_ACCOUNTS: Record<string, { password: string; fullName: string }> = {
  'demo@agenticdream.com': { password: 'StrataDemo2026!', fullName: 'Demo User' },
  'test@goavanto.com': { password: 'StrataDemo2026!', fullName: 'Test User' },
};

const STORAGE_KEY = 'strata-demo-auth';

function createMockUser(email: string): MockUser {
  const account = DEMO_ACCOUNTS[email.toLowerCase()];
  return {
    id: `demo-${email.replace(/[@.]/g, '-')}`,
    email: email.toLowerCase(),
    user_metadata: { full_name: account?.fullName ?? email.split('@')[0] },
  };
}

// --- Types ---

interface AuthState {
  session: { user: MockUser } | null;
  user: MockUser | null;
  initialLoading: boolean;
  error: string | null;
  showSessionWarning: boolean;
  authEvent: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  validateCredentials: (email: string, password: string) => { valid: boolean; error?: string };
  completeMfaLogin: (email: string) => void;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  signInWithMicrosoft: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  dismissSessionWarning: () => void;
  clearError: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

type AuthContextType = AuthState & AuthActions;

// --- Context ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MockUser;
        if (parsed?.email) {
          setUser(parsed);
        }
      }
    } catch {
      // Corrupted storage — ignore
    }
    setInitialLoading(false);
  }, []);

  const validateCredentials = (email: string, password: string) => {
    const domainError = getDomainError(email);
    if (domainError) return { valid: false, error: domainError };
    const account = DEMO_ACCOUNTS[email.toLowerCase()];
    if (!account || account.password !== password) {
      return { valid: false, error: 'Invalid email or password. Please try again.' };
    }
    return { valid: true };
  };

  const completeMfaLogin = (email: string) => {
    const mockUser = createMockUser(email);
    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
  };

  const signIn = async (email: string, password: string) => {
    setError(null);

    const domainError = getDomainError(email);
    if (domainError) {
      setError(domainError);
      return { success: false, error: domainError };
    }

    const account = DEMO_ACCOUNTS[email.toLowerCase()];
    if (!account || account.password !== password) {
      const msg = 'Invalid email or password. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    }

    const mockUser = createMockUser(email);
    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    return { success: true };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setError(null);

    const domainError = getDomainError(email);
    if (domainError) {
      setError(domainError);
      return { success: false, error: domainError };
    }

    const pwValidation = validatePassword(password);
    if (!pwValidation.isValid) {
      const msg = 'Password does not meet all requirements.';
      setError(msg);
      return { success: false, error: msg };
    }

    // In demo mode, just log them in directly
    const mockUser: MockUser = {
      id: `demo-${email.replace(/[@.]/g, '-')}`,
      email: email.toLowerCase(),
      user_metadata: { full_name: fullName },
    };
    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    return { success: true, needsVerification: false };
  };

  const signInWithMicrosoft = async () => {
    // Simulate Microsoft login — auto-login as goavanto user
    const mockUser = createMockUser('test@goavanto.com');
    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    return { success: true };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const refreshSession = async () => {
    // No-op for demo — session doesn't expire
  };

  const dismissSessionWarning = useCallback(() => {}, []);
  const clearError = useCallback(() => setError(null), []);

  const resetPassword = async (email: string) => {
    setError(null);
    if (!email || !isAllowedDomain(email)) {
      const msg = 'Access is restricted to authorized organization emails only.';
      setError(msg);
      return { success: false, error: msg };
    }
    return { success: true };
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return { success: false, error: 'Not authenticated.' };
    const account = DEMO_ACCOUNTS[user.email];
    if (!account || account.password !== currentPassword) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return { success: false, error: 'New password does not meet all requirements.' };
    }
    account.password = newPassword;
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{
      session: user ? { user } : null,
      user,
      initialLoading,
      error,
      showSessionWarning: false,
      authEvent: null,
      signIn, validateCredentials, completeMfaLogin, signUp, signInWithMicrosoft, signOut, refreshSession,
      dismissSessionWarning, clearError, resetPassword, changePassword,
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
