import { API_BASE_URL } from '@env';
import { TokenManager, ApiException } from './AuthService';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT = 300000; // 60 seconds for comments

// ============================================
// TYPES
// ============================================

export interface MentionedUser {
  mentionedUserId: string;
  firstName: string;
  lastName: string;
}

export interface Comment {
  id: string;
  content: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
  parentCommentId?: string | null;
  replies?: Comment[];
  userId?: string;
  mentions?: MentionedUser[];
}

export interface CreateCommentRequest {
  content: string; // Max 2048 characters
  parentCommentId?: string | null;
  mentionedUserIds?: string[];
}

export interface UpdateCommentRequest {
  content: string; // Max 2048 characters
  mentionedUserIds?: string[];
}

// ============================================
// UTILITIES
// ============================================

const validateCommentContent = (content: string): void => {
  if (!content || content.trim().length === 0) {
    throw new Error('Comment content is required');
  }
  if (content.length > 2048) {
    throw new Error('Comment content must not exceed 2048 characters');
  }
};

// ============================================
// HTTP CLIENT
// ============================================

class CommentHttpClient {
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
      const response = await this.fetchWithTimeout(url, { 
        ...options, 
        headers,
        credentials: 'include',
      });

      if (response.status === 204) return {} as T;

      // Handle empty response body
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0' || !response.body) {
        if (!response.ok) {
          throw new ApiException(`Error ${response.status}: ${response.statusText}`, response.status);
        }
        return {} as T;
      }

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

const commentHttpClient = new CommentHttpClient(BASE_URL);

// ============================================
// API METHODS
// ============================================

/**
 * Get all comments for a recipe
 * Public endpoint - no authentication required
 */
export async function getComments(recipeId: string): Promise<Comment[]> {
  if (!recipeId) throw new Error('Recipe ID is required');

  try {
    return await commentHttpClient.request<Comment[]>(
      `/comment/${recipeId}`,
      { method: 'GET' },
      false
    );
  } catch (error) {
    console.error('[CommentService] getComments error:', error);
    throw error;
  }
}

/**
 * Create a new comment
 * Requires authentication
 */
export async function createComment(
  recipeId: string,
  request: CreateCommentRequest
): Promise<Comment | null> {
  if (!recipeId) throw new Error('Recipe ID is required');
  validateCommentContent(request.content);

  try {
    const result = await commentHttpClient.request<Comment>(
      `/comment/${recipeId}`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
      true
    );
    
    // Return null if backend returns empty response (need to refresh)
    return result || null;
  } catch (error) {
    console.error('[CommentService] createComment error:', error);
    throw error;
  }
}

/**
 * Update an existing comment
 * Requires authentication
 */
export async function updateComment(
  recipeId: string,
  commentId: string,
  request: UpdateCommentRequest
): Promise<Comment | null> {
  if (!recipeId) throw new Error('Recipe ID is required');
  if (!commentId) throw new Error('Comment ID is required');
  validateCommentContent(request.content);

  try {
    const result = await commentHttpClient.request<Comment>(
      `/comment/${recipeId}/${commentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(request),
      },
      true
    );
    
    // Return null if backend returns empty response (need to refresh)
    return result || null;
  } catch (error) {
    console.error('[CommentService] updateComment error:', error);
    throw error;
  }
}

/**
 * Delete a comment
 * Requires authentication
 */
export async function deleteComment(commentId: string): Promise<void> {
  if (!commentId) throw new Error('Comment ID is required');

  try {
    await commentHttpClient.request<void>(
      `/comment/${commentId}`,
      { method: 'DELETE' },
      true
    );
  } catch (error) {
    console.error('[CommentService] deleteComment error:', error);
    throw error;
  }
}

/**
 * Delete a comment as the recipe author
 * Requires authentication
 */
export async function deleteCommentAsAuthor(commentId: string): Promise<void> {
  if (!commentId) throw new Error('Comment ID is required');

  try {
    await commentHttpClient.request<void>(
      `/comment/${commentId}/by-author`,
      { method: 'DELETE' },
      true
    );
  } catch (error) {
    console.error('[CommentService] deleteCommentAsAuthor error:', error);
    throw error;
  }
}

/**
 * Delete a comment as admin/moderator
 * Requires authentication with admin privileges
 */
export async function deleteCommentAsAdmin(commentId: string): Promise<void> {
  if (!commentId) throw new Error('Comment ID is required');

  try {
    await commentHttpClient.request<void>(
      `/comment/${commentId}/manage`,
      { method: 'DELETE' },
      true
    );
  } catch (error) {
    console.error('[CommentService] deleteCommentAsAdmin error:', error);
    throw error;
  }
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  deleteCommentAsAuthor,
  deleteCommentAsAdmin,
};