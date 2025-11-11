// frontend/frontend/src/types.ts

// ---------- Productos ----------
export interface Category {
  id: number;
  nombre: string;
}

export interface ProductSeller {
  id: number;
  email: string;
  nombre?: string;
  apellido?: string;
}

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number | string;
  stock: number;
  sellerId: number;
  seller?: ProductSeller;
  categories?: Category[];
}

// ---------- Paginación genérica ----------
export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ---------- Chat / Mensajes ----------
export interface Conversation {
  id: number;
  createdAt: string;
  updatedAt: string;
  // usuario "del otro lado" calculado en backend o frontend
  otherUser?: {
    id: number;
    nombre?: string;
    apellido?: string;
    email: string;
  };
  lastMessage?: Message;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isMine?: boolean;
}
