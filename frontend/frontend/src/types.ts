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
