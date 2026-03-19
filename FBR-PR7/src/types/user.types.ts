export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  createdAt: Date;
}

export interface TokenPayload {
  sub: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDTO;
}