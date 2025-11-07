export type Category = {
  id: number;
  nombre: string;
}

export type Seller = {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
}

export type Product = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number | string; 
  stock: number;
  sellerId: number;
  creado_en?: string;
  actualizado_en?: string;
  categories?: Category[];
  seller?: Seller;
}

export type PagedProducts = {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
export type ConversationParticipant = {
  userId: number;
  user: { id: number; nombre: string; apellido: string; email: string };
  joinedAt: string;
};

export type Message = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;   // ISO
  sender?: { id: number; nombre: string; apellido: string; email: string };
};

export type Conversation = {
  id: number;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages?: Message[];
};

export type Paged<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
