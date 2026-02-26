import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const api = {
  getAllProducts: async () => {
    let response = await apiClient.get("/products");
    return response.data;
  },
  addProduct: async (product: any) => {
    let response = await apiClient.post("/products", product);
    return response.data;
  },
  updateProduct: async (id: string, product: any) => {
    let response = await apiClient.put(`/products/${id}`, product);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    let response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
