// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { clearToken, getToken, setToken, login as apiLogin, registerUser, me } from "../api/auth";

type User = {
  id: number;
  email: string;
  nombre?: string;
  apellido?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { nombre: string; apellido: string; email: string; password: string; }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Al iniciar, si hay token, cargo el perfil
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      try {
        const u = await me();
        setUser(u);
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const { token, user } = await apiLogin(email, password);
      setToken(token);
      setUser(user);
    } finally {
      setLoading(false);
    }
  }

  async function register(payload: { nombre: string; apellido: string; email: string; password: string; }) {
    setLoading(true);
    try {
      const { token, user } = await registerUser(payload);
      setToken(token);
      setUser(user);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
