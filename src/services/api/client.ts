// API Client Factory for Vetting Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api/v1';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T = any>(
    method: string,
    path: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${path}`;
      const options: RequestInit = {
        method,
        headers: this.getHeaders(includeAuth),
        credentials: 'include', // For httpOnly cookies
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      if (response.status === 401) {
        // Unauthorized - clear token
        localStorage.removeItem('authToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      const responseData = await response.json();

      if (!response.ok) {
        return {
          error: responseData.message || 'Request failed',
          statusCode: response.status,
        };
      }

      return { data: responseData };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  get<T = any>(path: string, includeAuth?: boolean) {
    return this.request<T>('GET', path, undefined, includeAuth);
  }

  post<T = any>(path: string, data?: any, includeAuth?: boolean) {
    return this.request<T>('POST', path, data, includeAuth);
  }

  put<T = any>(path: string, data?: any, includeAuth?: boolean) {
    return this.request<T>('PUT', path, data, includeAuth);
  }

  patch<T = any>(path: string, data?: any, includeAuth?: boolean) {
    return this.request<T>('PATCH', path, data, includeAuth);
  }

  delete<T = any>(path: string, includeAuth?: boolean) {
    return this.request<T>('DELETE', path, undefined, includeAuth);
  }
}

export const apiClient = new ApiClient();
