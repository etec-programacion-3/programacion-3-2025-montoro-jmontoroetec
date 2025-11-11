// frontend/src/api/auth.ts
import { api } from "./client";

export async function loginUser(email: string, password: string) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data; // { token, user }
}

export async function registerUser(
  email: string,
  password: string,
  nombre?: string,
  apellido?: string
) {
  const { data } = await api.post("/api/auth/register", {
    email,
    password,
    nombre,
    apellido,
  });
  return data;
}

export type AuthUser = {
  id: number;
  email: string;
  nombre?: string | null;
  apellido?: string | null;
};

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = {
  email: string;
  password: string;
  nombre?: string;
  apellido?: string;
};

const LS_TOKEN_KEY = "token";
const LS_USER_KEY = "authUser";

export function setToken(token: string) {
  localStorage.setItem(LS_TOKEN_KEY, token);
}
export function getToken(): string | null {
  return localStorage.getItem(LS_TOKEN_KEY);
}
export function clearToken() {
  localStorage.removeItem(LS_TOKEN_KEY);
}
export function setStoredUser(u: AuthUser | null) {
  if (!u) localStorage.removeItem(LS_USER_KEY);
  else localStorage.setItem(LS_USER_KEY, JSON.stringify(u));
}
export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(LS_USER_KEY);
  try {
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export async function apiLogin(payload: LoginPayload) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Credenciales inválidas");
  return (await res.json()) as { token: string; user: AuthUser };
}

export async function apiRegister(payload: RegisterPayload) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("No se pudo registrar");
  return (await res.json()) as { token: string; user: AuthUser };
}

