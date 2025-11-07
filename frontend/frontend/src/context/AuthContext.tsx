import React, { createContext, useContext, useEffect, useState } from "react";
import {
  apiLogin,
  apiRegister,
  clearToken,
  getStoredUser,
  setStoredUser,
  setToken,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from "../api/auth";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (p: LoginPayload) => Promise<void>;
  register: (p: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [token, setTok] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // persistencia
    if (user) setStoredUser(user);
    else setStoredUser(null);
  }, [user]);

  async function login(payload: LoginPayload) {
    setLoading(true);
    try {
      const { token, user } = await apiLogin(payload);
      setTok(token);
      setToken(token);
      setUser(user);
    } finally {
      setLoading(false);
    }
  }

  async function register(payload: RegisterPayload) {
    setLoading(true);
    try {
      const { token, user } = await apiRegister(payload);
      setTok(token);
      setToken(token);
      setUser(user);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearToken();
    setTok(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider/>");
  return ctx;
}
