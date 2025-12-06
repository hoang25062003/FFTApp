// FILE: src/services/HealthGoalService.ts

import { API_BASE_URL } from '@env'; // Đảm bảo bạn đã config react-native-dotenv
import { TokenManager } from './AuthService'; // Giả định bạn có service quản lý token

// =============================================================================
// 1. CONFIGURATION & CONSTANTS
// =============================================================================

const BASE_URL = `${API_BASE_URL}/api`;
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// =============================================================================
// 2. DATA TYPES (INTERFACES)
// =============================================================================

// --- Core Data Structures ---
export interface NutrientTarget {
  nutrientId: string;
  name: string;
  targetType?: string;
  minValue: number;
  medianValue?: number;
  maxValue: number;
  minEnergyPct?: number;
  medianEnergyPct?: number;
  maxEnergyPct?: number;
  weight?: number;
}

// DTO dùng khi tạo/update (thường ít field hơn response)
export interface NutrientTargetDto {
  nutrientId: string;
  targetType?: string;
  minValue: number;
  medianValue?: number;
  maxValue: number;
  minEnergyPct?: number;
  medianEnergyPct?: number;
  maxEnergyPct?: number;
  weight?: number;
}

// --- Response Types ---
export interface HealthGoalResponse {
  id: string;
  name: string;
  description?: string;
  targets: NutrientTarget[];
}

// Custom goal có cấu trúc giống System goal
export type CustomHealthGoalResponse = HealthGoalResponse;

// User Goal (Active/History) - Có thêm thông tin ngày tháng và relation ID
export interface UserHealthGoalResponse {
  id: string;
  healthGoalId?: string;       // ID nếu là System Goal
  customHealthGoalId?: string; // ID nếu là Custom Goal
  name: string;
  description?: string;
  targets: NutrientTarget[];
  startedAtUtc?: string;       // ISO Date
  expiredAtUtc?: string;       // ISO Date
}

// --- Request DTOs ---

// System & Custom Goal Requests
export interface CreateGoalRequest {
  name: string;
  description?: string;
  targets: NutrientTargetDto[];
}

export interface UpdateGoalRequest {
  name?: string;
  description?: string;
  targets?: NutrientTargetDto[];
}

// Active Goal Requests
export interface SetUserHealthGoalRequest {
  type: 'SYSTEM' | 'CUSTOM'; // Quan trọng: Backend cần biết loại goal
  expiredAtUtc?: string;
}

// =============================================================================
// 3. HTTP CLIENT HELPER (Private)
// =============================================================================

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

    // 1. Prepare Headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // 2. Inject Token
    const token = await TokenManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      // 3. Execute Fetch
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 4. Handle Empty Response (204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      // 5. Parse JSON
      const data = await response.json().catch(() => ({}));

      // 6. Handle Errors
      if (!response.ok) {
        let message = data.message || `Error ${response.status}`;
        if (data.errors) {
            // Format validation errors for display
            const details = Object.values(data.errors).flat().join('\n');
            message = details || message;
        }
        throw new ApiException(message, response.status, data.errors);
      }

      return data as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new ApiException('Request timeout. Please check your connection.', 408);
      }
      throw error;
    }
  },
};

// =============================================================================
// 4. SERVICE METHODS
// =============================================================================

// -----------------------------------------------------------------------------
// GROUP A: SYSTEM HEALTH GOALS (Mục tiêu hệ thống có sẵn)
// -----------------------------------------------------------------------------

/** Lấy tất cả mục tiêu mẫu của hệ thống */
export const getSystemGoals = async () => {
  return apiClient.request<HealthGoalResponse[]>('/HealthGoal', { method: 'GET' });
};

/** Lấy chi tiết một mục tiêu hệ thống */
export const getSystemGoalById = async (id: string) => {
  return apiClient.request<HealthGoalResponse>(`/HealthGoal/${id}`, { method: 'GET' });
};

// (Admin only - thường không dùng trên mobile app user, nhưng giữ lại cho full)
export const createSystemGoal = async (data: CreateGoalRequest) => {
  return apiClient.request<void>('/HealthGoal', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// -----------------------------------------------------------------------------
// GROUP B: CUSTOM HEALTH GOALS (Mục tiêu cá nhân tự tạo)
// -----------------------------------------------------------------------------

/** Lấy danh sách mục tiêu do người dùng tự tạo */
export const getMyCustomGoals = async () => {
  return apiClient.request<CustomHealthGoalResponse[]>('/CustomHealthGoal', { method: 'GET' });
};

/** Lấy chi tiết mục tiêu cá nhân */
export const getCustomGoalById = async (id: string) => {
  return apiClient.request<CustomHealthGoalResponse>(`/CustomHealthGoal/${id}`, { method: 'GET' });
};

/** Tạo mới mục tiêu cá nhân */
export const createCustomGoal = async (data: CreateGoalRequest) => {
  return apiClient.request<void>('/CustomHealthGoal', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/** Cập nhật mục tiêu cá nhân */
export const updateCustomGoal = async (id: string, data: UpdateGoalRequest) => {
  return apiClient.request<void>(`/CustomHealthGoal/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/** Xóa mục tiêu cá nhân */
export const deleteCustomGoal = async (id: string) => {
  return apiClient.request<void>(`/CustomHealthGoal/${id}`, { method: 'DELETE' });
};

// -----------------------------------------------------------------------------
// GROUP C: HYBRID LIST (Danh sách tổng hợp)
// -----------------------------------------------------------------------------

/**
 * Lấy danh sách tổng hợp (System + Custom).
 * Rất hữu ích cho Dropdown chọn mục tiêu.
 */
export const getListGoal = async () => {
  return apiClient.request<UserHealthGoalResponse[]>('/HealthGoal/listGoal', { method: 'GET' });
};

// -----------------------------------------------------------------------------
// GROUP D: USER ACTIVE GOAL (Quản lý mục tiêu đang áp dụng)
// -----------------------------------------------------------------------------

/**
 * Lấy mục tiêu đang Active hiện tại của User.
 * Trả về null nếu chưa chọn mục tiêu nào.
 */
export const getCurrentActiveGoal = async (): Promise<UserHealthGoalResponse | null> => {
  try {
    return await apiClient.request<UserHealthGoalResponse>('/UserHealthGoal/current', { method: 'GET' });
  } catch (error: any) {
    // Nếu API trả 404 nghĩa là chưa có goal active -> trả về null để UI xử lý
    if (error.status === 404) return null;
    throw error;
  }
};

/**
 * Lấy lịch sử các mục tiêu đã từng áp dụng (Đã hết hạn hoặc bị thay thế)
 */
export const getGoalHistory = async () => {
  return apiClient.request<UserHealthGoalResponse[]>('/UserHealthGoal/history', { method: 'GET' });
};

/**
 * Áp dụng một mục tiêu (System hoặc Custom) cho người dùng
 * @param goalId ID của SystemGoal hoặc CustomGoal
 * @param type Loại mục tiêu ('SYSTEM' hoặc 'CUSTOM')
 * @param expiredAtUtc Ngày hết hạn (ISO string), optional
 */
export const setActiveGoal = async (
  goalId: string,
  type: 'SYSTEM' | 'CUSTOM',
  expiredAtUtc?: string
) => {
  const data: SetUserHealthGoalRequest = { type, expiredAtUtc };
  
  // Endpoint là /api/UserHealthGoal/{id}
  return apiClient.request<void>(`/UserHealthGoal/${goalId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Hủy bỏ mục tiêu hiện tại (Không cần truyền ID)
 */
export const removeActiveGoal = async () => {
  return apiClient.request<void>('/UserHealthGoal', { method: 'DELETE' });
};

// Export default object để tiện import kiểu: healthGoalService.getSystemGoals()
export const healthGoalService = {
  // System
  getSystemGoals,
  getSystemGoalById,
  createSystemGoal,
  // Custom
  getMyCustomGoals,
  getCustomGoalById,
  createCustomGoal,
  updateCustomGoal,
  deleteCustomGoal,
  // Hybrid
  getListGoal,
  // Active/User
  getCurrentActiveGoal,
  getGoalHistory,
  setActiveGoal,
  removeActiveGoal,
};