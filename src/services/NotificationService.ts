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

export type NotificationType = 'SYSTEM' | 'COMMENT' | 'LIKE' | 'RATING' | string;

export type NotificationTypeInfo = {
    name: NotificationType;
};

export type NotificationSender = {
    id: string;
    avatarUrl: string | null;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
};

export type NotificationItem = {
    id: string;
    type: NotificationTypeInfo;
    message: string | null;       
    targetId: string | null;
    isRead: boolean;
    createdAtUtc: string;
    senders: NotificationSender[]; 
};

// ✅ FIX: Thêm type cho response từ API
export type NotificationResponse = {
    items: NotificationItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
};

// ============================================
// UTILITIES
// ============================================

/**
 * Định dạng thời gian tương đối (Ví dụ: 5 phút trước)
 */
export function formatRelativeTime(dateString: string): string {
    const now = new Date();
    const createdDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'vừa xong';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `khoảng ${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return createdDate.toLocaleDateString('vi-VN');
}

/**
 * Xử lý nội dung hiển thị cho cả 2 form JSON
 */
export function getNotificationContent(item: NotificationItem): string {
    // 1. Nếu là SYSTEM (Có message)
    if (item.message) return item.message;

    // 2. Nếu là tương tác (COMMENT/LIKE/RATING - message là null)
    if (item.senders && item.senders.length > 0) {
        const senders = item.senders;
        const firstSenderName = `${senders[0].lastName} ${senders[0].firstName}`;
        
        let displayNames = firstSenderName;
        if (senders.length === 2) {
            displayNames += ` và ${senders[1].lastName} ${senders[1].firstName}`;
        } else if (senders.length > 2) {
            displayNames += ` và ${senders.length - 1} người khác`;
        }

        switch (item.type.name) {
            case 'COMMENT':
                return `${displayNames} đã bình luận về bài viết của bạn.`;
            case 'LIKE':
                return `${displayNames} đã thích bài viết của bạn.`;
            case 'RATING':
                return `${displayNames} đã đánh giá bài viết của bạn.`;
            default:
                return `${displayNames} đã tương tác với bạn.`;
        }
    }

    return 'Bạn có thông báo mới.';
}

/**
 * Lấy chữ cái đầu cho Avatar (Ví dụ: Nguyễn Trà -> NT)
 */
export function getAvatarInitials(item: NotificationItem): string {
    if (item.type.name === 'SYSTEM') return 'BT'; // Ban Trị Sự/Hệ thống
    if (item.senders && item.senders.length > 0) {
        const s = item.senders[0];
        return `${s.lastName.charAt(0)}${s.firstName.charAt(0)}`.toUpperCase();
    }
    return '?';
}

// ============================================
// HTTP CLIENT
// ============================================

class NotificationHttpClient {
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
                throw new ApiException('Yêu cầu quá hạn.', 408);
            }
            throw error;
        }
    }

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const token = await TokenManager.getToken();
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const response = await this.fetchWithTimeout(url, { ...options, headers });
            if (response.status === 204) return {} as T;
            const data = await response.json().catch(() => ({}));

            if (!response.ok) throw new ApiException(data.message || 'Lỗi server', response.status);
            return data as T;
        } catch (error) {
            if (error instanceof ApiException) throw error;
            throw new ApiException('Lỗi kết nối server.', 0);
        }
    }
}

const client = new NotificationHttpClient(BASE_URL);

// ============================================
// EXPORTED SERVICE
// ============================================

export const NotificationService = {
    // ✅ FIX: Thay đổi để trả về NotificationItem[] thay vì NotificationResponse
    getMyNotifications: async (): Promise<NotificationItem[]> => {
        const response = await client.request<NotificationResponse>('/notifications/myNotifications');
        // Trích xuất items array từ response
        return response?.items || [];
    },
    
    markAsRead: (id: string) => client.request<void>(`/notifications/${id}/mark-read`, { method: 'POST' }),
    
    // Export Utilities
    getNotificationContent,
    formatRelativeTime,
    getAvatarInitials,
};

export default NotificationService;