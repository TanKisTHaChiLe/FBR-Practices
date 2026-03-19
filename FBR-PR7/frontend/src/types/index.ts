export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  id: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  first_name: string;
  last_name: string;
  iat?: number;
  exp?: number;
}