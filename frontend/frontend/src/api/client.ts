import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
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

  const url = `/api/products${q.toString() ? `?${q}` : ""}`;

  const { data } = await api.get(url);

  const items = Array.isArray(data)
    ? data
    : Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.data)
    ? data.data
    : [];

  const meta = Array.isArray(data) ? undefined : data.meta;

  return meta ? { items, meta } : items;
}

export async function fetchProductById(id: number) {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
}

export async function startConversation(otherUserId: number, token: string) {
  const { data } = await api.post(
    "/api/conversations",
    { otherUserId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data; 
}
