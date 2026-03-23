export interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  title: string;
  category: string;
  description: string;
  price: number;
}

export interface UpdateProductDTO {
  title?: string;
  category?: string;
  description?: string;
  price?: number;
}

export interface ProductResponseDTO {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}