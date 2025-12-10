// FILE: src/services/HealthGoalService.ts

import { API_BASE_URL } from '@env'; 
import { TokenManager } from './AuthService'; 

// =============================================================================
// 1. HTTP CLIENT CONFIG (Private Helper)
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

// Hàm wrapper fetch để xử lý Token và Error chung
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

      // Xử lý 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let message = data.message || `Error ${response.status}`;
        if (data.errors) {
            // Gom lỗi validation từ backend thành chuỗi
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
// 2. TYPES & INTERFACES (Synced with Web)
// =============================================================================

// --- Core Data ---
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

// --- Responses ---
export interface HealthGoalResponse {
  id: string;
  name: string;
  description?: string;
  targets: NutrientTarget[];
}

export type CustomHealthGoalResponse = HealthGoalResponse;

export interface UserHealthGoalResponse {
  id: string;
  healthGoalId?: string;       // ID nếu là System Goal
  customHealthGoalId?: string; // ID nếu là Custom Goal
  name: string;
  description?: string;
  targets: NutrientTarget[];
  startedAtUtc?: string;       // ISO Date
  expiredAtUtc?: string;       // ISO Date (null nếu đang active vĩnh viễn)
}

// --- Requests (DTOs) ---
export interface CreateHealthGoalRequest {
  name: string;
  description?: string;
  targets: NutrientTargetDto[];
}

export interface UpdateHealthGoalRequest {
  name?: string;
  description?: string;
  targets?: NutrientTargetDto[];
}

// Đổi tên cho khớp logic Custom
export type CreateCustomHealthGoalRequest = CreateHealthGoalRequest;
export type UpdateCustomHealthGoalRequest = UpdateHealthGoalRequest;

export interface SetUserHealthGoalRequest {
  type: 'SYSTEM' | 'CUSTOM';
  expiredAtUtc?: string;
}

// =============================================================================
// 3. SERVICE METHODS
// =============================================================================

// -----------------------------------------------------------------------------
// A. CustomHealthGoal Service (Quản lý mục tiêu cá nhân)
// -----------------------------------------------------------------------------

const createCustom = async (data: CreateCustomHealthGoalRequest) => {
  return apiClient.request<void>('/CustomHealthGoal', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const getMyCustomGoals = async () => {
  return apiClient.request<CustomHealthGoalResponse[]>('/CustomHealthGoal', {
    method: 'GET',
  });
};

const getCustomById = async (id: string) => {
  return apiClient.request<CustomHealthGoalResponse>(`/CustomHealthGoal/${id}`, {
    method: 'GET',
  });
};

const updateCustom = async (id: string, data: UpdateCustomHealthGoalRequest) => {
  return apiClient.request<void>(`/CustomHealthGoal/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

const deleteCustom = async (id: string) => {
  return apiClient.request<void>(`/CustomHealthGoal/${id}`, {
    method: 'DELETE',
  });
};

// -----------------------------------------------------------------------------
// B. HealthGoal Service (Quản lý mục tiêu hệ thống - System)
// -----------------------------------------------------------------------------

const getAllSystemGoals = async () => {
  return apiClient.request<HealthGoalResponse[]>('/HealthGoal', {
    method: 'GET',
  });
};

const getSystemById = async (id: string) => {
  return apiClient.request<HealthGoalResponse>(`/HealthGoal/${id}`, {
    method: 'GET',
  });
};

/**
 * Lấy danh sách tổng hợp (System + Custom) của user hiện tại.
 * Thay thế cho việc phải gọi 2 API riêng biệt.
 */
const getListGoal = async () => {
  return apiClient.request<UserHealthGoalResponse[]>('/HealthGoal/listGoal', {
    method: 'GET',
  });
};

// Các hàm Admin (Create/Update/Delete System Goal) thường ít dùng trên App User
// Nhưng nếu cần thì thêm vào đây tương tự như CustomHealthGoal

// -----------------------------------------------------------------------------
// C. UserHealthGoal Service (Quản lý trạng thái Active/History)
// -----------------------------------------------------------------------------

/**
 * Đặt một mục tiêu làm Active Goal.
 * @param goalId - ID của SystemGoal hoặc CustomGoal
 * @param type - 'SYSTEM' hoặc 'CUSTOM'
 * @param expiredAtUtc - Ngày hết hạn (Optional)
 */
const setAsActiveGoal = async (
  goalId: string, 
  type: 'SYSTEM' | 'CUSTOM', 
  expiredAtUtc?: string
) => {
  const data: SetUserHealthGoalRequest = { type, expiredAtUtc };
  return apiClient.request<void>(`/UserHealthGoal/${goalId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Lấy Goal đang active hiện tại. Trả về null nếu chưa có.
 */
const getCurrentActiveGoal = async (): Promise<UserHealthGoalResponse | null> => {
  try {
    // API trả về 200 kèm data hoặc 204 (no content)
    // Nếu backend trả 404 khi không có goal, cần catch lỗi này
    return await apiClient.request<UserHealthGoalResponse>('/UserHealthGoal/current', {
      method: 'GET',
    });
  } catch (error: any) {
    if (error.status === 404) return null;
    throw error;
  }
};

const getHistory = async () => {
  return apiClient.request<UserHealthGoalResponse[]>('/UserHealthGoal/history', {
    method: 'GET',
  });
};

/**
 * Hủy bỏ mục tiêu hiện tại (Không cần truyền ID)
 */
const removeCurrentActiveGoal = async () => {
  return apiClient.request<void>('/UserHealthGoal', {
    method: 'DELETE',
  });
};

// =============================================================================
// 4. EXPORT
// =============================================================================

export const healthGoalService = {
  // --- Custom Goals ---
  createCustom,
  getMyCustomGoals,
  getCustomById,
  updateCustom,
  deleteCustom,

  // --- System Goals ---
  getAllSystemGoals,
  getSystemById,
  getListGoal, // Quan trọng: lấy list tổng hợp cho dropdown

  // --- User Active Goals ---
  setAsActiveGoal,
  getCurrentActiveGoal,
  getHistory,
  removeCurrentActiveGoal,
};