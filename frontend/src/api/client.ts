import axios from "axios";
import { getToken } from "./auth";
import type { Product } from "../types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export async function fetchProducts(params?: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
}) {
  const { data } = await api.get("/api/products", { params });

  if (Array.isArray(data)) return { items: data, meta: undefined };
  if (data && Array.isArray(data.items)) return { items: data.items, meta: data.meta };
  if (data && Array.isArray(data.data)) return { items: data.data, meta: data.meta };

  return { items: [], meta: undefined };
}

export async function fetchProductById(id: number): Promise<Product | null> {
  const { data } = await api.get(`/api/products/${id}`);

  if (data && typeof data === "object" && "id" in data) {
    return data as Product;
  }
  if (data?.product && typeof data.product === "object") {
    return data.product as Product;
  }
  if (data?.data && typeof data.data === "object") {
    return data.data as Product;
  }
  return null;
}

export async function getConversations(page = 1, pageSize = 50) {
  const { data } = await api.get("/api/conversations", { params: { page, pageSize } });
  return data;
}
export async function getMessages(conversationId: number, page = 1, pageSize = 50) {
  const { data } = await api.get(`/api/conversations/${conversationId}/messages`, {
    params: { page, pageSize },
  });
  return data;
}
export async function sendMessage(conversationId: number, content: string) {
  const { data } = await api.post(`/api/conversations/${conversationId}/messages`, { content });
  return data;
}
export async function startConversation(otherUserId: number) {
  const { data } = await api.post(`/api/conversations`, { otherUserId });
  return data;
}
