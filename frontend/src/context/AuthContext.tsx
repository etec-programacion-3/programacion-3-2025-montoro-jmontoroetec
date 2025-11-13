// frontend/src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  apiLogin,
  apiRegister,
  clearToken,
  decodeToken,
  getStoredUser,
  setStoredUser,
  setToken,
  type AuthUser,
  type RegisterPayload,
} from "../api/auth";

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  // hidratar desde token guardado (si no hay usuario en storage)
  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem("token");
      if (token) {
        const { userId, email } = decodeToken(token);
        if (userId && email) {
          const u: AuthUser = { id: userId, email };
          setUser(u);
          setStoredUser(u);
        }
      }
    }
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const { token, user: serverUser } = await apiLogin({ email, password });
      setToken(token);

      if (serverUser) {
        setStoredUser(serverUser);
        setUser(serverUser);
      } else {
        const { userId, email: e } = decodeToken(token);
        const u: AuthUser = { id: userId ?? 0, email: e ?? email };
        setStoredUser(u);
        setUser(u);
      }
    } finally {
      setLoading(false);
    }
  }

  async function register(data: RegisterPayload) {
    setLoading(true);
    try {
      const { token, user: serverUser } = await apiRegister(data);
      setToken(token);

      if (serverUser) {
        setStoredUser(serverUser);
        setUser(serverUser);
      } else {
        const { userId, email } = decodeToken(token);
        const u: AuthUser = { id: userId ?? 0, email: email ?? data.email };
        setStoredUser(u);
        setUser(u);
      }
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearToken();
    setStoredUser(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
