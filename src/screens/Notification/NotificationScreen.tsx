import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import NotificationService, { NotificationItem } from '../../services/NotificationService';
import HeaderApp from '../../components/HeaderApp';
import styles from './NotificationScreenStyles';

const NotificationScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await NotificationService.getMyNotifications();
            setNotifications(data);
        } catch (error) {
            // console.error('Lỗi API notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handlePressItem = async (item: NotificationItem) => {
        if (!item.isRead) {
            try {
                await NotificationService.markAsRead(item.id);
                setNotifications(prev =>
                    prev.map(n => n.id === item.id ? { ...n, isRead: true } : n)
                );
            } catch (err) {
                // console.error("Lỗi mark-as-read:", err);
            }
        }
        // Logic điều hướng (Navigation) dựa trên item.targetId sẽ thêm ở đây
    };

    const handleMarkAllAsRead = async () => {
        try {
            // Giả sử có API markAllAsRead
            // await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            // console.error("Lỗi mark all as read:", err);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const renderItem = ({ item }: { item: NotificationItem }) => {
        const senders = item.senders;
        const hasManySenders = senders && senders.length > 1;

        return (
            <TouchableOpacity
                style={[styles.itemContainer, !item.isRead && styles.unreadBg]}
                onPress={() => handlePressItem(item)}
                activeOpacity={0.7}
            >
                <View style={styles.avatarContainer}>
                    {senders?.[0]?.avatarUrl ? (
                        <Image source={{ uri: senders[0].avatarUrl }} style={styles.avatarBase} />
                    ) : (
                        <View style={[styles.avatarBase, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>
                                {NotificationService.getAvatarInitials(item)}
                            </Text>
                        </View>
                    )}
                    
                    {hasManySenders && (
                        <View style={styles.badgeCount}>
                            <Text style={styles.badgeText}>+{senders.length - 1}</Text>
                        </View>
                    )}
                </View>
                
                <View style={styles.contentContainer}>
                    <Text style={[styles.messageText, !item.isRead && styles.unreadTextBold]}>
                        {NotificationService.getNotificationContent(item)}
                    </Text>

                    <View style={styles.metaRow}>
                        <Icon name="clock-outline" size={12} color="#9CA3AF" />
                        <Text style={styles.timeText}>
                            {NotificationService.formatRelativeTime(item.createdAtUtc)}
                        </Text>
                    </View>
                </View>

                {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const ListEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Icon name="bell-off-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
            <Text style={styles.emptySubtitle}>
                Các thông báo mới sẽ xuất hiện tại đây
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#8BC34A" />
            <HeaderApp isHome={false} onBackPress={handleBackPress} />

            <View style={styles.innerContainer}>
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.headerBackground}>
                        <View style={styles.decorativeCircle1} />
                        <View style={styles.decorativeCircle2} />
                        <View style={styles.headerContent}>
                            <View>
                                <Text style={styles.headerTitle}>Thông báo</Text>
                                <Text style={styles.headerSubtitle}>
                                    {unreadCount > 0 
                                        ? `${unreadCount} thông báo chưa đọc` 
                                        : 'Tất cả đã đọc'}
                                </Text>
                            </View>
                            <View style={styles.headerIconContainer}>
                                <Icon name="bell" size={28} color="rgba(255,255,255,0.9)" />
                                {unreadCount > 0 && (
                                    <View style={styles.headerBadge}>
                                        <Text style={styles.headerBadgeText}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Bar */}
                {notifications.length > 0 && unreadCount > 0 && (
                    <View style={styles.actionBar}>
                        <TouchableOpacity 
                            style={styles.markAllButton}
                            onPress={handleMarkAllAsRead}
                            activeOpacity={0.7}
                        >
                            <Icon name="check-all" size={18} color="#8BC34A" />
                            <Text style={styles.markAllText}>Đánh dấu tất cả đã đọc</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Notifications List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#8BC34A" />
                        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        refreshControl={
                            <RefreshControl 
                                refreshing={refreshing} 
                                onRefresh={onRefresh}
                                colors={['#8BC34A']}
                                tintColor="#8BC34A"
                            />
                        }
                        ListEmptyComponent={ListEmptyComponent}
                        contentContainerStyle={
                            notifications.length === 0 && styles.emptyListContent
                        }
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default NotificationScreen;