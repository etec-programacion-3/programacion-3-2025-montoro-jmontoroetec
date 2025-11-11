// frontend/frontend/src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  apiLogin,
  apiRegister,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
  getStoredUser,
  setStoredUser,
  setToken,
  clearToken,
} from "../api/auth";

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // leer usuario almacenado al inicio
  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const { token, user } = await apiLogin(payload);
      setToken(token);
      setStoredUser(user);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      const { token, user } = await apiRegister(payload);
      setToken(token);
      setStoredUser(user);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setStoredUser(null);
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
