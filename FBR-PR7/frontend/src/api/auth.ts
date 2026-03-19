import { apiClient } from "./axios";
import { AuthResponse, LoginDTO, RegisterDTO } from "../types";

export const authApi = {
  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};
