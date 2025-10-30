const STORAGE_KEY = "token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
export function setToken(t: string) {
  localStorage.setItem(STORAGE_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(STORAGE_KEY);
}

import { api } from "./client";

export async function login(email: string, password: string) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data as { token: string; user: any };
}

export async function registerUser(payload: {
  nombre: string; apellido: string; email: string; password: string;
}) {
  const { data } = await api.post("/api/auth/register", payload);
  return data as { token: string; user: any };
}

export async function me() {
  const { data } = await api.get("/api/auth/me");
  return data; 
}
