// FILE: src/services/HealthGoalService.ts

import { API_BASE_URL } from '@env'; 
import { TokenManager } from './AuthService'; 
import { getNutrients, NutrientInfo } from './NutrientService'; // Import để lấy đơn vị

// =============================================================================
// 1. HTTP CLIENT CONFIG & HELPERS
// =============================================================================

const BASE_URL = `${API_BASE_URL}/api`;
const DEFAULT_TIMEOUT = 300000;

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
        throw new ApiException('Request timeout. Please check your connection.', 408);
      }
      throw error;
    }
  },
};

// =============================================================================
// 2. UNIT MAPPING LOGIC (Bổ sung đơn vị từ NutrientService)
// =============================================================================

// Biến cache để tránh gọi API /Nutrient liên tục mỗi khi lấy Goal
let nutrientUnitMapCache: Record<string, string> | null = null;

/**
 * Lấy bản đồ tra cứu ID -> Unit
 */
const getUnitMap = async (): Promise<Record<string, string>> => {
  if (nutrientUnitMapCache) return nutrientUnitMapCache;
  
  try {
    const nutrients = await getNutrients();
    const map: Record<string, string> = {};
    nutrients.forEach((n: NutrientInfo) => {
      map[n.id] = n.unit;
    });
    nutrientUnitMapCache = map;
    return map;
  } catch (error) {
    console.error("Failed to fetch nutrient units:", error);
    return {};
  }
};

/**
 * Hàm Helper để gắn unit vào các targets trong Health Goal response
 */
const enrichGoalData = async <T extends UserHealthGoalResponse | UserHealthGoalResponse[] | null>(data: T): Promise<T> => {
  if (!data) return data;
  
  const unitMap = await getUnitMap();

  const mapUnits = (goal: any) => ({
    ...goal,
    targets: goal.targets?.map((target: any) => ({
      ...target,
      // Nếu backend chưa có unit, lấy từ map tra cứu theo nutrientId
      unit: target.unit || unitMap[target.nutrientId] || ''
    })) || []
  });

  if (Array.isArray(data)) {
    return data.map(mapUnits) as any;
  }
  return mapUnits(data) as any;
};

// =============================================================================
// 3. TYPES & INTERFACES
// =============================================================================

export interface NutrientTarget {
  nutrientId: string;
  name: string;
  unit?: string;      // Trường unit đã được bổ sung
  targetType?: string;
  minValue: number;
  medianValue?: number;
  maxValue: number;
  minEnergyPct: number;
  medianEnergyPct?: number;
  maxEnergyPct: number;
  weight: number; 
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

export interface UserHealthGoalResponse {
  id: string;
  healthGoalId?: string;
  customHealthGoalId?: string;
  name: string;
  description?: string;
  targets: NutrientTarget[];
  startedAtUtc?: string;
  expiredAtUtc?: string;
  isCustom?: boolean; // Tùy chọn để phân biệt
}

export interface CreateHealthGoalRequest {
  name: string;
  description?: string;
  targets: NutrientTargetDto[];
}

// =============================================================================
// 4. SERVICE METHODS
// =============================================================================

// --- Quản lý mục tiêu cá nhân (Custom) ---

const createCustom = async (data: CreateHealthGoalRequest) => {
  return apiClient.request<void>('/CustomHealthGoal', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const getMyCustomGoals = async () => {
  const data = await apiClient.request<UserHealthGoalResponse[]>('/CustomHealthGoal', {
    method: 'GET',
  });
  return enrichGoalData(data); // Tự động bổ sung unit
};

const getCustomById = async (id: string) => {
  const data = await apiClient.request<UserHealthGoalResponse>(`/CustomHealthGoal/${id}`, {
    method: 'GET',
  });
  return enrichGoalData(data);
};

const updateCustom = async (id: string, data: CreateHealthGoalRequest) => {
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

// --- Quản lý mục tiêu hệ thống (Library) ---

const getListGoal = async () => {
  const data = await apiClient.request<UserHealthGoalResponse[]>('/HealthGoal/listGoal', {
    method: 'GET',
  });
  return enrichGoalData(data); // Tự động bổ sung unit
};

// --- Trạng thái Active & History ---

const setAsActiveGoal = async (
  goalId: string, 
  type: 'SYSTEM' | 'CUSTOM', 
  expiredAtUtc?: string
) => {
  return apiClient.request<void>(`/UserHealthGoal/${goalId}`, {
    method: 'POST',
    body: JSON.stringify({ type, expiredAtUtc }),
  });
};

const getCurrentActiveGoal = async (): Promise<UserHealthGoalResponse | null> => {
  try {
    const data = await apiClient.request<UserHealthGoalResponse>('/UserHealthGoal/current', {
      method: 'GET',
    });
    return enrichGoalData(data); // Tự động bổ sung unit
  } catch (error: any) {
    if (error.status === 404) return null;
    throw error;
  }
};

const getHistory = async () => {
  const data = await apiClient.request<UserHealthGoalResponse[]>('/UserHealthGoal/history', {
    method: 'GET',
  });
  return enrichGoalData(data);
};

const removeCurrentActiveGoal = async () => {
  return apiClient.request<void>('/UserHealthGoal', {
    method: 'DELETE',
  });
};

// =============================================================================
// 5. EXPORT
// =============================================================================

export const healthGoalService = {
  createCustom,
  getMyCustomGoals,
  getCustomById,
  updateCustom,
  deleteCustom,
  getListGoal,
  setAsActiveGoal,
  getCurrentActiveGoal,
  getHistory,
  removeCurrentActiveGoal,
};