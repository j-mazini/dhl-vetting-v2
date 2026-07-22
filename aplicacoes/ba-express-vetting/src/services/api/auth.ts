// Authentication Service
import { apiClient, type ApiResponse } from './client';

export interface LoginRequest {
  provider: string;
  token?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  token: string;
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export const authService = {
  async googleLogin(tokenId: string): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post('/auth/google/callback', { tokenId });
  },

  async getCurrentUser(): Promise<ApiResponse<CurrentUserResponse>> {
    return apiClient.get('/auth/me');
  },

  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/logout');
  },

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post('/auth/refresh');
  },
};
