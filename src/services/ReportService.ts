// FILE: src/services/ReportService.ts

import { API_BASE_URL } from '@env';
import { TokenManager } from './AuthService';

// =============================================================================
// 1. CONFIG & HTTP CLIENT (Private Helpers)
// =============================================================================

const BASE_URL = `${API_BASE_URL}/api`;
const DEFAULT_TIMEOUT = 30000;

class ApiException extends Error {
  status: number;
  errors?: any;
  constructor(message: string, status: number, errors?: any) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = await TokenManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 204) return {} as T;

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let message = data.message || `Error ${response.status}`;
        if (data.errors) {
            const details = Object.values(data.errors).flat().join('\n');
            message = details || message;
        }
        throw new ApiException(message, response.status, data.errors);
      }

      return data as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new ApiException('Request timeout', 408);
      }
      throw error;
    }
  },
};

// =============================================================================
// 2. TYPES & CONSTANTS (Synced with Backend)
// =============================================================================

// Report Target Types
export const ReportTargetType = {
  RECIPE: 'RECIPE',
  USER: 'USER',
  COMMENT: 'COMMENT',
  RATING: 'RATING',
} as const;

export type ReportTargetType = (typeof ReportTargetType)[keyof typeof ReportTargetType];

// Report Status
export const ReportStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

// Request DTOs
export interface CreateReportRequest {
  targetId: string;
  targetType: ReportTargetType;
  description?: string;
}

export interface ReportFilterRequest {
  paginationParams?: {
    pageNumber?: number;
    pageSize?: number;
  };
  type?: ReportTargetType | null;
  status?: ReportStatus | null;
  keyword?: string | null;
}

// Response DTOs
export interface ReportResponse {
  id: string;
  targetId: string;
  targetType: ReportTargetType;
  targetName: string;
  description: string;
  reporterId: string;
  reporterName: string;
  status: ReportStatus;
  createdAtUtc: string;
  rejectReason?: string;
}

export interface ReportSummaryResponse {
  targetType: ReportTargetType;
  targetId: string;
  targetName: string;
  count: number; // Số lượng report gộp
  latestReportAtUtc: string;
}

export interface ReportSummaryPagedResult {
  items: ReportSummaryResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ApproveReportResponse {
  targetType: ReportTargetType;
  targetId: string;
}

export interface ReportMessageResponse {
  message: string;
}

// =============================================================================
// 3. SERVICE METHODS
// =============================================================================

const ENDPOINT = '/report';

/**
 * Tạo báo cáo vi phạm mới (User feature)
 */
const createReport = async (data: CreateReportRequest) => {
  return apiClient.request<ReportMessageResponse>(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Lấy chi tiết báo cáo theo ID
 */
const getReportById = async (id: string) => {
  return apiClient.request<ReportResponse>(`${ENDPOINT}/${id}`, {
    method: 'GET',
  });
};

/**
 * Lấy danh sách báo cáo theo Target ID (VD: xem tất cả report của 1 bài viết)
 */
const getReportsByTargetId = async (targetId: string) => {
  return apiClient.request<ReportResponse[]>(`${ENDPOINT}/target/${targetId}`, {
    method: 'GET',
  });
};

/**
 * Lấy danh sách tổng hợp báo cáo (Admin/Mod feature)
 * Hỗ trợ phân trang và lọc
 */
const getReportSummary = async (request: ReportFilterRequest = {}) => {
  // Xây dựng Query String thủ công để map đúng tham số Backend yêu cầu (PascalCase)
  const params: string[] = [];

  if (request.paginationParams?.pageNumber) {
    params.push(`PaginationParams.PageNumber=${request.paginationParams.pageNumber}`);
  }
  if (request.paginationParams?.pageSize) {
    params.push(`PaginationParams.PageSize=${request.paginationParams.pageSize}`);
  }
  if (request.type) {
    params.push(`Type=${request.type}`);
  }
  if (request.status) {
    params.push(`Status=${request.status}`);
  }
  if (request.keyword) {
    // Cần encodeURI để xử lý ký tự đặc biệt hoặc tiếng Việt
    params.push(`Keyword=${encodeURIComponent(request.keyword)}`);
  }

  const queryString = params.length > 0 ? `?${params.join('&')}` : '';
  
  return apiClient.request<ReportSummaryPagedResult>(`${ENDPOINT}/summary${queryString}`, {
    method: 'GET',
  });
};

/**
 * Phê duyệt báo cáo (Admin/Mod feature)
 * (Xác nhận vi phạm là đúng -> Xử lý đối tượng bị báo cáo)
 */
const approveReport = async (id: string) => {
  return apiClient.request<ApproveReportResponse>(`${ENDPOINT}/${id}/approve`, {
    method: 'POST',
  });
};

/**
 * Từ chối báo cáo (Admin/Mod feature)
 * (Báo cáo sai sự thật hoặc không đủ căn cứ)
 */
const rejectReport = async (id: string, reason: string) => {
  return apiClient.request<ReportMessageResponse>(`${ENDPOINT}/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

// =============================================================================
// 4. EXPORT
// =============================================================================

export const reportService = {
  createReport,
  getReportById,
  getReportsByTargetId,
  getReportSummary,
  approveReport,
  rejectReport,
};