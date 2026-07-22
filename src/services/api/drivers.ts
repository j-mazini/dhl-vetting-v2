// Drivers Service
import { apiClient, type ApiResponse } from './client';

export interface Driver {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  currentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverStatus {
  status: string;
  updatedAt: string;
  slaExpiredAt?: string;
}

export interface DriverHistory {
  id: string;
  fromState: string;
  toState: string;
  action: string;
  reason?: string;
  createdAt: string;
}

export interface CreateDriverRequest {
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  rtwDocumentType: string;
  rtwDocumentNumber: string;
  rtwExpirationDate: string;
  dvlaType: string;
  dvlaNumber: string;
  dvlaExpirationDate: string;
  yearsOfExperience: number;
}

export interface UpdateDriverRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export const driverService = {
  async create(
    data: CreateDriverRequest
  ): Promise<ApiResponse<Driver>> {
    return apiClient.post('/drivers', data, true);
  },

  async getById(driverId: string): Promise<ApiResponse<Driver>> {
    return apiClient.get(`/drivers/${driverId}`, true);
  },

  async update(
    driverId: string,
    data: UpdateDriverRequest
  ): Promise<ApiResponse<Driver>> {
    return apiClient.put(`/drivers/${driverId}`, data, true);
  },

  async getStatus(driverId: string): Promise<ApiResponse<DriverStatus>> {
    return apiClient.get(`/drivers/${driverId}/status`, true);
  },

  async getHistory(driverId: string): Promise<ApiResponse<DriverHistory[]>> {
    return apiClient.get(`/drivers/${driverId}/history`, true);
  },

  async uploadDocument(
    driverId: string,
    file: File,
    documentType: string
  ): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    // Use fetch directly for FormData
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/drivers/${driverId}/documents`,
      {
        method: 'POST',
        body: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      return {
        error: 'Document upload failed',
        statusCode: response.status,
      };
    }

    return { data: await response.json() };
  },

  async getDocuments(
    driverId: string
  ): Promise<ApiResponse<Array<{ id: string; url: string; type: string; uploadedAt: string }>>> {
    return apiClient.get(`/drivers/${driverId}/documents`, true);
  },
};
