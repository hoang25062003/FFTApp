import { API_BASE_URL } from '@env';
import { TokenManager, ApiException } from './AuthService';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT = 300000;

// ============================================
// TYPES
// ============================================

export enum RecipeStatus {
  Posted = 'POSTED',
  Locked = 'LOCKED',
  Pending = 'PENDING',
  Deleted = 'DELETED',
}

export interface Author {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface RecipeManagementResponse {
  id: string;
  name: string;
  description?: string;
  author: Author;
  difficulty: {
    name: string;
    value: number;
  };
  cookTime: number;
  ration: number;
  imageUrl?: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  reason?: string;
}

export interface RecipeManagementListResponse {
  items: RecipeManagementResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface RecipeManagementReasonRequest {
  reason: string;
}

interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

// ============================================
// UTILITIES
// ============================================

const validateReason = (reason: string): void => {
  if (!reason || reason.trim().length === 0) {
    throw new Error('Reason is required');
  }
  if (reason.length > 500) {
    throw new Error('Reason must not exceed 500 characters');
  }
};

const buildQueryParams = (params: Record<string, any>): URLSearchParams => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  return queryParams;
};

// ============================================
// HTTP CLIENT
// ============================================

class RecipeManagementHttpClient {
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
      const response = await fetch(url, { ...options, signal: controller.signal });
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
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await this.fetchWithTimeout(url, { ...options, headers });

      if (response.status === 204) return {} as T;

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw this.handleError(response, responseData);
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof ApiException) throw error;
      const message = error instanceof Error ? error.message : 'Lỗi kết nối mạng.';
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

const managementHttpClient = new RecipeManagementHttpClient(BASE_URL);

// ============================================
// API METHODS
// ============================================

/**
 * Get pending recipes list for management
 * Requires Admin/Moderator authentication
 * 
 * @param params - Pagination parameters
 * @returns List of pending recipes with pagination
 */
export async function getPendingRecipes(
  params: PaginationParams = {}
): Promise<RecipeManagementListResponse> {
  const { pageNumber = 1, pageSize = 10 } = params;

  const queryParams = buildQueryParams({
    PageNumber: pageNumber,
    PageSize: pageSize,
  });

  const endpoint = `/Recipe/pending?${queryParams.toString()}`;

  const result = await managementHttpClient.request<RecipeManagementListResponse>(
    endpoint,
    { method: 'GET' },
    true
  );

  // Calculate totalPages if not provided by backend
  return {
    ...result,
    totalPages: result.totalPages || Math.ceil(result.totalCount / result.pageSize),
  };
}

/**
 * Lock a recipe (Admin/Moderator action)
 * Requires Admin/Moderator authentication
 * 
 * @param recipeId - ID of the recipe to lock
 * @param reason - Reason for locking the recipe
 */
export async function lockRecipe(recipeId: string, reason: string): Promise<void> {
  if (!recipeId) throw new Error('Recipe ID is required');
  validateReason(reason);

  await managementHttpClient.request<void>(
    `/RecipeManagement/${recipeId}/lock`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    },
    true
  );
}

/**
 * Approve a recipe (Admin/Moderator action)
 * Requires Admin/Moderator authentication
 * 
 * @param recipeId - ID of the recipe to approve
 */
export async function approveRecipe(recipeId: string): Promise<void> {
  if (!recipeId) throw new Error('Recipe ID is required');

  await managementHttpClient.request<void>(
    `/RecipeManagement/${recipeId}/approve`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
    true
  );
}

/**
 * Reject a recipe (Admin/Moderator action)
 * Requires Admin/Moderator authentication
 * 
 * @param recipeId - ID of the recipe to reject
 * @param reason - Reason for rejecting the recipe
 */
export async function rejectRecipe(recipeId: string, reason: string): Promise<void> {
  if (!recipeId) throw new Error('Recipe ID is required');
  validateReason(reason);

  await managementHttpClient.request<void>(
    `/RecipeManagement/${recipeId}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    },
    true
  );
}

/**
 * Delete a recipe by admin (Admin/Moderator action)
 * Requires Admin/Moderator authentication
 * 
 * @param recipeId - ID of the recipe to delete
 * @param reason - Reason for deleting the recipe
 */
export async function deleteRecipeByAdmin(recipeId: string, reason: string): Promise<void> {
  if (!recipeId) throw new Error('Recipe ID is required');
  validateReason(reason);

  await managementHttpClient.request<void>(
    `/RecipeManagement/${recipeId}`,
    {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    },
    true
  );
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  getPendingRecipes,
  lockRecipe,
  approveRecipe,
  rejectRecipe,
  deleteRecipeByAdmin,
};