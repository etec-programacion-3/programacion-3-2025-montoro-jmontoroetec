// frontend/src/api/client.ts
import axios from "axios";
import { getToken, clearToken } from "./auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Interceptor: agrega Authorization si hay token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// (Opcional) Si el backend devuelve 401, limpiamos sesión
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(err);
  }
);

// ------- HELPERS EXISTENTES -------
export async function fetchProducts(params?: {
  page?: number; pageSize?: number; categoryId?: number;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  if (params?.categoryId) q.set("categoryId", String(params.categoryId));

  const url = `/api/products${q.toString() ? `?${q}` : ""}`;
  const { data } = await api.get(url);
  return data;
}

export async function fetchProductById(id: number) {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
}

// Conversaciones (ya las venías usando)
export async function startConversation(otherUserId: number) {
  const { data } = await api.post(`/api/conversations`, { otherUserId });
  return data;
}
