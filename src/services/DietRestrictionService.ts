import { API_BASE_URL } from '@env';
import { TokenManager, ApiException } from './AuthService';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT = 30000;

// ============================================
// ENUMS
// ============================================

export enum RestrictionType {
  ALLERGY = 'ALLERGY',
  DISLIKE = 'DISLIKE',
  TEMPORARYAVOID = 'TEMPORARYAVOID',
}

// ============================================
// TYPES
// ============================================

export interface CreateIngredientRestrictionRequest {
  ingredientId: string;
  type: RestrictionType | string;
  notes?: string;
  expiredAtUtc?: string;
}

export interface CreateIngredientCategoryRestrictionRequest {
  ingredientCategoryId: string;
  type: RestrictionType | string;
  notes?: string;
  expiredAtUtc?: string;
}

export interface UserDietRestrictionFilterRequest {
  keyword?: string;
  type?: RestrictionType | string;
}

export interface UserDietRestrictionResponse {
  id: string;
  ingredientId?: string;
  ingredientName?: string;
  ingredientCategoryId?: string;
  ingredientCategoryName?: string;
  type: RestrictionType | string | { value: string };
  notes?: string;
  expiredAtUtc?: string;
}

export type UserDietRestrictionListResponse = UserDietRestrictionResponse[];

// ============================================
// RESTRICTION TYPE CONFIG
// ============================================

export const RESTRICTION_TYPE_CONFIG = {
  [RestrictionType.ALLERGY]: {
    label: 'Dị ứng',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    description: 'Dị ứng thực phẩm',
    icon: '🚫',
  },
  [RestrictionType.DISLIKE]: {
    label: 'Không thích',
    color: '#F97316',
    bgColor: '#FFEDD5',
    description: 'Không thích thực phẩm',
    icon: '😕',
  },
  [RestrictionType.TEMPORARYAVOID]: {
    label: 'Tạm tránh',
    color: '#EAB308',
    bgColor: '#FEFCE8',
    description: 'Tạm thời tránh thực phẩm',
    icon: '⏳',
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getRestrictionTypeConfig = (type: RestrictionType | string) => {
  return RESTRICTION_TYPE_CONFIG[type as RestrictionType] || {
    label: type,
    color: '#6B7280',
    bgColor: '#F3F4F6',
    description: type,
    icon: '📋',
  };
};

export const isRestrictionExpired = (expiredAtUtc?: string): boolean => {
  if (!expiredAtUtc) return false;
  return new Date(expiredAtUtc) < new Date();
};

export const getAllRestrictionTypes = () => {
  return Object.values(RestrictionType);
};

// ============================================
// HTTP CLIENT
// ============================================

class DietRestrictionHttpClient {
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
        throw new ApiException('Request timeout - Vui lòng kiểm tra kết nối mạng', 408);
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
      'Accept': '*/*',
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
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
      const message = error instanceof Error ? error.message : 'Lỗi kết nối mạng không xác định.';
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

const apiClient = new DietRestrictionHttpClient(BASE_URL);

// ============================================
// SERVICE METHODS
// ============================================

export const createIngredientRestriction = async (
  request: CreateIngredientRestrictionRequest
): Promise<void> => {
  await apiClient.request<void>('/UserDietRestriction/ingredient', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const createIngredientCategoryRestriction = async (
  request: CreateIngredientCategoryRestrictionRequest
): Promise<void> => {
  await apiClient.request<void>('/UserDietRestriction/ingredient-category', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const getUserDietRestrictions = async (
  filter?: UserDietRestrictionFilterRequest
): Promise<UserDietRestrictionListResponse> => {
  const params = new URLSearchParams();
  
  if (filter?.keyword) params.append('Keyword', filter.keyword);
  if (filter?.type) params.append('Type', filter.type);

  const queryString = params.toString();
  const endpoint = queryString 
    ? `/UserDietRestriction?${queryString}` 
    : '/UserDietRestriction';

  const data = await apiClient.request<UserDietRestrictionListResponse>(endpoint, {
    method: 'GET',
  });

  return data;
};

export const getActiveDietRestrictions = async (
  filter?: UserDietRestrictionFilterRequest
): Promise<UserDietRestrictionListResponse> => {
  const allRestrictions = await getUserDietRestrictions(filter);
  
  return allRestrictions.filter(restriction => !isRestrictionExpired(restriction.expiredAtUtc));
};

export const getRestrictionsByType = async (
  type: RestrictionType | string
): Promise<UserDietRestrictionListResponse> => {
  return getUserDietRestrictions({ type });
};

export const deleteRestriction = async (restrictionId: string): Promise<void> => {
  await apiClient.request<void>(`/UserDietRestriction/${restrictionId}`, {
    method: 'DELETE',
  });
};

export const hasIngredientRestriction = async (ingredientId: string): Promise<boolean> => {
  try {
    const restrictions = await getUserDietRestrictions();
    return restrictions.some(r => 
      r.ingredientId === ingredientId && !isRestrictionExpired(r.expiredAtUtc)
    );
  } catch (error) {
    console.error('Error checking ingredient restriction:', error);
    return false;
  }
};

export const hasIngredientCategoryRestriction = async (
  ingredientCategoryId: string
): Promise<boolean> => {
  try {
    const restrictions = await getUserDietRestrictions();
    return restrictions.some(r => 
      r.ingredientCategoryId === ingredientCategoryId && !isRestrictionExpired(r.expiredAtUtc)
    );
  } catch (error) {
    console.error('Error checking category restriction:', error);
    return false;
  }
};

export const getRestrictionStats = async () => {
  try {
    const restrictions = await getUserDietRestrictions();
    
    const getTypeValue = (type: any): string => {
      if (!type) return '';
      if (typeof type === 'object' && type.value) {
        return type.value;
      }
      return String(type);
    };
    
    const allByType = {
      allergy: restrictions.filter(r => getTypeValue(r.type) === 'ALLERGY').length,
      dislike: restrictions.filter(r => getTypeValue(r.type) === 'DISLIKE').length,
      temporaryAvoid: restrictions.filter(r => getTypeValue(r.type) === 'TEMPORARYAVOID').length,
    };
    
    const active = restrictions.filter(r => !isRestrictionExpired(r.expiredAtUtc));
    
    return {
      total: restrictions.length,
      active: active.length,
      expired: restrictions.length - active.length,
      byType: allByType,
      ingredients: active.filter(r => r.ingredientId).length,
      categories: active.filter(r => r.ingredientCategoryId).length,
    };
  } catch (error) {
    console.error('Error getting restriction stats:', error);
    return {
      total: 0,
      active: 0,
      expired: 0,
      byType: { allergy: 0, dislike: 0, temporaryAvoid: 0 },
      ingredients: 0,
      categories: 0,
    };
  }
};

export default {
  createIngredientRestriction,
  createIngredientCategoryRestriction,
  getUserDietRestrictions,
  getActiveDietRestrictions,
  getRestrictionsByType,
  deleteRestriction,
  hasIngredientRestriction,
  hasIngredientCategoryRestriction,
  getRestrictionStats,
  getRestrictionTypeConfig,
  isRestrictionExpired,
  getAllRestrictionTypes,
};