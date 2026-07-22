// Admin Service
import { apiClient, type ApiResponse } from './client';

export interface PipelineStats {
  totalDrivers: number;
  byStatus: Record<string, number>;
  pendingActions: number;
}

export interface SlaAlert {
  driverId: string;
  driverName: string;
  currentStatus: string;
  slaExpiredAt: string;
  hoursRemaining: number;
}

export interface AdminDashboard {
  pipeline: PipelineStats;
  slaAlerts: SlaAlert[];
  recentActivity: Array<{
    driverId: string;
    action: string;
    timestamp: string;
  }>;
}

export interface AnalyticsData {
  totalApplications: number;
  approvedCount: number;
  rejectedCount: number;
  averageTimeToApproval: number;
  conversionRate: number;
}

export interface DriverQuery {
  status?: string;
  email?: string;
  fullName?: string;
  limit?: number;
  offset?: number;
}

export const adminService = {
  async getDashboard(): Promise<ApiResponse<AdminDashboard>> {
    return apiClient.get('/admin/dashboard', true);
  },

  async getPipeline(): Promise<ApiResponse<PipelineStats>> {
    return apiClient.get('/admin/pipeline', true);
  },

  async getSlaAlerts(): Promise<ApiResponse<SlaAlert[]>> {
    return apiClient.get('/admin/sla-alerts', true);
  },

  async getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    return apiClient.get('/admin/analytics', true);
  },

  async searchDrivers(
    query: DriverQuery
  ): Promise<ApiResponse<Array<any>>> {
    const params = new URLSearchParams();
    if (query.status) params.append('status', query.status);
    if (query.email) params.append('email', query.email);
    if (query.fullName) params.append('fullName', query.fullName);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());

    return apiClient.get(
      `/admin/drivers?${params.toString()}`,
      true
    );
  },

  async updateDriverStatus(
    driverId: string,
    status: string,
    reason?: string
  ): Promise<ApiResponse<any>> {
    return apiClient.put(
      `/admin/drivers/${driverId}/status`,
      { status, reason },
      true
    );
  },

  async sendEmail(
    driverId: string,
    templateId: string,
    variables?: Record<string, any>
  ): Promise<ApiResponse<{ messageId: string }>> {
    return apiClient.post(
      `/admin/drivers/${driverId}/email`,
      { templateId, variables },
      true
    );
  },

  async exportReport(
    startDate: string,
    endDate: string,
    format: 'csv' | 'xlsx'
  ): Promise<ApiResponse<Blob>> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/report?startDate=${startDate}&endDate=${endDate}&format=${format}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      return {
        error: 'Export failed',
        statusCode: response.status,
      };
    }

    return { data: await response.blob() };
  },
};
