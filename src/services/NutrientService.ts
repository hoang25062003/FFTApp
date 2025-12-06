// FILE: src/services/NutrientService.ts

import { API_BASE_URL } from '@env';
import { TokenManager, ApiException } from './AuthService';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT = 30000; // 30 seconds

// ============================================
// TYPES
// ============================================

export interface NutrientInfo {
  id: string;
  vietnameseName: string;
  unit: string;
}

// ============================================
// HTTP CLIENT FOR NUTRIENT
// ============================================
class NutrientHttpClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number = REQUEST_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiException('Request timeout', 408);
      }
      throw error;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    if (includeAuth) {
      const token = await TokenManager.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        headers,
      });

      if (response.status === 204) {
        return {} as T;
      }

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw this.handleError(response, responseData);
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      const message = error instanceof Error 
        ? error.message 
        : 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
      throw new ApiException(message, 0);
    }
  }

  private handleError(response: Response, responseData: any): ApiException {
    const errorData = responseData as any;
    let errorMessage = errorData.message || `Lỗi ${response.status}: ${response.statusText}`;

    if (errorData.errors) {
      const details = Object.entries(errorData.errors)
        .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
        .join('\n');
      errorMessage = `Dữ liệu không hợp lệ:\n${details}`;
    }

    return new ApiException(errorMessage, response.status, errorData.errors);
  }
}

// Create HTTP client instance
const nutrientHttpClient = new NutrientHttpClient(BASE_URL);

// ============================================
// SERVICE METHODS
// ============================================

/**
 * Get all nutrients (Lấy tất cả chất dinh dưỡng)
 */
export async function getNutrients(): Promise<NutrientInfo[]> {
  return nutrientHttpClient.request<NutrientInfo[]>(
    '/Nutrient', 
    { method: 'GET' }, 
    true // isPrivateRoute = true
  );
}

/**
 * Get required nutrients that must be present in every ingredient
 * (Lấy các chất dinh dưỡng bắt buộc)
 */
export async function getRequiredNutrients(): Promise<NutrientInfo[]> {
  return nutrientHttpClient.request<NutrientInfo[]>(
    '/Nutrient/required', 
    { method: 'GET' }, 
    true // isPrivateRoute = true
  );
}

// Export default object for compatibility
export default {
  getNutrients,
  getRequiredNutrients,
};