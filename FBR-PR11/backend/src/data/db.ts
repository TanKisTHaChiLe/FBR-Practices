import { User } from "../types/user.types";
import { Product } from "../types/product.types";

export const users: User[] = [];
export const products: Product[] = [];

export const findUserByEmail = (email: string): User | undefined => {
  return users.find((user) => user.email === email);
};

export const findUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};

export const findProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const findProductsByUserId = (userId: string): Product[] => {
  return products.filter((product) => product.userId === userId);
};