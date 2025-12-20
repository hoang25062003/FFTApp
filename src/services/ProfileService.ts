import { API_BASE_URL } from '@env';
import { TokenManager } from './AuthService';
import { Share, Alert } from 'react-native';

// ============================================
// 1. CONFIG & CLIENT
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const WEB_URL = 'https://sep-490-ftcdhmm-ui.vercel.app';
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
      const response = await fetch(url, { ...options, headers, signal: controller.signal });
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
      if (error.name === 'AbortError') throw new ApiException('Request timeout', 408);
      throw error;
    }
  },
};

// ============================================
// 2. TYPES
// ============================================

export interface PublicProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  gender: string;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean; 
  bio: string | null;
  address: string | null;
  dateOfBirth: string | null;
}

export interface UserFollowerDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  avatarUrl?: string | null;
  fullName?: string;
  isFollowing: boolean;
}

// ============================================
// 3. METHODS
// ============================================

/**
 * Lấy thông tin Profile của một User khác theo Username
 * GET /api/User/profile/:username
 */
const getUserProfileByUsername = async (username: string) => {
  return apiClient.request<PublicProfileDto>(`/User/profile/${encodeURIComponent(username)}`, {
    method: 'GET',
  });
};

/**
 * Theo dõi một User (Dùng ID để định danh chính xác trong database)
 * POST /api/User/follow/:followeeId
 */
const followUser = async (followeeId: string) => {
  return apiClient.request<void>(`/User/follow/${followeeId}`, {
    method: 'POST',
  });
};

/**
 * Hủy theo dõi một User
 * DELETE /api/User/unfollow/:followeeId
 */
const unfollowUser = async (followeeId: string) => {
  return apiClient.request<void>(`/User/unfollow/${followeeId}`, {
    method: 'DELETE',
  });
};

/**
 * Lấy danh sách những người đang theo dõi mình
 * GET /api/User/followers
 */
const getFollowers = async () => {
  return apiClient.request<UserFollowerDto[]>('/User/followers', {
    method: 'GET',
  });
};

/**
 * Lấy danh sách những người mình đang theo dõi
 * GET /api/User/following
 */
const getFollowing = async () => {
  return apiClient.request<UserFollowerDto[]>('/User/following', {
    method: 'GET',
  });
};

/**
 * Chia sẻ profile của user qua Share API
 * @param userName - Username của user cần chia sẻ
 * @param fullName - Tên đầy đủ của user (optional)
 */
export async function shareProfile(userName: string, fullName?: string): Promise<void> {
  if (!userName) throw new Error('Username is required');

  const shareUrl = `${WEB_URL}/profile/${userName}`;
  
  try {
    await Share.share({
      title: 'FitFood Tracker',
      message: `Khám phá profile "${fullName || userName}" tại đây: ${shareUrl}`,
      url: shareUrl, // Dành cho iOS
    }, {
      dialogTitle: 'Chia sẻ qua:', // Android
    });
  } catch (error: any) {
    Alert.alert('Lỗi', 'Không thể chia sẻ: ' + error.message);
  }
}

// ============================================
// 4. EXPORT
// ============================================

export const profileService = {
  getUserProfileByUsername,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  shareProfile,
};

export default profileService;