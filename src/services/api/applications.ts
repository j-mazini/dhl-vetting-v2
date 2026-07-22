// Applications API Service — usa backend ao invés de Firestore direto
import { apiClient, type ApiResponse } from './client';

export interface ApplicationSubmission {
  fullName: string;
  email: string;
  phone: string;
  roleCategory: string;
  dateOfBirth: string;
  address: string;
  postcode: string;
  nin: string;
  rtwType: string;
  rtwNumber: string;
  rtwExpiry: string;
  rtwNationality?: string;
  rtwShareCode?: string;
  dvlaType?: string;
  dvlaNumber?: string;
  dvlaExpiry?: string;
  dvlaShareCode?: string;
  dvlaCountry?: string;
  yearsOfExperience?: number;
  insuranceException?: boolean;
}

export const applicationsService = {
  async submitApplication(
    data: ApplicationSubmission
  ): Promise<ApiResponse<{ id: string; status: string; reference: string }>> {
    try {
      return await apiClient.post('/applications/submit', data, false);
    } catch (error) {
      // Fallback para Firestore se API não estiver disponível
      console.warn('[applicationsService] API unavailable, attempting Firestore fallback', error);
      return {
        error: 'Service temporarily unavailable. Please try again in a moment.',
        statusCode: 503,
      };
    }
  },

  async getApplicationStatus(
    applicationId: string
  ): Promise<ApiResponse<{ status: string; stage: string; updatedAt: string }>> {
    return apiClient.get(`/applications/${applicationId}/status`, false);
  },

  async uploadApplicationDocument(
    applicationId: string,
    file: File,
    documentType: string
  ): Promise<ApiResponse<{ url: string; documentId: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/documents`,
      {
        method: 'POST',
        body: formData,
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
};
