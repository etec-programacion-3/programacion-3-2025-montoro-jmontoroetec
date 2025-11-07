import axios from "axios";
import { getToken } from "./auth"; 
import type { Conversation, Message, Paged } from "../types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken?.(); 
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export async function fetchProducts(params?: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  if (params?.categoryId) q.set("categoryId", String(params.categoryId));

  const url = `/api/products${q.toString() ? `?${q.toString()}` : ""}`;
  const { data } = await api.get(url);
  return data;
}

export async function fetchProductById(id: number) {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
}

export async function startConversation(otherUserId: number) {
  const { data } = await api.post("/api/conversations", { otherUserId });
  return data; 
}

export async function listConversations(): Promise<Conversation[]> {
  const { data } = await api.get("/api/conversations");
  return Array.isArray(data) ? data : (data?.items ?? []);
}

export async function getMessages(
  conversationId: number,
  page = 1,
  pageSize = 50
): Promise<Message[] | Paged<Message>> {
  const { data } = await api.get(
    `/api/conversations/${conversationId}/messages`,
    { params: { page, pageSize } }
  );
  return data;
}

export async function sendMessage(
  conversationId: number,
  content: string
): Promise<Message> {
  const { data } = await api.post(
    `/api/conversations/${conversationId}/messages`,
    { content }
  );
  return data;
}
